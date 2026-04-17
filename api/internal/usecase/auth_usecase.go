package usecase

import (
	"context"
	"errors"
	"strconv"
	"time"

	"github.com/rootbeer/homex/api/internal/domain"
)

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

func (u *authUsecase) SyncOAuthUser(ctx context.Context, ident domain.UserIdentity, accountType domain.UserType, inviteStoreID string) (*domain.User, *domain.StoreMembership, *domain.Store, *domain.TechnicianProfile, error) {
	// 1. Find or create user
	user, err := u.findOrCreateUser(ctx, ident, accountType)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	// 2. Determine target store ID
	storeID := uint(1)
	if inviteStoreID != "" && inviteStoreID != "draft" {
		if id, err := strconv.Atoi(inviteStoreID); err == nil && id > 0 {
			storeID = uint(id)
		}
	}

	// 3. Ensure membership if staff/invite flow
	if user.Type == domain.UserTypeStaff || user.Type == domain.UserTypeHybrid || accountType == domain.UserTypeStaff {
		_ = u.ensureStaffMembership(ctx, user, storeID)
	} else {
		profile := &domain.UserProfile{StoreID: storeID, UserID: user.ID}
		_ = u.userRepo.UpsertProfile(ctx, profile)
	}

	// 4. Load full context
	membership, _ := u.storeRepo.GetMembership(ctx, storeID, user.ID)
	store, _ := u.storeRepo.GetByID(ctx, storeID)
	var tech *domain.TechnicianProfile
	if membership != nil {
		tech, _ = u.storeRepo.GetTechnicianProfile(ctx, membership.ID)
	}

	return user, membership, store, tech, nil
}

func (u *authUsecase) findOrCreateUser(ctx context.Context, ident domain.UserIdentity, accountType domain.UserType) (*domain.User, error) {
	existingIdent, err := u.userRepo.GetIdentity(ctx, ident.Provider, ident.ProviderUserID)

	var user *domain.User
	if err == nil && existingIdent != nil {
		user, _ = u.userRepo.GetByID(ctx, existingIdent.UserID)
	} else if !errors.Is(err, domain.ErrNotFound) && err != nil {
		return nil, err
	}

	if user != nil {
		return user, nil
	}

	// Create new user
	user = &domain.User{
		Type:     accountType,
		FullName: ident.Email,
		Email:    ident.Email,
		IsActive: true,
	}
	if err := u.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	ident.UserID = user.ID
	ident.IsPrimary = true
	_ = u.userRepo.UpsertIdentity(ctx, &ident)

	return user, nil
}

func (u *authUsecase) ensureStaffMembership(ctx context.Context, user *domain.User, storeID uint) error {
	if storeID == 0 {
		return nil
	}

	membership, _ := u.storeRepo.GetMembership(ctx, storeID, user.ID)
	if membership != nil {
		return nil
	}

	// Join store via invite or default
	membership = &domain.StoreMembership{
		StoreID:  storeID,
		UserID:   user.ID,
		IsActive: true,
		Role:     domain.RoleTechnician,
	}
	if err := u.storeRepo.CreateMembership(ctx, membership); err != nil {
		return err
	}

	// Initialize tech profile
	tech := &domain.TechnicianProfile{
		MembershipID: membership.ID,
		StoreID:      storeID,
		UserID:       user.ID,
		Slug:         "tech-" + strconv.FormatUint(uint64(user.ID), 10),
		Availability: domain.AvailabilityAvailable,
	}
	_ = u.storeRepo.CreateTechnicianProfile(ctx, tech)

	return nil
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

	storeID := uint(1)
	if sess.StoreID != nil {
		storeID = *sess.StoreID
	}

	membership, _ := u.storeRepo.GetMembership(ctx, storeID, user.ID)
	store, _ := u.storeRepo.GetByID(ctx, storeID)

	return user, membership, store, nil
}
