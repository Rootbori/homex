package repository

import (
	"context"
	"errors"

	"github.com/rootbeer/homex/api/internal/domain"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

const (
	whereStoreID       = "store_id = ?"
	whereStoreUser     = "store_id = ? AND user_id = ?"
	queryCreatedAtDesc = "created_at desc"
	queryNameThAsc     = "name_th asc"
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

func (r *gormUserRepository) ListVisibleUsersByStore(ctx context.Context, storeID uint) ([]domain.StoreUserSummary, error) {
	var users []domain.StoreUserSummary
	query := `
		SELECT
			u.id,
			u.full_name AS name,
			COALESCE(u.email, '') AS email,
			COALESCE(NULLIF(u.phone, ''), '-') AS phone,
			COALESCE(
				NULLIF(up.preferred_area, ''),
				NULLIF((
					SELECT j.area_label
					FROM jobs j
					WHERE j.store_id = ? AND j.user_id = u.id
					ORDER BY j.created_at DESC
					LIMIT 1
				), ''),
				NULLIF((
					SELECT l.area_label
					FROM leads l
					WHERE l.store_id = ? AND l.user_id = u.id
					ORDER BY l.created_at DESC
					LIMIT 1
				), ''),
				'-'
			) AS area,
			COALESCE(up.total_spend, 0) AS total_spend,
			COALESCE((
				SELECT COUNT(*)
				FROM jobs j2
				WHERE j2.store_id = ? AND j2.user_id = u.id
			), 0) AS jobs_count,
			COALESCE(up.note, '') AS note
		FROM users u
		LEFT JOIN user_profiles up ON up.store_id = ? AND up.user_id = u.id
		WHERE EXISTS (
			SELECT 1
			FROM jobs j3
			WHERE j3.store_id = ? AND j3.user_id = u.id
		)
		AND u.type IN (?, ?)
		AND NOT EXISTS (
			SELECT 1
			FROM store_memberships sm
			WHERE sm.store_id = ? AND sm.user_id = u.id
		)
		ORDER BY jobs_count DESC, u.created_at DESC
	`
	if err := r.db.WithContext(ctx).Raw(
		query,
		storeID,
		storeID,
		storeID,
		storeID,
		storeID,
		domain.UserTypeUser,
		domain.UserTypeHybrid,
		storeID,
	).Scan(&users).Error; err != nil {
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

func (r *gormStoreRepository) Create(ctx context.Context, store *domain.Store) error {
	return r.db.WithContext(ctx).Create(store).Error
}

func (r *gormStoreRepository) Update(ctx context.Context, store *domain.Store) error {
	return r.db.WithContext(ctx).Save(store).Error
}

func (r *gormStoreRepository) GetMembership(ctx context.Context, storeID, userID uint) (*domain.StoreMembership, error) {
	var mem domain.StoreMembership
	err := r.db.WithContext(ctx).Where(whereStoreUser, storeID, userID).First(&mem).Error
	if err != nil {
		return nil, wrapNotFound(err)
	}
	return &mem, nil
}

func (r *gormStoreRepository) GetAnyMembershipByUser(ctx context.Context, userID uint) (*domain.StoreMembership, error) {
	var mem domain.StoreMembership
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Order(queryCreatedAtDesc).First(&mem).Error
	if err != nil {
		return nil, wrapNotFound(err)
	}
	return &mem, nil
}

func (r *gormStoreRepository) GetTechnicianProfile(ctx context.Context, memID uint) (*domain.TechnicianProfile, error) {
	var tech domain.TechnicianProfile
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Store").
		Preload("Services").
		Preload("Areas").
		Where("membership_id = ?", memID).
		First(&tech).Error
	if err != nil {
		return nil, wrapNotFound(err)
	}
	return &tech, nil
}

func (r *gormStoreRepository) GetTechnicianByUserID(ctx context.Context, storeID, userID uint) (*domain.TechnicianProfile, error) {
	var tech domain.TechnicianProfile
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Store").
		Preload("Services").
		Preload("Areas").
		Where(whereStoreUser, storeID, userID).
		First(&tech).Error
	if err != nil {
		return nil, wrapNotFound(err)
	}
	return &tech, nil
}

func (r *gormStoreRepository) GetTechnicianBySlug(ctx context.Context, slug string) (*domain.TechnicianProfile, error) {
	var tech domain.TechnicianProfile
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Store").
		Preload("Services").
		Preload("Areas").
		Where("slug = ?", slug).
		First(&tech).Error
	if err != nil {
		return nil, wrapNotFound(err)
	}
	return &tech, nil
}

func (r *gormStoreRepository) ListPublicTechnicians(ctx context.Context, filters domain.TechnicianSearchFilters) ([]domain.TechnicianProfile, error) {
	var techs []domain.TechnicianProfile
	db := r.db.WithContext(ctx).
		Model(&domain.TechnicianProfile{}).
		Preload("User").
		Preload("Store").
		Preload("Services").
		Preload("Areas")

	if filters.Query != "" {
		like := "%" + filters.Query + "%"
		db = db.Joins("LEFT JOIN users ON users.id = technician_profiles.user_id").
			Joins("LEFT JOIN stores ON stores.id = technician_profiles.store_id").
			Where("technician_profiles.headline ILIKE ? OR technician_profiles.slug ILIKE ? OR users.full_name ILIKE ? OR stores.name ILIKE ?", like, like, like, like)
	}
	if filters.ServiceLabel != "" {
		like := "%" + filters.ServiceLabel + "%"
		db = db.Joins("JOIN technician_services ON technician_services.technician_id = technician_profiles.id").
			Where("technician_services.label ILIKE ?", like)
	}
	if filters.AreaLabel != "" {
		like := "%" + filters.AreaLabel + "%"
		db = db.Joins("JOIN service_areas ON service_areas.technician_id = technician_profiles.id").
			Where("service_areas.label ILIKE ?", like)
	}
	if filters.Availability != "" {
		db = db.Where("technician_profiles.availability = ?", filters.Availability)
	}
	if filters.MaxPrice > 0 {
		db = db.Joins("JOIN technician_services price_filter ON price_filter.technician_id = technician_profiles.id").
			Where("price_filter.starting_price > 0 AND price_filter.starting_price <= ?", filters.MaxPrice)
	}
	if err := db.Distinct("technician_profiles.*").Find(&techs).Error; err != nil {
		return nil, err
	}
	return techs, nil
}

func (r *gormStoreRepository) ListStoreTechnicians(ctx context.Context, storeID uint) ([]domain.TechnicianProfile, error) {
	var techs []domain.TechnicianProfile
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Store").
		Preload("Services").
		Preload("Areas").
		Where(whereStoreID, storeID).
		Order(queryCreatedAtDesc).
		Find(&techs).Error; err != nil {
		return nil, err
	}
	return techs, nil
}

func (r *gormStoreRepository) CreateMembership(ctx context.Context, mem *domain.StoreMembership) error {
	return r.db.WithContext(ctx).Create(mem).Error
}

func (r *gormStoreRepository) CreateTechnicianProfile(ctx context.Context, tech *domain.TechnicianProfile) error {
	return r.db.WithContext(ctx).Create(tech).Error
}

func (r *gormStoreRepository) UpdateTechnicianProfile(ctx context.Context, tech *domain.TechnicianProfile) error {
	return r.db.WithContext(ctx).Save(tech).Error
}

func (r *gormStoreRepository) ReplaceTechnicianServices(ctx context.Context, technicianID uint, services []domain.TechnicianService) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("technician_id = ?", technicianID).Delete(&domain.TechnicianService{}).Error; err != nil {
			return err
		}
		if len(services) == 0 {
			return nil
		}
		return tx.Create(&services).Error
	})
}

func (r *gormStoreRepository) ReplaceServiceAreas(ctx context.Context, storeID, technicianID uint, areas []domain.ServiceArea) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("store_id = ? AND technician_id = ?", storeID, technicianID).Delete(&domain.ServiceArea{}).Error; err != nil {
			return err
		}
		if len(areas) == 0 {
			return nil
		}
		return tx.Create(&areas).Error
	})
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
	if err := r.db.WithContext(ctx).Where(whereStoreID, id).Order(queryCreatedAtDesc).Find(&jobs).Error; err != nil {
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

func (r *gormJobRepository) ListByStoreAndUser(ctx context.Context, storeID, userID uint) ([]domain.Job, error) {
	var jobs []domain.Job
	if err := r.db.WithContext(ctx).
		Where("store_id = ? AND user_id = ?", storeID, userID).
		Order(queryCreatedAtDesc).
		Find(&jobs).Error; err != nil {
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
	if err := r.db.WithContext(ctx).Where(whereStoreID, id).Order(queryCreatedAtDesc).Find(&leads).Error; err != nil {
		return nil, err
	}
	return leads, nil
}

func (r *gormJobRepository) CreateLead(ctx context.Context, lead *domain.Lead) error {
	return r.db.WithContext(ctx).Create(lead).Error
}

func (r *gormJobRepository) CreateQuotation(ctx context.Context, quotation *domain.Quotation, items []domain.QuotationItem) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(quotation).Error; err != nil {
			return err
		}

		if len(items) == 0 {
			return nil
		}

		for index := range items {
			items[index].QuotationID = quotation.ID
		}

		return tx.Create(&items).Error
	})
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

