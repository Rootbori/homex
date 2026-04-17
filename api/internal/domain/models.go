package domain

import "time"

type LeadSource string
type LeadStatus string
type JobStatus string
type QuotationStatus string
type Availability string
type ServiceType string
type UserType string
type IdentityProvider string

const (
	LeadSourceLineOA         LeadSource       = "line_oa"
	LeadSourceFindTech       LeadSource       = "find_technician"
	LeadStatusNew            LeadStatus       = "new"
	LeadStatusQuoted         LeadStatus       = "quoted"
	LeadStatusConverted      LeadStatus       = "converted"
	LeadStatusCancelled      LeadStatus       = "cancelled"
	JobStatusAwaitingShop    JobStatus        = "awaiting_shop"
	JobStatusAwaitingQuote   JobStatus        = "awaiting_quote"
	JobStatusAwaitingConfirm JobStatus        = "awaiting_confirm"
	JobStatusScheduled       JobStatus        = "scheduled"
	JobStatusOnTheWay        JobStatus        = "on_the_way"
	JobStatusInProgress      JobStatus        = "in_progress"
	JobStatusCompleted       JobStatus        = "completed"
	JobStatusCancelled       JobStatus        = "cancelled"
	QuotationStatusDraft     QuotationStatus  = "draft"
	QuotationStatusSent      QuotationStatus  = "sent"
	QuotationStatusAccepted  QuotationStatus  = "accepted"
	QuotationStatusDeclined  QuotationStatus  = "declined"
	AvailabilityAvailable    Availability     = "available"
	AvailabilityBusy         Availability     = "busy"
	ServiceCleaning          ServiceType      = "cleaning"
	ServiceRepair            ServiceType      = "repair"
	ServiceRefill            ServiceType      = "refill"
	ServiceInstallation      ServiceType      = "installation"
	UserTypeCustomer         UserType         = "customer"
	UserTypeStaff            UserType         = "staff"
	UserTypeHybrid           UserType         = "hybrid"
	IdentityProviderLine     IdentityProvider = "line"
	IdentityProviderGoogle   IdentityProvider = "google"
	IdentityProviderPhoneOTP IdentityProvider = "phone_otp"
)

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Type      UserType  `gorm:"size:32;index;not null;default:'customer'" json:"type"`
	FullName  string    `gorm:"size:120;not null" json:"full_name"`
	Phone     string    `gorm:"size:32;index" json:"phone"`
	Email     string    `gorm:"size:160;index" json:"email"`
	AvatarURL string    `gorm:"size:255" json:"avatar_url"`
	IsActive  bool      `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UserIdentity struct {
	ID             uint             `gorm:"primaryKey" json:"id"`
	UserID         uint             `gorm:"index;not null" json:"user_id"`
	Provider       IdentityProvider `gorm:"size:32;not null;uniqueIndex:idx_user_identity_provider_subject" json:"provider"`
	ProviderUserID string           `gorm:"size:191;not null;uniqueIndex:idx_user_identity_provider_subject" json:"provider_user_id"`
	Email          string           `gorm:"size:160;index" json:"email"`
	IsPrimary      bool             `gorm:"default:false" json:"is_primary"`
	CreatedAt      time.Time        `json:"created_at"`
	UpdatedAt      time.Time        `json:"updated_at"`
}

type AuthSignupSession struct {
	ID          uint             `gorm:"primaryKey" json:"id"`
	Token       string           `gorm:"size:80;uniqueIndex;not null" json:"token"`
	UserID      uint             `gorm:"index;not null" json:"user_id"`
	StoreID     *uint            `gorm:"index" json:"store_id,omitempty"`
	AccountType UserType         `gorm:"size:32;not null" json:"account_type"`
	Provider    IdentityProvider `gorm:"size:32;not null" json:"provider"`
	ExpiresAt   time.Time        `gorm:"index;not null" json:"expires_at"`
	ConsumedAt  *time.Time       `gorm:"index" json:"consumed_at,omitempty"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
}

