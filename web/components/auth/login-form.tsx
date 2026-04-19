"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import {
  ArrowLeft,
  ChevronRight,
  Mail,
  MessageCircle,
  Shield,
  UserRound,
  Wrench,
} from "lucide-react";
import { beginOAuthLogin } from "@/lib/auth/actions";
import { Logo } from "@/components/ui/logo";
import {
  authProviderOptions,
  loginPathForAccountType,
  providerLabel,
  type AuthAccountType,
  type AuthProviderId,
} from "@/lib/auth-flow";
import { cn } from "@/lib/utils";

/* ─────────────────────── Types ─────────────────────── */

type LoginFormProps = {
  error?: string | null;
  providerAvailability: Record<AuthProviderId, boolean>;
  initialAccountType?: AuthAccountType;
  heading?: string;
  subtitle?: string;
  backHref?: string;
};

const errorMessages: Record<string, string> = {
  AccessDenied: "การเข้าสู่ระบบถูกปฏิเสธจากผู้ให้บริการ",
  CallbackRouteError: "ไม่สามารถยืนยันตัวตนจากผู้ให้บริการได้",
  Configuration: "การตั้งค่า OAuth ยังไม่ครบถ้วน",
  OAuthAccountNotLinked: "บัญชีนี้เคยผูกกับผู้ให้บริการอีกตัวหนึ่ง",
  OAuthCallbackError: "เกิดปัญหาระหว่างรับผลลัพธ์จากผู้ให้บริการ",
  "provider-not-configured":
    "ยังไม่ได้ตั้งค่า Client ID / Secret ของผู้ให้บริการนี้",
  "unsupported-account-type": "ประเภทบัญชีไม่ถูกต้อง",
  "unsupported-provider": "ผู้ให้บริการที่เลือกไม่รองรับ",
};

/* ════════════════ Login Form (Provider Buttons) ════════════════ */

export function LoginForm({
  error,
  providerAvailability,
  initialAccountType = "user",
  heading = "เข้าสู่ระบบ",
  subtitle,
  backHref = "/login",
}: Readonly<LoginFormProps>) {
  const isUser = initialAccountType === "user";

  return (
    <div className="login-page relative flex min-h-dvh flex-col overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div
          className={cn(
            "absolute inset-0",
            isUser
              ? "bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100"
              : "bg-gradient-to-br from-slate-50 via-zinc-50 to-stone-100",
          )}
        />
        {/* Decorative blobs */}
        <div
          className={cn(
            "absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl",
            isUser ? "bg-blue-300" : "bg-amber-200",
          )}
        />
        <div
          className={cn(
            "absolute -bottom-32 -left-32 h-80 w-80 rounded-full opacity-15 blur-3xl",
            isUser ? "bg-indigo-300" : "bg-orange-200",
          )}
        />
      </div>

      {/* Back button */}
      <header className="relative z-10 px-5 pt-5">
        <Link
          href={backHref}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 text-on-surface-variant/60 backdrop-blur-sm transition-all hover:bg-white hover:text-on-surface"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </header>

      {/* Center content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-[22rem] animate-in">
          {/* Icon + Heading */}
          <div className="mb-10 text-center">
            <div
              className={cn(
                "mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg",
                isUser
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25"
                  : "bg-gradient-to-br from-amber-500 to-orange-600 shadow-orange-500/25",
              )}
            >
              {isUser ? (
                <Logo className="h-8 w-8 text-white" />
              ) : (
                <Wrench className="h-8 w-8 text-white" />
              )}
            </div>
            <h1 className="headline-font text-[1.75rem] font-extrabold tracking-tight text-on-surface">
              {heading}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-[13px] leading-relaxed text-on-surface-variant/60">
                {subtitle}
              </p>
            ) : null}
          </div>

          {/* Error */}
          {error ? (
            <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600 ring-1 ring-red-100">
              {errorMessages[error] ?? "เกิดข้อผิดพลาดในการเข้าสู่ระบบ"}
            </div>
          ) : null}

          {/* Glass card with providers */}
          <div className="rounded-3xl bg-white/70 p-5 shadow-xl shadow-black/[0.03] ring-1 ring-white/80 backdrop-blur-xl">
            <form action={beginOAuthLogin} className="space-y-3">
              <input
                name="account_type"
                type="hidden"
                value={initialAccountType}
              />

              {authProviderOptions.map((provider) => (
                <ProviderButton
                  key={provider.id}
                  accent={provider.accent}
                  disabled={!providerAvailability[provider.id]}
                  icon={provider.id === "line" ? MessageCircle : Mail}
                  provider={provider.id}
                  title={provider.label}
                />
              ))}
            </form>

            {/* Divider */}
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-black/[0.06]" />
              <span className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/30">
                ปลอดภัย
              </span>
              <div className="h-px flex-1 bg-black/[0.06]" />
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-2 text-on-surface-variant/30">
              <Shield className="h-3.5 w-3.5" />
              <span className="text-[11px]">
                สร้างบัญชีอัตโนมัติเมื่อเข้าใช้ครั้งแรก
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ════════════════ Login Type Chooser (User / Staff) ════════════════ */

