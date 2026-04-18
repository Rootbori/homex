package usecase

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/rootbeer/homex/api/internal/domain"
)

const defaultUserStoreID uint = 1

var slugSanitizer = regexp.MustCompile(`[^a-z0-9]+`)

type authUsecase struct {
	userRepo  domain.UserRepository
	storeRepo domain.StoreRepository
}

func NewAuthUsecase(userRepo domain.UserRepository, storeRepo domain.StoreRepository) AuthUsecase {
	return &authUsecase{
		userRepo:  userRepo,
		storeRepo: storeRepo,
	}
}

func (u *authUsecase) SyncOAuthUser(
	ctx context.Context,
	ident domain.UserIdentity,
	accountType domain.UserType,
	inviteStoreID,
	fullName,
	avatarURL string,
) (*AuthSyncResult, error) {
	user, err := u.findOrCreateUser(ctx, ident, accountType, fullName, avatarURL)
	if err != nil {
		return nil, err
	}

	result := &AuthSyncResult{
		User: user,
	}

	if accountType == domain.UserTypeUser {
		store, err := u.storeRepo.GetByID(ctx, defaultUserStoreID)
		if err != nil {
			return nil, err
		}

		profile := &domain.UserProfile{
			StoreID: store.ID,
			UserID:  user.ID,
		}
		if err := u.userRepo.UpsertProfile(ctx, profile); err != nil {
			return nil, err
		}

		result.Store = store
		result.Role = domain.RoleUser
		result.ProfileID = user.ID
		result.NextPath = "/search"
		return result, nil
	}

	if inviteStoreID != "" && inviteStoreID != "draft" {
		storeID, err := parseStoreID(inviteStoreID)
		if err != nil {
			return nil, err
		}

		store, err := u.storeRepo.GetByID(ctx, storeID)
		if err != nil {
			return nil, err
		}

		membership, tech, err := u.ensureStaffMembership(ctx, user, store, domain.RoleTechnician, true)
		if err != nil {
			return nil, err
		}

		result.Membership = membership
		result.Store = store
		result.Technician = tech
		result.Role = membership.Role
		result.NextPath = "/portal/dashboard"
		return result, nil
	}

	membership, err := u.storeRepo.GetAnyMembershipByUser(ctx, user.ID)
	if err == nil && membership != nil {
		store, err := u.storeRepo.GetByID(ctx, membership.StoreID)
		if err != nil {
			return nil, err
		}

		tech, err := u.storeRepo.GetTechnicianProfile(ctx, membership.ID)
		if err != nil && !errors.Is(err, domain.ErrNotFound) {
			return nil, err
		}

		result.Membership = membership
		result.Store = store
		result.Technician = tech
		result.Role = membership.Role
		result.NextPath = "/portal/dashboard"
		return result, nil
	}
	if err != nil && !errors.Is(err, domain.ErrNotFound) {
		return nil, err
	}

	result.Role = domain.RoleAnonymous
	result.NextPath = "/onboarding/staff"
	result.OnboardingRequired = true
	return result, nil
}

func (u *authUsecase) ValidateOAuthSession(
	ctx context.Context,
	ident domain.UserIdentity,
	accountType domain.UserType,
	input ValidateSessionInput,
) (*AuthSyncResult, error) {
	existingIdent, err := u.userRepo.GetIdentity(ctx, ident.Provider, ident.ProviderUserID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			return nil, domain.ErrUnauthorized
		}
		return nil, err
	}

	user, err := u.userRepo.GetByID(ctx, existingIdent.UserID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			return nil, domain.ErrUnauthorized
		}
		return nil, err
	}

	result := &AuthSyncResult{
		User: user,
	}

	switch accountType {
	case domain.UserTypeUser:
		store, err := u.storeRepo.GetByID(ctx, defaultUserStoreID)
		if err != nil {
			if errors.Is(err, domain.ErrNotFound) {
				return nil, domain.ErrUnauthorized
			}
			return nil, err
		}

		if _, err := u.userRepo.GetProfile(ctx, defaultUserStoreID, user.ID); err != nil {
			if errors.Is(err, domain.ErrNotFound) {
				return nil, domain.ErrUnauthorized
			}
			return nil, err
		}

		if input.ClaimedStoreID != "" && input.ClaimedStoreID != strconv.Itoa(int(defaultUserStoreID)) {
			return nil, domain.ErrUnauthorized
		}
		if input.ClaimedRole != "" && input.ClaimedRole != domain.RoleUser {
			return nil, domain.ErrUnauthorized
		}
		if input.ClaimedProfileID != "" && input.ClaimedProfileID != strconv.Itoa(int(user.ID)) {
			return nil, domain.ErrUnauthorized
		}

		result.Store = store
		result.Role = domain.RoleUser
		result.ProfileID = user.ID
		result.NextPath = "/search"
		return result, nil

	case domain.UserTypeStaff:
		var membership *domain.StoreMembership
		if strings.TrimSpace(input.ClaimedStoreID) != "" {
			storeID, err := parseStoreID(input.ClaimedStoreID)
			if err != nil {
				return nil, domain.ErrUnauthorized
			}
			membership, err = u.storeRepo.GetMembership(ctx, storeID, user.ID)
			if err != nil {
				if errors.Is(err, domain.ErrNotFound) {
					return nil, domain.ErrUnauthorized
				}
				return nil, err
			}
		} else {
			membership, err = u.storeRepo.GetAnyMembershipByUser(ctx, user.ID)
			if err != nil {
				if errors.Is(err, domain.ErrNotFound) {
					result.Role = domain.RoleAnonymous
					result.NextPath = "/onboarding/staff"
					result.OnboardingRequired = true
					return result, nil
				}
				return nil, err
			}
		}

		if membership == nil || !membership.IsActive {
			return nil, domain.ErrUnauthorized
		}

		store, err := u.storeRepo.GetByID(ctx, membership.StoreID)
		if err != nil {
			if errors.Is(err, domain.ErrNotFound) {
				return nil, domain.ErrUnauthorized
			}
			return nil, err
		}

		if input.ClaimedRole != "" && input.ClaimedRole != membership.Role {
			return nil, domain.ErrUnauthorized
		}

		tech, err := u.storeRepo.GetTechnicianByUserID(ctx, store.ID, user.ID)
		if err != nil && !errors.Is(err, domain.ErrNotFound) {
			return nil, err
		}
		if errors.Is(err, domain.ErrNotFound) {
			tech = nil
		}

		if membership.Role == domain.RoleTechnician && tech == nil {
			return nil, domain.ErrUnauthorized
		}
		if input.ClaimedTechnicianID != "" {
			if tech == nil || input.ClaimedTechnicianID != strconv.Itoa(int(tech.ID)) {
				return nil, domain.ErrUnauthorized
			}
		}

		result.Membership = membership
		result.Store = store
		result.Technician = tech
		result.Role = membership.Role
		result.NextPath = "/portal/dashboard"
		return result, nil
	default:
		return nil, domain.ErrUnauthorized
	}
}

