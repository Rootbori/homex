package repository

import (
	"context"
	"errors"

	"github.com/rootbeer/homex/api/internal/domain"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

const (
	whereStoreUser      = "store_id = ? AND user_id = ?"
	queryCreatedAtDesc  = "created_at desc"
)

// wrapNotFound converts gorm.ErrRecordNotFound to domain.ErrNotFound
// so the usecase layer never needs to know about gorm.
func wrapNotFound(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return domain.ErrNotFound
	}
	return err
}

// ── User Repository ─────────────────────────────────────────────────

type gormUserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) domain.UserRepository {
	return &gormUserRepository{db: db}
}

func (r *gormUserRepository) GetByID(ctx context.Context, id uint) (*domain.User, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).First(&user, id).Error; err != nil {
		return nil, wrapNotFound(err)
	}
	return &user, nil
}

func (r *gormUserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error; err != nil {
		return nil, wrapNotFound(err)
	}
	return &user, nil
}

func (r *gormUserRepository) GetByPhone(ctx context.Context, phone string) (*domain.User, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Where("phone = ?", phone).First(&user).Error; err != nil {
		return nil, wrapNotFound(err)
	}
	return &user, nil
}

func (r *gormUserRepository) Create(ctx context.Context, user *domain.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *gormUserRepository) Update(ctx context.Context, user *domain.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

func (r *gormUserRepository) ListUsers(ctx context.Context) ([]domain.User, error) {
	var users []domain.User
	if err := r.db.WithContext(ctx).Where("type = ?", domain.UserTypeUser).Order(queryCreatedAtDesc).Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (r *gormUserRepository) GetIdentity(ctx context.Context, provider domain.IdentityProvider, providerUserID string) (*domain.UserIdentity, error) {
	var ident domain.UserIdentity
	err := r.db.WithContext(ctx).Where("provider = ? AND provider_user_id = ?", provider, providerUserID).First(&ident).Error
	if err != nil {
		return nil, wrapNotFound(err)
	}
	return &ident, nil
}

func (r *gormUserRepository) UpsertIdentity(ctx context.Context, ident *domain.UserIdentity) error {
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "provider"}, {Name: "provider_user_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"email", "updated_at"}),
	}).Create(ident).Error
}

func (r *gormUserRepository) GetProfile(ctx context.Context, storeID, userID uint) (*domain.UserProfile, error) {
	var profile domain.UserProfile
	err := r.db.WithContext(ctx).Where(whereStoreUser, storeID, userID).First(&profile).Error
	if err != nil {
		return nil, wrapNotFound(err)
	}
	return &profile, nil
}

func (r *gormUserRepository) UpsertProfile(ctx context.Context, profile *domain.UserProfile) error {
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "store_id"}, {Name: "user_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"preferred_area", "note", "updated_at"}),
	}).Create(profile).Error
}

func (r *gormUserRepository) GetSignupSession(ctx context.Context, token string) (*domain.AuthSignupSession, error) {
	var sess domain.AuthSignupSession
	err := r.db.WithContext(ctx).Where("token = ? AND consumed_at IS NULL", token).First(&sess).Error
	if err != nil {
		return nil, wrapNotFound(err)
	}
	return &sess, nil
}

func (r *gormUserRepository) CreateSignupSession(ctx context.Context, sess *domain.AuthSignupSession) error {
	return r.db.WithContext(ctx).Create(sess).Error
}

func (r *gormUserRepository) UpdateSignupSession(ctx context.Context, sess *domain.AuthSignupSession) error {
	return r.db.WithContext(ctx).Save(sess).Error
}

// ── Store Repository ────────────────────────────────────────────────

type gormStoreRepository struct {
	db *gorm.DB
}

func NewStoreRepository(db *gorm.DB) domain.StoreRepository {
	return &gormStoreRepository{db: db}
}

func (r *gormStoreRepository) GetByID(ctx context.Context, id uint) (*domain.Store, error) {
	var store domain.Store
	if err := r.db.WithContext(ctx).First(&store, id).Error; err != nil {
		return nil, wrapNotFound(err)
	}
	return &store, nil
}

func (r *gormStoreRepository) GetMembership(ctx context.Context, storeID, userID uint) (*domain.StoreMembership, error) {
	var mem domain.StoreMembership
	err := r.db.WithContext(ctx).Where(whereStoreUser, storeID, userID).First(&mem).Error
	if err != nil {
		return nil, wrapNotFound(err)
	}
	return &mem, nil
}

func (r *gormStoreRepository) GetTechnicianProfile(ctx context.Context, memID uint) (*domain.TechnicianProfile, error) {
	var tech domain.TechnicianProfile
	err := r.db.WithContext(ctx).Where("membership_id = ?", memID).First(&tech).Error
	if err != nil {
		return nil, wrapNotFound(err)
	}
	return &tech, nil
}