type Store struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:120;not null" json:"name"`
	Phone       string    `gorm:"size:32" json:"phone"`
	LineOAID    string    `gorm:"size:120" json:"line_oa_id"`
	LogoURL     string    `gorm:"size:255" json:"logo_url"`
	Description string    `gorm:"size:500" json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type StoreMembership struct {
	ID                uint               `gorm:"primaryKey" json:"id"`
	StoreID           uint               `gorm:"uniqueIndex:idx_store_membership_store_user;index;not null" json:"store_id"`
	UserID            uint               `gorm:"uniqueIndex:idx_store_membership_store_user;index;not null" json:"user_id"`
	DisplayName       string             `gorm:"size:120" json:"display_name"`
	Role              Role               `gorm:"size:32;not null" json:"role"`
	IsActive          bool               `gorm:"default:true" json:"is_active"`
	TechnicianProfile *TechnicianProfile `gorm:"foreignKey:MembershipID" json:"technician_profile,omitempty"`
	CreatedAt         time.Time          `json:"created_at"`
	UpdatedAt         time.Time          `json:"updated_at"`
}

type TechnicianProfile struct {
	ID              uint         `gorm:"primaryKey" json:"id"`
	MembershipID    uint         `gorm:"uniqueIndex;not null" json:"membership_id"`
	StoreID         uint         `gorm:"index;not null" json:"store_id"`
	UserID          uint         `gorm:"index;not null" json:"user_id"`
	Slug            string       `gorm:"uniqueIndex;size:140;not null" json:"slug"`
	AvatarURL       string       `gorm:"size:255" json:"avatar_url"`
	Headline        string       `gorm:"size:180" json:"headline"`
	ExperienceYears int          `gorm:"default:0" json:"experience_years"`
	Rating          float64      `gorm:"type:numeric(3,2);default:0" json:"rating"`
	ReviewCount     int          `gorm:"default:0" json:"review_count"`
	Availability    Availability `gorm:"size:32;default:'available'" json:"availability"`
	WorkingHours    string       `gorm:"size:160" json:"working_hours"`
	LineURL         string       `gorm:"size:255" json:"line_url"`
	CreatedAt       time.Time    `json:"created_at"`
	UpdatedAt       time.Time    `json:"updated_at"`
}

type TechnicianService struct {
	ID            uint        `gorm:"primaryKey" json:"id"`
	TechnicianID  uint        `gorm:"index;not null" json:"technician_id"`
	ServiceType   ServiceType `gorm:"size:32;not null" json:"service_type"`
	Label         string      `gorm:"size:140;not null" json:"label"`
	StartingPrice int         `gorm:"default:0" json:"starting_price"`
}

type ServiceArea struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	StoreID      uint      `gorm:"index;not null" json:"store_id"`
	TechnicianID *uint     `gorm:"index" json:"technician_id,omitempty"`
	Province     string    `gorm:"size:120;not null" json:"province"`
	District     string    `gorm:"size:120;not null" json:"district"`
	Label        string    `gorm:"size:160;not null" json:"label"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type CustomerProfile struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	StoreID       uint      `gorm:"uniqueIndex:idx_customer_profile_store_user;index;not null" json:"store_id"`
	UserID        uint      `gorm:"uniqueIndex:idx_customer_profile_store_user;index;not null" json:"user_id"`
	PreferredArea string    `gorm:"size:160" json:"preferred_area"`
	TotalSpend    int       `gorm:"default:0" json:"total_spend"`
	Note          string    `gorm:"size:800" json:"note"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type UserAddress struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"index;not null" json:"user_id"`
	Label       string    `gorm:"size:80;not null" json:"label"`
	AddressLine string    `gorm:"size:255;not null" json:"address_line"`
	District    string    `gorm:"size:120" json:"district"`
	Province    string    `gorm:"size:120" json:"province"`
	PostalCode  string    `gorm:"size:16" json:"postal_code"`
	Latitude    float64   `gorm:"default:0" json:"latitude"`
	Longitude   float64   `gorm:"default:0" json:"longitude"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Lead struct {
	ID                   uint        `gorm:"primaryKey" json:"id"`
	StoreID              uint        `gorm:"index;not null" json:"store_id"`
	CustomerUserID       uint        `gorm:"index;not null" json:"customer_user_id"`
	AssignedTechnicianID *uint       `gorm:"index" json:"assigned_technician_id,omitempty"`
	Source               LeadSource  `gorm:"size:32;index;not null" json:"source"`
	Status               LeadStatus  `gorm:"size:32;index;not null" json:"status"`
	ServiceType          ServiceType `gorm:"size:32;not null" json:"service_type"`
	AreaLabel            string      `gorm:"size:160;not null" json:"area_label"`
	AddressLine          string      `gorm:"size:255;not null" json:"address_line"`
	Symptom              string      `gorm:"size:800" json:"symptom"`
	PreferredDate        string      `gorm:"size:40" json:"preferred_date"`
	PreferredTime        string      `gorm:"size:40" json:"preferred_time"`
	QuickNote            string      `gorm:"size:800" json:"quick_note"`
	CreatedAt            time.Time   `json:"created_at"`
	UpdatedAt            time.Time   `json:"updated_at"`
}

type LeadUnit struct {
	ID          uint        `gorm:"primaryKey" json:"id"`
	LeadID      uint        `gorm:"index;not null" json:"lead_id"`
	Sequence    int         `gorm:"default:1" json:"sequence"`
	Brand       string      `gorm:"size:120" json:"brand"`
	BTU         string      `gorm:"size:40" json:"btu"`
	ServiceType ServiceType `gorm:"size:32;not null" json:"service_type"`
	Symptom     string      `gorm:"size:500" json:"symptom"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
}