export function LoginTypeChooser() {
  return (
    <div className="login-page relative flex min-h-dvh flex-col overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/50 to-indigo-50" />
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-blue-200/20 blur-3xl" />
        <div className="absolute -left-40 bottom-20 h-[400px] w-[400px] rounded-full bg-indigo-200/15 blur-3xl" />
      </div>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm animate-in">
          {/* Brand */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20">
              <Logo className="h-10 w-10 text-white" />
            </div>
            <h1 className="headline-font text-3xl font-extrabold tracking-tight text-on-surface">
              Homex
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant/50">
              บริการช่างแอร์มืออาชีพ
            </p>
          </div>

          {/* Cards */}
          <div className="space-y-3">
            <RoleCard
              href={loginPathForAccountType("user")}
              icon={UserRound}
              title="ลูกค้า"
              description="ค้นหาและจองช่างแอร์"
              gradient="from-blue-500 to-indigo-600"
              shadowColor="shadow-blue-500/15"
            />
            <RoleCard
              href={loginPathForAccountType("staff")}
              icon={Wrench}
              title="ร้าน / ทีมช่าง"
              description="สร้างร้านใหม่หรือเข้าร่วมทีมด้วยลิงก์เชิญ"
              gradient="from-amber-500 to-orange-600"
              shadowColor="shadow-orange-500/15"
            />
          </div>

          {/* Footer */}
          <p className="mt-10 text-center text-[11px] text-on-surface-variant/30">
            ใช้ LINE หรือ Gmail เข้าสู่ระบบได้ทันที
          </p>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════ Sub-components ═══════════════════════ */

function ProviderButton({
  accent,
  disabled,
  icon: Icon,
  provider,
  title,
}: Readonly<{
  accent: string;
  disabled: boolean;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  provider: AuthProviderId;
  title: string;
}>) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button
      type="submit"
      name="provider"
      value={provider}
      disabled={isDisabled}
      className={cn(
        "group relative flex h-[3.25rem] w-full items-center justify-center gap-2.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200",
        !isDisabled && "hover:brightness-110 active:scale-[0.97]",
        isDisabled && "pointer-events-none opacity-40 saturate-0",
      )}
      style={{ backgroundColor: accent }}
    >
      <Icon className="h-[18px] w-[18px]" />
      <span>
        {pending
          ? `กำลังไป ${providerLabel(provider)}…`
          : `เข้าสู่ระบบด้วย ${title}`}
      </span>
    </button>
  );
}

function RoleCard({
  href,
  icon: Icon,
  title,
  description,
  gradient,
  shadowColor,
}: Readonly<{
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  shadowColor: string;
}>) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-4 rounded-[1.25rem] bg-white/80 px-5 py-5 shadow-lg ring-1 ring-black/[0.03] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]",
        shadowColor,
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md",
          gradient,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-base font-bold text-on-surface">
          {title}
        </span>
        <span className="block text-[13px] text-on-surface-variant/50">
          {description}
        </span>
      </div>
      <ChevronRight className="h-5 w-5 text-on-surface-variant/20 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-on-surface-variant/40" />
    </Link>
  );
}
