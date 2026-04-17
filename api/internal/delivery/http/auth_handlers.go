package http

import (
	"net/http"

	"github.com/rootbeer/homex/api/internal/domain"
)

type oauthSyncPayload struct {
	Provider       string `json:"provider"`
	ProviderUserID string `json:"provider_user_id"`
	Email          string `json:"email"`
	AccountType    string `json:"account_type"`
	InviteStoreID  string `json:"invite_store_id"`
}

func (h *Handler) handleOAuthSync(w http.ResponseWriter, r *http.Request) {
	var payload oauthSyncPayload
	if err := h.readJSON(r, &payload); err != nil {
		h.errJSON(w, http.StatusBadRequest, "invalid payload")
		return
	}

	ident := domain.UserIdentity{
		Provider:       domain.IdentityProvider(payload.Provider),
		ProviderUserID: payload.ProviderUserID,
		Email:          payload.Email,
	}

	user, mem, store, tech, err := h.authUC.SyncOAuthUser(r.Context(), ident, domain.UserType(payload.AccountType), payload.InviteStoreID)
	if err != nil {
		h.errJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]any{
		"user":       user,
		"membership": mem,
		"store":      store,
		"technician": tech,
	})
}

func (h *Handler) handleCompleteSignup(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Token    string `json:"token"`
		FullName string `json:"full_name"`
		Phone    string `json:"phone"`
	}
	if err := h.readJSON(r, &payload); err != nil {
		h.errJSON(w, http.StatusBadRequest, "invalid payload")
		return
	}

	user, mem, store, err := h.authUC.CompleteSignup(r.Context(), payload.Token, payload.FullName, payload.Phone)
	if err != nil {
		h.errJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]any{
		"user":       user,
		"membership": mem,
		"store":      store,
	})
}