// ── Geo Repository ──────────────────────────────────────────────────

type gormGeoRepository struct {
	db *gorm.DB
}

func NewGeoRepository(db *gorm.DB) domain.GeoRepository {
	return &gormGeoRepository{db: db}
}

func (r *gormGeoRepository) ListProvinces(ctx context.Context) ([]domain.ThaiProvince, error) {
	var items []domain.ThaiProvince
	if err := r.db.WithContext(ctx).Order(queryNameThAsc).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *gormGeoRepository) ListDistricts(ctx context.Context, provinceID uint) ([]domain.ThaiDistrict, error) {
	var items []domain.ThaiDistrict
	if err := r.db.WithContext(ctx).Where("province_id = ?", provinceID).Order(queryNameThAsc).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *gormGeoRepository) ListSubdistricts(ctx context.Context, districtID uint) ([]domain.ThaiSubdistrict, error) {
	var items []domain.ThaiSubdistrict
	if err := r.db.WithContext(ctx).Where("district_id = ?", districtID).Order(queryNameThAsc).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *gormGeoRepository) ReplaceThailandGeoData(ctx context.Context, provinces []domain.ThaiProvince, districts []domain.ThaiDistrict, subdistricts []domain.ThaiSubdistrict) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec("TRUNCATE TABLE thai_subdistricts, thai_districts, thai_provinces RESTART IDENTITY CASCADE").Error; err != nil {
			return err
		}

		if err := insertInBatches(tx, provinces, 500); err != nil {
			return err
		}
		if err := insertInBatches(tx, districts, 1000); err != nil {
			return err
		}
		if err := insertInBatches(tx, subdistricts, 1000); err != nil {
			return err
		}

		return nil
	})
}

func insertInBatches[T any](tx *gorm.DB, items []T, batchSize int) error {
	if len(items) == 0 {
		return nil
	}
	return tx.CreateInBatches(items, batchSize).Error
}
