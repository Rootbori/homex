package httpapi

import (
	"fmt"
	"net/http"

	"github.com/rootbeer/homex/api/internal/domain"
)

const (
	signupAccountTypeCustomer = "customer"
	signupAccountTypeStaff    = "staff"
	signupProviderLine        = "line"
	signupProviderGoogle      = "google"
)

type createServiceRequestPayload struct {
	Name          string   `json:"name"`
	Phone         string   `json:"phone"`
	Area          string   `json:"area"`
	Address       string   `json:"address"`
	ServiceType   string   `json:"service_type"`
	Units         int      `json:"units"`
	BTU           string   `json:"btu"`
	Brand         string   `json:"brand"`
	Symptom       string   `json:"symptom"`
	PreferredDate string   `json:"preferred_date"`
	PreferredTime string   `json:"preferred_time"`
	Notes         string   `json:"notes"`
	Images        []string `json:"images"`
}

type updateJobStatusPayload struct {
	Status string `json:"status"`
	Note   string `json:"note"`
}

type signupPayload struct {
	FullName    string `json:"full_name"`
	Phone       string `json:"phone"`
	Email       string `json:"email"`
	StoreName   string `json:"store_name"`
	AccountType string `json:"account_type"`
	Provider    string `json:"provider"`
	AcceptTerms bool   `json:"accept_terms"`
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"ok":       true,
		"app_env":  s.cfg.AppEnv,
		"database": s.db != nil,
	})
}

func (s *Server) handleSignupOptions(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"title":    "สมัครใช้งาน Homex",
		"subtitle": "บันทึกข้อมูลผู้ใช้ก่อน แล้วค่อยยืนยันตัวตนด้วย LINE หรือ Gmail เพื่อเปิดใช้งานบัญชีจริง",
		"defaults": map[string]string{
			"account_type": signupAccountTypeCustomer,
			"provider":     signupProviderLine,
		},
		"account_types": []map[string]any{
			{
				"id":          signupAccountTypeCustomer,
				"label":       "ลูกค้า",
				"description": "สร้างผู้ใช้ประเภท customer สำหรับค้นหาช่างแอร์ ดูโปรไฟล์ และติดตามงานของตัวเอง",
				"user_type":   domain.UserTypeCustomer,
				"next_path":   "/search",
			},
			{
				"id":          signupAccountTypeStaff,
				"label":       "ร้าน / ทีมช่าง",
				"description": "สร้างผู้ใช้ประเภท staff แล้วผูกสิทธิ์ผ่าน store_memberships และ technician_profiles",
				"user_type":   domain.UserTypeStaff,
				"next_path":   "/portal/dashboard",
			},
		},
		"providers": []map[string]any{
			{
				"id":          signupProviderLine,
				"label":       "LINE",
				"description": "เหมาะกับร้านที่รับลูกค้าจาก LINE OA และผู้ใช้ที่สะดวกล็อกอินผ่าน LINE",
				"accent":      "#06C755",
			},
			{
				"id":          signupProviderGoogle,
				"label":       "Gmail",
				"description": "เหมาะกับการเข้าใช้งานผ่านเว็บและงานหลังบ้านด้วยบัญชี Google",
				"accent":      "#4285F4",
			},
		},
	})
}

func (s *Server) handleSignup(w http.ResponseWriter, r *http.Request) {
	s.handleSignupCreate(w, r)
}

func (s *Server) handlePublicTechnicians(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	items := make([]map[string]any, 0)
	for _, technician := range s.store.Technicians() {
		if matchesLooseSearch(technician, query) {
			items = append(items, technician)
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"filters": map[string]any{
			"area":           r.URL.Query().Get("area"),
			"service_type":   r.URL.Query().Get("service_type"),
			"starting_price": r.URL.Query().Get("starting_price"),
			"rating":         r.URL.Query().Get("rating"),
			"available_now":  r.URL.Query().Get("available_now"),
		},
		"items": items,
	})
}

