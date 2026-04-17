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
	query := r.URL.Query().Get("q")
	techs, err := h.storeUC.ListTechnicians(r.Context(), query)
	if err != nil {
		h.errJSON(w, http.StatusInternalServerError, err.Error())
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
			h.errJSON(w, http.StatusNotFound, "technician not found")
			return
		}
		h.errJSON(w, http.StatusInternalServerError, err.Error())
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

func (h *Handler) handleSignupOptions(w http.ResponseWriter, _ *http.Request) {
	h.writeJSON(w, http.StatusOK, map[string]any{
		"title":    "สมัครใช้งาน Homex",
		"subtitle": "เข้าใช้งานด้วย LINE หรือ Gmail ก่อน จากนั้นระบบจะพาไปเลือกว่าจะเป็นลูกค้า, ร้าน, ช่างอิสระ หรือเข้าร่วมทีม",
		"account_types": []map[string]any{
			{
				"id":          "user",
				"label":       "ลูกค้า",
				"description": "สำหรับค้นหาช่างแอร์ ดูโปรไฟล์ และติดตามงาน",
				"user_type":   domain.UserTypeUser,
				"next_path":   "/search",
			},
			{
				"id":          "staff",
				"label":       "ร้าน / ช่างอิสระ / ทีมงาน",
				"description": "ใช้สำหรับฝั่งหลังบ้าน และจะมี onboarding แยกให้อีกครั้งหลัง login",
				"user_type":   domain.UserTypeStaff,
				"next_path":   "/onboarding/staff",
			},
		},
		"providers": []map[string]any{
			{"id": "line", "label": "LINE", "accent": "#06C755"},
			{"id": "google", "label": "Gmail", "accent": "#4285F4"},
		},
	})
}

// ── User Jobs ───────────────────────────────────────────────────────

func (h *Handler) handleListUserJobs(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	jobs, err := h.jobUC.ListJobs(r.Context(), actor)
	if err != nil {
		h.errJSON(w, http.StatusInternalServerError, err.Error())
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
			h.errJSON(w, http.StatusNotFound, "job not found")
			return
		}
		h.errJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"job": job})
}

// ── Create Lead (service request) ───────────────────────────────────

func (h *Handler) handleCreateLead(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	var lead domain.Lead
	if err := h.readJSON(r, &lead); err != nil {
		h.errJSON(w, http.StatusBadRequest, "invalid payload")
		return
	}
	lead.StoreID = 1

	if err := h.jobUC.CreateLead(r.Context(), actor, &lead); err != nil {
		h.errJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.writeJSON(w, http.StatusCreated, map[string]any{
		"id":      lead.ID,
		"status":  lead.Status,
		"message": "รับคำขอเรียบร้อย ร้านจะติดต่อกลับพร้อมใบเสนอราคา",
	})
}

// ── Staff: Dashboard ────────────────────────────────────────────────

func (h *Handler) handleGetDashboard(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w) {
		return
	}
	// Simplified — full KPI queries belong in a DashboardUsecase later
	h.writeJSON(w, http.StatusOK, map[string]any{
		"scope":     actor.Scope(),
		"dashboard": map[string]any{},
	})
}

// ── Staff: Leads ────────────────────────────────────────────────────

func (h *Handler) handleListLeads(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w) {
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"items": []any{}})
}

func (h *Handler) handleGetLeadDetail(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w) {
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"lead": nil})
}

// ── Staff: Jobs ─────────────────────────────────────────────────────

func (h *Handler) handleListJobs(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w) {
		return
	}
	jobs, err := h.jobUC.ListJobs(r.Context(), actor)
	if err != nil {
		h.errJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"items": jobs})
}

func (h *Handler) handleGetJobDetail(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w) {
		return
	}
	id, _ := strconv.ParseUint(r.PathValue("id"), 10, 32)
	job, err := h.jobUC.GetJobDetail(r.Context(), actor, uint(id))
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			h.errJSON(w, http.StatusNotFound, "job not found")
			return
		}
		h.errJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"job": job})
}

func (h *Handler) handleUpdateJobStatus(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w) {
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"message": "status updated"})
}

func (h *Handler) handleCreateQuotation(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w) {
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
		h.errJSON(w, http.StatusBadRequest, "invalid payload")
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
			h.errJSON(w, http.StatusForbidden, "forbidden")
			return
		}
		if errors.Is(err, domain.ErrConflict) {
			h.errJSON(w, http.StatusBadRequest, "กรอกข้อมูลใบเสนอราคาให้ครบก่อนส่ง")
			return
		}
		h.errJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	subject, body, gmailURL := quotationEmailPreview(quotation, savedItems)
	h.writeJSON(w, http.StatusCreated, map[string]any{
		"status":  "created",
		"message": quotationMessage(quotation.SharedViaEmail),
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
	if !h.requireStaff(actor, w) {
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"days": []any{}})
}

// ── Staff: Technicians ──────────────────────────────────────────────

func (h *Handler) handleListStoreTechnicians(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if !h.requireStaff(actor, w) {
		return
	}
	techs, err := h.storeUC.ListStoreTechnicians(r.Context(), actor)
	if err != nil {
		h.errJSON(w, http.StatusInternalServerError, err.Error())
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
	if !h.requireStaff(actor, w) {
		return
	}

	var payload struct {
		Name     string   `json:"name"`
		Phone    string   `json:"phone"`
		Services []string `json:"services"`
	}
	if err := h.readJSON(r, &payload); err != nil {
		h.errJSON(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if payload.Name == "" {
		h.errJSON(w, http.StatusBadRequest, "name is required")
		return
	}

	tech, err := h.storeUC.CreateTechnician(r.Context(), actor, usecase.CreateTechnicianInput{
		Name:     payload.Name,
		Phone:    payload.Phone,
		Services: payload.Services,
	})
	if err != nil {
		if errors.Is(err, domain.ErrForbidden) {
			h.errJSON(w, http.StatusForbidden, "forbidden")
			return
		}
		if errors.Is(err, domain.ErrConflict) {
			h.errJSON(w, http.StatusConflict, "บัญชีช่างอิสระยังไม่สามารถเพิ่มทีมช่างเพิ่มได้")
			return
		}
		h.errJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.writeJSON(w, http.StatusCreated, map[string]any{
		"status":     "created",
		"message":    "สร้างโปรไฟล์ช่างเรียบร้อยแล้ว",
		"technician": technicianPayload(tech),
	})
}

// ── Staff: Users ────────────────────────────────────────────────────

func (h *Handler) handleListUsers(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	users, err := h.userUC.ListUsers(r.Context(), actor)
	if err != nil {
		if errors.Is(err, domain.ErrForbidden) {
			h.errJSON(w, http.StatusForbidden, "forbidden")
			return
		}
		h.errJSON(w, http.StatusInternalServerError, err.Error())
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
			h.errJSON(w, http.StatusForbidden, "forbidden")
			return
		}
		h.errJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]any{"items": jobs})
}

func quotationCode(id uint) string {
	return fmt.Sprintf("QT-%06d", id)
}

func quotationMessage(sharedViaEmail bool) string {
	if sharedViaEmail {
		return "บันทึกใบเสนอราคาแล้ว พร้อมเปิด Gmail ให้ส่งต่อได้ทันที"
	}
	return "บันทึกร่างใบเสนอราคาเรียบร้อยแล้ว"
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
