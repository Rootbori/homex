package httpapi

import (
	"net/http"
	"strings"

	"github.com/rootbeer/homex/api/internal/config"
	"github.com/rootbeer/homex/api/internal/domain"
	"github.com/rootbeer/homex/api/internal/fixtures"
	"gorm.io/gorm"
)

type Server struct {
	cfg   config.Config
	db    *gorm.DB
	store *fixtures.Store
}

func NewServer(cfg config.Config, db *gorm.DB) *Server {
	return &Server{
		cfg:   cfg,
		db:    db,
		store: fixtures.NewStore(),
	}
}

func (s *Server) Router() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", s.handleHealth)
	mux.HandleFunc("GET /v1/public/technicians", s.handlePublicTechnicians)
	mux.HandleFunc("GET /v1/public/technicians/{slug}", s.handlePublicTechnicianDetail)
	mux.HandleFunc("POST /v1/public/service-requests", s.handleCreateServiceRequest)
	mux.HandleFunc("GET /v1/public/auth/signup-options", s.handleSignupOptions)
	mux.HandleFunc("POST /v1/public/auth/signup", s.handleSignup)
	mux.HandleFunc("GET /v1/customer/jobs", s.handleCustomerJobs)
	mux.HandleFunc("GET /v1/customer/jobs/{id}", s.handleCustomerJobDetail)
	mux.HandleFunc("GET /v1/app/dashboard", s.handleDashboard)
	mux.HandleFunc("GET /v1/app/leads", s.handleLeads)
	mux.HandleFunc("GET /v1/app/leads/{id}", s.handleLeadDetail)
	mux.HandleFunc("POST /v1/app/leads/{id}/assign", s.handleLeadAssign)
	mux.HandleFunc("POST /v1/app/leads/{id}/quotation", s.handleLeadQuotation)
	mux.HandleFunc("POST /v1/app/leads/{id}/convert", s.handleLeadConvert)
	mux.HandleFunc("GET /v1/app/jobs", s.handleJobs)
	mux.HandleFunc("GET /v1/app/jobs/{id}", s.handleJobDetail)
	mux.HandleFunc("POST /v1/app/jobs/{id}/status", s.handleJobStatus)
	mux.HandleFunc("GET /v1/app/schedule", s.handleSchedule)
	mux.HandleFunc("GET /v1/app/technicians", s.handleTechnicians)
	mux.HandleFunc("GET /v1/app/customers", s.handleCustomers)

	return withActor(mux)
}

func withActor(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-App-Visibility", string(domain.ActorFromRequest(r).Role))
		next.ServeHTTP(w, r)
	})
}

func requireStaff(actor domain.Actor, w http.ResponseWriter) bool {
	if actor.IsStaff() {
		return true
	}

	writeJSON(w, http.StatusUnauthorized, map[string]any{
		"error": "staff access required",
	})

	return false
}

func requireAdmin(actor domain.Actor, w http.ResponseWriter) bool {
	if actor.IsAdminLike() {
		return true
	}

	writeJSON(w, http.StatusForbidden, map[string]any{
		"error": "admin access required",
	})

	return false
}

func filterJobsByActor(actor domain.Actor, jobs []map[string]any) []map[string]any {
	if actor.Role != domain.RoleTechnician {
		return jobs
	}

	filtered := make([]map[string]any, 0, len(jobs))
	for _, job := range jobs {
		if job["assigned_technician"] == actor.TechnicianID {
			filtered = append(filtered, job)
		}
	}

	return filtered
}

func filterJobsByCustomer(actor domain.Actor, jobs []map[string]any) []map[string]any {
	if actor.Role != domain.RoleCustomer {
		return jobs
	}

	filtered := make([]map[string]any, 0, len(jobs))
	for _, job := range jobs {
		if job["customer_id"] == actor.CustomerID {
			filtered = append(filtered, job)
		}
	}

	return filtered
}

func filterLeadsByActor(actor domain.Actor, leads []map[string]any) []map[string]any {
	if actor.Role != domain.RoleTechnician {
		return leads
	}

	filtered := make([]map[string]any, 0, len(leads))
	for _, lead := range leads {
		if lead["assigned_technician"] == actor.TechnicianID {
			filtered = append(filtered, lead)
		}
	}

	return filtered
}

func filterMapsByField(items []map[string]any, key, value string) []map[string]any {
	filtered := make([]map[string]any, 0, len(items))
	for _, item := range items {
		if item[key] == value {
			filtered = append(filtered, item)
		}
	}

	return filtered
}

func findByID(items []map[string]any, key, value string) map[string]any {
	for _, item := range items {
		if item[key] == value {
			return item
		}
	}

	return nil
}

func findTechnicianBySlug(items []map[string]any, slug string) map[string]any {
	for _, item := range items {
		if item["slug"] == slug {
			return item
		}
	}

	return nil
}

func matchesLooseSearch(item map[string]any, query string) bool {
	query = strings.TrimSpace(strings.ToLower(query))
	if query == "" {
		return true
	}

	fields := []string{
		stringValue(item["name"]),
		stringValue(item["area"]),
	}

	for _, field := range fields {
		if strings.Contains(strings.ToLower(field), query) {
			return true
		}
	}

	return false
}

func stringValue(value any) string {
	text, _ := value.(string)
	return text
}
