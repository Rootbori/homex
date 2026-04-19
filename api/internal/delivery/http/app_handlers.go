package http

import (
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/rootbeer/homex/api/internal/domain"
	"github.com/rootbeer/homex/api/internal/usecase"
)

// ── Health ───────────────────────────────────────────────────────────

func (h *Handler) handleHealth(w http.ResponseWriter, _ *http.Request) {
	h.writeJSON(w, http.StatusOK, map[string]any{
		"ok":      true,
		"app_env": h.cfg.AppEnv,
	})
}

// ── Public Technicians ──────────────────────────────────────────────

func (h *Handler) handleListTechnicians(w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()
	maxPrice, _ := strconv.Atoi(strings.TrimSpace(queryParams.Get("max_price")))
	filters := domain.TechnicianSearchFilters{
		Query:        strings.TrimSpace(queryParams.Get("q")),
		ServiceLabel: strings.TrimSpace(queryParams.Get("service")),
		AreaLabel:    strings.TrimSpace(queryParams.Get("area")),
		Availability: domain.Availability(strings.TrimSpace(queryParams.Get("availability"))),
		MaxPrice:     maxPrice,
	}
	techs, err := h.storeUC.ListTechnicians(r.Context(), filters)
	if err != nil {
		h.internalErrJSON(w, r)
		return
	}

	items := make([]map[string]any, 0, len(techs))
	for index := range techs {
		items = append(items, technicianPayload(&techs[index]))
	}

	h.writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Handler) handleGetTechnician(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	tech, err := h.storeUC.GetTechnicianDetails(r.Context(), slug)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			h.errJSONKey(w, r, http.StatusNotFound, "technician_not_found")
			return
		}
		h.internalErrJSON(w, r)
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{
		"technician": technicianPayload(tech),
		"gallery": []map[string]any{
			{"image_url": tech.AvatarURL},
		},
		"reviews": []map[string]any{
			{"user": "ลูกค้าตัวอย่าง", "rating": tech.Rating, "comment": "งานเรียบร้อยและตรงเวลา"},
		},
	})
}

// ── Signup Options ──────────────────────────────────────────────────

func (h *Handler) handleSignupOptions(w http.ResponseWriter, r *http.Request) {
	h.writeJSON(w, http.StatusOK, map[string]any{
		"title":    messageFor(r, "signup_title"),
		"subtitle": messageFor(r, "signup_subtitle"),
		"account_types": []map[string]any{
			{
				"id":          "user",
				"label":       messageFor(r, "signup_user_label"),
				"description": messageFor(r, "signup_user_description"),
				"user_type":   domain.UserTypeUser,
				"next_path":   "/search",
			},
			{
				"id":          "staff",
				"label":       messageFor(r, "signup_staff_label"),
				"description": messageFor(r, "signup_staff_description"),
				"user_type":   domain.UserTypeStaff,
				"next_path":   "/onboarding/staff",
			},
		},
		"providers": []map[string]any{
			{"id": "line", "label": "LINE", "accent": "#06C755"},
			{"id": "google", "label": messageFor(r, "gmail_label"), "accent": "#4285F4"},
		},
	})
}

// ── User Jobs ───────────────────────────────────────────────────────

func (h *Handler) handleListUserJobs(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	jobs, err := h.jobUC.ListJobs(r.Context(), actor)
	if err != nil {
		h.internalErrJSON(w, r)
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"items": jobs})
}

func (h *Handler) handleGetUserJob(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	id, _ := strconv.ParseUint(r.PathValue("id"), 10, 32)

	job, err := h.jobUC.GetJobDetail(r.Context(), actor, uint(id))
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			h.errJSONKey(w, r, http.StatusNotFound, "job_not_found")
			return
		}
		h.internalErrJSON(w, r)
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"job": job})
}

// ── Create Lead (service request) ───────────────────────────────────

func (h *Handler) handleCreateLead(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	var lead domain.Lead
	if err := h.readJSON(r, &lead); err != nil {
		h.errJSONKey(w, r, http.StatusBadRequest, errInvalidPayloadKey)
		return
	}
	lead.StoreID = 1

	if err := h.jobUC.CreateLead(r.Context(), actor, &lead); err != nil {
		h.internalErrJSON(w, r)
		return
	}

	h.messageJSON(w, r, http.StatusCreated, "lead_created", map[string]any{
		"id":      lead.ID,
		"status":  lead.Status,
	})
}

// ── Staff: Dashboard ────────────────────────────────────────────────

func (h *Handler) handleGetDashboard(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w, r) {
		return
	}
	// Simplified — full KPI queries belong in a DashboardUsecase later
	h.writeJSON(w, http.StatusOK, map[string]any{
		"scope":     actor.Scope(),
		"dashboard": map[string]any{},
	})
}

