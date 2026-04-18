package http

import (
	"strings"

	"github.com/rootbeer/homex/api/internal/domain"
	"github.com/rootbeer/homex/api/internal/usecase"
)

func technicianPayload(tech *domain.TechnicianProfile) map[string]any {
	if tech == nil {
		return nil
	}

	services := make([]string, 0, len(tech.Services))
	for _, service := range tech.Services {
		if strings.TrimSpace(service.Label) != "" {
			services = append(services, service.Label)
		}
	}

	areas := make([]string, 0, len(tech.Areas))
	for _, area := range tech.Areas {
		if strings.TrimSpace(area.Label) != "" {
			areas = append(areas, area.Label)
		}
	}

	return map[string]any{
		"id":             tech.ID,
		"slug":           tech.Slug,
		"name":           tech.Store.Name,
		"shop_name":      tech.Store.Name,
		"display_name":   firstNonEmpty(tech.User.FullName, tech.Store.Name),
		"rating":         tech.Rating,
		"reviews":        tech.ReviewCount,
		"experience":     tech.ExperienceYears,
		"area":           areas,
		"services":       services,
		"starting_price": firstStartingPrice(tech.Services),
		"availability":   tech.Availability,
		"phone":          firstNonEmpty(tech.User.Phone, tech.Store.Phone),
		"headline":       firstNonEmpty(tech.Headline, tech.Store.Description),
		"working_hours":  tech.WorkingHours,
		"hero_image":     firstNonEmpty(tech.AvatarURL, tech.Store.LogoURL),
		"avatar_url":     firstNonEmpty(tech.AvatarURL, tech.Store.LogoURL),
		"line_url":       tech.LineURL,
		"store_id":       tech.StoreID,
		"user_id":        tech.UserID,
		"membership_id":  tech.MembershipID,
		"store_kind":     tech.Store.Kind,
	}
}

func technicianServiceItemsPayload(tech *domain.TechnicianProfile) []map[string]any {
	if tech == nil {
		return nil
	}

	items := make([]map[string]any, 0, len(tech.Services))
	for _, service := range tech.Services {
		items = append(items, map[string]any{
			"label":          service.Label,
			"starting_price": service.StartingPrice,
			"service_type":   service.ServiceType,
		})
	}
	return items
}

func serviceAreaItemsPayload(tech *domain.TechnicianProfile) []map[string]any {
	if tech == nil {
		return nil
	}

	items := make([]map[string]any, 0, len(tech.Areas))
	for _, area := range tech.Areas {
		items = append(items, map[string]any{
			"id":          area.ID,
			"province":    area.Province,
			"district":    area.District,
			"subdistrict": area.Subdistrict,
			"label":       area.Label,
		})
	}
	return items
}

func authPayload(result *usecase.AuthSyncResult) map[string]any {
	payload := map[string]any{
		"user":       result.User,
		"membership": result.Membership,
		"store":      result.Store,
		"technician": result.Technician,
		"next": map[string]any{
			"next_path": result.NextPath,
		},
		"actor": map[string]any{
			"user_id": result.User.ID,
		},
	}

	actor := payload["actor"].(map[string]any)
	if result.Store != nil {
		actor["store_id"] = result.Store.ID
	}
	if result.Role != "" && result.Role != domain.RoleAnonymous {
		actor["role"] = result.Role
	}
	if result.ProfileID > 0 {
		actor["profile_id"] = result.ProfileID
	}
	if result.Technician != nil {
		actor["technician_id"] = result.Technician.ID
	}
	if result.OnboardingRequired {
		payload["status"] = "onboarding_required"
		payload["message"] = "กรุณาเลือกวิธีเริ่มต้นใช้งานสำหรับฝั่งร้านหรือทีมช่าง"
	} else {
		payload["status"] = "ok"
		payload["message"] = "เชื่อมบัญชีเรียบร้อย"
	}

	return payload
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}

func firstStartingPrice(services []domain.TechnicianService) int {
	if len(services) == 0 {
		return 0
	}

	price := services[0].StartingPrice
	for _, service := range services[1:] {
		if price == 0 || (service.StartingPrice > 0 && service.StartingPrice < price) {
			price = service.StartingPrice
		}
	}
	return price
}
