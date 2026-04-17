export type AuthAccountType = "customer" | "staff";
export type AuthProviderId = "line" | "google";
export type AppRole = "customer" | "staff";

export const authAccountOptions: Array<{
  id: AuthAccountType;
  label: string;
  caption: string;
  nextPath: string;
}> = [
  {
    id: "customer",
    label: "ลูกค้า",
    caption: "สำหรับคนที่ต้องการหาช่าง ส่งคำขอ และติดตามงานของตัวเอง",
    nextPath: "/search",
  },
  {
    id: "staff",
    label: "ร้าน / ทีมช่าง",
    caption: "สำหรับ owner, admin, dispatcher และ technician ในร้าน",
    nextPath: "/portal/dashboard",
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
  return value === "customer" || value === "staff";
}

export function isAuthProviderId(value: string): value is AuthProviderId {
  return value === "line" || value === "google";
}

export function redirectForAccountType(accountType: AuthAccountType) {
  return accountType === "staff" ? "/portal/dashboard" : "/search";
}

export function loginPathForAccountType(accountType: AuthAccountType) {
  return accountType === "staff" ? "/login/staff" : "/login/customer";
}

export function roleForAccountType(accountType: AuthAccountType): AppRole {
  return accountType === "staff" ? "staff" : "customer";
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