func (h *Handler) handleGetCurrentStore(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w, r) {
		return
	}

	store, err := h.storeUC.GetCurrentStore(r.Context(), actor)
	if err != nil {
		if errors.Is(err, domain.ErrForbidden) {
			h.errJSONKey(w, r, http.StatusForbidden, "forbidden")
			return
		}
		if errors.Is(err, domain.ErrNotFound) {
			h.errJSONKey(w, r, http.StatusNotFound, "store_not_found")
			return
		}
		h.internalErrJSON(w, r)
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]any{
		"store": map[string]any{
			"id":          store.ID,
			"name":        store.Name,
			"kind":        store.Kind,
			"phone":       store.Phone,
			"line_oa_id":  store.LineOAID,
			"logo_url":    store.LogoURL,
			"description": store.Description,
		},
		"scope": actor.Scope(),
	})
}

func (h *Handler) handleGetSetupProfile(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w, r) {
		return
	}

	store, technician, err := h.storeUC.GetSetupProfile(r.Context(), actor)
	if err != nil {
		if errors.Is(err, domain.ErrForbidden) {
			h.errJSONKey(w, r, http.StatusForbidden, "forbidden")
			return
		}
		if errors.Is(err, domain.ErrNotFound) {
			h.errJSONKey(w, r, http.StatusNotFound, "setup_profile_not_found")
			return
		}
		h.errJSONKey(w, r, http.StatusInternalServerError, "unable_load_setup_profile")
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]any{
		"store": map[string]any{
			"id":          store.ID,
			"name":        store.Name,
			"kind":        store.Kind,
			"phone":       store.Phone,
			"line_oa_id":  store.LineOAID,
			"logo_url":    store.LogoURL,
			"description": store.Description,
		},
		"technician":          technicianPayload(technician),
		"technician_services": technicianServiceItemsPayload(technician),
		"service_areas":       serviceAreaItemsPayload(technician),
	})
}

func (h *Handler) handleUpdateSetupProfile(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w, r) {
		return
	}

	var payload struct {
		Store struct {
			Name        string `json:"name"`
			Phone       string `json:"phone"`
			LineOAID    string `json:"line_oa_id"`
			LogoURL     string `json:"logo_url"`
			Description string `json:"description"`
		} `json:"store"`
		Technician struct {
			Name            string `json:"name"`
			Phone           string `json:"phone"`
			AvatarURL       string `json:"avatar_url"`
			Headline        string `json:"headline"`
			ExperienceYears int    `json:"experience_years"`
			Availability    string `json:"availability"`
			WorkingHours    string `json:"working_hours"`
			LineURL         string `json:"line_url"`
			Services        []struct {
				Label         string `json:"label"`
				StartingPrice int    `json:"starting_price"`
			} `json:"services"`
			Areas []struct {
				Province    string `json:"province"`
				District    string `json:"district"`
				Subdistrict string `json:"subdistrict"`
				Label       string `json:"label"`
			} `json:"areas"`
		} `json:"technician"`
	}
	if err := h.readJSON(r, &payload); err != nil {
		h.errJSONKey(w, r, http.StatusBadRequest, errInvalidPayloadKey)
		return
	}

	services := make([]usecase.TechnicianServiceInput, 0, len(payload.Technician.Services))
	for _, item := range payload.Technician.Services {
		services = append(services, usecase.TechnicianServiceInput{
			Label:         item.Label,
			StartingPrice: item.StartingPrice,
		})
	}

	areas := make([]usecase.SetupAreaInput, 0, len(payload.Technician.Areas))
	for _, item := range payload.Technician.Areas {
		areas = append(areas, usecase.SetupAreaInput{
			Province:    item.Province,
			District:    item.District,
			Subdistrict: item.Subdistrict,
			Label:       item.Label,
		})
	}

	store, technician, err := h.storeUC.UpdateSetupProfile(r.Context(), actor, usecase.SetupProfileInput{
		StoreName:           payload.Store.Name,
		StorePhone:          payload.Store.Phone,
		StoreLineOAID:       payload.Store.LineOAID,
		StoreLogoURL:        payload.Store.LogoURL,
		StoreDescription:    payload.Store.Description,
		TechnicianName:      payload.Technician.Name,
		TechnicianPhone:     payload.Technician.Phone,
		TechnicianAvatarURL: payload.Technician.AvatarURL,
		TechnicianHeadline:  payload.Technician.Headline,
		ExperienceYears:     payload.Technician.ExperienceYears,
		Availability:        domain.Availability(payload.Technician.Availability),
		WorkingHours:        payload.Technician.WorkingHours,
		LineURL:             payload.Technician.LineURL,
		Services:            services,
		Areas:               areas,
	})
	if err != nil {
		if errors.Is(err, domain.ErrForbidden) {
			h.errJSONKey(w, r, http.StatusForbidden, "forbidden")
			return
		}
		h.errJSONKey(w, r, http.StatusInternalServerError, "unable_update_setup_profile")
		return
	}

	h.messageJSON(w, r, http.StatusOK, "setup_profile_updated", map[string]any{
		"status":              "updated",
		"store":               store,
		"technician":          technicianPayload(technician),
		"technician_services": technicianServiceItemsPayload(technician),
		"service_areas":       serviceAreaItemsPayload(technician),
	})
}

