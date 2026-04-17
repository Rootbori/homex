package httpapi

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/rootbeer/homex/api/internal/domain"
	"gorm.io/gorm"
)

type oauthSyncPayload struct {
	AccountType    string `json:"account_type"`
	Provider       string `json:"provider"`
	ProviderUserID string `json:"provider_user_id"`
	Email          string `json:"email"`
	FullName       string `json:"full_name"`
	AvatarURL      string `json:"avatar_url"`
	SignupToken    string `json:"signup_token"`
}

func (s *Server) handleSignupCreate(w http.ResponseWriter, r *http.Request) {
	if s.db == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"error": "database is required for real signup",
		})
		return
	}

	var payload signupPayload
	if err := decodeJSON(r, &payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid signup payload"})
		return
	}

	payload.FullName = strings.TrimSpace(payload.FullName)
	payload.Phone = strings.TrimSpace(payload.Phone)
	payload.Email = strings.TrimSpace(strings.ToLower(payload.Email))
	payload.StoreName = strings.TrimSpace(payload.StoreName)
	payload.AccountType = strings.TrimSpace(payload.AccountType)
	payload.Provider = strings.TrimSpace(payload.Provider)

	requestedType, identityProvider, ok := validateSignupPayload(w, payload)
	if !ok {
		return
	}

	var (
		user          domain.User
		store         *domain.Store
		membership    *domain.StoreMembership
		signupSession domain.AuthSignupSession
	)

	err := s.db.Transaction(func(tx *gorm.DB) error {
		resolvedUser, err := findOrCreateSignupUser(tx, payload, requestedType)
		if err != nil {
			return err
		}
		user = resolvedUser

		if requestedType == domain.UserTypeStaff {
			resolvedStore, resolvedMembership, err := ensureStaffWorkspace(tx, user, payload.StoreName, payload.FullName, payload.Phone)
			if err != nil {
				return err
			}
			store = resolvedStore
			membership = resolvedMembership
		}

		token, err := generateSignupToken()
		if err != nil {
			return err
		}

		signupSession = domain.AuthSignupSession{
			Token:       token,
			UserID:      user.ID,
			AccountType: requestedType,
			Provider:    identityProvider,
			ExpiresAt:   time.Now().Add(30 * time.Minute),
		}
		if store != nil {
			signupSession.StoreID = &store.ID
		}

		return tx.Create(&signupSession).Error
	})
	if err != nil {
		if strings.Contains(err.Error(), "different users") {
			writeJSON(w, http.StatusConflict, map[string]any{
				"error":   "signup_conflict",
				"message": "เบอร์โทรและอีเมลนี้ผูกกับคนละบัญชีในระบบ กรุณาใช้ข้อมูลชุดเดียวกันหรือเข้าสู่ระบบบัญชีเดิม",
			})
			return
		}

		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to create signup"})
		return
	}

	accountLabel, nextPath := accountLabelAndNextPath(payload.AccountType)
	providerLabel := providerDisplayName(payload.Provider)

	response := map[string]any{
		"id":           signupSession.ID,
		"status":       "created",
		"message":      "บันทึกข้อมูลสมัครเรียบร้อยแล้ว กรุณายืนยันตัวตนต่อด้วย " + providerLabel,
		"signup_token": signupSession.Token,
		"user": map[string]any{
			"id":         user.ID,
			"type":       user.Type,
			"full_name":  user.FullName,
			"phone":      user.Phone,
			"email":      user.Email,
			"avatar_url": user.AvatarURL,
		},
		"profile": map[string]any{
			"full_name":    user.FullName,
			"phone":        user.Phone,
			"email":        user.Email,
			"store_name":   payload.StoreName,
			"account_type": payload.AccountType,
			"user_type":    user.Type,
			"provider":     payload.Provider,
		},
		"next": map[string]any{
			"action":      "oauth_signin",
			"provider":    payload.Provider,
			"provider_ui": providerLabel,
			"next_path":   nextPath,
			"hint":        "ยืนยันตัวตนด้วย " + providerLabel + " เพื่อเปิดใช้งานบัญชี " + accountLabel,
		},
	}
	if membership != nil {
		response["membership"] = map[string]any{
			"id":    membership.ID,
			"role":  membership.Role,
			"label": membership.Role,
		}
	}
	if store != nil {
		response["store"] = map[string]any{
			"id":   store.ID,
			"name": store.Name,
		}
	}

	writeJSON(w, http.StatusCreated, response)
}

