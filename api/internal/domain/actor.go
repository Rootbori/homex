package domain

import "net/http"

type Role string

const (
	RoleOwner      Role = "owner"
	RoleAdmin      Role = "admin"
	RoleDispatcher Role = "dispatcher"
	RoleTechnician Role = "technician"
	RoleCustomer   Role = "customer"
	RoleAnonymous  Role = "anonymous"
)

type Actor struct {
	UserID       string `json:"user_id"`
	StoreID      string `json:"store_id"`
	TechnicianID string `json:"technician_id,omitempty"`
	CustomerID   string `json:"customer_id,omitempty"`
	Role         Role   `json:"role"`
}

type VisibilityScope struct {
	StoreID              string `json:"store_id,omitempty"`
	CustomerID           string `json:"customer_id,omitempty"`
	AssignedTechnicianID string `json:"assigned_technician_id,omitempty"`
	CanSeeEntireStore    bool   `json:"can_see_entire_store"`
}

func ActorFromRequest(r *http.Request) Actor {
	role := Role(r.Header.Get("X-Actor-Role"))
	if role == "" {
		role = RoleAnonymous
	}

	return Actor{
		UserID:       r.Header.Get("X-Actor-User-ID"),
		StoreID:      r.Header.Get("X-Store-ID"),
		TechnicianID: r.Header.Get("X-Technician-ID"),
		CustomerID:   r.Header.Get("X-Customer-ID"),
		Role:         role,
	}
}

func (a Actor) IsStaff() bool {
	switch a.Role {
	case RoleOwner, RoleAdmin, RoleDispatcher, RoleTechnician:
		return true
	default:
		return false
	}
}

func (a Actor) IsAdminLike() bool {
	switch a.Role {
	case RoleOwner, RoleAdmin:
		return true
	default:
		return false
	}
}

func (a Actor) CanAssignJobs() bool {
	switch a.Role {
	case RoleOwner, RoleAdmin, RoleDispatcher:
		return true
	default:
		return false
	}
}

func (a Actor) Scope() VisibilityScope {
	scope := VisibilityScope{
		StoreID: a.StoreID,
	}

	switch a.Role {
	case RoleOwner, RoleAdmin, RoleDispatcher:
		scope.CanSeeEntireStore = true
	case RoleTechnician:
		scope.AssignedTechnicianID = a.TechnicianID
	case RoleCustomer:
		scope.CustomerID = a.CustomerID
	}

	return scope
}
