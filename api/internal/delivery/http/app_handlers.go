package http

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/rootbeer/homex/api/internal/domain"
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
	h.writeJSON(w, http.StatusOK, map[string]any{"items": techs})
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
	h.writeJSON(w, http.StatusOK, tech)
}

// ── Signup Options ──────────────────────────────────────────────────

func (h *Handler) handleSignupOptions(w http.ResponseWriter, _ *http.Request) {
	h.writeJSON(w, http.StatusOK, map[string]any{
		"title":    "สมัครใช้งาน Homex",
		"subtitle": "บันทึกข้อมูลผู้ใช้ก่อน แล้วค่อยยืนยันตัวตนด้วย LINE หรือ Gmail เพื่อเปิดใช้งานบัญชีจริง",
		"account_types": []map[string]any{
			{
				"id":          "user",
				"label":       "ผู้ใช้งาน",
				"description": "สำหรับค้นหาช่างแอร์ ดูโปรไฟล์ และติดตามงาน",
				"user_type":   domain.UserTypeUser,
				"next_path":   "/search",
			},
			{
				"id":          "staff",
				"label":       "ร้าน / ทีมช่าง",
				"description": "สำหรับ staff ผูกสิทธิ์ผ่าน store_memberships",
				"user_type":   domain.UserTypeStaff,
				"next_path":   "/portal/dashboard",
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
	techs, err := h.storeUC.ListTechnicians(r.Context(), "")
	if err != nil {
		h.errJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"items": techs})
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