func (s *Server) handleOAuthSync(w http.ResponseWriter, r *http.Request) {
	if s.db == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"error": "database is required for oauth sync",
		})
		return
	}

	var payload oauthSyncPayload
	if err := decodeJSON(r, &payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid oauth sync payload"})
		return
	}

	payload.AccountType = strings.TrimSpace(payload.AccountType)
	payload.Provider = strings.TrimSpace(payload.Provider)
	payload.ProviderUserID = strings.TrimSpace(payload.ProviderUserID)
	payload.Email = strings.TrimSpace(strings.ToLower(payload.Email))
	payload.FullName = strings.TrimSpace(payload.FullName)
	payload.AvatarURL = strings.TrimSpace(payload.AvatarURL)
	payload.SignupToken = strings.TrimSpace(payload.SignupToken)

	if payload.ProviderUserID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "provider_user_id is required"})
		return
	}

	requestedType, identityProvider, ok := validateOAuthSyncPayload(w, payload)
	if !ok {
		return
	}

	var (
		user       domain.User
		store      *domain.Store
		membership *domain.StoreMembership
		technician *domain.TechnicianProfile
	)

	err := s.db.Transaction(func(tx *gorm.DB) error {
		signupSession, err := lookupSignupSession(tx, payload.SignupToken)
		if err != nil {
			return err
		}
		if signupSession != nil {
			if signupSession.AccountType != requestedType {
				return errors.New("signup account type mismatch")
			}
			if signupSession.Provider != identityProvider {
				return errors.New("signup provider mismatch")
			}
		}

		resolvedUser, err := resolveUserForOAuth(tx, payload, requestedType, identityProvider, signupSession)
		if err != nil {
			return err
		}
		user = resolvedUser

		if err := upsertIdentity(tx, user, identityProvider, payload.ProviderUserID, payload.Email); err != nil {
			return err
		}

		if requestedType == domain.UserTypeStaff {
			resolvedStore, resolvedMembership, resolvedTechnician, err := resolveStaffContext(tx, user, signupSession, payload.FullName)
			if err != nil {
				return err
			}
			store = resolvedStore
			membership = resolvedMembership
			technician = resolvedTechnician
		}

		if signupSession != nil && signupSession.ConsumedAt == nil {
			now := time.Now()
			signupSession.ConsumedAt = &now
			if err := tx.Save(signupSession).Error; err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil {
		if strings.Contains(err.Error(), "expired") {
			writeJSON(w, http.StatusConflict, map[string]any{
				"error":   "signup_session_expired",
				"message": "ขั้นตอนสมัครหมดอายุแล้ว กรุณากรอกข้อมูลสมัครใหม่อีกครั้ง",
			})
			return
		}

		if strings.Contains(err.Error(), "mismatch") || strings.Contains(err.Error(), "not found") {
			writeJSON(w, http.StatusConflict, map[string]any{
				"error":   "signup_context_mismatch",
				"message": "ข้อมูลสมัครที่ค้างไว้ไม่ตรงกับบัญชีที่ใช้ยืนยันตัวตน กรุณาเริ่มใหม่อีกครั้ง",
			})
			return
		}

		writeJSON(w, http.StatusInternalServerError, map[string]any{
			"error": "unable to sync oauth account",
		})
		return
	}

	accountType := signupAccountTypeCustomer
	nextPath := "/search"
	role := string(domain.RoleCustomer)
	customerID := user.ID

	actor := map[string]any{
		"user_id":      user.ID,
		"account_type": signupAccountTypeCustomer,
		"user_type":    user.Type,
		"role":         domain.RoleCustomer,
		"customer_id":  user.ID,
		"next_path":    nextPath,
	}

	if requestedType == domain.UserTypeStaff && membership != nil && store != nil {
		accountType = signupAccountTypeStaff
		nextPath = "/portal/dashboard"
		role = string(membership.Role)
		customerID = 0
		actor = map[string]any{
			"user_id":      user.ID,
			"account_type": signupAccountTypeStaff,
			"user_type":    user.Type,
			"role":         membership.Role,
			"store_id":     store.ID,
			"next_path":    nextPath,
		}
		if technician != nil {
			actor["technician_id"] = technician.ID
		}
	}

	response := map[string]any{
		"status":  "ok",
		"message": "ยืนยันตัวตนและเชื่อมบัญชีเรียบร้อยแล้ว",
		"actor":   actor,
		"user": map[string]any{
			"id":         user.ID,
			"type":       user.Type,
			"full_name":  user.FullName,
			"phone":      user.Phone,
			"email":      user.Email,
			"avatar_url": user.AvatarURL,
		},
		"next": map[string]any{
			"account_type": accountType,
			"next_path":    nextPath,
			"role":         role,
		},
	}
	if customerID != 0 {
		response["customer_id"] = customerID
	}
	if store != nil {
		response["store"] = map[string]any{
			"id":   store.ID,
			"name": store.Name,
		}
	}

	writeJSON(w, http.StatusOK, response)
}

func validateSignupPayload(w http.ResponseWriter, payload signupPayload) (domain.UserType, domain.IdentityProvider, bool) {
	if payload.FullName == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "full_name is required"})
		return "", "", false
	}
	if payload.Phone == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "phone is required"})
		return "", "", false
	}
	if !payload.AcceptTerms {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "accept_terms is required"})
		return "", "", false
	}

	requestedType, ok := userTypeForAccountType(payload.AccountType)
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "unsupported account_type"})
		return "", "", false
	}

	identityProvider, ok := identityProviderForValue(payload.Provider)
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "unsupported provider"})
		return "", "", false
	}

	if identityProvider == domain.IdentityProviderGoogle && payload.Email == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "email is required for google signup"})
		return "", "", false
	}

	if requestedType == domain.UserTypeStaff && payload.StoreName == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "store_name is required for staff"})
		return "", "", false
	}

	return requestedType, identityProvider, true
}

