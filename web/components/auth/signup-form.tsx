"use client";

import Link from "next/link";
import type { ComponentType, FormEvent } from "react";
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
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const fallbackOptions: SignupOptionsResponse = {
  title: "สมัครใช้งาน Homex",
  subtitle: "เลือกว่าคุณต้องการหาช่างหรือรับงาน แล้วเริ่มสมัครผ่าน LINE หรือ Gmail",
  defaults: {
    account_type: "job_seeker",
    provider: "line",
  },
  account_types: [
    {
      id: "job_seeker",
      label: "ผู้หางาน",
      description: "สำหรับลูกค้าที่ต้องการค้นหาช่างแอร์และติดตามงานของตัวเอง",
      mapped_role: "customer",
      next_path: "/search",
    },
    {
      id: "job_receiver",
      label: "ผู้รับงาน",
      description: "สำหรับร้านช่างแอร์ แอดมิน หรือช่างที่ต้องการรับ lead และจัดการงาน",
      mapped_role: "technician",
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
  account_type: "job_seeker",
  provider: "line",
  accept_terms: false,
};

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "เกิดข้อผิดพลาดระหว่างสมัครใช้งาน";
}

export function SignupForm() {
  const [options, setOptions] = useState<SignupOptionsResponse>(fallbackOptions);
  const [form, setForm] = useState<SignupPayload>(initialForm);
  const [submitResult, setSubmitResult] = useState<SignupResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        const payload = await getSignupOptions();

        if (cancelled) {
          return;
        }

        setOptions(payload);
        setForm((current) => ({
          ...current,
          account_type: current.account_type || payload.defaults.account_type,
          provider: current.provider || payload.defaults.provider,
        }));
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
    () => options.account_types.find((item) => item.id === form.account_type),
    [form.account_type, options.account_types],
  );

  const selectedProvider = useMemo(
    () => options.providers.find((item) => item.id === form.provider),
    [form.provider, options.providers],
  );

  function setField<Key extends keyof SignupPayload>(key: Key, value: SignupPayload[Key]) {
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
          store_name: form.account_type === "job_receiver" ? form.store_name : "",
        };
        const response = await submitSignup(payload);

        setSubmitResult(response);
      } catch (error) {
        setSubmitError(errorMessage(error));
      }
    });
  }

  return (
    <div className="min-h-screen bg-surface">
      <main className="mx-auto max-w-md px-6 pb-16 pt-8">
        <Link
          href="/"
          className="mb-8 inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-low text-primary transition-transform active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <section className="mb-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Homex</p>
          <h1 className="headline-font text-4xl font-extrabold leading-tight tracking-tight text-on-surface">
            {options.title}
          </h1>
          <p className="text-base leading-7 text-on-surface-variant">{options.subtitle}</p>
        </section>

        {loadError ? (
          <div className="mb-6 rounded-3xl border border-error/10 bg-error-container p-4 text-sm font-medium text-on-error-container">
            {loadError}
          </div>
        ) : null}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <section className="space-y-3">
            <p className="text-sm font-semibold text-on-surface">เลือกประเภทบัญชี</p>
            <div className="space-y-3">
              {options.account_types.map((option) => (
                <SelectableCard
                  key={option.id}
                  checked={form.account_type === option.id}
                  icon={option.id === "job_seeker" ? Search : Wrench}
                  onClick={() => selectAccount(option.id as SignupAccountType)}
                  option={option}
                />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-sm font-semibold text-on-surface">สมัครด้วย</p>
            <div className="grid grid-cols-2 gap-3">
              {options.providers.map((option) => {
                const active = form.provider === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => selectProvider(option.id as SignupProvider)}
                    className={cn(
                      "relative rounded-[1.75rem] border p-5 text-left transition-transform active:scale-[0.98]",
                      active
                        ? "border-primary bg-surface-container-lowest shadow-[0_8px_24px_rgba(0,88,188,0.08)]"
                        : "border-border/30 bg-surface-container-low",
                    )}
                  >
                    <div
                      className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${option.accent ?? "#0058bc"}16` }}
                    >
                      {option.id === "line" ? (
                        <MessageCircle
                          className="h-5 w-5"
                          style={{ color: option.accent ?? "#06C755" }}
                        />
                      ) : (
                        <Mail
                          className="h-5 w-5"
                          style={{ color: option.accent ?? "#4285F4" }}
                        />
                      )}
                    </div>
                    <p className="text-base font-bold text-on-surface">{option.label}</p>
                    <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                      {option.description}
                    </p>
                    {active ? (
                      <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          <Card className="rounded-[2rem] border border-border/20">
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  ชื่อผู้สมัคร
                </label>
                <Input
                  value={form.full_name}
                  onChange={(event) => setField("full_name", event.target.value)}
                  placeholder="สมชาย มั่นใจ"
                />
              </div>

              <div className="space-y-1.5">
                <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  เบอร์โทร
                </label>
                <Input
                  value={form.phone}
                  onChange={(event) => setField("phone", event.target.value)}
                  placeholder="08x-xxx-xxxx"
                  type="tel"
                />
              </div>

              {form.provider === "google" ? (
                <div className="space-y-1.5">
                  <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Gmail
                  </label>
                  <Input
                    value={form.email}
                    onChange={(event) => setField("email", event.target.value)}
                    placeholder="you@gmail.com"
                    type="email"
                  />
                </div>
              ) : null}

              {form.account_type === "job_receiver" ? (
                <div className="space-y-1.5">
                  <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    ชื่อร้าน / ทีมช่าง
                  </label>
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
            </CardContent>
          </Card>

          <label className="flex items-start gap-3 rounded-3xl bg-surface-container-low p-4">
            <input
              checked={form.accept_terms}
              onChange={(event) => setField("accept_terms", event.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--primary)]"
              type="checkbox"
            />
            <span className="text-sm leading-6 text-on-surface-variant">
              ฉันยอมรับเงื่อนไขการใช้งาน และเข้าใจว่า flow นี้เป็น MVP สำหรับเชื่อม front-end กับ API
            </span>
          </label>

          {submitError ? (
            <div className="rounded-3xl border border-error/10 bg-error-container p-4 text-sm font-medium text-on-error-container">
              {submitError}
            </div>
          ) : null}

          {submitResult ? (
            <Card className="rounded-[2rem] border border-primary/10 bg-surface-container-lowest">
              <CardContent className="space-y-4">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-on-primary">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <p className="headline-font text-xl font-bold text-on-surface">
                    {submitResult.message}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    ระบบ map บัญชีนี้เป็น {selectedAccount?.label ?? "ผู้หางาน"} และจะพาไปที่{" "}
                    {submitResult.next.next_path}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    {submitResult.next.hint}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <Link
                    href={submitResult.next.next_path}
                    className={cn(buttonVariants(), "w-full")}
                  >
                    ไปต่อที่ระบบ
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/"
                    className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                  >
                    กลับหน้าแรก
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="rounded-[2rem] bg-[#001a41] p-6 text-on-primary">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-fixed">
              Signup Summary
            </p>
            <h2 className="headline-font mt-3 text-2xl font-bold leading-tight">
              {selectedAccount?.label ?? "ผู้หางาน"} ผ่าน {selectedProvider?.label ?? "LINE"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-primary-fixed">
              {selectedAccount?.description}
            </p>
          </div>

          <Button className="h-16 w-full text-lg font-bold" disabled={isPending}>
            {isPending ? "กำลังส่งข้อมูล..." : `สมัครด้วย${selectedProvider?.label ?? "LINE"}`}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </form>
      </main>
    </div>
  );
}

function SelectableCard({
  checked,
  icon: Icon,
  onClick,
  option,
}: {
  checked: boolean;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  option: SignupOption;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full rounded-[2rem] border p-5 text-left transition-transform active:scale-[0.98]",
        checked
          ? "border-primary bg-surface-container-lowest shadow-[0_8px_24px_rgba(0,88,188,0.08)]"
          : "border-border/30 bg-surface-container-low",
      )}
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-lg font-bold text-on-surface">{option.label}</p>
      <p className="mt-2 text-sm leading-6 text-on-surface-variant">{option.description}</p>
      {checked ? (
        <span className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary">
          <Check className="h-3.5 w-3.5" />
        </span>
      ) : null}
    </button>
  );
}