func (r *gormStoreRepository) GetTechnicianByUserID(ctx context.Context, storeID, userID uint) (*domain.TechnicianProfile, error) {
	var tech domain.TechnicianProfile
	err := r.db.WithContext(ctx).Where(whereStoreUser, storeID, userID).First(&tech).Error
	if err != nil {
		return nil, wrapNotFound(err)
	}
	return &tech, nil
}

func (r *gormStoreRepository) GetTechnicianBySlug(ctx context.Context, slug string) (*domain.TechnicianProfile, error) {
	var tech domain.TechnicianProfile
	err := r.db.WithContext(ctx).Where("slug = ?", slug).First(&tech).Error
	if err != nil {
		return nil, wrapNotFound(err)
	}
	return &tech, nil
}

func (r *gormStoreRepository) ListPublicTechnicians(ctx context.Context, query string) ([]domain.TechnicianProfile, error) {
	var techs []domain.TechnicianProfile
	db := r.db.WithContext(ctx)
	if query != "" {
		db = db.Where("headline LIKE ? OR slug LIKE ?", "%"+query+"%", "%"+query+"%")
	}
	if err := db.Find(&techs).Error; err != nil {
		return nil, err
	}
	return techs, nil
}

// ── Job Repository ──────────────────────────────────────────────────

type gormJobRepository struct {
	db *gorm.DB
}

func NewJobRepository(db *gorm.DB) domain.JobRepository {
	return &gormJobRepository{db: db}
}

func (r *gormJobRepository) GetByID(ctx context.Context, id uint) (*domain.Job, error) {
	var job domain.Job
	if err := r.db.WithContext(ctx).First(&job, id).Error; err != nil {
		return nil, wrapNotFound(err)
	}
	return &job, nil
}

func (r *gormJobRepository) ListByStore(ctx context.Context, id uint) ([]domain.Job, error) {
	var jobs []domain.Job
	if err := r.db.WithContext(ctx).Where("store_id = ?", id).Order(queryCreatedAtDesc).Find(&jobs).Error; err != nil {
		return nil, err
	}
	return jobs, nil
}

func (r *gormJobRepository) ListByUser(ctx context.Context, profileID uint) ([]domain.Job, error) {
	var jobs []domain.Job
	if err := r.db.WithContext(ctx).Where("user_id = ?", profileID).Order(queryCreatedAtDesc).Find(&jobs).Error; err != nil {
		return nil, err
	}
	return jobs, nil
}

func (r *gormJobRepository) ListByTechnician(ctx context.Context, techID uint) ([]domain.Job, error) {
	var jobs []domain.Job
	if err := r.db.WithContext(ctx).Where("assigned_technician_id = ?", techID).Order(queryCreatedAtDesc).Find(&jobs).Error; err != nil {
		return nil, err
	}
	return jobs, nil
}

func (r *gormJobRepository) Create(ctx context.Context, job *domain.Job) error {
	return r.db.WithContext(ctx).Create(job).Error
}

func (r *gormJobRepository) Update(ctx context.Context, job *domain.Job) error {
	return r.db.WithContext(ctx).Save(job).Error
}

func (r *gormJobRepository) GetLeadByID(ctx context.Context, id uint) (*domain.Lead, error) {
	var lead domain.Lead
	if err := r.db.WithContext(ctx).First(&lead, id).Error; err != nil {
		return nil, wrapNotFound(err)
	}
	return &lead, nil
}

func (r *gormJobRepository) ListLeadsByStore(ctx context.Context, id uint) ([]domain.Lead, error) {
	var leads []domain.Lead
	if err := r.db.WithContext(ctx).Where("store_id = ?", id).Order(queryCreatedAtDesc).Find(&leads).Error; err != nil {
		return nil, err
	}
	return leads, nil
}

func (r *gormJobRepository) CreateLead(ctx context.Context, lead *domain.Lead) error {
	return r.db.WithContext(ctx).Create(lead).Error
}

func (r *gormJobRepository) GetQuotationByJobID(ctx context.Context, id uint) (*domain.Quotation, error) {
	var q domain.Quotation
	err := r.db.WithContext(ctx).Where("job_id = ?", id).First(&q).Error
	if err != nil {
		return nil, wrapNotFound(err)
	}
	return &q, nil
}

func (r *gormJobRepository) GetQuotationByLeadID(ctx context.Context, id uint) (*domain.Quotation, error) {
	var q domain.Quotation
	err := r.db.WithContext(ctx).Where("lead_id = ?", id).First(&q).Error
	if err != nil {
		return nil, wrapNotFound(err)
	}
	return &q, nil
}