type Quotation struct {
	ID            uint            `gorm:"primaryKey" json:"id"`
	StoreID       uint            `gorm:"index;not null" json:"store_id"`
	LeadID        *uint           `gorm:"index" json:"lead_id,omitempty"`
	JobID         *uint           `gorm:"index" json:"job_id,omitempty"`
	Status        QuotationStatus `gorm:"size:32;index;not null" json:"status"`
	Subtotal      int             `gorm:"default:0" json:"subtotal"`
	Discount      int             `gorm:"default:0" json:"discount"`
	Total         int             `gorm:"default:0" json:"total"`
	Note          string          `gorm:"size:800" json:"note"`
	SharedViaLine bool            `gorm:"default:false" json:"shared_via_line"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
}

type QuotationItem struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	QuotationID uint      `gorm:"index;not null" json:"quotation_id"`
	Label       string    `gorm:"size:160;not null" json:"label"`
	Quantity    int       `gorm:"default:1" json:"quantity"`
	UnitPrice   int       `gorm:"default:0" json:"unit_price"`
	Amount      int       `gorm:"default:0" json:"amount"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Job struct {
	ID                   uint        `gorm:"primaryKey" json:"id"`
	StoreID              uint        `gorm:"index;not null" json:"store_id"`
	LeadID               *uint       `gorm:"index" json:"lead_id,omitempty"`
	CustomerUserID       uint        `gorm:"index;not null" json:"customer_user_id"`
	AssignedTechnicianID *uint       `gorm:"index" json:"assigned_technician_id,omitempty"`
	QuotationID          *uint       `gorm:"index" json:"quotation_id,omitempty"`
	JobCode              string      `gorm:"uniqueIndex;size:48;not null" json:"job_code"`
	Status               JobStatus   `gorm:"size:32;index;not null" json:"status"`
	ServiceType          ServiceType `gorm:"size:32;not null" json:"service_type"`
	AreaLabel            string      `gorm:"size:160;not null" json:"area_label"`
	AddressLine          string      `gorm:"size:255;not null" json:"address_line"`
	Symptom              string      `gorm:"size:800" json:"symptom"`
	ScheduledDate        string      `gorm:"size:40" json:"scheduled_date"`
	ScheduledTime        string      `gorm:"size:40" json:"scheduled_time"`
	PaymentStatus        string      `gorm:"size:40;not null;default:'pending'" json:"payment_status"`
	InternalNote         string      `gorm:"size:1000" json:"internal_note"`
	CreatedAt            time.Time   `json:"created_at"`
	UpdatedAt            time.Time   `json:"updated_at"`
}

type JobPhoto struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	JobID     uint      `gorm:"index;not null" json:"job_id"`
	Kind      string    `gorm:"size:40;not null" json:"kind"`
	ImageURL  string    `gorm:"size:255;not null" json:"image_url"`
	Caption   string    `gorm:"size:160" json:"caption"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type JobTimelineEvent struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	JobID     uint      `gorm:"index;not null" json:"job_id"`
	Type      string    `gorm:"size:40;not null" json:"type"`
	Label     string    `gorm:"size:120;not null" json:"label"`
	Note      string    `gorm:"size:255" json:"note"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Review struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	StoreID        uint      `gorm:"index;not null" json:"store_id"`
	TechnicianID   uint      `gorm:"index;not null" json:"technician_id"`
	CustomerUserID uint      `gorm:"index;not null" json:"customer_user_id"`
	JobID          uint      `gorm:"index;not null" json:"job_id"`
	Rating         int       `gorm:"not null" json:"rating"`
	Comment        string    `gorm:"size:500" json:"comment"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
