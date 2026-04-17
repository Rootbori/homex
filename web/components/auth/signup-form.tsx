"use client";

import Link from "next/link";
import type { ComponentType, CSSProperties, FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Mail,
  MessageCircle,
  Search,
  Wrench,
} from "lucide-react";
import { beginOAuthLogin } from "@/app/login/actions";
import {
  getSignupOptions,
  submitSignup,
  type SignupAccountType,
  type SignupOption,
  type SignupOptionsResponse,
  type SignupPayload,
  type SignupProvider,
  type SignupResponse,
} from "@/lib/api";
import { loginPathForAccountType } from "@/lib/auth-flow";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const fallbackOptions: SignupOptionsResponse = {
  title: "สมัครใช้งาน Homex",
  subtitle: "เลือกประเภทผู้ใช้ตามโครง users ของระบบ แล้วเริ่มสมัครผ่าน LINE หรือ Gmail",
  defaults: {
    account_type: "user",
    provider: "line",
  },
  account_types: [
    {
      id: "user",
      label: "ลูกค้า",
      description: "สร้างผู้ใช้ประเภท user สำหรับค้นหาช่างแอร์และติดตามงานของตัวเอง",
      user_type: "user",
      next_path: "/search",
    },
    {
      id: "staff",
      label: "ร้าน / ทีมช่าง",
      description: "สร้างผู้ใช้ประเภท staff สำหรับเข้าระบบร้านและจัดการงาน",
      user_type: "staff",
      next_path: "/portal/dashboard",
    },
  ],
  providers: [
    {
      id: "line",
      label: "LINE",
      description: "เหมาะกับผู้ใช้ที่ต้องการสมัครผ่าน LINE และทำงานต่อผ่าน LINE OA",
      accent: "#06C755",
    },
    {
      id: "google",
      label: "Gmail",
      description: "เหมาะกับผู้ใช้ที่ต้องการเข้าใช้งานเว็บผ่านบัญชี Google",
      accent: "#4285F4",
    },
  ],
};

const initialForm: SignupPayload = {
  full_name: "",
  phone: "",
  email: "",
  store_name: "",
  account_type: "user",
  provider: "line",
  accept_terms: false,
};

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "เกิดข้อผิดพลาดระหว่างสมัครใช้งาน";
}

function getAccountCopy(option?: SignupOption | null) {
  if (option?.id === "staff") {
    return {
      title: "ร้าน / ทีมช่าง",
      caption: "สำหรับผู้ใช้ประเภท staff",
      nextPath: option.next_path ?? "/portal/dashboard",
    };
  }

  return {
    title: "ลูกค้า",
    caption: "สำหรับผู้ใช้ประเภท user",
    nextPath: option?.next_path ?? "/search",
  };
}

