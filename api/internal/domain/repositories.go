package domain

import "context"

type UserRepository interface {
	GetByID(ctx context.Context, id uint) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	GetByPhone(ctx context.Context, phone string) (*User, error)
	Create(ctx context.Context, user *User) error
	Update(ctx context.Context, user *User) error
	ListUsers(ctx context.Context) ([]User, error)
	
	GetIdentity(ctx context.Context, provider IdentityProvider, providerUserID string) (*UserIdentity, error)
	UpsertIdentity(ctx context.Context, ident *UserIdentity) error
	
	GetProfile(ctx context.Context, storeID, userID uint) (*UserProfile, error)
	UpsertProfile(ctx context.Context, profile *UserProfile) error
	
	GetSignupSession(ctx context.Context, token string) (*AuthSignupSession, error)
	CreateSignupSession(ctx context.Context, sess *AuthSignupSession) error
	UpdateSignupSession(ctx context.Context, sess *AuthSignupSession) error
}

type StoreRepository interface {
	GetByID(ctx context.Context, id uint) (*Store, error)
	GetMembership(ctx context.Context, storeID, userID uint) (*StoreMembership, error)
	GetTechnicianProfile(ctx context.Context, membershipID uint) (*TechnicianProfile, error)
	GetTechnicianByUserID(ctx context.Context, storeID, userID uint) (*TechnicianProfile, error)
	GetTechnicianBySlug(ctx context.Context, slug string) (*TechnicianProfile, error)
	ListPublicTechnicians(ctx context.Context, query string) ([]TechnicianProfile, error)
	CreateMembership(ctx context.Context, mem *StoreMembership) error
	CreateTechnicianProfile(ctx context.Context, tech *TechnicianProfile) error
}

type JobRepository interface {
	GetByID(ctx context.Context, id uint) (*Job, error)
	ListByStore(ctx context.Context, storeID uint) ([]Job, error)
	ListByUser(ctx context.Context, profileID uint) ([]Job, error)
	ListByTechnician(ctx context.Context, techID uint) ([]Job, error)
	Create(ctx context.Context, job *Job) error
	Update(ctx context.Context, job *Job) error
	
	GetLeadByID(ctx context.Context, id uint) (*Lead, error)
	ListLeadsByStore(ctx context.Context, storeID uint) ([]Lead, error)
	CreateLead(ctx context.Context, lead *Lead) error
	
	GetQuotationByJobID(ctx context.Context, jobID uint) (*Quotation, error)
	GetQuotationByLeadID(ctx context.Context, leadID uint) (*Quotation, error)
}
