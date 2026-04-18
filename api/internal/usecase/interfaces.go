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

type ValidateSessionInput struct {
	ClaimedStoreID      string
	ClaimedRole         domain.Role
	ClaimedTechnicianID string
	ClaimedProfileID    string
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

type TechnicianServiceInput struct {
	Label         string
	StartingPrice int
}

type SetupAreaInput struct {
	Province    string
	District    string
	Subdistrict string
	Label       string
}

type SetupProfileInput struct {
	StoreName           string
	StorePhone          string
	StoreLineOAID       string
	StoreLogoURL        string
	StoreDescription    string
	TechnicianName      string
	TechnicianPhone     string
	TechnicianAvatarURL string
	TechnicianHeadline  string
	ExperienceYears     int
	Availability        domain.Availability
	WorkingHours        string
	LineURL             string
	Services            []TechnicianServiceInput
	Areas               []SetupAreaInput
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
	ValidateOAuthSession(ctx context.Context, ident domain.UserIdentity, accountType domain.UserType, input ValidateSessionInput) (*AuthSyncResult, error)
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
	GetSetupProfile(ctx context.Context, actor domain.Actor) (*domain.Store, *domain.TechnicianProfile, error)
	UpdateSetupProfile(ctx context.Context, actor domain.Actor, input SetupProfileInput) (*domain.Store, *domain.TechnicianProfile, error)
	GetTechnicianDetails(ctx context.Context, slug string) (*domain.TechnicianProfile, error)
	ListTechnicians(ctx context.Context, filters domain.TechnicianSearchFilters) ([]domain.TechnicianProfile, error)
	ListStoreTechnicians(ctx context.Context, actor domain.Actor) ([]domain.TechnicianProfile, error)
	CreateTechnician(ctx context.Context, actor domain.Actor, input CreateTechnicianInput) (*domain.TechnicianProfile, error)
}

type GeoUsecase interface {
	ListProvinces(ctx context.Context) ([]domain.ThaiProvince, error)
	ListDistricts(ctx context.Context, provinceID uint) ([]domain.ThaiDistrict, error)
	ListSubdistricts(ctx context.Context, districtID uint) ([]domain.ThaiSubdistrict, error)
}
