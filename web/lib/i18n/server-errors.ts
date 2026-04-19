import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n/config";

const routeMessages = {
  th: {
    unable_reach_api: "ยังเชื่อมต่อ API ไม่สำเร็จ",
    unable_create_service_request: "ยังส่งคำขอใช้บริการไม่สำเร็จ",
    unable_load_provinces: "ยังโหลดข้อมูลจังหวัดไม่สำเร็จ",
    unable_load_districts: "ยังโหลดข้อมูลอำเภอไม่สำเร็จ",
    unable_load_subdistricts: "ยังโหลดข้อมูลตำบลไม่สำเร็จ",
    unable_signup_options: "ยังโหลดตัวเลือกการสมัครไม่สำเร็จ",
    unable_signup: "ยังส่งข้อมูลสมัครไม่สำเร็จ",
    missing_session_provider_context: "ไม่พบข้อมูล session สำหรับยืนยันบัญชี",
    unable_oauth_sync: "ยังยืนยันบัญชีไม่สำเร็จ",
    unable_complete_staff_onboarding: "ยังตั้งค่าฝั่งร้านไม่สำเร็จ",
    login_required_before_onboarding: "กรุณา login ด้วย LINE หรือ Gmail ก่อนเริ่มตั้งค่าฝั่งร้าน",
    unable_load_setup_profile: "ยังโหลดข้อมูลตั้งค่าร้านไม่สำเร็จ",
    unable_update_setup_profile: "ยังบันทึกข้อมูลตั้งค่าร้านไม่สำเร็จ",
    unable_create_quotation: "ยังสร้างใบเสนอราคาไม่สำเร็จ",
    unable_create_technician: "ยังสร้างทีมช่างไม่สำเร็จ"
  },
  en: {
    unable_reach_api: "Unable to reach API",
    unable_create_service_request: "Unable to create service request",
    unable_load_provinces: "Unable to load provinces",
    unable_load_districts: "Unable to load districts",
    unable_load_subdistricts: "Unable to load subdistricts",
    unable_signup_options: "Unable to load signup options",
    unable_signup: "Unable to submit signup",
    missing_session_provider_context: "Missing session provider context",
    unable_oauth_sync: "Unable to complete account sync",
    unable_complete_staff_onboarding: "Unable to complete staff onboarding",
    login_required_before_onboarding: "Please sign in with LINE or Gmail before setting up your shop",
    unable_load_setup_profile: "Unable to load setup profile",
    unable_update_setup_profile: "Unable to update setup profile",
    unable_create_quotation: "Unable to create quotation",
    unable_create_technician: "Unable to create technician"
  }
} as const;

export async function getServerLocale() {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get("homex_locale")?.value);
}

export async function routeMessage(
  key: keyof (typeof routeMessages)["th"],
) {
  const locale = await getServerLocale();
  return routeMessages[locale][key] ?? routeMessages.en[key];
}
