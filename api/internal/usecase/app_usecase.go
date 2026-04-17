package usecase

import (
	"context"
	"errors"
	"strings"

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

func (u *jobUsecase) ListJobsForUser(ctx context.Context, actor domain.Actor, userID uint) ([]domain.Job, error) {
	if !actor.IsStaff() {
		return nil, domain.ErrForbidden
	}
	return u.jobRepo.ListByStoreAndUser(ctx, actor.UintStoreID(), userID)
}

func (u *jobUsecase) CreateQuotation(ctx context.Context, actor domain.Actor, input CreateQuotationInput) (*domain.Quotation, []domain.QuotationItem, error) {
	if !actor.CanAssignJobs() {
		return nil, nil, domain.ErrForbidden
	}

	recipientName := strings.TrimSpace(input.RecipientName)
	recipientEmail := strings.TrimSpace(input.RecipientEmail)
	if recipientName == "" || recipientEmail == "" {
		return nil, nil, domain.ErrConflict
	}

	items := make([]domain.QuotationItem, 0, len(input.Items))
	subtotal := 0
	for _, item := range input.Items {
		label := strings.TrimSpace(item.Label)
		if label == "" {
			continue
		}

		quantity := item.Quantity
		if quantity <= 0 {
			quantity = 1
		}

		unitPrice := item.UnitPrice
		if unitPrice < 0 {
			unitPrice = 0
		}

		amount := quantity * unitPrice
		subtotal += amount
		items = append(items, domain.QuotationItem{
			Label:     label,
			Quantity:  quantity,
			UnitPrice: unitPrice,
			Amount:    amount,
		})
	}

	if len(items) == 0 {
		return nil, nil, domain.ErrConflict
	}

	discount := input.Discount
	if discount < 0 {
		discount = 0
	}
	if discount > subtotal {
		discount = subtotal
	}

	quotation := &domain.Quotation{
		StoreID:        actor.UintStoreID(),
		RecipientName:  recipientName,
		RecipientEmail: recipientEmail,
		Status:         domain.QuotationStatusDraft,
		Subtotal:       subtotal,
		Discount:       discount,
		Total:          subtotal - discount,
		Note:           strings.TrimSpace(input.Note),
		SharedViaEmail: input.SendViaEmail,
	}
	if input.SendViaEmail {
		quotation.Status = domain.QuotationStatusSent
	}

	if err := u.jobRepo.CreateQuotation(ctx, quotation, items); err != nil {
		return nil, nil, err
	}

	return quotation, items, nil
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

func (u *userUsecase) ListUsers(ctx context.Context, actor domain.Actor) ([]domain.StoreUserSummary, error) {
	if !actor.IsStaff() {
		return nil, domain.ErrForbidden
	}
	return u.userRepo.ListVisibleUsersByStore(ctx, actor.UintStoreID())
}

// ── Store Usecase ───────────────────────────────────────────────────

type storeUsecase struct {
	storeRepo domain.StoreRepository
	userRepo  domain.UserRepository
}

func NewStoreUsecase(storeRepo domain.StoreRepository, userRepo domain.UserRepository) StoreUsecase {
	return &storeUsecase{
		storeRepo: storeRepo,
		userRepo:  userRepo,
	}
}

func (u *storeUsecase) GetTechnicianDetails(ctx context.Context, slug string) (*domain.TechnicianProfile, error) {
	return u.storeRepo.GetTechnicianBySlug(ctx, slug)
}

func (u *storeUsecase) ListTechnicians(ctx context.Context, query string) ([]domain.TechnicianProfile, error) {
	return u.storeRepo.ListPublicTechnicians(ctx, query)
}

func (u *storeUsecase) ListStoreTechnicians(ctx context.Context, actor domain.Actor) ([]domain.TechnicianProfile, error) {
	if !actor.IsStaff() {
		return nil, domain.ErrForbidden
	}
	return u.storeRepo.ListStoreTechnicians(ctx, actor.UintStoreID())
}

func (u *storeUsecase) CreateTechnician(ctx context.Context, actor domain.Actor, input CreateTechnicianInput) (*domain.TechnicianProfile, error) {
	if !actor.CanAssignJobs() {
		return nil, domain.ErrForbidden
	}

	name := strings.TrimSpace(input.Name)
	if name == "" {
		return nil, domain.ErrConflict
	}

	store, err := u.storeRepo.GetByID(ctx, actor.UintStoreID())
	if err != nil {
		return nil, err
	}
	if store.Kind == domain.StoreKindSolo {
		return nil, domain.ErrConflict
	}

	user, err := u.resolveOrCreateStaffUser(ctx, name, strings.TrimSpace(input.Phone))
	if err != nil {
		return nil, err
	}

	membership, err := u.storeRepo.GetMembership(ctx, store.ID, user.ID)
	if err != nil && !errorsIsNotFound(err) {
		return nil, err
	}
	if membership == nil {
		membership = &domain.StoreMembership{
			StoreID:     store.ID,
			UserID:      user.ID,
			DisplayName: user.FullName,
			Role:        domain.RoleTechnician,
			IsActive:    true,
		}
		if err := u.storeRepo.CreateMembership(ctx, membership); err != nil {
			return nil, err
		}
	}

	tech, err := u.storeRepo.GetTechnicianProfile(ctx, membership.ID)
	if err != nil && !errorsIsNotFound(err) {
		return nil, err
	}
	if tech == nil {
		tech = &domain.TechnicianProfile{
			MembershipID:    membership.ID,
			StoreID:         store.ID,
			UserID:          user.ID,
			Slug:            technicianSlug(user.FullName, membership.ID),
			Headline:        defaultTechnicianHeadline(store.Name),
			Availability:    domain.AvailabilityAvailable,
			WorkingHours:    "ทุกวัน 08:00 - 18:00",
			ExperienceYears: 0,
			AvatarURL:       user.AvatarURL,
		}
		if err := u.storeRepo.CreateTechnicianProfile(ctx, tech); err != nil {
			return nil, err
		}
	}

	services := make([]domain.TechnicianService, 0, len(input.Services))
	for _, label := range input.Services {
		trimmed := strings.TrimSpace(label)
		if trimmed == "" {
			continue
		}
		services = append(services, domain.TechnicianService{
			TechnicianID: tech.ID,
			ServiceType:  mapServiceType(trimmed),
			Label:        trimmed,
		})
	}
	if err := u.storeRepo.ReplaceTechnicianServices(ctx, tech.ID, services); err != nil {
		return nil, err
	}

	return u.storeRepo.GetTechnicianProfile(ctx, membership.ID)
}

func (u *storeUsecase) resolveOrCreateStaffUser(ctx context.Context, fullName, phone string) (*domain.User, error) {
	if phone != "" {
		user, err := u.userRepo.GetByPhone(ctx, phone)
		if err == nil && user != nil {
			if user.Type == domain.UserTypeUser {
				user.Type = domain.UserTypeHybrid
				if updateErr := u.userRepo.Update(ctx, user); updateErr != nil {
					return nil, updateErr
				}
			}
			if user.FullName == "" {
				user.FullName = fullName
				if updateErr := u.userRepo.Update(ctx, user); updateErr != nil {
					return nil, updateErr
				}
			}
			return user, nil
		}
		if err != nil && !errorsIsNotFound(err) {
			return nil, err
		}
	}

	user := &domain.User{
		Type:     domain.UserTypeStaff,
		FullName: fullName,
		Phone:    phone,
		IsActive: true,
	}
	if err := u.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func mapServiceType(label string) domain.ServiceType {
	text := strings.ToLower(label)
	switch {
	case strings.Contains(text, "ล้าง"):
		return domain.ServiceCleaning
	case strings.Contains(text, "ซ่อม"):
		return domain.ServiceRepair
	case strings.Contains(text, "ติดตั้ง"), strings.Contains(text, "ย้าย"):
		return domain.ServiceInstallation
	case strings.Contains(text, "น้ำยา"):
		return domain.ServiceRefill
	default:
		return domain.ServiceRepair
	}
}

func errorsIsNotFound(err error) bool {
	return err == nil || errors.Is(err, domain.ErrNotFound)
}
