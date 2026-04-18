package usecase

import (
	"context"
	"errors"
	"fmt"
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

func (u *storeUsecase) GetCurrentStore(ctx context.Context, actor domain.Actor) (*domain.Store, error) {
	if !actor.IsStaff() {
		return nil, domain.ErrForbidden
	}
	return u.storeRepo.GetByID(ctx, actor.UintStoreID())
}

func (u *storeUsecase) GetSetupProfile(ctx context.Context, actor domain.Actor) (*domain.Store, *domain.TechnicianProfile, error) {
	if !actor.IsStaff() {
		return nil, nil, domain.ErrForbidden
	}

	store, err := u.storeRepo.GetByID(ctx, actor.UintStoreID())
	if err != nil {
		return nil, nil, err
	}

	tech, err := u.ensureActorTechnicianProfile(ctx, actor, store, false)
	if err != nil && !errorsIsNotFound(err) {
		return nil, nil, err
	}
	if errorsIsNotFound(err) {
		tech = nil
	}

	return store, tech, nil
}

func (u *storeUsecase) UpdateSetupProfile(ctx context.Context, actor domain.Actor, input SetupProfileInput) (*domain.Store, *domain.TechnicianProfile, error) {
	if !actor.IsStaff() {
		return nil, nil, domain.ErrForbidden
	}

	store, err := u.storeRepo.GetByID(ctx, actor.UintStoreID())
	if err != nil {
		return nil, nil, err
	}

	if actor.CanAssignJobs() {
		if err := u.updateStoreForSetup(ctx, store, input); err != nil {
			return nil, nil, err
		}
	}

	tech, err := u.ensureActorTechnicianProfile(ctx, actor, store, true)
	if err != nil {
		return nil, nil, err
	}

	if err := u.updateBasicProfileForSetup(ctx, actor, tech, input); err != nil {
		return nil, nil, err
	}

	if err := u.replaceTechnicianServices(ctx, tech.ID, input.Services); err != nil {
		return nil, nil, err
	}

	if err := u.replaceTechnicianAreas(ctx, store.ID, tech.ID, input.Areas); err != nil {
		return nil, nil, err
	}

	return u.GetSetupProfile(ctx, actor)
}

func (u *storeUsecase) updateStoreForSetup(ctx context.Context, store *domain.Store, input SetupProfileInput) error {
	store.Name = firstNonBlank(strings.TrimSpace(input.StoreName), store.Name)
	store.Phone = strings.TrimSpace(input.StorePhone)
	store.LineOAID = strings.TrimSpace(input.StoreLineOAID)
	store.LogoURL = strings.TrimSpace(input.StoreLogoURL)
	store.Description = strings.TrimSpace(input.StoreDescription)
	return u.storeRepo.Update(ctx, store)
}

func (u *storeUsecase) updateBasicProfileForSetup(ctx context.Context, actor domain.Actor, tech *domain.TechnicianProfile, input SetupProfileInput) error {
	user, err := u.userRepo.GetByID(ctx, actor.UintUserID())
	if err != nil {
		return err
	}

	user.FullName = firstNonBlank(strings.TrimSpace(input.TechnicianName), user.FullName)
	user.Phone = strings.TrimSpace(input.TechnicianPhone)
	user.AvatarURL = strings.TrimSpace(input.TechnicianAvatarURL)
	if err := u.userRepo.Update(ctx, user); err != nil {
		return err
	}

	tech.AvatarURL = user.AvatarURL
	tech.Headline = strings.TrimSpace(input.TechnicianHeadline)
	tech.ExperienceYears = maxInt(input.ExperienceYears, 0)
	if input.Availability == domain.AvailabilityBusy {
		tech.Availability = domain.AvailabilityBusy
	} else {
		tech.Availability = domain.AvailabilityAvailable
	}
	tech.WorkingHours = strings.TrimSpace(input.WorkingHours)
	tech.LineURL = strings.TrimSpace(input.LineURL)
	return u.storeRepo.UpdateTechnicianProfile(ctx, tech)
}

func (u *storeUsecase) replaceTechnicianServices(ctx context.Context, techID uint, input []TechnicianServiceInput) error {
	services := make([]domain.TechnicianService, 0, len(input))
	for _, item := range input {
		label := strings.TrimSpace(item.Label)
		if label == "" {
			continue
		}
		services = append(services, domain.TechnicianService{
			TechnicianID:  techID,
			ServiceType:   classifyServiceLabel(label),
			Label:         label,
			StartingPrice: maxInt(item.StartingPrice, 0),
		})
	}
	return u.storeRepo.ReplaceTechnicianServices(ctx, techID, services)
}

func (u *storeUsecase) replaceTechnicianAreas(ctx context.Context, storeID, techID uint, input []SetupAreaInput) error {
	areas := make([]domain.ServiceArea, 0, len(input))
	for _, item := range input {
		province := strings.TrimSpace(item.Province)
		district := strings.TrimSpace(item.District)
		subdistrict := strings.TrimSpace(item.Subdistrict)
		label := buildServiceAreaLabel(province, district, subdistrict, strings.TrimSpace(item.Label))
		if label == "" || province == "" || district == "" {
			continue
		}
		areas = append(areas, domain.ServiceArea{
			StoreID:      storeID,
			TechnicianID: &techID,
			Province:     province,
			District:     district,
			Subdistrict:  subdistrict,
			Label:        label,
		})
	}
	return u.storeRepo.ReplaceServiceAreas(ctx, storeID, techID, areas)
}

func (u *storeUsecase) GetTechnicianDetails(ctx context.Context, slug string) (*domain.TechnicianProfile, error) {
	return u.storeRepo.GetTechnicianBySlug(ctx, slug)
}

func (u *storeUsecase) ListTechnicians(ctx context.Context, filters domain.TechnicianSearchFilters) ([]domain.TechnicianProfile, error) {
	return u.storeRepo.ListPublicTechnicians(ctx, filters)
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

	user, err := u.resolveOrCreateStaffUser(ctx, name, strings.TrimSpace(input.Phone))
	if err != nil {
		return nil, err
	}

	membership, err := u.ensureMembershipForTechnician(ctx, store, user)
	if err != nil {
		return nil, err
	}

	tech, err := u.ensureTechnicianProfileForCreate(ctx, store, user, membership)
	if err != nil {
		return nil, err
	}

	if err := u.setupTechnicianServicesFromInput(ctx, tech.ID, input.Services); err != nil {
		return nil, err
	}

	return u.storeRepo.GetTechnicianProfile(ctx, membership.ID)
}

func (u *storeUsecase) ensureMembershipForTechnician(ctx context.Context, store *domain.Store, user *domain.User) (*domain.StoreMembership, error) {
	membership, err := u.storeRepo.GetMembership(ctx, store.ID, user.ID)
	if err != nil && !errorsIsNotFound(err) {
		return nil, err
	}
	if membership != nil {
		return membership, nil
	}

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
	return membership, nil
}

func (u *storeUsecase) ensureTechnicianProfileForCreate(ctx context.Context, store *domain.Store, user *domain.User, membership *domain.StoreMembership) (*domain.TechnicianProfile, error) {
	tech, err := u.storeRepo.GetTechnicianProfile(ctx, membership.ID)
	if err != nil && !errorsIsNotFound(err) {
		return nil, err
	}
	if tech != nil {
		return tech, nil
	}

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
	return tech, nil
}

func (u *storeUsecase) setupTechnicianServicesFromInput(ctx context.Context, techID uint, serviceLabels []string) error {
	services := make([]domain.TechnicianService, 0, len(serviceLabels))
	for _, label := range serviceLabels {
		trimmed := strings.TrimSpace(label)
		if trimmed == "" {
			continue
		}
		services = append(services, domain.TechnicianService{
			TechnicianID: techID,
			ServiceType:  mapServiceType(trimmed),
			Label:        trimmed,
		})
	}
	return u.storeRepo.ReplaceTechnicianServices(ctx, techID, services)
}

func firstNonBlank(value, fallback string) string {
	if value != "" {
		return value
	}
	return fallback
}

func maxInt(value, minimum int) int {
	if value < minimum {
		return minimum
	}
	return value
}

func classifyServiceLabel(label string) domain.ServiceType {
	normalized := strings.TrimSpace(label)

	switch {
	case strings.Contains(normalized, "ล้าง"):
		return domain.ServiceCleaning
	case strings.Contains(normalized, "ซ่อม"), strings.Contains(normalized, "ตรวจ"):
		return domain.ServiceRepair
	case strings.Contains(normalized, "น้ำยา"), strings.Contains(normalized, "เติม"):
		return domain.ServiceRefill
	case strings.Contains(normalized, "ติดตั้ง"), strings.Contains(normalized, "ย้าย"):
		return domain.ServiceInstallation
	default:
		return domain.ServiceRepair
	}
}

func buildServiceAreaLabel(province, district, subdistrict, fallback string) string {
	if fallback != "" {
		return fallback
	}

	parts := make([]string, 0, 3)
	if subdistrict != "" {
		parts = append(parts, subdistrict)
	}
	if district != "" {
		parts = append(parts, district)
	}
	if province != "" {
		parts = append(parts, province)
	}

	return strings.Join(parts, ", ")
}

func (u *storeUsecase) ensureActorTechnicianProfile(
	ctx context.Context,
	actor domain.Actor,
	store *domain.Store,
	createIfMissing bool,
) (*domain.TechnicianProfile, error) {
	tech, err := u.storeRepo.GetTechnicianByUserID(ctx, actor.UintStoreID(), actor.UintUserID())
	if err == nil {
		return tech, nil
	}
	if !errorsIsNotFound(err) {
		return nil, err
	}

	membership, err := u.storeRepo.GetMembership(ctx, store.ID, actor.UintUserID())
	if err != nil {
		return nil, err
	}

	tech, err = u.storeRepo.GetTechnicianProfile(ctx, membership.ID)
	if err == nil {
		return tech, nil
	}
	if !errorsIsNotFound(err) || !createIfMissing {
		return nil, err
	}

	user, err := u.userRepo.GetByID(ctx, actor.UintUserID())
	if err != nil {
		return nil, err
	}

	tech = &domain.TechnicianProfile{
		MembershipID:    membership.ID,
		StoreID:         store.ID,
		UserID:          user.ID,
		Slug:            setupTechnicianSlug(user.FullName, user.ID),
		AvatarURL:       user.AvatarURL,
		Headline:        defaultTechnicianHeadline(store.Name),
		Availability:    domain.AvailabilityAvailable,
		WorkingHours:    "ทุกวัน 08:00 - 18:00",
		ExperienceYears: 0,
	}
	if err := u.storeRepo.CreateTechnicianProfile(ctx, tech); err != nil {
		// Another request may have created the profile already; read it back instead of surfacing DB internals.
		existing, readErr := u.storeRepo.GetTechnicianProfile(ctx, membership.ID)
		if readErr == nil {
			return existing, nil
		}
		return nil, err
	}

	return tech, nil
}

func setupTechnicianSlug(name string, userID uint) string {
	base := strings.ToLower(strings.TrimSpace(name))
	if base == "" {
		base = fmt.Sprintf("technician-%d", userID)
	}

	replacer := strings.NewReplacer(" ", "-", "_", "-", "/", "-", ".", "-")
	base = replacer.Replace(base)
	base = strings.Trim(base, "-")
	if base == "" {
		base = fmt.Sprintf("technician-%d", userID)
	}

	return fmt.Sprintf("%s-%d", base, userID)
}

func (u *storeUsecase) resolveOrCreateStaffUser(ctx context.Context, fullName, phone string) (*domain.User, error) {
	if phone == "" {
		return u.createNewStaffUser(ctx, fullName, phone)
	}

	user, err := u.userRepo.GetByPhone(ctx, phone)
	if err == nil && user != nil {
		return u.upgradeExistingStaffUser(ctx, user, fullName)
	}
	if err != nil && !errorsIsNotFound(err) {
		return nil, err
	}

	return u.createNewStaffUser(ctx, fullName, phone)
}

func (u *storeUsecase) upgradeExistingStaffUser(ctx context.Context, user *domain.User, fullName string) (*domain.User, error) {
	needsUpdate := false
	if user.Type == domain.UserTypeUser {
		user.Type = domain.UserTypeHybrid
		needsUpdate = true
	}
	if user.FullName == "" {
		user.FullName = fullName
		needsUpdate = true
	}

	if needsUpdate {
		if err := u.userRepo.Update(ctx, user); err != nil {
			return nil, err
		}
	}
	return user, nil
}

func (u *storeUsecase) createNewStaffUser(ctx context.Context, fullName, phone string) (*domain.User, error) {
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
	return err != nil && errors.Is(err, domain.ErrNotFound)
}