export function SignupForm({ initialAccountType = "user" }: { initialAccountType?: SignupAccountType }) {
  const [options, setOptions] = useState<SignupOptionsResponse>(fallbackOptions);
  const [form, setForm] = useState<SignupPayload>({
    ...initialForm,
    account_type: initialAccountType,
  });
  const [submitResult, setSubmitResult] = useState<SignupResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isOAuthPending, startOAuthTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        const payload = await getSignupOptions();

        if (cancelled) {
          return;
        }

        setOptions(payload);
        setLoadError(null);
      } catch (error) {
        if (!cancelled) {
          setLoadError(errorMessage(error));
        }
      }
    }

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedAccount = useMemo(
    () => options.account_types.find((item) => item.id === form.account_type) ?? options.account_types[0],
    [form.account_type, options.account_types],
  );

  const selectedProvider = useMemo(
    () => options.providers.find((item) => item.id === form.provider) ?? options.providers[0],
    [form.provider, options.providers],
  );

  const accountCopy = getAccountCopy(selectedAccount);

  function setField<Key extends keyof SignupPayload>(key: Key, value: SignupPayload[Key]) {
    setSubmitResult(null);
    setSubmitError(null);
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function selectAccount(accountType: SignupAccountType) {
    setSubmitResult(null);
    setSubmitError(null);
    setField("account_type", accountType);
  }

  function selectProvider(provider: SignupProvider) {
    setSubmitResult(null);
    setSubmitError(null);
    setField("provider", provider);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitResult(null);
    setSubmitError(null);

    startTransition(async () => {
      try {
        const payload: SignupPayload = {
          ...form,
          email: form.provider === "google" ? form.email : "",
          store_name: form.account_type === "staff" ? form.store_name : "",
        };
        const response = await submitSignup(payload);

        setSubmitResult(response);
      } catch (error) {
        setSubmitError(errorMessage(error));
      }
    });
  }

  function continueWithOAuth(result: SignupResponse) {
    setSubmitError(null);

    startOAuthTransition(async () => {
      const formData = new FormData();
      formData.set("account_type", result.profile.account_type);
      formData.set("provider", result.profile.provider);
      await beginOAuthLogin(formData);
    });
  }

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
            <h1 className="headline-font text-2xl font-bold text-on-surface">เริ่มใช้งาน</h1>
          </div>
        </div>

        <p className="mb-5 text-sm leading-6 text-on-surface-variant">
          เลือกประเภทผู้ใช้และวิธีสมัครก่อน แล้วกรอกข้อมูลเท่าที่จำเป็น
        </p>

        {loadError ? (
          <NoticeBox tone="error">{loadError}</NoticeBox>
        ) : null}

        <form className="page-stack" onSubmit={handleSubmit}>
          <Card className="rounded-[1.75rem] border border-border/20">
            <CardContent className="space-y-5 p-5">
              <section className="section-stack-sm">
                <SectionLabel>ฉันต้องการ</SectionLabel>
                <div className="grid gap-2">
                  {options.account_types.map((option) => {
                    const copy = getAccountCopy(option);

                    return (
                      <ChoiceButton
                        key={option.id}
                        active={form.account_type === option.id}
                        caption={copy.caption}
                        icon={option.id === "user" ? Search : Wrench}
                        onClick={() => selectAccount(option.id as SignupAccountType)}
                        title={copy.title}
                      />
                    );
                  })}
                </div>
              </section>

              <section className="section-stack-sm">
                <SectionLabel>สมัครด้วย</SectionLabel>
                <div className="grid grid-cols-2 gap-2">
                  {options.providers.map((option) => (
                    <ProviderButton
                      key={option.id}
                      active={form.provider === option.id}
                      accent={option.accent}
                      icon={option.id === "line" ? MessageCircle : Mail}
                      label={option.label}
                      onClick={() => selectProvider(option.id as SignupProvider)}
                    />
                  ))}
                </div>
              </section>

              <div className="space-y-3 border-t border-border/20 pt-3">
                <div className="field-stack">
                  <FieldLabel>ชื่อผู้สมัคร</FieldLabel>
                  <Input
                    value={form.full_name}
                    onChange={(event) => setField("full_name", event.target.value)}
                    placeholder="สมชาย มั่นใจ"
                  />
                </div>

                <div className="field-stack">
                  <FieldLabel>เบอร์โทร</FieldLabel>
                  <Input
                    value={form.phone}
                    onChange={(event) => setField("phone", event.target.value)}
                    placeholder="08x-xxx-xxxx"
                    type="tel"
                  />
                </div>

                {form.provider === "google" ? (
                  <div className="field-stack">
                    <FieldLabel>Gmail</FieldLabel>
                    <Input
                      value={form.email}
                      onChange={(event) => setField("email", event.target.value)}
                      placeholder="you@gmail.com"
                      type="email"
                    />
                  </div>
                ) : null}

                {form.account_type === "staff" ? (
                  <div className="field-stack">
                    <FieldLabel>ชื่อร้าน / ทีมช่าง</FieldLabel>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                      <Input
                        className="pl-11"
                        value={form.store_name}
                        onChange={(event) => setField("store_name", event.target.value)}
                        placeholder="Cool Care Bangkok"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            สมัครเป็น <span className="font-semibold text-on-surface">{accountCopy.title}</span> ผ่าน{" "}
            <span className="font-semibold text-on-surface">{selectedProvider?.label ?? "LINE"}</span>
          </div>

          <label className="flex items-start gap-3 rounded-2xl bg-surface-container-low px-4 py-3">
            <input
              checked={form.accept_terms}
              onChange={(event) => setField("accept_terms", event.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--primary)]"
              type="checkbox"
            />
            <span className="text-sm leading-6 text-on-surface-variant">
              ยอมรับเงื่อนไขการใช้งานและเริ่มสมัครต่อได้
            </span>
          </label>

          {submitError ? <NoticeBox tone="error">{submitError}</NoticeBox> : null}

          {submitResult ? (
            <NoticeBox tone="success">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary">
                    <Check className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-on-surface">{submitResult.message}</p>
                    <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                      ระบบสร้างบัญชีจริงในฐานข้อมูลแล้ว เหลือเพียงยืนยันตัวตนด้วย{" "}
                      {submitResult.next.provider_ui} เพื่อเปิดใช้งานต่อ
                    </p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Button
                    type="button"
                    className="h-12 w-full rounded-[1.4rem]"
                    disabled={isOAuthPending}
                    onClick={() => continueWithOAuth(submitResult)}
                  >
                    {isOAuthPending
                      ? `กำลังพาไป ${submitResult.next.provider_ui}...`
                      : `ยืนยันตัวตนต่อด้วย ${submitResult.next.provider_ui}`}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Link
                    href={loginPathForAccountType(submitResult.profile.account_type)}
                    className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                  >
                    ไปหน้าเข้าสู่ระบบ
                  </Link>
                </div>
                {submitResult.store ? (
                  <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                    ร้านที่ผูกไว้:{" "}
                    <span className="font-semibold text-on-surface">{submitResult.store.name}</span>
                  </div>
                ) : null}
              </div>
            </NoticeBox>
          ) : null}

          <Button className="h-14 w-full text-base font-bold" disabled={isPending || isOAuthPending}>
            {isPending ? "กำลังบันทึกข้อมูล..." : "สมัครใช้งาน"}
            <ArrowRight className="h-5 w-5" />
          </Button>

          <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href={loginPathForAccountType(form.account_type)} className="font-semibold text-primary">
              เข้าสู่ระบบด้วย LINE / Gmail
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
      {children}
    </p>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="px-1 text-sm font-medium text-on-surface">{children}</label>;
}

function NoticeBox({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "error" | "success";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3",
        tone === "error"
          ? "border-error/10 bg-error-container text-on-error-container"
          : "border-primary/10 bg-surface-container-lowest text-on-surface",
      )}
    >
      {children}
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
  icon: ComponentType<{ className?: string }>;
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
      {active ? (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary">
          <Check className="h-3.5 w-3.5" />
        </span>
      ) : null}
    </button>
  );
}

function ProviderButton({
  active,
  accent,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  accent?: string;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-transform active:scale-[0.98]",
        active
          ? "border-primary bg-surface-container-lowest text-on-surface"
          : "border-border/30 bg-surface-container-low text-on-surface-variant",
      )}
    >
      <Icon className="h-4 w-4" style={{ color: accent ?? "#0058bc" }} />
      <span>{label}</span>
    </button>
  );
}
