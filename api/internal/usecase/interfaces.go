package usecase

import (
	"context"

	"github.com/rootbeer/homex/api/internal/domain"
)

type AuthSyncResult struct {
	User               *domain.User
	Membership         *domain.StoreMembership
	Store              *domain.Store
	Technician         *domain.TechnicianProfile
	Role               domain.Role
	ProfileID          uint
	NextPath           string
	OnboardingRequired bool
}

type StaffOnboardingInput struct {
	Mode      string
	StoreName string
}

type CreateTechnicianInput struct {
	Name     string
	Phone    string
	Services []string
}

type QuotationItemInput struct {
	Label     string
	Quantity  int
	UnitPrice int
}

type CreateQuotationInput struct {
	RecipientName  string
	RecipientEmail string
	Note           string
	Discount       int
	SendViaEmail   bool
	Items          []QuotationItemInput
}

type AuthUsecase interface {
	SyncOAuthUser(ctx context.Context, ident domain.UserIdentity, accountType domain.UserType, inviteStoreID, fullName, avatarURL string) (*AuthSyncResult, error)
	CompleteStaffOnboarding(ctx context.Context, userID uint, input StaffOnboardingInput) (*AuthSyncResult, error)
	GetSignupSession(ctx context.Context, token string) (*domain.AuthSignupSession, error)
	CompleteSignup(ctx context.Context, token string, fullName, phone string) (*domain.User, *domain.StoreMembership, *domain.Store, error)
}

type UserUsecase interface {
	GetProfile(ctx context.Context, actor domain.Actor) (*domain.User, *domain.UserProfile, error)
	UpdateProfile(ctx context.Context, actor domain.Actor, fullName, phone string) error
	ListUsers(ctx context.Context, actor domain.Actor) ([]domain.StoreUserSummary, error)
}

type JobUsecase interface {
	GetJobDetail(ctx context.Context, actor domain.Actor, jobID uint) (*domain.Job, error)
	ListJobs(ctx context.Context, actor domain.Actor) ([]domain.Job, error)
	ListJobsForUser(ctx context.Context, actor domain.Actor, userID uint) ([]domain.Job, error)
	CreateQuotation(ctx context.Context, actor domain.Actor, input CreateQuotationInput) (*domain.Quotation, []domain.QuotationItem, error)
	CreateLead(ctx context.Context, actor domain.Actor, lead *domain.Lead) error
	ListLeads(ctx context.Context, actor domain.Actor) ([]domain.Lead, error)
	GetLeadDetail(ctx context.Context, actor domain.Actor, id uint) (*domain.Lead, error)
}

type StoreUsecase interface {
	GetCurrentStore(ctx context.Context, actor domain.Actor) (*domain.Store, error)
	GetTechnicianDetails(ctx context.Context, slug string) (*domain.TechnicianProfile, error)
	ListTechnicians(ctx context.Context, query string) ([]domain.TechnicianProfile, error)
	ListStoreTechnicians(ctx context.Context, actor domain.Actor) ([]domain.TechnicianProfile, error)
	CreateTechnician(ctx context.Context, actor domain.Actor, input CreateTechnicianInput) (*domain.TechnicianProfile, error)
}
