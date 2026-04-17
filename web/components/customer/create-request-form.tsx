"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState, useTransition } from "react";
import { CalendarDays, CheckCircle2, ImagePlus, MapPin, Send, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
}: CreateRequestFormProps) {
  const [form, setForm] = useState<RequestState>(() => initialState(defaultName));
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

  function updateField<K extends keyof RequestState>(key: K, value: RequestState[K]) {
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
            notes: [form.notes, selectedTechnician ? `ช่างที่เลือก: ${selectedTechnician.slug}` : ""]
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
      <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
        <div className="section-stack">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container text-on-primary">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="headline-font text-xl font-bold text-on-surface">ข้อมูลบริการ</p>
              <p className="mt-1 text-sm text-on-surface-variant">{previewLabel}</p>
            </div>
          </div>

          {result.status !== "idle" ? (
            <div
              className={`rounded-[1.5rem] px-4 py-3 text-sm ${
                result.status === "success"
                  ? "bg-[#E8F7EE] text-[#0E6E3E]"
                  : "bg-[rgba(186,26,26,0.08)] text-error"
              }`}
            >
              <div className="flex items-center gap-2">
                {result.status === "success" ? <CheckCircle2 className="h-4 w-4" /> : null}
                <span>{result.message}</span>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
        <div className="section-stack">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="headline-font text-lg font-bold text-on-surface">ข้อมูลผู้ติดต่อ</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="field-stack">
              <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                ชื่อ
              </label>
              <Input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="ชื่อผู้ติดต่อ"
                required
              />
            </div>
            <div className="field-stack">
              <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                เบอร์โทร
              </label>
              <Input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="08x-xxx-xxxx"
                type="tel"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="field-stack">
              <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                พื้นที่
              </label>
              <Input
                value={form.area}
                onChange={(event) => updateField("area", event.target.value)}
                placeholder="เช่น ลาดพร้าว, บางนา"
                required
              />
            </div>
            <div className="field-stack">
              <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                จำนวนเครื่อง
              </label>
              <Input
                value={form.units}
                onChange={(event) => updateField("units", event.target.value)}
                placeholder="1"
                inputMode="numeric"
                required
              />
            </div>
          </div>

          <div className="field-stack">
            <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
              ที่อยู่
            </label>
            <Textarea
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="บ้านเลขที่ อาคาร ชั้น หรือจุดสังเกต"
              rows={3}
              required
            />
          </div>
        </div>
      </section>

      <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
        <div className="section-stack">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <h2 className="headline-font text-lg font-bold text-on-surface">รายละเอียดเครื่องและอาการ</h2>
          </div>

          <div className="section-stack-sm">
            <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
              ประเภทบริการ
            </label>
            <div className="flex flex-wrap gap-2">
              {serviceOptions.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => updateField("serviceType", service)}
                  className={
                    form.serviceType === service
                      ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
                      : "rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface-variant"
                  }
                >
                  {service}
                </button>
              ))}
            </div>
          </div>

          <div className="section-stack-sm">
            <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
              BTU
            </label>
            <div className="flex flex-wrap gap-2">
              {btuOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => updateField("btu", item)}
                  className={
                    form.btu === item
                      ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
                      : "rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface-variant"
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="field-stack">
              <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                ยี่ห้อ
              </label>
              <Input
                value={form.brand}
                onChange={(event) => updateField("brand", event.target.value)}
                placeholder="Daikin, Mitsubishi, Carrier"
              />
            </div>
            <div className="field-stack">
              <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                รูปประกอบ
              </label>
              <label className="flex h-[3.25rem] cursor-pointer items-center justify-center gap-2 rounded-2xl bg-surface-container-low px-4 text-sm font-semibold text-on-surface">
                <ImagePlus className="h-4 w-4 text-primary" />
                เลือกไฟล์
                <input className="hidden" type="file" multiple onChange={handleFileChange} />
              </label>
            </div>
          </div>

          {form.images.length > 0 ? (
            <div className="rounded-[1.5rem] bg-surface-container-low p-4 text-sm text-on-surface-variant">
              แนบไฟล์แล้ว {form.images.length} รายการ: {form.images.join(", ")}
            </div>
          ) : null}

          <div className="field-stack">
            <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
              อาการ
            </label>
            <Textarea
              value={form.symptom}
              onChange={(event) => updateField("symptom", event.target.value)}
              placeholder="เช่น แอร์ไม่เย็น มีน้ำหยด เปิดไม่ติด"
              rows={4}
              required
            />
          </div>

          <div className="field-stack">
            <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
              หมายเหตุเพิ่มเติม
            </label>
            <Textarea
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="เช่น สะดวกติดต่อผ่าน LINE หรือมีจุดจอดรถ"
              rows={3}
            />
          </div>
        </div>
      </section>

      <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
        <div className="section-stack">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="headline-font text-lg font-bold text-on-surface">วันและเวลาที่สะดวก</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="field-stack">
              <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                วันที่
              </label>
              <Input
                value={form.preferredDate}
                onChange={(event) => updateField("preferredDate", event.target.value)}
                type="date"
              />
            </div>
            <div className="field-stack">
              <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                เวลา
              </label>
              <Input
                value={form.preferredTime}
                onChange={(event) => updateField("preferredTime", event.target.value)}
                type="time"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="glass-bar sticky-action-bar fixed bottom-0 left-0 z-50 w-full">
        <div className="mx-auto w-full max-w-[42rem]">
          <Button type="submit" size="lg" className="h-14 w-full text-base font-bold" disabled={isPending}>
            {isPending ? "กำลังส่งคำขอ..." : "ส่งคำขอใช้บริการ"}
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
