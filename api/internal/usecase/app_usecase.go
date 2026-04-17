package usecase

import (
	"context"

	"github.com/rootbeer/homex/api/internal/domain"
)

// ── Job Usecase ─────────────────────────────────────────────────────

type jobUsecase struct {
	jobRepo domain.JobRepository
}

func NewJobUsecase(jobRepo domain.JobRepository) JobUsecase {
	return &jobUsecase{jobRepo: jobRepo}
}

func (u *jobUsecase) GetJobDetail(ctx context.Context, actor domain.Actor, jobID uint) (*domain.Job, error) {
	return u.jobRepo.GetByID(ctx, jobID)
}

func (u *jobUsecase) ListJobs(ctx context.Context, actor domain.Actor) ([]domain.Job, error) {
	scope := actor.Scope()
	if scope.CanSeeEntireStore {
		return u.jobRepo.ListByStore(ctx, actor.UintStoreID())
	}

	if actor.Role == domain.RoleTechnician {
		return u.jobRepo.ListByTechnician(ctx, actor.UintTechnicianID())
	}

	return u.jobRepo.ListByUser(ctx, actor.UintProfileID())
}

func (u *jobUsecase) CreateLead(ctx context.Context, actor domain.Actor, lead *domain.Lead) error {
	lead.Status = domain.LeadStatusNew
	lead.UserID = actor.UintUserID()
	return u.jobRepo.CreateLead(ctx, lead)
}

func (u *jobUsecase) ListLeads(ctx context.Context, actor domain.Actor) ([]domain.Lead, error) {
	if !actor.IsStaff() {
		return nil, domain.ErrForbidden
	}
	return u.jobRepo.ListLeadsByStore(ctx, actor.UintStoreID())
}

func (u *jobUsecase) GetLeadDetail(ctx context.Context, actor domain.Actor, id uint) (*domain.Lead, error) {
	if !actor.IsStaff() {
		return nil, domain.ErrForbidden
	}
	return u.jobRepo.GetLeadByID(ctx, id)
}

// ── User Usecase ────────────────────────────────────────────────────

type userUsecase struct {
	userRepo domain.UserRepository
}

func NewUserUsecase(userRepo domain.UserRepository) UserUsecase {
	return &userUsecase{userRepo: userRepo}
}

func (u *userUsecase) GetProfile(ctx context.Context, actor domain.Actor) (*domain.User, *domain.UserProfile, error) {
	user, err := u.userRepo.GetByID(ctx, actor.UintUserID())
	if err != nil {
		return nil, nil, err
	}
	profile, _ := u.userRepo.GetProfile(ctx, actor.UintStoreID(), user.ID)
	return user, profile, nil
}

func (u *userUsecase) UpdateProfile(ctx context.Context, actor domain.Actor, fullName, phone string) error {
	user, err := u.userRepo.GetByID(ctx, actor.UintUserID())
	if err != nil {
		return err
	}
	user.FullName = fullName
	user.Phone = phone
	return u.userRepo.Update(ctx, user)
}

func (u *userUsecase) ListUsers(ctx context.Context, actor domain.Actor) ([]domain.User, error) {
	if !actor.IsAdminLike() {
		return nil, domain.ErrForbidden
	}
	return u.userRepo.ListUsers(ctx)
}

// ── Store Usecase ───────────────────────────────────────────────────

type storeUsecase struct {
	storeRepo domain.StoreRepository
}

func NewStoreUsecase(storeRepo domain.StoreRepository) StoreUsecase {
	return &storeUsecase{storeRepo: storeRepo}
}

func (u *storeUsecase) GetTechnicianDetails(ctx context.Context, slug string) (*domain.TechnicianProfile, error) {
	return u.storeRepo.GetTechnicianBySlug(ctx, slug)
}

func (u *storeUsecase) ListTechnicians(ctx context.Context, query string) ([]domain.TechnicianProfile, error) {
	return u.storeRepo.ListPublicTechnicians(ctx, query)
}
