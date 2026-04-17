package usecase

import (
	"context"

	"github.com/rootbeer/homex/api/internal/domain"
)

type AuthUsecase interface {
	SyncOAuthUser(ctx context.Context, ident domain.UserIdentity, accountType domain.UserType, inviteStoreID string) (*domain.User, *domain.StoreMembership, *domain.Store, *domain.TechnicianProfile, error)
	GetSignupSession(ctx context.Context, token string) (*domain.AuthSignupSession, error)
	CompleteSignup(ctx context.Context, token string, fullName, phone string) (*domain.User, *domain.StoreMembership, *domain.Store, error)
}

type UserUsecase interface {
	GetProfile(ctx context.Context, actor domain.Actor) (*domain.User, *domain.UserProfile, error)
	UpdateProfile(ctx context.Context, actor domain.Actor, fullName, phone string) error
	ListUsers(ctx context.Context, actor domain.Actor) ([]domain.User, error)
}

type JobUsecase interface {
	GetJobDetail(ctx context.Context, actor domain.Actor, jobID uint) (*domain.Job, error)
	ListJobs(ctx context.Context, actor domain.Actor) ([]domain.Job, error)
	CreateLead(ctx context.Context, actor domain.Actor, lead *domain.Lead) error
	ListLeads(ctx context.Context, actor domain.Actor) ([]domain.Lead, error)
	GetLeadDetail(ctx context.Context, actor domain.Actor, id uint) (*domain.Lead, error)
}

type StoreUsecase interface {
	GetTechnicianDetails(ctx context.Context, slug string) (*domain.TechnicianProfile, error)
	ListTechnicians(ctx context.Context, query string) ([]domain.TechnicianProfile, error)
}
