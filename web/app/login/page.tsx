import type { Metadata } from "next";
import { LoginTypeChooser } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage() {
  return <LoginTypeChooser />;
}
