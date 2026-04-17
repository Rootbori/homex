package domain

import "strconv"

// Role defines the access level of a user within the system.
type Role string

const (
	RoleOwner      Role = "owner"
	RoleAdmin      Role = "admin"
	RoleDispatcher Role = "dispatcher"
	RoleTechnician Role = "technician"
	RoleUser       Role = "user"
	RoleAnonymous  Role = "anonymous"
)

// Actor represents the authenticated identity making a request.
type Actor struct {
	UserID       string `json:"user_id"`
	StoreID      string `json:"store_id"`
	TechnicianID string `json:"technician_id,omitempty"`
	ProfileID    string `json:"profile_id,omitempty"`
	Role         Role   `json:"role"`
}

// VisibilityScope determines what data an actor is allowed to see.
type VisibilityScope struct {
	StoreID              string `json:"store_id,omitempty"`
	ProfileID            string `json:"profile_id,omitempty"`
	AssignedTechnicianID string `json:"assigned_technician_id,omitempty"`
	CanSeeEntireStore    bool   `json:"can_see_entire_store"`
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
	case RoleUser:
		scope.ProfileID = a.ProfileID
	}

	return scope
}

// ID conversion helpers

func (a Actor) UintUserID() uint {
	v, _ := strconv.ParseUint(a.UserID, 10, 32)
	return uint(v)
}

func (a Actor) UintStoreID() uint {
	v, _ := strconv.ParseUint(a.StoreID, 10, 32)
	return uint(v)
}

func (a Actor) UintTechnicianID() uint {
	v, _ := strconv.ParseUint(a.TechnicianID, 10, 32)
	return uint(v)
}

func (a Actor) UintProfileID() uint {
	v, _ := strconv.ParseUint(a.ProfileID, 10, 32)
	return uint(v)
}
