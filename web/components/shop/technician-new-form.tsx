"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, QrCode, UserPlus, ShieldCheck } from "lucide-react";
import { TopAppBar } from "@/components/ui/top-app-bar";
import { InputField } from "@/components/ui/input-field";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { cn } from "@/lib/utils";

export interface TechnicianNewFormProps {
  storeId: string;
  baseUrl: string;
}

export function TechnicianNewForm({ storeId, baseUrl }: Readonly<TechnicianNewFormProps>) {
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    services: [] as string[],
  });

  const inviteLink = `${baseUrl}/invite/t/${storeId || "pending"}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
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

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`สร้างโปรไฟล์สำหรับ ${form.name} เรียบร้อยแล้ว! ระบบจะเชื่อมต่อกับบัญชีของช่างโดยอัตโนมัติเมื่อเขาลงทะเบียนด้วยเบอร์ ${form.phone}`);
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col bg-surface-container-lowest pb-20">
      <TopAppBar
        title="เพิ่มช่างใหม่"
        left={
          <Link
            href="/portal/technicians"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low active:bg-surface-container"
          >
            <ArrowLeft className="h-5 w-5 text-on-surface" />
          </Link>
        }
      />

      <main className="px-4 py-6 space-y-8">
        {/* Method 1: Invite Link */}
        <section className="animate-in slide-in-from-bottom-2 fade-in duration-500">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-on-surface">
              วิธีที่ 1: ส่งลิงก์เชิญ (แนะนำ)
            </h2>
            <p className="mt-1 text-xs text-on-surface-variant/60">
              ให้ช่างกดลิงก์นี้เพื่อเข้าสู่ระบบและเชื่อมต่อกับร้านของคุณโดยอัตโนมัติ
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 ring-1 ring-black/[0.04] shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-on-surface">
                  {inviteLink}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  ลิงก์ใช้งานได้ 24 ชั่วโมง
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
                  : "bg-white ring-1 ring-slate-200/60 text-on-surface hover:bg-slate-50"
              )}
            >
              {copied ? (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  คัดลอกแล้ว!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  คัดลอกลิงก์
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

        {/* Method 2: Manual Add Form */}
        <section className="animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100 fill-both">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-on-surface">
              วิธีที่ 2: เพิ่มช่างด้วยตนเอง
            </h2>
            <p className="mt-1 text-xs text-on-surface-variant/60">
              คุณสามารถกรอกข้อมูลของช่างเพื่อสร้างโปรไฟล์เบื้องต้นให้ก่อนได้
            </p>
          </div>
          <form className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-black/[0.04] shadow-sm" onSubmit={handleManualSubmit}>
            <div className="rounded-xl bg-amber-50 p-4 text-[11px] leading-relaxed text-amber-900/70 shadow-inner">
              <p className="font-bold mb-1">💡 ข้อมูลการเชื่อมต่อ:</p>
              เมื่อช่างคนนี้สมัครใช้งานระบบด้วยเบอร์โทรศัพท์ที่ระบุไว้ ระบบจะตรวจพบบัญชีที่สร้างล่วงหน้านี้ และเชื่อมต่อเข้ากับร้านของคุณทันที
            </div>
            <InputField
              id="name"
              type="text"
              label="ชื่อ-นามสกุล"
              required
              placeholder="เช่น ช่างสมชาย แอร์เซอร์วิส"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <InputField
              id="phone"
              type="tel"
              label="เบอร์โทรศัพท์"
              required
              placeholder="08X-XXX-XXXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-semibold text-on-surface">
                ประเภทงานที่รับ (เลือกได้มากกว่า 1)
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {["ล้างแอร์", "ซ่อมแอร์", "ติดตั้งแอร์ใหม่", "ย้ายแอร์"].map(
                  (service) => (
                    <CheckboxField
                      key={service}
                      id={`service-${service}`}
                      label={service}
                      checked={form.services.includes(service)}
                      onChange={() => toggleService(service)}
                    />
                  ),
                )}
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <UserPlus className="h-4 w-4" />
              สร้างโปรไฟล์ช่าง
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
