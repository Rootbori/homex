"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowLeft, Building2, LogIn, Mail, MessageCircle, Search, UserRound, Wrench } from "lucide-react";
import { beginOAuthLogin } from "@/app/login/actions";
import {
  authAccountOptions,
  authProviderOptions,
  loginPathForAccountType,
  providerLabel,
  type AuthAccountType,
  type AuthProviderId,
} from "@/lib/auth-flow";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

type LoginFormProps = {
  error?: string | null;
  providerAvailability: Record<AuthProviderId, boolean>;
  initialAccountType?: AuthAccountType;
  fixedAccountType?: AuthAccountType;
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
  "provider-not-configured": "ยังไม่ได้ตั้งค่า Client ID / Secret ของผู้ให้บริการนี้",
  "unsupported-account-type": "ประเภทบัญชีไม่ถูกต้อง",
  "unsupported-provider": "ผู้ให้บริการที่เลือกไม่รองรับ",
};

export function LoginForm({
  error,
  providerAvailability,
  initialAccountType = "customer",
  fixedAccountType,
  heading = "เข้าสู่ระบบ",
  subtitle = "เลือกประเภทผู้ใช้ตามโครง `users` ของระบบ แล้วเข้าสู่ระบบด้วย LINE หรือ Gmail",
  backHref = "/login",
}: LoginFormProps) {
  const [accountType, setAccountType] = useState<AuthAccountType>(fixedAccountType ?? initialAccountType);
  const selectedAccount = useMemo(
    () => authAccountOptions.find((item) => item.id === accountType) ?? authAccountOptions[0],
    [accountType],
  );

  return (
    <div className="min-h-screen bg-surface">
      <main className="mx-auto max-w-sm px-5 pb-10 pt-6 sm:max-w-md md:max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href={backHref}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-low text-primary transition-transform active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Homex</p>
            <h1 className="headline-font text-2xl font-bold text-on-surface">{heading}</h1>
          </div>
        </div>

        <p className="mb-5 text-sm leading-6 text-on-surface-variant">{subtitle}</p>

        {error ? <NoticeBox>{errorMessages[error] ?? "เกิดข้อผิดพลาดในการเข้าสู่ระบบ"}</NoticeBox> : null}

        <form action={beginOAuthLogin} className="page-stack">
          <input name="account_type" type="hidden" value={accountType} />

          <Card className="rounded-[1.75rem] border border-border/20">
            <CardContent className="space-y-5 p-5">
              {fixedAccountType ? (
                <section className="section-stack-sm">
                  <SectionLabel>ประเภทผู้ใช้</SectionLabel>
                  <LockedAccountCard accountType={fixedAccountType} />
                </section>
              ) : (
                <section className="section-stack-sm">
                  <SectionLabel>ฉันต้องการใช้งานเป็น</SectionLabel>
                  <div className="grid gap-2">
                    {authAccountOptions.map((option) => (
                      <ChoiceButton
                        key={option.id}
                        active={option.id === accountType}
                        caption={option.caption}
                        icon={option.id === "customer" ? Search : Wrench}
                        onClick={() => setAccountType(option.id)}
                        title={option.label}
                      />
                    ))}
                  </div>
                </section>
              )}

              <section className="section-stack-sm">
                <SectionLabel>เข้าสู่ระบบด้วย</SectionLabel>
                <div className="grid gap-2">
                  {authProviderOptions.map((provider) => (
                    <ProviderSubmitButton
                      key={provider.id}
                      accent={provider.accent}
                      description={provider.description}
                      disabled={!providerAvailability[provider.id]}
                      icon={provider.id === "line" ? MessageCircle : Mail}
                      provider={provider.id}
                      title={provider.label}
                    />
                  ))}
                </div>
              </section>
            </CardContent>
          </Card>

          <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            เมื่อเข้าสู่ระบบสำเร็จ ระบบจะพาไปที่{" "}
            <span className="font-semibold text-on-surface">{selectedAccount.nextPath}</span>
          </div>

        <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
          หลังยืนยันกับ LINE หรือ Gmail แล้ว ระบบจะเชื่อมบัญชี OAuth เข้ากับข้อมูลผู้ใช้จริงของคุณก่อนเข้าใช้งาน
        </div>

        <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
          เข้าสู่ระบบครั้งแรก ระบบจะสร้างบัญชีให้อัตโนมัติตามประเภทผู้ใช้ที่คุณเลือก
        </div>
      </form>
    </main>
  </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
      {children}
    </p>
  );
}

function NoticeBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-2xl border border-error/10 bg-error-container px-4 py-3 text-sm text-on-error-container">
      {children}
    </div>
  );
}

function LockedAccountCard({ accountType }: { accountType: AuthAccountType }) {
  const option = authAccountOptions.find((item) => item.id === accountType) ?? authAccountOptions[0];
  const Icon = accountType === "staff" ? Building2 : UserRound;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-primary/15 bg-surface-container-lowest px-4 py-4">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-on-surface">{option.label}</span>
        <span className="block text-xs text-on-surface-variant">{option.caption}</span>
      </span>
    </div>
  );
}

function ChoiceButton({
  active,
  caption,
  icon: Icon,
  onClick,
  title,
}: {
  active: boolean;
  caption: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-transform active:scale-[0.98]",
        active
          ? "border-primary bg-surface-container-lowest"
          : "border-border/30 bg-surface-container-low",
      )}
    >
      <span
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-xl",
          active ? "bg-primary/10 text-primary" : "bg-surface-container-high text-on-surface-variant",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-on-surface">{title}</span>
        <span className="block text-xs text-on-surface-variant">{caption}</span>
      </span>
    </button>
  );
}

function ProviderSubmitButton({
  accent,
  description,
  disabled,
  icon: Icon,
  provider,
  title,
}: {
  accent: string;
  description: string;
  disabled: boolean;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  provider: AuthProviderId;
  title: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name="provider"
      value={provider}
      disabled={disabled || pending}
      className={cn(
        buttonVariants({
          variant: disabled ? "outline" : provider === "line" ? "secondary" : "default",
          size: "lg",
        }),
        "h-auto w-full justify-between rounded-[1.5rem] px-4 py-4 text-left",
        disabled && "text-on-surface-variant",
      )}
    >
      <span className="flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-on-surface">
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold">
            {pending ? `กำลังพาไป ${providerLabel(provider)}...` : `เข้าสู่ระบบด้วย ${title}`}
          </span>
          <span className="mt-1 block text-xs opacity-80">
            {disabled ? `ตั้งค่า ${title} OAuth ก่อนใช้งาน` : description}
          </span>
        </span>
      </span>
      <LogIn className="h-4 w-4 shrink-0" />
    </button>
  );
}

export function LoginTypeChooser() {
  return (
    <div className="min-h-screen bg-surface">
      <main className="mx-auto max-w-sm px-5 pb-10 pt-6 sm:max-w-md md:max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-low text-primary transition-transform active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Homex</p>
            <h1 className="headline-font text-2xl font-bold text-on-surface">เลือกประเภทผู้ใช้</h1>
          </div>
        </div>

        <p className="mb-5 text-sm leading-6 text-on-surface-variant">
          แยกเส้นทางเข้าใช้งานให้ชัดระหว่างผู้ใช้ประเภท customer กับทีมงานประเภท staff
        </p>

        <div className="page-stack">
          <Card className="rounded-[1.75rem] border border-border/20">
            <CardContent className="card-stack p-5">
              <Link
                href={loginPathForAccountType("customer")}
                className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "h-auto justify-between rounded-[1.5rem] px-4 py-4 text-left")}
              >
                <span className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-primary">
                    <Search className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">ลูกค้า</span>
                    <span className="mt-1 block text-xs opacity-80">
                      สำหรับผู้ใช้ประเภท customer ที่ต้องการหาช่างแอร์ ส่งคำขอ และติดตามงาน
                    </span>
                  </span>
                </span>
                <LogIn className="h-4 w-4 shrink-0" />
              </Link>

              <Link
                href={loginPathForAccountType("staff")}
                className={cn(buttonVariants({ size: "lg" }), "h-auto justify-between rounded-[1.5rem] px-4 py-4 text-left")}
              >
                <span className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-primary">
                    <Wrench className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">ร้าน / ทีมช่าง</span>
                    <span className="mt-1 block text-xs opacity-80">
                      สำหรับผู้ใช้ประเภท staff เช่น owner, admin, dispatcher และ technician
                    </span>
                  </span>
                </span>
                <LogIn className="h-4 w-4 shrink-0" />
              </Link>
            </CardContent>
          </Card>

        <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
          ใช้ LINE หรือ Gmail เดิมของคุณได้เลย ระบบจะสร้างบัญชีอัตโนมัติในครั้งแรกที่เข้าสู่ระบบ
        </div>
      </div>
    </main>
  </div>
  );
}
