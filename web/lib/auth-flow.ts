export type AuthAccountType = "user" | "staff";
export type AuthProviderId = "line" | "google";
export type AppRole = "user" | "staff";
export type StaffIntent = "owner" | "solo" | "team_member";

export const authAccountOptions: Array<{
  id: AuthAccountType;
  label: string;
  caption: string;
  nextPath: string;
}> = [
  {
    id: "user",
    label: "ลูกค้า",
    caption: "สำหรับคนที่ต้องการหาช่าง ส่งคำขอ และติดตามงานของตัวเอง",
    nextPath: "/search",
  },
  {
    id: "staff",
    label: "ร้าน / ช่างอิสระ / ทีมงาน",
    caption: "สำหรับเจ้าของร้าน ช่างอิสระ หรือทีมงานที่ต้องเข้าระบบหลังบ้าน",
    nextPath: "/portal/dashboard",
  },
];

export const staffIntentOptions: Array<{
  id: StaffIntent;
  label: string;
  description: string;
}> = [
  {
    id: "owner",
    label: "ฉันเป็นเจ้าของร้าน / บริษัท",
    description: "สร้างร้านใหม่และเริ่มจัดการทีม งาน และลูกค้าในฐานะ owner",
  },
  {
    id: "solo",
    label: "ฉันเป็นช่างอิสระ",
    description: "สร้างร้านชื่อเดียวกับคุณและเปิดใช้งานเป็นทีมเดี่ยวได้ทันที",
  },
  {
    id: "team_member",
    label: "ฉันเป็นทีมงาน / ลูกน้อง",
    description: "ใช้ลิงก์เชิญจากเจ้าของร้านเพื่อเข้าร่วมทีมของเขา",
  },
];

export const authProviderOptions: Array<{
  id: AuthProviderId;
  label: string;
  accent: string;
  description: string;
}> = [
  {
    id: "line",
    label: "LINE",
    accent: "#06C755",
    description: "เหมาะกับผู้ใช้ที่ทำงานต่อผ่าน LINE OA",
  },
  {
    id: "google",
    label: "Gmail",
    accent: "#4285F4",
    description: "เหมาะกับการเข้าใช้งานผ่านบัญชี Google",
  },
];

export function isAuthAccountType(value: string): value is AuthAccountType {
  return value === "user" || value === "staff";
}

export function isAuthProviderId(value: string): value is AuthProviderId {
  return value === "line" || value === "google";
}

export function redirectForAccountType(accountType: AuthAccountType) {
  return accountType === "staff" ? "/portal/dashboard" : "/search";
}

export function staffOnboardingPath() {
  return "/onboarding/staff";
}

export function loginPathForAccountType(accountType: AuthAccountType) {
  return accountType === "staff" ? "/login/staff" : "/login/user";
}

export function roleForAccountType(accountType: AuthAccountType): AppRole {
  return accountType === "staff" ? "staff" : "user";
}

export function isProviderConfigured(provider: AuthProviderId) {
  if (provider === "line") {
    return Boolean(process.env.AUTH_LINE_ID && process.env.AUTH_LINE_SECRET);
  }

  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

export function normalizeRedirectPath(value: string | undefined | null) {
  if (!value || !value.startsWith("/")) {
    return null;
  }

  return value;
}

export function providerLabel(provider: string | null | undefined) {
  if (provider === "line") {
    return "LINE";
  }

  if (provider === "google") {
    return "Gmail";
  }

  return "OAuth";
}