func (u *authUsecase) CompleteStaffOnboarding(
	ctx context.Context,
	userID uint,
	input StaffOnboardingInput,
) (*AuthSyncResult, error) {
	user, err := u.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	mode := normalizeStaffOnboardingMode(input.Mode)
	if mode != "create_store" {
		return nil, fmt.Errorf("unsupported onboarding mode")
	}

	if existing, err := u.storeRepo.GetAnyMembershipByUser(ctx, user.ID); err == nil && existing != nil {
		store, storeErr := u.storeRepo.GetByID(ctx, existing.StoreID)
		if storeErr != nil {
			return nil, storeErr
		}
		tech, techErr := u.storeRepo.GetTechnicianProfile(ctx, existing.ID)
		if techErr != nil && !errors.Is(techErr, domain.ErrNotFound) {
			return nil, techErr
		}
		return &AuthSyncResult{
			User:       user,
			Membership: existing,
			Store:      store,
			Technician: tech,
			Role:       existing.Role,
			NextPath:   "/portal/dashboard",
		}, nil
	}

	storeName := strings.TrimSpace(input.StoreName)
	if storeName == "" {
		storeName = defaultShopStoreName(user.FullName)
	}

	store := &domain.Store{
		Name: storeName,
		Kind: domain.StoreKindShop,
	}

	if err := u.storeRepo.Create(ctx, store); err != nil {
		return nil, err
	}

	membership, tech, err := u.ensureStaffMembership(ctx, user, store, domain.RoleOwner, true)
	if err != nil {
		return nil, err
	}

	return &AuthSyncResult{
		User:       user,
		Membership: membership,
		Store:      store,
		Technician: tech,
		Role:       membership.Role,
		NextPath:   "/portal/dashboard",
	}, nil
}

func (u *authUsecase) findOrCreateUser(
	ctx context.Context,
	ident domain.UserIdentity,
	accountType domain.UserType,
	fullName,
	avatarURL string,
) (*domain.User, error) {
	existingIdent, err := u.userRepo.GetIdentity(ctx, ident.Provider, ident.ProviderUserID)

	var user *domain.User
	if err == nil && existingIdent != nil {
		user, _ = u.userRepo.GetByID(ctx, existingIdent.UserID)
	} else if !errors.Is(err, domain.ErrNotFound) && err != nil {
		return nil, err
	}

	if user != nil {
		updated := false
		if needsHybridType(user.Type, accountType) {
			user.Type = domain.UserTypeHybrid
			updated = true
		}
		if strings.TrimSpace(user.FullName) == "" || user.FullName == user.Email {
			if strings.TrimSpace(fullName) != "" {
				user.FullName = fullName
				updated = true
			}
		}
		if strings.TrimSpace(user.AvatarURL) == "" && strings.TrimSpace(avatarURL) != "" {
			user.AvatarURL = avatarURL
			updated = true
		}
		if updated {
			if err := u.userRepo.Update(ctx, user); err != nil {
				return nil, err
			}
		}
		return user, nil
	}

	displayName := strings.TrimSpace(fullName)
	if displayName == "" {
		displayName = ident.Email
	}

	user = &domain.User{
		Type:      accountType,
		FullName:  displayName,
		Email:     ident.Email,
		AvatarURL: strings.TrimSpace(avatarURL),
		IsActive:  true,
	}
	if err := u.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	ident.UserID = user.ID
	ident.IsPrimary = true
	if err := u.userRepo.UpsertIdentity(ctx, &ident); err != nil {
		return nil, err
	}

	return user, nil
}