// ── Staff: Leads ────────────────────────────────────────────────────

func (h *Handler) handleListLeads(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w, r) {
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"items": []any{}})
}

func (h *Handler) handleGetLeadDetail(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w, r) {
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"lead": nil})
}

// ── Staff: Jobs ─────────────────────────────────────────────────────

func (h *Handler) handleListJobs(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w, r) {
		return
	}
	jobs, err := h.jobUC.ListJobs(r.Context(), actor)
	if err != nil {
		h.internalErrJSON(w, r)
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"items": jobs})
}

func (h *Handler) handleGetJobDetail(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w, r) {
		return
	}
	id, _ := strconv.ParseUint(r.PathValue("id"), 10, 32)
	job, err := h.jobUC.GetJobDetail(r.Context(), actor, uint(id))
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			h.errJSONKey(w, r, http.StatusNotFound, "job_not_found")
			return
		}
		h.internalErrJSON(w, r)
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"job": job})
}

func (h *Handler) handleUpdateJobStatus(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w, r) {
		return
	}
	h.messageJSON(w, r, http.StatusOK, "status_updated", map[string]any{})
}

func (h *Handler) handleCreateQuotation(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w, r) {
		return
	}

	var payload struct {
		RecipientName  string `json:"recipient_name"`
		RecipientEmail string `json:"recipient_email"`
		Note           string `json:"note"`
		Discount       int    `json:"discount"`
		SendViaEmail   bool   `json:"send_via_email"`
		Items          []struct {
			Label     string `json:"label"`
			Quantity  int    `json:"quantity"`
			UnitPrice int    `json:"unit_price"`
		} `json:"items"`
	}
	if err := h.readJSON(r, &payload); err != nil {
		h.errJSONKey(w, r, http.StatusBadRequest, errInvalidPayloadKey)
		return
	}

	items := make([]usecase.QuotationItemInput, 0, len(payload.Items))
	for _, item := range payload.Items {
		items = append(items, usecase.QuotationItemInput{
			Label:     item.Label,
			Quantity:  item.Quantity,
			UnitPrice: item.UnitPrice,
		})
	}

	quotation, savedItems, err := h.jobUC.CreateQuotation(r.Context(), actor, usecase.CreateQuotationInput{
		RecipientName:  payload.RecipientName,
		RecipientEmail: payload.RecipientEmail,
		Note:           payload.Note,
		Discount:       payload.Discount,
		SendViaEmail:   payload.SendViaEmail,
		Items:          items,
	})
	if err != nil {
		if errors.Is(err, domain.ErrForbidden) {
			h.errJSONKey(w, r, http.StatusForbidden, "forbidden")
			return
		}
		if errors.Is(err, domain.ErrConflict) {
			h.errJSONKey(w, r, http.StatusBadRequest, "quotation_invalid")
			return
		}
		h.internalErrJSON(w, r)
		return
	}

	subject, body, gmailURL := quotationEmailPreview(quotation, savedItems)
	h.writeJSON(w, http.StatusCreated, map[string]any{
		"status":  "created",
		"message": quotationMessage(r, quotation.SharedViaEmail),
		"quotation": map[string]any{
			"id":               quotation.ID,
			"code":             quotationCode(quotation.ID),
			"recipient_name":   quotation.RecipientName,
			"recipient_email":  quotation.RecipientEmail,
			"subtotal":         quotation.Subtotal,
			"discount":         quotation.Discount,
			"total":            quotation.Total,
			"note":             quotation.Note,
			"status":           quotation.Status,
			"shared_via_email": quotation.SharedViaEmail,
			"items":            savedItems,
		},
		"email_preview": map[string]any{
			"to":        quotation.RecipientEmail,
			"subject":   subject,
			"body":      body,
			"gmail_url": gmailURL,
		},
	})
}

// ── Staff: Schedule ─────────────────────────────────────────────────

func (h *Handler) handleGetSchedule(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w, r) {
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"days": []any{}})
}

