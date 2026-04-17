"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Copy, LoaderCircle, QrCode, ShieldCheck, UserPlus, Users } from "lucide-react";
import { TopAppBar } from "@/components/ui/top-app-bar";
import { InputField } from "@/components/ui/input-field";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { cn } from "@/lib/utils";

export interface TechnicianNewFormProps {
  storeId: string;
  baseUrl: string;
}

const serviceOptions = ["ล้างแอร์", "ซ่อมแอร์", "ติดตั้งแอร์ใหม่", "ย้ายแอร์"];

export function TechnicianNewForm({ storeId, baseUrl }: Readonly<TechnicianNewFormProps>) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    services: [] as string[],
  });
  const [result, setResult] = useState<{
    type: "idle" | "error" | "success";
    message?: string;
  }>({ type: "idle" });
  const [isPending, startTransition] = useTransition();

  const inviteLink = `${baseUrl}/invite/t/${storeId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const toggleService = (service: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleManualSubmit = (event: FormEvent) => {
    event.preventDefault();
    setResult({ type: "idle" });

    startTransition(async () => {
      try {
        const response = await fetch("/api/app/technicians", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            services: form.services,
          }),
        });
        const payload = (await response.json()) as {
          error?: string;
          message?: string;
        };

        if (!response.ok) {
          setResult({
            type: "error",
            message: payload.message ?? payload.error ?? "ยังสร้างโปรไฟล์ช่างไม่สำเร็จ",
          });
          return;
        }

        setResult({
          type: "success",
          message: payload.message ?? "สร้างโปรไฟล์ช่างเรียบร้อยแล้ว",
        });
        setForm({
          name: "",
          phone: "",
          services: [],
        });
        router.refresh();
        setTimeout(() => {
          router.push("/portal/technicians");
        }, 500);
      } catch {
        setResult({
          type: "error",
          message: "ยังเชื่อมต่อ API ไม่สำเร็จ ลองอีกครั้งอีกสักครู่",
        });
      }
    });
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col bg-surface-container-lowest pb-20">
      <TopAppBar
        title="เพิ่มทีมช่าง"
        left={
          <Link
            href="/portal/technicians"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low active:bg-surface-container"
          >
            <ArrowLeft className="h-5 w-5 text-on-surface" />
          </Link>
        }
      />

      <main className="space-y-8 px-4 py-6">
        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow">
          <div className="section-stack">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Invite Team</p>
              <h1 className="headline-font mt-2 text-3xl font-extrabold tracking-tight text-on-surface">
                เพิ่มช่างเข้าร้าน
              </h1>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                วิธีที่แนะนำคือส่ง invite link ให้ช่างกดเข้าระบบด้วยตัวเอง ส่วนแบบ manual ใช้สร้างโปรไฟล์ช่างในร้านเพื่อเริ่มมอบหมายงานได้ทันที
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-sm font-bold text-on-surface">วิธีที่ 1: ส่งลิงก์เชิญ</h2>
            <p className="mt-1 text-xs text-on-surface-variant/60">
              ช่างกดลิงก์นี้แล้ว login ด้วย LINE หรือ Gmail ระบบจะพาเข้าร้านของคุณอัตโนมัติ
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 ring-1 ring-black/[0.04] shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-on-surface">{inviteLink}</p>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  ลิงก์สำหรับเข้าร่วมร้านนี้
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.98]",
                copied
                  ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                  : "bg-white text-on-surface ring-1 ring-slate-200/60 hover:bg-slate-50",
              )}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  คัดลอกแล้ว
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  คัดลอกลิงก์เชิญ
                </>
              )}
            </button>
          </div>
        </section>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-black/[0.04]" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/30">
            หรือ
          </span>
          <div className="h-px flex-1 bg-black/[0.04]" />
        </div>

        <section>
          <div className="mb-4">
            <h2 className="text-sm font-bold text-on-surface">วิธีที่ 2: สร้างโปรไฟล์ช่างในระบบ</h2>
            <p className="mt-1 text-xs text-on-surface-variant/60">
              เหมาะกับการเพิ่มลูกทีมเพื่อเริ่ม assign งานภายในร้านได้ทันที แม้เขาจะยังไม่ได้ login เข้าระบบด้วยตัวเอง
            </p>
          </div>

          <form className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-black/[0.04] shadow-sm" onSubmit={handleManualSubmit}>
            <div className="rounded-xl bg-surface-container-low p-4 text-[12px] leading-relaxed text-on-surface-variant shadow-inner">
              เมื่อสร้างโปรไฟล์แบบ manual แล้ว คุณจะเห็นช่างคนนี้ในรายการทีมช่างทันที หากภายหลังต้องการให้เขา login เอง แนะนำให้ส่ง invite link ด้านบนแทน
            </div>

            {result.type !== "idle" ? (
              <div
                className={cn(
                  "rounded-xl px-4 py-3 text-sm",
                  result.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-[rgba(186,26,26,0.08)] text-error",
                )}
              >
                {result.message}
              </div>
            ) : null}

            <InputField
              id="name"
              type="text"
              label="ชื่อ-นามสกุล"
              required
              placeholder="เช่น ช่างสมชาย แอร์เซอร์วิส"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />

            <InputField
              id="phone"
              type="tel"
              label="เบอร์โทรศัพท์"
              placeholder="08X-XXX-XXXX"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
            />

            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-semibold text-on-surface">ประเภทงานที่รับ</span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {serviceOptions.map((service) => (
                  <CheckboxField
                    key={service}
                    id={`service-${service}`}
                    label={service}
                    checked={form.services.includes(service)}
                    onChange={() => toggleService(service)}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {isPending ? "กำลังสร้างโปรไฟล์..." : "สร้างโปรไฟล์ช่าง"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-surface-container-low p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-container text-on-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">คำแนะนำการใช้งาน</p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                ถ้าช่างคนนั้นต้องเข้ามาเปลี่ยนสถานะงานหรืออัปโหลดรูปหน้างานด้วยตัวเอง ให้ใช้ invite link เป็นหลัก ส่วน manual create เหมาะกับการสร้าง roster ภายในร้านอย่างรวดเร็ว
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