func (u *authUsecase) ensureStaffMembership(
	ctx context.Context,
	user *domain.User,
	store *domain.Store,
	role domain.Role,
	createTechnician bool,
) (*domain.StoreMembership, *domain.TechnicianProfile, error) {
	if store == nil || store.ID == 0 {
		return nil, nil, nil
	}

	membership, err := u.storeRepo.GetMembership(ctx, store.ID, user.ID)
	if err != nil && !errors.Is(err, domain.ErrNotFound) {
		return nil, nil, err
	}
	if membership == nil {
		membership = &domain.StoreMembership{
			StoreID:     store.ID,
			UserID:      user.ID,
			DisplayName: user.FullName,
			IsActive:    true,
			Role:        role,
		}
		if err := u.storeRepo.CreateMembership(ctx, membership); err != nil {
			return nil, nil, err
		}
	}

	if !createTechnician && membership.Role != domain.RoleTechnician {
		return membership, nil, nil
	}

	tech, err := u.storeRepo.GetTechnicianProfile(ctx, membership.ID)
	if err == nil && tech != nil {
		return membership, tech, nil
	}
	if err != nil && !errors.Is(err, domain.ErrNotFound) {
		return nil, nil, err
	}

	tech = &domain.TechnicianProfile{
		MembershipID:    membership.ID,
		StoreID:         store.ID,
		UserID:          user.ID,
		Slug:            technicianSlug(user.FullName, membership.ID),
		AvatarURL:       user.AvatarURL,
		Headline:        defaultTechnicianHeadline(store.Name),
		Availability:    domain.AvailabilityAvailable,
		WorkingHours:    "ทุกวัน 08:00 - 18:00",
		ExperienceYears: 0,
	}
	if err := u.storeRepo.CreateTechnicianProfile(ctx, tech); err != nil {
		return nil, nil, err
	}

	return membership, tech, nil
}

func (u *authUsecase) GetSignupSession(ctx context.Context, token string) (*domain.AuthSignupSession, error) {
	return u.userRepo.GetSignupSession(ctx, token)
}

func (u *authUsecase) CompleteSignup(ctx context.Context, token string, fullName, phone string) (*domain.User, *domain.StoreMembership, *domain.Store, error) {
	sess, err := u.userRepo.GetSignupSession(ctx, token)
	if err != nil {
		return nil, nil, nil, err
	}

	user, err := u.userRepo.GetByID(ctx, sess.UserID)
	if err != nil {
		return nil, nil, nil, err
	}

	user.FullName = fullName
	user.Phone = phone
	if err := u.userRepo.Update(ctx, user); err != nil {
		return nil, nil, nil, err
	}

	now := time.Now()
	sess.ConsumedAt = &now
	_ = u.userRepo.UpdateSignupSession(ctx, sess)

	storeID := defaultUserStoreID
	if sess.StoreID != nil {
		storeID = *sess.StoreID
	}

	membership, _ := u.storeRepo.GetMembership(ctx, storeID, user.ID)
	store, _ := u.storeRepo.GetByID(ctx, storeID)

	return user, membership, store, nil
}

func parseStoreID(raw string) (uint, error) {
	id, err := strconv.Atoi(raw)
	if err != nil || id <= 0 {
		return 0, fmt.Errorf("invalid invite store id")
	}
	return uint(id), nil
}

func needsHybridType(current, incoming domain.UserType) bool {
	return (current == domain.UserTypeStaff && incoming == domain.UserTypeUser) ||
		(current == domain.UserTypeUser && incoming == domain.UserTypeStaff)
}

func defaultShopStoreName(fullName string) string {
	name := strings.TrimSpace(fullName)
	if name == "" {
		return "ร้าน Homex ใหม่"
	}
	return fmt.Sprintf("ร้านของ %s", name)
}

func normalizeStaffOnboardingMode(raw string) string {
	switch strings.TrimSpace(raw) {
	case "create_store", "owner", "solo":
		return "create_store"
	case "join_team", "team_member":
		return "join_team"
	default:
		return ""
	}
}

func defaultTechnicianHeadline(storeName string) string {
	if strings.TrimSpace(storeName) == "" {
		return "พร้อมรับงานหน้างานและจัดตารางงานผ่าน Homex"
	}
	return fmt.Sprintf("ทีมงานจาก %s พร้อมดูแลงานหน้างาน", storeName)
}

func technicianSlug(name string, suffix uint) string {
	base := strings.ToLower(strings.TrimSpace(name))
	if base == "" {
		base = "technician"
	}
	base = slugSanitizer.ReplaceAllString(base, "-")
	base = strings.Trim(base, "-")
	if base == "" {
		base = "technician"
	}
	return fmt.Sprintf("%s-%d", base, suffix)
}
