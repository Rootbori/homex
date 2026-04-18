"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  LoaderCircle,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { staffIntentOptions, type StaffIntent } from "@/lib/auth-flow";
import { cn } from "@/lib/utils";

type StaffOnboardingProps = {
  displayName: string;
};

export function StaffOnboarding({ displayName }: Readonly<StaffOnboardingProps>) {
  const [intent, setIntent] = useState<StaffIntent>("create_store");
  const [storeName, setStoreName] = useState(defaultStoreName(displayName));
  const [result, setResult] = useState<{
    type: "idle" | "error";
    message?: string;
  }>({ type: "idle" });
  const [isPending, startTransition] = useTransition();

  const suggestedStoreName = useMemo(() => defaultStoreName(displayName), [displayName]);

  function selectIntent(nextIntent: StaffIntent) {
    setIntent(nextIntent);
    setResult({ type: "idle" });

    if (nextIntent === "create_store") {
      setStoreName(defaultStoreName(displayName));
    }
  }

  function handleSubmit() {
    if (intent === "join_team") {
      return;
    }

    startTransition(async () => {
      setResult({ type: "idle" });

      try {
        const response = await fetch("/api/app/staff/onboarding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: intent,
            store_name: storeName.trim() || suggestedStoreName,
          }),
        });
        const payload = (await response.json()) as {
          error?: string;
          message?: string;
          next?: {
            next_path?: string;
          };
        };

        if (!response.ok) {
          setResult({
            type: "error",
            message: payload.message ?? payload.error ?? "ยังสร้างพื้นที่ทำงานไม่สำเร็จ",
          });
          return;
        }

        globalThis.location.replace(payload.next?.next_path ?? "/portal/dashboard");
      } catch {
        setResult({
          type: "error",
          message: "ยังเชื่อมต่อ API ไม่สำเร็จ ลองอีกครั้งอีกสักครู่",
        });
      }
    });
  }

  return (
    <div className="page-content pb-16">
      <div className="flex flex-col gap-5 md:gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white px-5 py-6 shadow-[0_24px_60px_-32px_rgba(30,64,175,0.35)] md:px-7 md:py-7">
          <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_58%),radial-gradient(circle_at_top_right,rgba(30,64,175,0.14),transparent_48%)]" />

          <div className="relative flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Staff Setup
              </div>
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-surface-container-low px-4 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
              >
                <ArrowLeft className="h-4 w-4" />
                Login
              </Link>
            </div>

            <div className="max-w-2xl">
              <h1 className="headline-font text-[2rem] font-extrabold leading-tight tracking-tight text-on-surface md:text-[2.35rem]">
                เริ่มต้นพื้นที่ทำงาน
                <br />
                สำหรับร้านหรือทีมช่าง
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-on-surface-variant md:text-[15px]">
                เลือกทางเริ่มต้นที่ตรงกับคุณที่สุด ถ้าคุณเป็นเจ้าของร้านให้สร้างร้านใหม่ได้เลย
                แต่ถ้ามีทีมอยู่แล้วให้ใช้ลิงก์เชิญจากเจ้าของร้านเพื่อเข้าร่วม
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-[1.5rem] border border-primary/10 bg-[linear-gradient(135deg,rgba(219,234,254,0.9),rgba(255,255,255,0.95))] p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">บัญชีที่เข้าสู่ระบบอยู่</p>
                <p className="mt-1 text-base font-semibold text-on-surface">{displayName}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant md:flex md:gap-3">
                <FeaturePill label="สร้างร้านใหม่" />
                <FeaturePill label="เชิญทีมเพิ่ม" />
                <FeaturePill label="แยกลูกค้า/งาน" />
                <FeaturePill label="ใช้งานบนมือถือ" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {staffIntentOptions.map((option) => {
            const active = intent === option.id;
            const Icon = option.id === "create_store" ? Store : Users;
            const eyebrow = option.id === "create_store" ? "เริ่มร้านของตัวเอง" : "มีร้านอยู่แล้ว";
            const helper =
              option.id === "create_store"
                ? "เหมาะกับเจ้าของร้านหรือช่างที่ต้องการเริ่ม workspace ใหม่"
                : "เหมาะกับช่างหรือทีมงานที่ได้รับ invite link จากเจ้าของร้าน";

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => selectIntent(option.id)}
                className={cn(
                  "group relative overflow-hidden rounded-[1.9rem] border p-5 text-left transition-all md:p-6",
                  active
                    ? "border-primary/30 bg-[linear-gradient(180deg,rgba(239,246,255,1),rgba(255,255,255,1))] shadow-[0_22px_45px_-28px_rgba(30,64,175,0.5)]"
                    : "border-[rgba(15,23,42,0.08)] bg-white shadow-[0_20px_45px_-32px_rgba(15,23,42,0.24)] hover:-translate-y-0.5 hover:border-primary/15",
                )}
              >
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 h-1.5 transition-opacity",
                    active ? "bg-[linear-gradient(90deg,#60A5FA,#1D4ED8)] opacity-100" : "bg-transparent opacity-0",
                  )}
                />

                <div className="flex h-full flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
                        active ? "bg-primary text-on-primary" : "bg-surface-container-low text-primary",
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    {active ? (
                      <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        เลือกอยู่
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/70">{eyebrow}</p>
                    <h2 className="headline-font mt-2 text-2xl font-bold tracking-tight text-on-surface">
                      {option.label}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-on-surface-variant">{option.description}</p>
                  </div>

                  <div className="rounded-[1.35rem] bg-surface-container-low px-4 py-3 text-sm leading-6 text-on-surface-variant">
                    {helper}
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        {intent === "create_store" ? (
          <section className="overflow-hidden rounded-[2rem] border border-primary/10 bg-white shadow-[0_24px_55px_-34px_rgba(15,23,42,0.28)]">
            <div className="border-b border-black/[0.05] bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,0.96))] px-5 py-4 md:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/70">Step 2</p>
                  <h2 className="headline-font mt-1 text-xl font-bold text-on-surface">ตั้งชื่อร้านหรือทีมช่าง</h2>
                  <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                    ชื่อนี้จะใช้ในหลังบ้าน และใช้เป็นชื่อที่ลูกค้าเห็นในโปรไฟล์ร้านภายหลัง
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 px-5 py-5 md:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.8fr)] md:px-6 md:py-6">
              <div className="space-y-4">
                <InputField
                  id="store_name"
                  label="ชื่อร้าน / ทีมช่าง"
                  value={storeName}
                  onChange={(event) => setStoreName(event.target.value)}
                  placeholder={suggestedStoreName}
                  className="h-14 rounded-2xl text-base"
                />

                {result.type === "error" ? (
                  <div className="rounded-[1.25rem] bg-[rgba(186,26,26,0.08)] px-4 py-3 text-sm text-error">
                    {result.message}
                  </div>
                ) : null}

                <Button
                  type="button"
                  size="lg"
                  className="h-14 w-full text-base font-bold md:w-auto md:min-w-[16rem]"
                  onClick={handleSubmit}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      กำลังสร้างร้าน...
                    </>
                  ) : (
                    <>
                      สร้างร้านและเริ่มใช้งาน
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              <div className="rounded-[1.6rem] bg-surface-container-low p-4 md:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/70">สิ่งที่จะได้ทันที</p>
                <div className="mt-3 space-y-3">
                  <PreviewItem title="ร้านของคุณถูกสร้างทันที" caption="พร้อมใช้เป็น workspace หลักของงาน ลูกค้า และทีมช่าง" />
                  <PreviewItem title="คุณจะเป็นเจ้าของร้าน" caption="เริ่มใช้งาน dashboard และเพิ่มทีมงานได้จากหลังบ้าน" />
                  <PreviewItem title="ขยายทีมได้ภายหลัง" caption="ถ้าวันหลังมีลูกน้องเพิ่ม ก็เชิญเข้าร้านเดิมได้เลย" />
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="overflow-hidden rounded-[2rem] border border-primary/10 bg-white shadow-[0_24px_55px_-34px_rgba(15,23,42,0.28)]">
            <div className="border-b border-black/[0.05] bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,0.96))] px-5 py-4 md:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/70">Step 2</p>
                  <h2 className="headline-font mt-1 text-xl font-bold text-on-surface">เข้าร่วมทีมด้วยลิงก์เชิญ</h2>
                  <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                    ขอ invite link จากเจ้าของร้าน แล้วเปิดลิงก์นั้นก่อนหรือหลัง login ก็ได้ ระบบจะเชื่อมคุณเข้าร้านให้อัตโนมัติ
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 px-5 py-5 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.9fr)] md:px-6 md:py-6">
              <div className="space-y-3">
                <GuideItem
                  step="1"
                  title="ขอลิงก์เชิญจากเจ้าของร้าน"
                  caption="เจ้าของร้านสามารถสร้างลิงก์เชิญจากหน้าจัดการทีมช่างในระบบได้"
                />
                <GuideItem
                  step="2"
                  title="เปิดลิงก์เชิญในเครื่องนี้"
                  caption="ระบบจะจำคำเชิญไว้ให้ แล้วเชื่อมคุณเข้าร้านทันทีหลังยืนยันตัวตน"
                />
                <GuideItem
                  step="3"
                  title="กลับมา login อีกครั้งถ้าจำเป็น"
                  caption="ถ้าคุณต้องการเปลี่ยนบัญชี ให้กลับไปหน้า login เพื่อเริ่มใหม่ได้เลย"
                />
              </div>

              <div className="flex flex-col gap-3 rounded-[1.6rem] bg-surface-container-low p-4 md:p-5">
                <p className="text-sm leading-6 text-on-surface-variant">
                  ตอนนี้คุณยังไม่ต้องกรอกชื่อร้านเอง เพราะระบบจะใช้ข้อมูลจากร้านที่เชิญคุณเข้าไปโดยตรง
                </p>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-on-surface ring-1 ring-black/[0.05] transition-colors hover:bg-slate-50"
                >
                  กลับไปหน้า Login
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function FeaturePill({ label }: Readonly<{ label: string }>) {
  return (
    <div className="inline-flex items-center justify-center rounded-full bg-white/80 px-3 py-2 text-center text-[11px] font-semibold text-on-surface ring-1 ring-primary/10">
      {label}
    </div>
  );
}

function PreviewItem({ title, caption }: Readonly<{ title: string; caption: string }>) {
  return (
    <div className="rounded-[1.2rem] bg-white px-4 py-3 ring-1 ring-black/[0.04]">
      <p className="text-sm font-semibold text-on-surface">{title}</p>
      <p className="mt-1 text-sm leading-6 text-on-surface-variant">{caption}</p>
    </div>
  );
}

function GuideItem({
  step,
  title,
  caption,
}: Readonly<{
  step: string;
  title: string;
  caption: string;
}>) {
  return (
    <div className="flex items-start gap-3 rounded-[1.4rem] bg-surface-container-low px-4 py-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
        {step}
      </div>
      <div>
        <p className="text-sm font-semibold text-on-surface">{title}</p>
        <p className="mt-1 text-sm leading-6 text-on-surface-variant">{caption}</p>
      </div>
    </div>
  );
}

function defaultStoreName(displayName: string) {
  const trimmed = displayName.trim();
  return trimmed ? `ร้านของ ${trimmed}` : "ร้าน Homex ใหม่";
}
