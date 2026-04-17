package fixtures

type Store struct{}

func NewStore() *Store {
	return &Store{}
}

func (s *Store) Technicians() []map[string]any {
	return []map[string]any{
		{
			"id":             "tech-01",
			"slug":           "cool-care-bangkok",
			"name":           "Cool Care Bangkok",
			"shop_name":      "Cool Care Bangkok",
			"display_name":   "ช่างบอย",
			"rating":         4.9,
			"reviews":        128,
			"experience":     12,
			"area":           "ลาดพร้าว, บางกะปิ, วังทองหลาง",
			"services":       []string{"ล้างแอร์", "ซ่อมแอร์", "เติมน้ำยา"},
			"starting_price": 650,
			"availability":   "available",
			"phone":          "089-000-1111",
			"headline":       "ช่างแอร์คอนโดและบ้าน ดูแลงานจบในรอบเดียวถ้าอะไหล่พร้อม",
			"working_hours":  "ทุกวัน 08:00 - 20:00",
			"hero_image":     "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80",
			"avatar_url":     "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=600&q=80",
			"line_url":       "https://line.me/R/ti/p/@coolcare",
		},
		{
			"id":             "tech-02",
			"slug":           "bluewind-service",
			"name":           "Bluewind Service",
			"shop_name":      "Bluewind Service",
			"display_name":   "ช่างเจ",
			"rating":         4.8,
			"reviews":        91,
			"experience":     8,
			"area":           "บางนา, พระโขนง, อ่อนนุช",
			"services":       []string{"ล้างแอร์", "ติดตั้ง", "ซ่อม"},
			"starting_price": 790,
			"availability":   "busy",
			"phone":          "081-555-2323",
			"headline":       "ทีมงานชัดเจน ตรงเวลา เหมาะกับงานติดตั้งและแก้ระบบ",
			"working_hours":  "จันทร์ - เสาร์ 09:00 - 18:30",
			"hero_image":     "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
			"avatar_url":     "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
			"line_url":       "https://line.me/R/ti/p/@bluewind",
		},
	}
}

func (s *Store) Leads() []map[string]any {
	return []map[string]any{
		{
			"id":                  "lead-1201",
			"customer_name":       "คุณมุก",
			"phone":               "089-000-1111",
			"area":                "ลาดพร้าว 71",
			"service_type":        "ล้างแอร์",
			"units":               2,
			"symptom":             "แอร์ไม่ค่อยเย็น มีน้ำหยด",
			"source":              "line_oa",
			"status":              "new",
			"created_at":          "2026-04-16T09:15:00+07:00",
			"assigned_technician": "tech-01",
		},
		{
			"id":                  "lead-1202",
			"customer_name":       "คุณต้น",
			"phone":               "081-555-2323",
			"area":                "บางนา",
			"service_type":        "ซ่อมแอร์",
			"units":               1,
			"symptom":             "เปิดไม่ติด",
			"source":              "find_technician",
			"status":              "quoted",
			"created_at":          "2026-04-16T10:10:00+07:00",
			"assigned_technician": "tech-02",
		},
	}
}

func (s *Store) Jobs() []map[string]any {
	return []map[string]any{
		{
			"id":                       "job-2048",
			"job_code":                 "JOB-2048",
			"customer_user_id":         "cust-101",
			"customer_name":            "คุณแพร",
			"customer_phone":           "095-232-4444",
			"address_line":             "คอนโด The Base ชั้น 9 ห้อง 912",
			"area":                     "รามคำแหง",
			"service_type":             "ล้างแอร์",
			"status":                   "scheduled",
			"source":                   "find_technician",
			"symptom":                  "มีน้ำหยดจากเครื่องในห้องนอน",
			"scheduled_date":           "2026-04-17",
			"scheduled_time":           "13:00 - 15:00",
			"assigned_technician":      "tech-01",
			"assigned_technician_name": "ช่างบอย",
			"quotation_total":          1800,
			"payment_status":           "pending",
			"internal_note":            "นิติบุคคลให้แลกบัตรก่อนเข้าตึก",
			"created_at":               "2026-04-16T09:15:00+07:00",
			"timeline": []map[string]string{
				{"type": "lead_created", "label": "รับคำขอแล้ว"},
				{"type": "quoted", "label": "ส่งใบเสนอราคา"},
				{"type": "confirmed", "label": "ลูกค้ายืนยัน"},
				{"type": "scheduled", "label": "นัดหมายแล้ว"},
			},
		},
		{
			"id":                       "job-2049",
			"job_code":                 "JOB-2049",
			"customer_user_id":         "cust-102",
			"customer_name":            "คุณนนท์",
			"customer_phone":           "098-555-8888",
			"address_line":             "บ้านเลขที่ 88 หมู่บ้านสวนหลวง",
			"area":                     "อ่อนนุช",
			"service_type":             "เติมน้ำยา",
			"status":                   "on_the_way",
			"source":                   "line_oa",
			"symptom":                  "คอมเพรสเซอร์ทำงาน แต่ไม่เย็น",
			"scheduled_date":           "2026-04-16",
			"scheduled_time":           "16:00 - 17:00",
			"assigned_technician":      "tech-02",
			"assigned_technician_name": "ช่างเจ",
			"quotation_total":          1500,
			"payment_status":           "pending",
			"internal_note":            "เข้าซอยลึก โทรก่อนถึง 10 นาที",
			"created_at":               "2026-04-16T08:30:00+07:00",
			"timeline": []map[string]string{
				{"type": "lead_created", "label": "รับคำขอแล้ว"},
				{"type": "quoted", "label": "ส่งใบเสนอราคา"},
				{"type": "confirmed", "label": "ลูกค้ายืนยัน"},
				{"type": "scheduled", "label": "นัดหมายแล้ว"},
				{"type": "on_the_way", "label": "ช่างกำลังเดินทาง"},
			},
		},
	}
}

func (s *Store) Customers() []map[string]any {
	return []map[string]any{
		{
			"id":          "cust-101",
			"name":        "คุณแพร",
			"phone":       "095-232-4444",
			"area":        "รามคำแหง",
			"total_spend": 4200,
			"jobs_count":  3,
			"note":        "คอนโด ชั้น 9 ติดต่อผ่าน LINE สะดวกกว่าโทร",
		},
		{
			"id":          "cust-102",
			"name":        "คุณนนท์",
			"phone":       "098-555-8888",
			"area":        "อ่อนนุช",
			"total_spend": 1500,
			"jobs_count":  1,
			"note":        "บ้านเดี่ยว มีที่จอดรถหน้าบ้าน",
		},
	}
}

func (s *Store) Dashboard() map[string]any {
	return map[string]any{
		"kpis": map[string]int{
			"new_leads_today":    7,
			"jobs_in_progress":   5,
			"pending_quotes":     3,
			"completed_jobs":     18,
			"revenue_this_month": 84200,
		},
		"urgent_jobs": []map[string]any{
			{
				"job_code":            "JOB-2049",
				"customer":            "คุณนนท์",
				"status":              "on_the_way",
				"time":                "16:00",
				"assigned_technician": "tech-02",
			},
		},
		"today_jobs":   s.Jobs(),
		"latest_leads": s.Leads(),
	}
}
