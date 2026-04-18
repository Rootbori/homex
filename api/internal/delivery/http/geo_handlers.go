package http

import (
	"net/http"
	"strconv"
	"strings"
)

func (h *Handler) handleListThaiProvinces(w http.ResponseWriter, r *http.Request) {
	items, err := h.geoUC.ListProvinces(r.Context())
	if err != nil {
		h.errJSON(w, http.StatusInternalServerError, "unable to load provinces")
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Handler) handleListThaiDistricts(w http.ResponseWriter, r *http.Request) {
	provinceID, err := strconv.ParseUint(strings.TrimSpace(r.URL.Query().Get("province_id")), 10, 32)
	if err != nil || provinceID == 0 {
		h.errJSON(w, http.StatusBadRequest, "province_id is required")
		return
	}

	items, err := h.geoUC.ListDistricts(r.Context(), uint(provinceID))
	if err != nil {
		h.errJSON(w, http.StatusInternalServerError, "unable to load districts")
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Handler) handleListThaiSubdistricts(w http.ResponseWriter, r *http.Request) {
	districtID, err := strconv.ParseUint(strings.TrimSpace(r.URL.Query().Get("district_id")), 10, 32)
	if err != nil || districtID == 0 {
		h.errJSON(w, http.StatusBadRequest, "district_id is required")
		return
	}

	items, err := h.geoUC.ListSubdistricts(r.Context(), uint(districtID))
	if err != nil {
		h.errJSON(w, http.StatusInternalServerError, "unable to load subdistricts")
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]any{"items": items})
}
