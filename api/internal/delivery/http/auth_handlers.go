package http

import (
	"errors"
	"net/http"

	"github.com/rootbeer/homex/api/internal/domain"
	"github.com/rootbeer/homex/api/internal/usecase"
)

type oauthSyncPayload struct {
	Provider       string `json:"provider"`
	ProviderUserID string `json:"provider_user_id"`
	Email          string `json:"email"`
	FullName       string `json:"full_name"`
	AvatarURL      string `json:"avatar_url"`
	AccountType    string `json:"account_type"`
	InviteStoreID  string `json:"invite_store_id"`
}

type validateOAuthPayload struct {
	Provider       string `json:"provider"`
	ProviderUserID string `json:"provider_user_id"`
	AccountType    string `json:"account_type"`
}

type staffOnboardingPayload struct {
	Mode      string `json:"mode"`
	StoreName string `json:"store_name"`
}

func (h *Handler) handleOAuthSync(w http.ResponseWriter, r *http.Request) {
	var payload oauthSyncPayload
	if err := h.readJSON(r, &payload); err != nil {
		h.errJSONKey(w, r, http.StatusBadRequest, errInvalidPayloadKey)
		return
	}

	ident := domain.UserIdentity{
		Provider:       domain.IdentityProvider(payload.Provider),
		ProviderUserID: payload.ProviderUserID,
		Email:          payload.Email,
	}

	result, err := h.authUC.SyncOAuthUser(
		r.Context(),
		ident,
		domain.UserType(payload.AccountType),
		payload.InviteStoreID,
		payload.FullName,
		payload.AvatarURL,
	)
	if err != nil {
		h.internalErrJSON(w, r)
		return
	}

	h.writeJSON(w, http.StatusOK, authPayload(result))
}

func (h *Handler) handleValidateOAuthSession(w http.ResponseWriter, r *http.Request) {
	var payload validateOAuthPayload
	if err := h.readJSON(r, &payload); err != nil {
		h.errJSONKey(w, r, http.StatusBadRequest, errInvalidPayloadKey)
		return
	}

	actor := actorFromRequest(r)
	ident := domain.UserIdentity{
		Provider:       domain.IdentityProvider(payload.Provider),
		ProviderUserID: payload.ProviderUserID,
	}

	result, err := h.authUC.ValidateOAuthSession(r.Context(), ident, domain.UserType(payload.AccountType), usecase.ValidateSessionInput{
		ClaimedStoreID:      actor.StoreID,
		ClaimedRole:         actor.Role,
		ClaimedTechnicianID: actor.TechnicianID,
		ClaimedProfileID:    actor.ProfileID,
	})
	if err != nil {
		if errors.Is(err, domain.ErrUnauthorized) || errors.Is(err, domain.ErrNotFound) {
			h.errJSONKey(w, r, http.StatusUnauthorized, "session_invalid")
			return
		}
		h.internalErrJSON(w, r)
		return
	}

	h.writeJSON(w, http.StatusOK, authPayload(result))
}

func (h *Handler) handleStaffOnboarding(w http.ResponseWriter, r *http.Request) {
	actor := actorFromRequest(r)
	if actor.UserID == "" {
		h.errJSONKey(w, r, http.StatusUnauthorized, "login_required")
		return
	}

	var payload staffOnboardingPayload
	if err := h.readJSON(r, &payload); err != nil {
		h.errJSONKey(w, r, http.StatusBadRequest, errInvalidPayloadKey)
		return
	}

	result, err := h.authUC.CompleteStaffOnboarding(r.Context(), actor.UintUserID(), usecase.StaffOnboardingInput{
		Mode:      payload.Mode,
		StoreName: payload.StoreName,
	})
	if err != nil {
		h.internalErrJSON(w, r)
		return
	}

	h.writeJSON(w, http.StatusOK, authPayload(result))
}

func (h *Handler) handleCompleteSignup(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Token    string `json:"token"`
		FullName string `json:"full_name"`
		Phone    string `json:"phone"`
	}
	if err := h.readJSON(r, &payload); err != nil {
		h.errJSONKey(w, r, http.StatusBadRequest, errInvalidPayloadKey)
		return
	}

	user, mem, store, err := h.authUC.CompleteSignup(r.Context(), payload.Token, payload.FullName, payload.Phone)
	if err != nil {
		h.internalErrJSON(w, r)
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]any{
		"user":       user,
		"membership": mem,
		"store":      store,
	})
}