func validateOAuthSyncPayload(w http.ResponseWriter, payload oauthSyncPayload) (domain.UserType, domain.IdentityProvider, bool) {
	requestedType, ok := userTypeForAccountType(payload.AccountType)
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "unsupported account_type"})
		return "", "", false
	}

	identityProvider, ok := identityProviderForValue(payload.Provider)
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "unsupported provider"})
		return "", "", false
	}

	return requestedType, identityProvider, true
}

func userTypeForAccountType(value string) (domain.UserType, bool) {
	switch value {
	case signupAccountTypeCustomer:
		return domain.UserTypeCustomer, true
	case signupAccountTypeStaff:
		return domain.UserTypeStaff, true
	default:
		return "", false
	}
}

func identityProviderForValue(value string) (domain.IdentityProvider, bool) {
	switch value {
	case signupProviderLine:
		return domain.IdentityProviderLine, true
	case signupProviderGoogle:
		return domain.IdentityProviderGoogle, true
	default:
		return "", false
	}
}

func accountLabelAndNextPath(accountType string) (string, string) {
	if accountType == signupAccountTypeStaff {
		return "ร้าน / ทีมช่าง", "/portal/dashboard"
	}
	return "ลูกค้า", "/search"
}

func providerDisplayName(provider string) string {
	if provider == signupProviderGoogle {
		return "Gmail"
	}
	return "LINE"
}

func mergeUserType(current, requested domain.UserType) domain.UserType {
	switch {
	case current == "":
		return requested
	case current == requested:
		return current
	case current == domain.UserTypeHybrid || requested == domain.UserTypeHybrid:
		return domain.UserTypeHybrid
	default:
		return domain.UserTypeHybrid
	}
}

func generateSignupToken() (string, error) {
	buffer := make([]byte, 24)
	if _, err := rand.Read(buffer); err != nil {
		return "", err
	}
	return hex.EncodeToString(buffer), nil
}

