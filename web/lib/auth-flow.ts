import { normalizeLocale, withLocalePath } from "@/lib/i18n/config";

export type AuthAccountType = "user" | "staff";
export type AuthProviderId = "line" | "google";
export type AppRole = "user" | "staff";
export type StaffIntent = "create_store" | "join_team";

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
    label: "ร้าน / ทีมช่าง",
    caption: "สำหรับคนที่ต้องการสร้างร้านใหม่ หรือเข้าร่วมทีมด้วยลิงก์เชิญ",
    nextPath: "/portal/dashboard",
  },
];

export const staffIntentOptions: Array<{
  id: StaffIntent;
  label: string;
  description: string;
}> = [
  {
    id: "create_store",
    label: "สร้างร้านใหม่",
    description: "ตั้งชื่อร้านของคุณ แล้วเริ่มจัดการงาน ลูกค้า และทีมช่างในร้านเดียวกัน",
  },
  {
    id: "join_team",
    label: "เข้าร่วมทีม",
    description: "ใช้ลิงก์เชิญจากเจ้าของร้านเพื่อเข้าร่วมร้านที่มีอยู่แล้ว",
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

export function localizeAppPath(pathname: string, locale?: string | null) {
  return withLocalePath(normalizeLocale(locale), pathname);
}

export function redirectForAccountType(accountType: AuthAccountType, locale?: string | null) {
  return localizeAppPath(accountType === "staff" ? "/portal/dashboard" : "/search", locale);
}

export function staffOnboardingPath(locale?: string | null) {
  return localizeAppPath("/onboarding/staff", locale);
}

export function loginPathForAccountType(accountType: AuthAccountType, locale?: string | null) {
  return localizeAppPath(accountType === "staff" ? "/login/staff" : "/login/user", locale);
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
  if (!value?.startsWith("/")) {
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
