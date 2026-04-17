package usecase

import (
	"context"
	"errors"
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

func (u *authUsecase) SyncOAuthUser(ctx context.Context, ident domain.UserIdentity, accountType domain.UserType) (*domain.User, *domain.StoreMembership, *domain.Store, *domain.TechnicianProfile, error) {
	// 1. Find existing identity
	existingIdent, err := u.userRepo.GetIdentity(ctx, ident.Provider, ident.ProviderUserID)

	var user *domain.User
	if err == nil && existingIdent != nil {
		user, _ = u.userRepo.GetByID(ctx, existingIdent.UserID)
	} else if !errors.Is(err, domain.ErrNotFound) && err != nil {
		return nil, nil, nil, nil, err
	}

	// 2. Create user if not found
	if user == nil {
		user = &domain.User{
			Type:     accountType,
			FullName: ident.Email,
			Email:    ident.Email,
		}
		if err := u.userRepo.Create(ctx, user); err != nil {
			return nil, nil, nil, nil, err
		}

		ident.UserID = user.ID
		ident.IsPrimary = true
		if err := u.userRepo.UpsertIdentity(ctx, &ident); err != nil {
			return nil, nil, nil, nil, err
		}
	}

	// 3. Resolve store context
	var membership *domain.StoreMembership
	var store *domain.Store
	var tech *domain.TechnicianProfile

	storeID := uint(1)
	if user.Type == domain.UserTypeStaff || user.Type == domain.UserTypeHybrid {
		membership, _ = u.storeRepo.GetMembership(ctx, storeID, user.ID)
		if membership != nil {
			store, _ = u.storeRepo.GetByID(ctx, storeID)
			tech, _ = u.storeRepo.GetTechnicianProfile(ctx, membership.ID)
		}
	} else {
		profile := &domain.UserProfile{StoreID: storeID, UserID: user.ID}
		_ = u.userRepo.UpsertProfile(ctx, profile)
		store, _ = u.storeRepo.GetByID(ctx, storeID)
	}

	return user, membership, store, tech, nil
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