func findOrCreateSignupUser(tx *gorm.DB, payload signupPayload, requestedType domain.UserType) (domain.User, error) {
	var (
		emailUser domain.User
		phoneUser domain.User
		err       error
	)

	emailFound := false
	if payload.Email != "" {
		err = tx.Where("email = ?", payload.Email).First(&emailUser).Error
		if err == nil {
			emailFound = true
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.User{}, err
		}
	}

	phoneFound := false
	if payload.Phone != "" {
		err = tx.Where("phone = ?", payload.Phone).First(&phoneUser).Error
		if err == nil {
			phoneFound = true
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.User{}, err
		}
	}

	if emailFound && phoneFound && emailUser.ID != phoneUser.ID {
		return domain.User{}, errors.New("email and phone belong to different users")
	}

	var user domain.User
	switch {
	case emailFound:
		user = emailUser
	case phoneFound:
		user = phoneUser
	default:
		user = domain.User{
			Type:     requestedType,
			FullName: payload.FullName,
			Phone:    payload.Phone,
			Email:    payload.Email,
			IsActive: true,
		}
		return user, tx.Create(&user).Error
	}

	user.Type = mergeUserType(user.Type, requestedType)
	user.FullName = payload.FullName
	user.Phone = payload.Phone
	if payload.Email != "" {
		user.Email = payload.Email
	}

	return user, tx.Save(&user).Error
}

func ensureStaffWorkspace(
	tx *gorm.DB,
	user domain.User,
	storeName string,
	displayName string,
	phone string,
) (*domain.Store, *domain.StoreMembership, error) {
	var membership domain.StoreMembership
	err := tx.Where("user_id = ?", user.ID).Order("id asc").First(&membership).Error
	if err == nil {
		var store domain.Store
		if err := tx.First(&store, membership.StoreID).Error; err != nil {
			return nil, nil, err
		}
		return &store, &membership, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil, err
	}

	store := domain.Store{
		Name:  storeName,
		Phone: phone,
	}
	if err := tx.Create(&store).Error; err != nil {
		return nil, nil, err
	}

	membership = domain.StoreMembership{
		StoreID:     store.ID,
		UserID:      user.ID,
		DisplayName: displayName,
		Role:        domain.RoleOwner,
		IsActive:    true,
	}
	if err := tx.Create(&membership).Error; err != nil {
		return nil, nil, err
	}

	return &store, &membership, nil
}

func lookupSignupSession(tx *gorm.DB, token string) (*domain.AuthSignupSession, error) {
	if token == "" {
		return nil, nil
	}

	var session domain.AuthSignupSession
	if err := tx.Where("token = ?", token).First(&session).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("signup session not found")
		}
		return nil, err
	}

	if session.ExpiresAt.Before(time.Now()) {
		return nil, errors.New("signup session expired")
	}

	return &session, nil
}

func resolveUserForOAuth(
	tx *gorm.DB,
	payload oauthSyncPayload,
	requestedType domain.UserType,
	identityProvider domain.IdentityProvider,
	signupSession *domain.AuthSignupSession,
) (domain.User, error) {
	var identity domain.UserIdentity
	if err := tx.Where("provider = ? AND provider_user_id = ?", identityProvider, payload.ProviderUserID).First(&identity).Error; err == nil {
		var user domain.User
		if err := tx.First(&user, identity.UserID).Error; err != nil {
			return domain.User{}, err
		}
		if signupSession != nil && signupSession.UserID != user.ID {
			return domain.User{}, errors.New("signup context mismatch")
		}
		user.Type = mergeUserType(user.Type, requestedType)
		user.FullName = coalesceString(payload.FullName, user.FullName)
		user.Email = coalesceString(payload.Email, user.Email)
		user.AvatarURL = coalesceString(payload.AvatarURL, user.AvatarURL)
		return user, tx.Save(&user).Error
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return domain.User{}, err
	}

	if signupSession != nil {
		var user domain.User
		if err := tx.First(&user, signupSession.UserID).Error; err != nil {
			return domain.User{}, err
		}
		user.Type = mergeUserType(user.Type, requestedType)
		user.FullName = coalesceString(payload.FullName, user.FullName)
		user.Email = coalesceString(payload.Email, user.Email)
		user.AvatarURL = coalesceString(payload.AvatarURL, user.AvatarURL)
		return user, tx.Save(&user).Error
	}

	if payload.Email != "" {
		var user domain.User
		if err := tx.Where("email = ?", payload.Email).First(&user).Error; err == nil {
			user.Type = mergeUserType(user.Type, requestedType)
			user.FullName = coalesceString(payload.FullName, user.FullName)
			user.Email = payload.Email
			user.AvatarURL = coalesceString(payload.AvatarURL, user.AvatarURL)
			return user, tx.Save(&user).Error
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.User{}, err
		}
	}

	user := domain.User{
		Type:      requestedType,
		FullName:  coalesceString(payload.FullName, "ผู้ใช้งาน Homex"),
		Email:     payload.Email,
		AvatarURL: payload.AvatarURL,
		IsActive:  true,
	}
	return user, tx.Create(&user).Error
}