func (s *Server) handlePublicTechnicianDetail(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	item := findTechnicianBySlug(s.store.Technicians(), slug)
	if item == nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "technician not found"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"technician": item,
		"gallery": []map[string]string{
			{"image_url": "https://images.example/homex/work-1.jpg", "caption": "ล้างแอร์คอนโด 2 เครื่อง"},
			{"image_url": "https://images.example/homex/work-2.jpg", "caption": "ซ่อมแอร์ไม่เย็น"},
		},
		"reviews": []map[string]any{
			{"customer": "คุณหนึ่ง", "rating": 5, "comment": "มาตรงเวลา งานเรียบร้อย"},
			{"customer": "คุณฝน", "rating": 5, "comment": "อธิบายอาการละเอียดมาก"},
		},
	})
}

func (s *Server) handleCreateServiceRequest(w http.ResponseWriter, r *http.Request) {
	var payload createServiceRequestPayload
	if err := decodeJSON(r, &payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request payload"})
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"id":      "lead-1203",
		"status":  "new",
		"message": "รับคำขอเรียบร้อย ร้านจะติดต่อกลับพร้อมใบเสนอราคา",
		"lead": map[string]any{
			"customer_name": payload.Name,
			"phone":         payload.Phone,
			"area":          payload.Area,
			"service_type":  payload.ServiceType,
			"source":        domain.LeadSourceFindTech,
		},
	})
}

func (s *Server) handleCustomerJobs(w http.ResponseWriter, r *http.Request) {
	actor := domain.ActorFromRequest(r)
	if actor.Role != domain.RoleCustomer {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "customer access required"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"scope": actor.Scope(),
		"items": filterJobsByCustomer(actor, s.store.Jobs()),
	})
}

func (s *Server) handleCustomerJobDetail(w http.ResponseWriter, r *http.Request) {
	actor := domain.ActorFromRequest(r)
	if actor.Role != domain.RoleCustomer {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "customer access required"})
		return
	}

	job := findByID(filterJobsByCustomer(actor, s.store.Jobs()), "id", r.PathValue("id"))
	if job == nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "job not found"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"scope": actor.Scope(),
		"job":   job,
		"quotation": map[string]any{
			"status": "sent",
			"items": []map[string]any{
				{"label": "ล้างแอร์ 9,000 - 12,000 BTU", "qty": 2, "amount": 1800},
			},
			"total": 1800,
		},
		"photos": []map[string]string{
			{"kind": "before", "image_url": "https://images.example/homex/before.jpg"},
			{"kind": "after", "image_url": "https://images.example/homex/after.jpg"},
		},
	})
}

func (s *Server) handleDashboard(w http.ResponseWriter, r *http.Request) {
	actor := domain.ActorFromRequest(r)
	if !requireStaff(actor, w) {
		return
	}

	dashboard := s.store.Dashboard()
	if actor.Role == domain.RoleTechnician {
		dashboard["today_jobs"] = filterJobsByActor(actor, s.store.Jobs())
		dashboard["latest_leads"] = filterLeadsByActor(actor, s.store.Leads())
		dashboard["urgent_jobs"] = filterMapsByField(
			dashboard["urgent_jobs"].([]map[string]any),
			"assigned_technician",
			actor.TechnicianID,
		)
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"scope":     actor.Scope(),
		"dashboard": dashboard,
	})
}

func (s *Server) handleLeads(w http.ResponseWriter, r *http.Request) {
	actor := domain.ActorFromRequest(r)
	if !requireStaff(actor, w) {
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"scope": actor.Scope(),
		"items": filterLeadsByActor(actor, s.store.Leads()),
	})
}

func (s *Server) handleLeadDetail(w http.ResponseWriter, r *http.Request) {
	actor := domain.ActorFromRequest(r)
	if !requireStaff(actor, w) {
		return
	}

	lead := findByID(filterLeadsByActor(actor, s.store.Leads()), "id", r.PathValue("id"))
	if lead == nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "lead not found in your scope"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"scope": actor.Scope(),
		"lead":  lead,
		"air_units": []map[string]any{
			{"brand": "Daikin", "btu": "12000", "symptom": "มีน้ำหยด"},
			{"brand": "Mitsubishi", "btu": "18000", "symptom": "ไม่เย็น"},
		},
	})
}