// ── Staff: Technicians ──────────────────────────────────────────────

func (h *Handler) handleListStoreTechnicians(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w, r) {
		return
	}
	techs, err := h.storeUC.ListStoreTechnicians(r.Context(), actor)
	if err != nil {
		h.internalErrJSON(w, r)
		return
	}

	items := make([]map[string]any, 0, len(techs))
	for index := range techs {
		items = append(items, technicianPayload(&techs[index]))
	}

	h.writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Handler) handleCreateTechnician(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w, r) {
		return
	}

	var payload struct {
		Name     string   `json:"name"`
		Phone    string   `json:"phone"`
		Services []string `json:"services"`
	}
	if err := h.readJSON(r, &payload); err != nil {
		h.errJSONKey(w, r, http.StatusBadRequest, errInvalidPayloadKey)
		return
	}
	if payload.Name == "" {
		h.errJSONKey(w, r, http.StatusBadRequest, "name_required")
		return
	}

	tech, err := h.storeUC.CreateTechnician(r.Context(), actor, usecase.CreateTechnicianInput{
		Name:     payload.Name,
		Phone:    payload.Phone,
		Services: payload.Services,
	})
	if err != nil {
		if errors.Is(err, domain.ErrForbidden) {
			h.errJSONKey(w, r, http.StatusForbidden, "forbidden")
			return
		}
		if errors.Is(err, domain.ErrConflict) {
			h.errJSONKey(w, r, http.StatusConflict, "technician_create_failed")
			return
		}
		h.internalErrJSON(w, r)
		return
	}

	h.messageJSON(w, r, http.StatusCreated, "technician_created", map[string]any{
		"status":     "created",
		"technician": technicianPayload(tech),
	})
}

// ── Staff: Users ────────────────────────────────────────────────────

func (h *Handler) handleListUsers(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	users, err := h.userUC.ListUsers(r.Context(), actor)
	if err != nil {
		if errors.Is(err, domain.ErrForbidden) {
			h.errJSONKey(w, r, http.StatusForbidden, "forbidden")
			return
		}
		h.internalErrJSON(w, r)
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"items": users})
}

func (h *Handler) handleListUserJobsForStore(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	id, _ := strconv.ParseUint(r.PathValue("id"), 10, 32)

	jobs, err := h.jobUC.ListJobsForUser(r.Context(), actor, uint(id))
	if err != nil {
		if errors.Is(err, domain.ErrForbidden) {
			h.errJSONKey(w, r, http.StatusForbidden, "forbidden")
			return
		}
		h.internalErrJSON(w, r)
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]any{"items": jobs})
}

func quotationCode(id uint) string {
	return fmt.Sprintf("QT-%06d", id)
}

func quotationMessage(r *http.Request, sharedViaEmail bool) string {
	if sharedViaEmail {
		return messageFor(r, "quotation_saved_open_gmail")
	}
	return messageFor(r, "quotation_saved")
}

func quotationEmailPreview(quotation *domain.Quotation, items []domain.QuotationItem) (string, string, string) {
	subject := fmt.Sprintf("ใบเสนอราคา %s", quotationCode(quotation.ID))
	lines := []string{
		fmt.Sprintf("เรียน คุณ%s", strings.TrimSpace(quotation.RecipientName)),
		"",
		fmt.Sprintf("แนบใบเสนอราคา %s", quotationCode(quotation.ID)),
		"",
		"รายละเอียดรายการ:",
	}

	for _, item := range items {
		lines = append(lines, fmt.Sprintf("- %s x %d = %s", item.Label, item.Quantity, formatBaht(item.Amount)))
	}

	lines = append(lines,
		"",
		fmt.Sprintf("ยอดรวมรายการ: %s", formatBaht(quotation.Subtotal)),
		fmt.Sprintf("ส่วนลด: %s", formatBaht(quotation.Discount)),
		fmt.Sprintf("ยอดรวมสุทธิ: %s", formatBaht(quotation.Total)),
	)

	if strings.TrimSpace(quotation.Note) != "" {
		lines = append(lines, "", "หมายเหตุ:", quotation.Note)
	}

	lines = append(lines, "", "ขอบคุณครับ", "ทีมงาน Homex")

	body := strings.Join(lines, "\n")
	gmailURL := "https://mail.google.com/mail/?view=cm&fs=1" +
		"&to=" + url.QueryEscape(quotation.RecipientEmail) +
		"&su=" + url.QueryEscape(subject) +
		"&body=" + url.QueryEscape(body)
	return subject, body, gmailURL
}

func formatBaht(amount int) string {
	return fmt.Sprintf("฿%d", amount)
}