func upsertIdentity(
	tx *gorm.DB,
	user domain.User,
	provider domain.IdentityProvider,
	providerUserID string,
	email string,
) error {
	var identity domain.UserIdentity
	if err := tx.Where("provider = ? AND provider_user_id = ?", provider, providerUserID).First(&identity).Error; err == nil {
		if identity.UserID != user.ID {
			return errors.New("provider already linked to another user")
		}
		identity.Email = coalesceString(email, identity.Email)
		identity.IsPrimary = true
		return tx.Save(&identity).Error
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	identity = domain.UserIdentity{
		UserID:         user.ID,
		Provider:       provider,
		ProviderUserID: providerUserID,
		Email:          email,
		IsPrimary:      true,
	}
	return tx.Create(&identity).Error
}

func resolveStaffContext(
	tx *gorm.DB,
	user domain.User,
	signupSession *domain.AuthSignupSession,
	displayName string,
) (*domain.Store, *domain.StoreMembership, *domain.TechnicianProfile, error) {
	var membership domain.StoreMembership
	if signupSession != nil && signupSession.StoreID != nil {
		err := tx.Where("store_id = ? AND user_id = ?", *signupSession.StoreID, user.ID).First(&membership).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			membership = domain.StoreMembership{
				StoreID:     *signupSession.StoreID,
				UserID:      user.ID,
				DisplayName: displayName,
				Role:        domain.RoleOwner,
				IsActive:    true,
			}
			if err := tx.Create(&membership).Error; err != nil {
				return nil, nil, nil, err
			}
		} else if err != nil {
			return nil, nil, nil, err
		}
	} else {
		if err := tx.Where("user_id = ?", user.ID).Order("id asc").First(&membership).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				store := domain.Store{
					Name:  defaultStoreName(displayName, user.FullName),
					Phone: user.Phone,
				}
				if err := tx.Create(&store).Error; err != nil {
					return nil, nil, nil, err
				}

				membership = domain.StoreMembership{
					StoreID:     store.ID,
					UserID:      user.ID,
					DisplayName: coalesceString(displayName, user.FullName),
					Role:        domain.RoleOwner,
					IsActive:    true,
				}
				if err := tx.Create(&membership).Error; err != nil {
					return nil, nil, nil, err
				}

				return &store, &membership, nil, nil
			}
			return nil, nil, nil, err
		}
	}

	var store domain.Store
	if err := tx.First(&store, membership.StoreID).Error; err != nil {
		return nil, nil, nil, err
	}

	var technician domain.TechnicianProfile
	err := tx.Where("membership_id = ?", membership.ID).First(&technician).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return &store, &membership, nil, nil
	}
	if err != nil {
		return nil, nil, nil, err
	}

	return &store, &membership, &technician, nil
}

func coalesceString(preferred, fallback string) string {
	if strings.TrimSpace(preferred) != "" {
		return strings.TrimSpace(preferred)
	}
	return strings.TrimSpace(fallback)
}

func defaultStoreName(candidates ...string) string {
	for _, candidate := range candidates {
		candidate = strings.TrimSpace(candidate)
		if candidate != "" {
			return "ทีมช่างของ " + candidate
		}
	}

	return "ร้านช่าง Homex"
}
