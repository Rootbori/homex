package http

import (
	"encoding/json"
	"net/http"

	"github.com/rootbeer/homex/api/internal/config"
	"github.com/rootbeer/homex/api/internal/domain"
	"github.com/rootbeer/homex/api/internal/usecase"
)

// Handler is the HTTP delivery layer. It knows about HTTP but delegates
// all business logic to usecases.
type Handler struct {
	cfg     config.Config
	authUC  usecase.AuthUsecase
	userUC  usecase.UserUsecase
	jobUC   usecase.JobUsecase
	storeUC usecase.StoreUsecase
}

func NewHandler(cfg config.Config, authUC usecase.AuthUsecase, userUC usecase.UserUsecase, jobUC usecase.JobUsecase, storeUC usecase.StoreUsecase) *Handler {
	return &Handler{
		cfg:     cfg,
		authUC:  authUC,
		userUC:  userUC,
		jobUC:   jobUC,
		storeUC: storeUC,
	}
}

func (h *Handler) Routes() http.Handler {
	mux := http.NewServeMux()

	// Health
	mux.HandleFunc("GET /health", h.handleHealth)

	// Public
	mux.HandleFunc("GET /v1/public/technicians", h.handleListTechnicians)
	mux.HandleFunc("GET /v1/public/technicians/{slug}", h.handleGetTechnician)
	mux.HandleFunc("POST /v1/public/service-requests", h.handleCreateLead)
	mux.HandleFunc("GET /v1/public/auth/signup-options", h.handleSignupOptions)

	// Auth
	mux.HandleFunc("POST /v1/public/auth/signup", h.handleCompleteSignup)
	mux.HandleFunc("POST /v1/public/auth/oauth-sync", h.handleOAuthSync)

	// User
	mux.HandleFunc("GET /v1/user/jobs", h.handleListUserJobs)
	mux.HandleFunc("GET /v1/user/jobs/{id}", h.handleGetUserJob)

	// Staff / App
	mux.HandleFunc("GET /v1/app/dashboard", h.handleGetDashboard)
	mux.HandleFunc("GET /v1/app/leads", h.handleListLeads)
	mux.HandleFunc("GET /v1/app/leads/{id}", h.handleGetLeadDetail)
	mux.HandleFunc("GET /v1/app/jobs", h.handleListJobs)
	mux.HandleFunc("GET /v1/app/jobs/{id}", h.handleGetJobDetail)
	mux.HandleFunc("POST /v1/app/jobs/{id}/status", h.handleUpdateJobStatus)
	mux.HandleFunc("GET /v1/app/schedule", h.handleGetSchedule)
	mux.HandleFunc("GET /v1/app/technicians", h.handleListStoreTechnicians)
	mux.HandleFunc("GET /v1/app/users", h.handleListUsers)

	return withCORS(mux)
}

// ── Middleware ───────────────────────────────────────────────────────

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Actor-Role, X-Actor-User-ID, X-Store-ID, X-User-ID, X-Technician-ID")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ── Actor extraction (lives here, not in domain) ────────────────────

func actorFromRequest(r *http.Request) domain.Actor {
	role := domain.Role(r.Header.Get("X-Actor-Role"))
	if role == "" {
		role = domain.RoleAnonymous
	}
	return domain.Actor{
		UserID:       r.Header.Get("X-Actor-User-ID"),
		StoreID:      r.Header.Get("X-Store-ID"),
		TechnicianID: r.Header.Get("X-Technician-ID"),
		ProfileID:    r.Header.Get("X-User-ID"),
		Role:         role,
	}
}

// ── JSON helpers ────────────────────────────────────────────────────

func (h *Handler) writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func (h *Handler) readJSON(r *http.Request, dst any) error {
	return json.NewDecoder(r.Body).Decode(dst)
}

func (h *Handler) errJSON(w http.ResponseWriter, status int, msg string) {
	h.writeJSON(w, status, map[string]any{"error": msg})
}

// ── Auth guards ─────────────────────────────────────────────────────

func (h *Handler) requireStaff(actor domain.Actor, w http.ResponseWriter) bool {
	if actor.IsStaff() {
		return true
	}
	h.errJSON(w, http.StatusUnauthorized, "staff access required")
	return false
}
