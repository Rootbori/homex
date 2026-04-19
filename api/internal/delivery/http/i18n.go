package http

import (
	"net/http"
	"strings"
)

type responseLocale string

const (
	localeTH responseLocale = "th"
	localeEN responseLocale = "en"
)

var responseMessages = map[string]map[responseLocale]string{
	"invalid_payload": {
		localeTH: "ข้อมูลไม่ถูกต้อง",
		localeEN: "Invalid payload",
	},
	"staff_access_required": {
		localeTH: "ต้องเข้าสู่ระบบฝั่งร้านหรือทีมช่างก่อน",
		localeEN: "Staff access required",
	},
	"session_invalid": {
		localeTH: "เซสชันไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่",
		localeEN: "Session invalid. Please sign in again.",
	},
	"login_required": {
		localeTH: "กรุณาเข้าสู่ระบบก่อน",
		localeEN: "Login required",
	},
	"forbidden": {
		localeTH: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
		localeEN: "Forbidden",
	},
	"store_not_found": {
		localeTH: "ไม่พบข้อมูลร้าน",
		localeEN: "Store not found",
	},
	"setup_profile_not_found": {
		localeTH: "ไม่พบข้อมูลตั้งค่าร้าน",
		localeEN: "Setup profile not found",
	},
	"unable_load_setup_profile": {
		localeTH: "ไม่สามารถโหลดข้อมูลตั้งค่าร้านได้",
		localeEN: "Unable to load setup profile",
	},
	"unable_update_setup_profile": {
		localeTH: "ยังบันทึกข้อมูลร้านและโปรไฟล์ช่างไม่สำเร็จ",
		localeEN: "Unable to update shop and technician profile",
	},
	"setup_profile_updated": {
		localeTH: "อัปเดตข้อมูลร้านและโปรไฟล์ช่างเรียบร้อยแล้ว",
		localeEN: "Shop and technician profile updated successfully",
	},
	"technician_not_found": {
		localeTH: "ไม่พบข้อมูลช่าง",
		localeEN: "Technician not found",
	},
	"job_not_found": {
		localeTH: "ไม่พบข้อมูลงาน",
		localeEN: "Job not found",
	},
	"name_required": {
		localeTH: "กรุณากรอกชื่อ",
		localeEN: "Name is required",
	},
	"technician_create_failed": {
		localeTH: "ยังไม่สามารถสร้างโปรไฟล์ช่างได้",
		localeEN: "Unable to create technician profile",
	},
	"technician_created": {
		localeTH: "สร้างโปรไฟล์ช่างเรียบร้อยแล้ว",
		localeEN: "Technician profile created successfully",
	},
	"quotation_invalid": {
		localeTH: "กรอกข้อมูลใบเสนอราคาให้ครบก่อนส่ง",
		localeEN: "Please complete the quotation before sending",
	},
	"quotation_saved": {
		localeTH: "บันทึกร่างใบเสนอราคาเรียบร้อยแล้ว",
		localeEN: "Quotation draft saved successfully",
	},
	"quotation_saved_open_gmail": {
		localeTH: "บันทึกใบเสนอราคาแล้ว พร้อมเปิด Gmail ให้ส่งต่อได้ทันที",
		localeEN: "Quotation saved. Gmail is ready to send.",
	},
	"lead_created": {
		localeTH: "รับคำขอเรียบร้อย ร้านจะติดต่อกลับพร้อมใบเสนอราคา",
		localeEN: "Service request received. The shop will respond with a quotation.",
	},
	"province_id_required": {
		localeTH: "กรุณาเลือกจังหวัดก่อน",
		localeEN: "Province ID is required",
	},
	"district_id_required": {
		localeTH: "กรุณาเลือกอำเภอก่อน",
		localeEN: "District ID is required",
	},
	"status_updated": {
		localeTH: "อัปเดตสถานะเรียบร้อยแล้ว",
		localeEN: "Status updated successfully",
	},
	"internal_error": {
		localeTH: "ระบบยังไม่สามารถทำรายการนี้ได้ กรุณาลองใหม่อีกครั้ง",
		localeEN: "The system could not complete this request. Please try again.",
	},
	"signup_title": {
		localeTH: "สมัครใช้งาน Homex",
		localeEN: "Join Homex",
	},
	"signup_subtitle": {
		localeTH: "เข้าใช้งานด้วย LINE หรือ Gmail ก่อน จากนั้นระบบจะพาไปเลือกว่าเป็นลูกค้าหรือฝั่งร้าน และถ้าเป็นฝั่งร้านจะเลือกสร้างร้านใหม่หรือเข้าร่วมทีมต่อได้",
		localeEN: "Continue with LINE or Gmail first, then choose whether you are a customer or a shop team. Shop users can create a new shop or join an existing team afterward.",
	},
	"signup_user_label": {
		localeTH: "ลูกค้า",
		localeEN: "Customer",
	},
	"signup_user_description": {
		localeTH: "สำหรับค้นหาช่างแอร์ ดูโปรไฟล์ และติดตามงาน",
		localeEN: "For finding technicians, viewing profiles, and tracking jobs",
	},
	"signup_staff_label": {
		localeTH: "ร้าน / ทีมช่าง",
		localeEN: "Shop / Technician team",
	},
	"signup_staff_description": {
		localeTH: "ใช้สำหรับฝั่งหลังบ้าน แล้วค่อยเลือกสร้างร้านใหม่หรือเข้าร่วมทีมหลัง login",
		localeEN: "For the back office flow, then create a new shop or join a team after login",
	},
	"gmail_label": {
		localeTH: "Gmail",
		localeEN: "Gmail",
	},
}

func localeFromRequest(r *http.Request) responseLocale {
	value := strings.TrimSpace(r.Header.Get("X-Homex-Locale"))
	if value == "" {
		value = strings.TrimSpace(r.Header.Get("Accept-Language"))
	}
	value = strings.ToLower(value)
	if strings.HasPrefix(value, "th") {
		return localeTH
	}
	return localeEN
}

func messageFor(r *http.Request, key string) string {
	if value, ok := responseMessages[key]; ok {
		if localized, ok := value[localeFromRequest(r)]; ok && localized != "" {
			return localized
		}
		if fallback, ok := value[localeEN]; ok {
			return fallback
		}
	}
	return key
}
