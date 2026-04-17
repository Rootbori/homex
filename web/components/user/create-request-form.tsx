"use client";

import React, { useMemo, useState, useTransition } from "react";
import type { ChangeEvent } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ImagePlus,
  MapPin,
  Send,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { TextareaField } from "@/components/ui/textarea-field";

const serviceOptions = ["ล้างแอร์", "ซ่อมแอร์", "เติมน้ำยา", "ติดตั้ง"];
const btuOptions = ["9,000", "12,000", "18,000", "24,000+"];

type CreateRequestFormProps = {
  defaultName?: string;
  selectedTechnician?: {
    slug: string;
    name: string;
    shopName: string;
  } | null;
};

type RequestState = {
  name: string;
  phone: string;
  area: string;
  address: string;
  serviceType: string;
  units: string;
  btu: string;
  brand: string;
  symptom: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  images: string[];
};

const initialState = (defaultName = ""): RequestState => ({
  name: defaultName,
  phone: "",
  area: "",
  address: "",
  serviceType: serviceOptions[0],
  units: "1",
  btu: btuOptions[0],
  brand: "",
  symptom: "",
  preferredDate: "",
  preferredTime: "",
  notes: "",
  images: [],
});

export function CreateRequestForm({
  defaultName,
  selectedTechnician,
}: Readonly<CreateRequestFormProps>) {
  const [form, setForm] = useState<RequestState>(() =>
    initialState(defaultName),
  );
  const [result, setResult] = useState<{
    status: "idle" | "success" | "error";
    message?: string;
  }>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  const previewLabel = useMemo(() => {
    if (!selectedTechnician) {
      return "ระบบจะส่งคำขอไปยังร้านที่คุณเลือกจากหน้าค้นหาช่าง";
    }

    return `คำขอนี้จะถูกส่งไปยัง ${selectedTechnician.shopName} (${selectedTechnician.name})`;
  }, [selectedTechnician]);

  function updateField<K extends keyof RequestState>(
    key: K,
    value: RequestState[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    updateField(
      "images",
      files.map((file) => file.name),
    );
  }

  function handleSubmit(event: React.BaseSyntheticEvent) {
    event.preventDefault();
    setResult({ status: "idle" });

    startTransition(async () => {
      try {
        const response = await fetch("/api/public/service-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            area: form.area,
            address: form.address,
            service_type: form.serviceType,
            units: Number(form.units) || 1,
            btu: form.btu,
            brand: form.brand,
            symptom: form.symptom,
            preferred_date: form.preferredDate,
            preferred_time: form.preferredTime,
            notes: [
              form.notes,
              selectedTechnician
                ? `ช่างที่เลือก: ${selectedTechnician.slug}`
                : "",
            ]
              .filter(Boolean)
              .join("\n"),
            images: form.images,
          }),
        });

        const payload = (await response.json()) as {
          message?: string;
          error?: string;
        };

        if (!response.ok) {
          setResult({
            status: "error",
            message: payload.message ?? payload.error ?? "ยังส่งคำขอไม่สำเร็จ",
          });
          return;
        }

        setResult({
          status: "success",
          message: payload.message ?? "ส่งคำขอเรียบร้อยแล้ว",
        });
        setForm(initialState(defaultName));
      } catch {
        setResult({
          status: "error",
          message: "ยังเชื่อมต่อ API ไม่สำเร็จ ลองอีกครั้งอีกสักครู่",
        });
      }
    });
  }

  return (
    <form className="page-stack-lg pb-28" onSubmit={handleSubmit}>
      <section className="premium-card p-6 md:p-8">
        <div className="section-stack">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <p className="headline-font text-2xl font-black tracking-tight text-on-surface">
                ข้อมูลบริการ
              </p>
              <p className="mt-1 text-sm font-medium text-on-surface-variant/70">
                {previewLabel}
              </p>
            </div>
          </div>

          {result.status === "idle" ? null : (
            <div
              className={`rounded-[1.5rem] px-4 py-3 text-sm ${
                result.status === "success"
                  ? "bg-[#E8F7EE] text-[#0E6E3E]"
                  : "bg-[rgba(186,26,26,0.08)] text-error"
              }`}
            >
              <div className="flex items-center gap-2">
                {result.status === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : null}
                <span>{result.message}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="premium-card p-6 md:p-8">
        <div className="section-stack">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="headline-font text-lg font-bold text-on-surface">
              ข้อมูลผู้ติดต่อ
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              id="name"
              label="ชื่อ"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="ชื่อผู้ติดต่อ"
              required
            />
            <InputField
              id="phone"
              label="เบอร์โทร"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="08x-xxx-xxxx"
              type="tel"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              id="area"
              label="พื้นที่"
              value={form.area}
              onChange={(event) => updateField("area", event.target.value)}
              placeholder="เช่น ลาดพร้าว, บางนา"
              required
            />
            <InputField
              id="units"
              label="จำนวนเครื่อง"
              value={form.units}
              onChange={(event) => updateField("units", event.target.value)}
              placeholder="1"
              inputMode="numeric"
              required
            />
          </div>

            <TextareaField
              id="address"
              label="ที่อยู่"
              value={form.address}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => updateField("address", event.target.value)}
              placeholder="บ้านเลขที่ อาคาร ชั้น หรือจุดสังเกต"
              rows={3}
              required
            />
        </div>
      </section>

      <section className="premium-card p-6 md:p-8">
        <div className="section-stack">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <h2 className="headline-font text-lg font-bold text-on-surface">
              รายละเอียดเครื่องและอาการ
            </h2>
          </div>

          <div className="section-stack-sm">
            <span className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
              ประเภทบริการ
            </span>
            <div className="flex flex-wrap gap-2">
              {serviceOptions.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => updateField("serviceType", service)}
                  className={
                    form.serviceType === service
                      ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
                      : "rounded-full bg-white ring-1 ring-slate-200/60 px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-slate-50"
                  }
                >
                  {service}
                </button>
              ))}
            </div>
          </div>

          <div className="section-stack-sm">
            <span className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
              BTU
            </span>
            <div className="flex flex-wrap gap-2">
              {btuOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => updateField("btu", item)}
                  className={
                    form.btu === item
                      ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
                      : "rounded-full bg-white ring-1 ring-slate-200/60 px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-slate-50"
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              id="brand"
              label="ยี่ห้อ"
              value={form.brand}
              onChange={(event) => updateField("brand", event.target.value)}
              placeholder="Daikin, Mitsubishi, Carrier"
            />
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-on-surface">
                รูปประกอบ
              </span>
              <label
                htmlFor="file-upload"
                className="flex h-[3.25rem] cursor-pointer items-center justify-center gap-2 rounded-xl bg-white ring-1 ring-slate-200/60 px-4 text-sm font-semibold text-on-surface transition-all hover:bg-slate-50"
              >
                <ImagePlus className="h-4 w-4 text-primary" />
                เลือกไฟล์
                <input
                  id="file-upload"
                  className="hidden"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {form.images.length > 0 ? (
            <div className="rounded-[1.5rem] bg-white ring-1 ring-slate-200/60 p-4 text-sm text-on-surface-variant">
              แนบไฟล์แล้ว {form.images.length} รายการ: {form.images.join(", ")}
            </div>
          ) : null}

          <TextareaField
            id="symptom"
            label="อาการ"
            value={form.symptom}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => updateField("symptom", event.target.value)}
            placeholder="เช่น แอร์ไม่เย็น มีน้ำหยด เปิดไม่ติด"
            rows={4}
            required
          />

          <TextareaField
            id="notes"
            label="หมายเหตุเพิ่มเติม"
            value={form.notes}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => updateField("notes", event.target.value)}
            placeholder="เช่น สะดวกติดต่อผ่าน LINE หรือมีจุดจอดรถ"
            rows={3}
          />
        </div>
      </section>

      <section className="premium-card p-6 md:p-8">
        <div className="section-stack">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="headline-font text-lg font-bold text-on-surface">
              วันและเวลาที่สะดวก
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              id="preferredDate"
              label="วันที่"
              value={form.preferredDate}
              onChange={(event) =>
                updateField("preferredDate", event.target.value)
              }
              type="date"
            />
            <InputField
              id="preferredTime"
              label="เวลา"
              value={form.preferredTime}
              onChange={(event) =>
                updateField("preferredTime", event.target.value)
              }
              type="time"
            />
          </div>
        </div>
      </section>

      <div className="glass-bar fixed bottom-0 left-0 z-50 w-full px-5 py-4">
        <div className="mx-auto w-full max-w-[42rem]">
          <Button
            type="submit"
            size="lg"
            className="interactive-scale h-14 w-full bg-tertiary text-lg font-black uppercase tracking-wider text-on-tertiary shadow-xl hover:brightness-110 active:scale-95 transition-all"
            disabled={isPending}
          >
            {isPending ? "กำลังบันทึกข้อมูล..." : "ยืนยันส่งคำขอช่าง"}
            <Send className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </form>
  );
}
