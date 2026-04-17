"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Building2, CheckCircle2, LoaderCircle, UserRoundPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { staffIntentOptions, type StaffIntent } from "@/lib/auth-flow";

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
    <div className="page-content page-stack-lg pb-16">
      <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
        <div className="section-stack">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Staff Onboarding</p>
            <h1 className="headline-font mt-2 text-3xl font-extrabold tracking-tight text-on-surface">
              เริ่มต้นใช้งานฝั่งร้านหรือทีมช่าง
            </h1>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              เลือกว่าจะสร้างร้านใหม่ของตัวเอง หรือเข้าร่วมทีมที่มีอยู่แล้วด้วยลิงก์เชิญ
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-surface-container-low p-4 text-sm text-on-surface-variant">
            เข้าสู่ระบบในชื่อ <span className="font-semibold text-on-surface">{displayName}</span>
          </div>
        </div>
      </section>

      <section className="card-stack">
        {staffIntentOptions.map((option) => {
          const active = intent === option.id;
          const Icon = option.id === "create_store" ? Building2 : Users;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => selectIntent(option.id)}
              className={`surface-card rounded-[1.75rem] p-5 text-left ambient-shadow transition-all ${
                active ? "ring-2 ring-primary/25" : "ring-1 ring-black/[0.04]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    active ? "bg-primary text-on-primary" : "bg-surface-container-low text-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="headline-font text-lg font-bold text-on-surface">{option.label}</p>
                    {active ? <CheckCircle2 className="h-4 w-4 text-primary" /> : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{option.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {intent === "join_team" ? (
        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
                <UserRoundPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="headline-font text-lg font-bold text-on-surface">เข้าร่วมทีมด้วยลิงก์เชิญ</p>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                  ให้เจ้าของร้านส่ง invite link ให้คุณ แล้วเปิดลิงก์นั้นก่อน login หรือหลัง login ก็ได้ ระบบจะผูกคุณเข้าร้านให้อัตโนมัติ
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-surface-container-low px-4 text-sm font-semibold text-on-surface"
            >
              กลับไปหน้าแรก
            </Link>
          </div>
        </section>
      ) : (
        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack">
            <div>
              <p className="text-sm font-semibold text-on-surface">
                ชื่อร้าน / ทีมช่าง
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                ใส่ชื่อที่ลูกค้าและทีมงานจะเห็นในระบบภายหลัง
              </p>
            </div>

            <InputField
              id="store_name"
              label="ชื่อร้าน / ทีมช่าง"
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
              placeholder={suggestedStoreName}
            />

            {result.type === "error" ? (
              <div className="rounded-[1.25rem] bg-[rgba(186,26,26,0.08)] px-4 py-3 text-sm text-error">
                {result.message}
              </div>
            ) : null}

            <Button type="button" size="lg" className="h-14 w-full text-base font-bold" onClick={handleSubmit} disabled={isPending}>
              {isPending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  กำลังตั้งค่าพื้นที่ทำงาน...
                </>
              ) : (
                "สร้างร้านและเริ่มใช้งาน"
              )}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

function defaultStoreName(displayName: string) {
  const trimmed = displayName.trim();
  return trimmed ? `ร้านของ ${trimmed}` : "ร้าน Homex ใหม่";
}