func (s *Server) handleLeadAssign(w http.ResponseWriter, r *http.Request) {
	actor := domain.ActorFromRequest(r)
	if !actor.CanAssignJobs() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "assignment requires dispatcher or admin role"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"id":      r.PathValue("id"),
		"status":  "assigned",
		"message": "assign ช่างเรียบร้อย",
	})
}

func (s *Server) handleLeadQuotation(w http.ResponseWriter, r *http.Request) {
	actor := domain.ActorFromRequest(r)
	if !actor.CanAssignJobs() && actor.Role != domain.RoleTechnician {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "quotation access denied"})
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"id":      "qt-3201",
		"status":  "draft",
		"message": "สร้างใบเสนอราคาเรียบร้อย",
		"preview": "สวัสดีครับ ใบเสนอราคางานล้างแอร์ 2 เครื่อง ราคารวม 1,800 บาท",
	})
}

func (s *Server) handleLeadConvert(w http.ResponseWriter, r *http.Request) {
	actor := domain.ActorFromRequest(r)
	if !actor.CanAssignJobs() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "convert requires dispatcher or admin role"})
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"id":      "job-2050",
		"status":  "scheduled",
		"message": "เปลี่ยน lead เป็น job แล้ว",
	})
}

func (s *Server) handleJobs(w http.ResponseWriter, r *http.Request) {
	actor := domain.ActorFromRequest(r)
	if !requireStaff(actor, w) {
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"scope": actor.Scope(),
		"items": filterJobsByActor(actor, s.store.Jobs()),
	})
}

func (s *Server) handleJobDetail(w http.ResponseWriter, r *http.Request) {
	actor := domain.ActorFromRequest(r)
	if !requireStaff(actor, w) {
		return
	}

	job := findByID(filterJobsByActor(actor, s.store.Jobs()), "id", r.PathValue("id"))
	if job == nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "job not found in your scope"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"scope": actor.Scope(),
		"job":   job,
		"quotation": map[string]any{
			"id":     "qt-3201",
			"status": "sent",
			"items": []map[string]any{
				{"label": "ล้างแอร์ 9,000 - 12,000 BTU", "qty": 2, "amount": 1800},
			},
			"total":        1800,
			"line_preview": "เรียนคุณแพร ใบเสนอราคางานล้างแอร์ 2 เครื่อง ราคารวม 1,800 บาท นัดหมาย 17 เม.ย. 13:00 น.",
		},
		"photos": []map[string]string{
			{"kind": "before", "image_url": "https://images.example/homex/before.jpg", "caption": "ก่อนล้าง"},
			{"kind": "after", "image_url": "https://images.example/homex/after.jpg", "caption": "หลังล้าง"},
		},
		"map_url": "https://maps.google.com/?q=13.7563,100.5018",
	})
}

func (s *Server) handleJobStatus(w http.ResponseWriter, r *http.Request) {
	actor := domain.ActorFromRequest(r)
	if !requireStaff(actor, w) {
		return
	}

	var payload updateJobStatusPayload
	if err := decodeJSON(r, &payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request payload"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"id":      r.PathValue("id"),
		"status":  payload.Status,
		"message": fmt.Sprintf("อัปเดตสถานะเป็น %s แล้ว", payload.Status),
		"note":    payload.Note,
	})
}

func (s *Server) handleSchedule(w http.ResponseWriter, r *http.Request) {
	actor := domain.ActorFromRequest(r)
	if !requireStaff(actor, w) {
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"scope": actor.Scope(),
		"days": []map[string]any{
			{
				"date": "2026-04-16",
				"jobs": filterJobsByActor(actor, s.store.Jobs()),
			},
			{
				"date": "2026-04-17",
				"jobs": filterJobsByActor(actor, s.store.Jobs()),
			},
		},
	})
}

func (s *Server) handleTechnicians(w http.ResponseWriter, r *http.Request) {
	actor := domain.ActorFromRequest(r)
	if !requireStaff(actor, w) {
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"scope": actor.Scope(),
		"items": s.store.Technicians(),
	})
}

func (s *Server) handleCustomers(w http.ResponseWriter, r *http.Request) {
	actor := domain.ActorFromRequest(r)
	if !requireAdmin(actor, w) {
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"scope": actor.Scope(),
		"items": s.store.Customers(),
	})
}
