package database

import (
	"fmt"
	"log"

	"github.com/rootbeer/homex/api/internal/domain"
	"gorm.io/gorm"
)

func Seed(db *gorm.DB) error {
	var count int64
	db.Model(&domain.Store{}).Count(&count)
	if count > 0 {
		return nil // Already seeded
	}

	log.Println("Seeding initial data...")

	// 1. Create a Store
	store := domain.Store{
		Name:        "Atmospheric Air Service",
		Kind:        domain.StoreKindShop,
		Phone:       "02-123-4567",
		Description: "ศูนย์รวมช่างแอร์มืออาชีพ ดูแลคุณด้วยใจ",
	}
	if err := db.Create(&store).Error; err != nil {
		return err
	}

	// 2. Create Technicians (Users + Profiles)
	techNames := []string{"ช่างบอย แอร์เซอร์วิส", "ช่างชัย คูลเอ็กซ์เพิร์ท"}
	techSlugs := []string{"boy-air-service", "chai-cool-expert"}
	techHeadlines := []string{
		"รับงานล้างแอร์บ้านและคอนโด สะอาดเนี๊ยบ ราคายุติธรรม",
		"ผู้เชี่ยวชาญด้านงานซ่อม แอร์ไม่เย็น น้ำหยด เปิดไม่ติด ปรึกษาฟรี",
	}

	for i := 0; i < len(techNames); i++ {
		// Create User
		user := domain.User{
			FullName: techNames[i],
			Type:     domain.UserTypeStaff,
			Phone:    fmt.Sprintf("081-000-000%d", i),
			Email:    fmt.Sprintf("tech%d@example.com", i),
		}
		db.Create(&user)

		// Create Membership
		membership := domain.StoreMembership{
			StoreID: store.ID,
			UserID:  user.ID,
			Role:    domain.RoleTechnician,
		}
		db.Create(&membership)

		// Create Profile
		profile := domain.TechnicianProfile{
			MembershipID:    membership.ID,
			StoreID:         store.ID,
			UserID:          user.ID,
			Slug:            techSlugs[i],
			Headline:        techHeadlines[i],
			ExperienceYears: 10 + (i * 5),
			Rating:          4.5 + (float64(i) * 0.2),
			ReviewCount:     50 + (i * 30),
			Availability:    domain.AvailabilityAvailable,
			WorkingHours:    "08:00 - 18:00",
		}
		db.Create(&profile)

		// Create Services
		services := []domain.TechnicianService{
			{TechnicianID: profile.ID, ServiceType: domain.ServiceCleaning, Label: "ล้างแอร์ปกติ", StartingPrice: 600},
			{TechnicianID: profile.ID, ServiceType: domain.ServiceRepair, Label: "ซ่อมแอร์", StartingPrice: 800},
		}
		for _, s := range services {
			db.Create(&s)
		}

		// Create Areas
		areas := []domain.ServiceArea{
			{StoreID: store.ID, TechnicianID: &profile.ID, Province: "กรุงเทพมหานคร", District: "ลาดพร้าว", Label: "เขตลาดพร้าว"},
		}
		for _, a := range areas {
			db.Create(&a)
		}
	}

	// 3. Create a User
	userUser := domain.User{
		FullName: "คุณแพรวา มั่นใจ",
		Type:     domain.UserTypeUser,
		Phone:    "095-123-4567",
		Email:    "user@example.com",
	}
	db.Create(&userUser)

	// 4. Create a Lead
	lead := domain.Lead{
		StoreID:       store.ID,
		UserID:        userUser.ID,
		Source:        domain.LeadSourceLineOA,
		Status:        domain.LeadStatusNew,
		ServiceType:   domain.ServiceCleaning,
		AreaLabel:     "พหลโยธิน 24",
		AddressLine:   "คอนโดไลฟ์ ชั้น 10",
		Symptom:       "แอร์ไม่ค่อยเย็น มีลมร้อนสลับ",
		PreferredDate: "2026-04-20",
		PreferredTime: "13:00-15:00",
	}
	db.Create(&lead)

	// 5. Create a Job
	job := domain.Job{
		StoreID:       store.ID,
		UserID:        userUser.ID,
		JobCode:       "JOB-2026-0001",
		Status:        domain.JobStatusScheduled,
		ServiceType:   domain.ServiceCleaning,
		AreaLabel:     "สุขุมวิท 101",
		AddressLine:   "หมู่บ้านสุขดี ซอย 5",
		ScheduledDate: "2026-04-18",
		ScheduledTime: "10:00",
	}
	db.Create(&job)

	return nil
}
