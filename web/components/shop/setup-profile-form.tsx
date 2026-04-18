"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, LoaderCircle, MapPin, Plus, Save, Store, Trash2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { TextareaField } from "@/components/ui/textarea-field";
import { TopAppBar } from "@/components/ui/top-app-bar";
import type {
  Availability,
  ServiceAreaSummary,
  SetupProfile,
  ThaiDistrict,
  ThaiProvince,
  ThaiSubdistrict,
} from "@/lib/api-types";

const servicePresets = [
  { label: "ล้างแอร์", defaultPrice: 700 },
  { label: "ซ่อมแอร์ / ตรวจเช็กอาการ", defaultPrice: 900 },
  { label: "เติมน้ำยา R32/R410", defaultPrice: 450 },
  { label: "ติดตั้งแอร์ใหม่", defaultPrice: 3500 },
  { label: "ย้ายแอร์", defaultPrice: 2500 },
];

const ALL_DISTRICTS_VALUE = "__all_districts__";
const ALL_SUBDISTRICTS_VALUE = "__all_subdistricts__";
const ALL_DISTRICTS_TEXT = "ทุกอำเภอ / ทุกเขต";
const ALL_SUBDISTRICTS_TEXT = "ทุกตำบล / ทุกแขวง";

type SetupProfileFormProps = {
  initialData: SetupProfile;
};

type AreaRow = {
  key: string;
  provinceId: string;
  province: string;
  districtId: string;
  district: string;
  subdistrictId: string;
  subdistrict: string;
};

type GeoPayload = {
  items?: unknown[];
};

function stringValue(value: unknown, fallback = "") {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

function createAreaRow(seed?: Partial<AreaRow>, keySeed = "area-0"): AreaRow {
  return {
    key: keySeed,
    provinceId: "",
    province: "",
    districtId: "",
    district: "",
    subdistrictId: "",
    subdistrict: "",
    ...seed,
  };
}

function buildAreaLabel(area: Pick<AreaRow, "province" | "district" | "subdistrict">) {
  return [area.subdistrict, area.district, area.province].filter(Boolean).join(", ");
}

function normalizeProvince(raw: unknown): ThaiProvince {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    id: stringValue(item.id),
    nameTh: stringValue(item.name_th),
  };
}

function normalizeDistrict(raw: unknown): ThaiDistrict {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    id: stringValue(item.id),
    provinceId: stringValue(item.province_id),
    nameTh: stringValue(item.name_th),
  };
}

function normalizeSubdistrict(raw: unknown): ThaiSubdistrict {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    id: stringValue(item.id),
    districtId: stringValue(item.district_id),
    provinceId: stringValue(item.province_id),
    nameTh: stringValue(item.name_th),
    zipCode: stringValue(item.zip_code) || undefined,
  };
}

async function fetchGeoPayload(path: string) {
  const response = await fetch(path, { cache: "no-store" });
  const payload = (await response.json()) as GeoPayload & { error?: string; message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? payload.error ?? "โหลดข้อมูลพื้นที่ไม่สำเร็จ");
  }

  return payload;
}

function buildAreaRows(serviceAreas: ServiceAreaSummary[]) {
  if (serviceAreas.length === 0) {
    return [createAreaRow({}, "area-0")];
  }

  return serviceAreas.map((area, index) =>
    createAreaRow({
      province: area.province,
      district: area.district,
      subdistrict: area.subdistrict ?? "",
      districtId: area.district === ALL_DISTRICTS_TEXT ? ALL_DISTRICTS_VALUE : "",
      subdistrictId: area.subdistrict === ALL_SUBDISTRICTS_TEXT ? ALL_SUBDISTRICTS_VALUE : "",
    }, `area-${index}`),
  );
}

function normalizeServiceLabel(label: string) {
  if (label.includes("ล้าง")) {
    return "ล้างแอร์";
  }
  return label;
}

function buildFormState(initialData: SetupProfile) {
  const selectedServices = Array.from(
    new Set((initialData.technician?.services ?? []).map((label) => normalizeServiceLabel(label))),
  );
  const priceMap = new Map<string, number>();
  for (const service of initialData.technicianServices) {
    const normalizedLabel = normalizeServiceLabel(service.label);
    const currentPrice = priceMap.get(normalizedLabel) ?? 0;
    const nextPrice =
      currentPrice === 0 || (service.startingPrice > 0 && service.startingPrice < currentPrice)
        ? service.startingPrice
        : currentPrice;
    priceMap.set(normalizedLabel, nextPrice);
  }
  for (const label of selectedServices) {
    if (!priceMap.has(label)) {
      const preset = servicePresets.find((item) => item.label === label);
      priceMap.set(label, preset?.defaultPrice ?? 0);
    }
  }

  return {
    storeName: initialData.store?.name ?? "",
    storePhone: initialData.store?.phone ?? "",
    storeLineOaId: initialData.store?.lineOaId ?? "",
    storeDescription: initialData.store?.description ?? "",
    storeLogoUrl: initialData.store?.logoUrl ?? "",
    technicianName: initialData.technician?.name ?? "",
    technicianPhone: initialData.technician?.phone ?? "",
    technicianAvatarUrl: initialData.technician?.image ?? "",
    technicianHeadline: initialData.technician?.headline ?? "",
    experienceYears: String(initialData.technician?.experienceYears ?? 0),
    availability: (initialData.technician?.availability ?? "available") as Availability,
    workingHours: initialData.technician?.hours ?? "ทุกวัน 08:00 - 18:00",
    lineUrl: initialData.technician?.lineUrl ?? "",
    serviceLabels: selectedServices,
    servicePrices: Object.fromEntries(priceMap),
    areaRows: buildAreaRows(initialData.serviceAreas),
  };
}

export function SetupProfileForm({ initialData }: Readonly<SetupProfileFormProps>) {
  const router = useRouter();
  const [form, setForm] = useState(() => buildFormState(initialData));
  const [provinces, setProvinces] = useState<ThaiProvince[]>([]);
  const [districtOptions, setDistrictOptions] = useState<Record<string, ThaiDistrict[]>>({});
  const [subdistrictOptions, setSubdistrictOptions] = useState<Record<string, ThaiSubdistrict[]>>({});
  const [result, setResult] = useState<{ type: "idle" | "success" | "error"; message?: string }>({
    type: "idle",
  });
  const [isPending, startTransition] = useTransition();
  const nextAreaKeyRef = useRef(Math.max(initialData.serviceAreas.length, 1));

  useEffect(() => {
    setForm(buildFormState(initialData));
    nextAreaKeyRef.current = Math.max(initialData.serviceAreas.length, 1);
  }, [initialData]);

  useEffect(() => {
    let active = true;

    async function loadProvinces() {
      try {
        const payload = await fetchGeoPayload("/api/public/geo/provinces");
        if (!active) {
          return;
        }
        setProvinces(Array.isArray(payload.items) ? payload.items.map((item) => normalizeProvince(item)) : []);
      } catch {
        if (!active) {
          return;
        }
        setResult({
          type: "error",
          message: "ยังโหลดข้อมูลจังหวัดไม่สำเร็จ ลองรีเฟรชหน้าอีกครั้ง",
        });
      }
    }

    loadProvinces();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (provinces.length === 0) {
      return;
    }

    let active = true;

    async function hydrateAreaRows() {
      const rows = buildAreaRows(initialData.serviceAreas);
      const hydratedRows: AreaRow[] = [];

      for (const row of rows) {
        const nextRow = await hydrateSingleAreaRow(row, provinces, active);
        if (!nextRow) {
          if (!active) return;
          continue;
        }
        hydratedRows.push(nextRow);
      }

      if (active) {
        setForm((current) => ({
          ...current,
          areaRows: hydratedRows.length > 0 ? hydratedRows : [createAreaRow()],
        }));
      }
    }

    hydrateAreaRows();

    return () => {
      active = false;
    };
  }, [initialData.serviceAreas, provinces]);

  const previewAreas = useMemo(
    () =>
      form.areaRows
        .map((item) => buildAreaLabel(item))
        .filter(Boolean),
    [form.areaRows],
  );

  function toggleService(label: string) {
    setForm((current) => {
      const exists = current.serviceLabels.includes(label);
      return {
        ...current,
        serviceLabels: exists
          ? current.serviceLabels.filter((item) => item !== label)
          : [...current.serviceLabels, label],
        servicePrices: exists
          ? current.servicePrices
          : {
              ...current.servicePrices,
              [label]: servicePresets.find((item) => item.label === label)?.defaultPrice ?? 0,
            },
      };
    });
  }

  async function ensureDistricts(provinceId: string) {
    if (!provinceId) {
      return [];
    }
    if (districtOptions[provinceId]) {
      return districtOptions[provinceId];
    }

    const payload = await fetchGeoPayload(`/api/public/geo/districts?province_id=${provinceId}`);
    const items = Array.isArray(payload.items) ? payload.items.map((item) => normalizeDistrict(item)) : [];
    setDistrictOptions((current) => ({ ...current, [provinceId]: items }));
    return items;
  }

  async function ensureSubdistricts(districtId: string) {
    if (!districtId) {
      return [];
    }
    if (subdistrictOptions[districtId]) {
      return subdistrictOptions[districtId];
    }

    const payload = await fetchGeoPayload(`/api/public/geo/subdistricts?district_id=${districtId}`);
    const items = Array.isArray(payload.items) ? payload.items.map((item) => normalizeSubdistrict(item)) : [];
    setSubdistrictOptions((current) => ({ ...current, [districtId]: items }));
    return items;
  }

  async function handleProvinceChange(rowKey: string, provinceId: string) {
    const province = provinces.find((item) => item.id === provinceId);

    setForm((current) => ({
      ...current,
      areaRows: current.areaRows.map((row) =>
        row.key === rowKey
          ? {
              ...row,
              provinceId,
              province: province?.nameTh ?? "",
              districtId: "",
              district: "",
              subdistrictId: "",
              subdistrict: "",
            }
          : row,
      ),
    }));

    if (provinceId) {
      try {
        await ensureDistricts(provinceId);
      } catch {
        setResult({
          type: "error",
          message: "ยังโหลดข้อมูลอำเภอไม่สำเร็จ ลองอีกครั้ง",
        });
      }
    }
  }

  async function handleDistrictChange(rowKey: string, districtId: string) {
    const targetRow = form.areaRows.find((row) => row.key === rowKey);
    const districts = targetRow?.provinceId ? districtOptions[targetRow.provinceId] ?? [] : [];
    const district = districts.find((item) => item.id === districtId);

    setForm((current) => ({
      ...current,
      areaRows: current.areaRows.map((row) =>
        row.key === rowKey
          ? {
              ...row,
              districtId,
              district: districtId === ALL_DISTRICTS_VALUE ? ALL_DISTRICTS_TEXT : district?.nameTh ?? "",
              subdistrictId: "",
              subdistrict: "",
            }
          : row,
      ),
    }));

    if (districtId && districtId !== ALL_DISTRICTS_VALUE) {
      try {
        await ensureSubdistricts(districtId);
      } catch {
        setResult({
          type: "error",
          message: "ยังโหลดข้อมูลตำบลไม่สำเร็จ ลองอีกครั้ง",
        });
      }
    }
  }

  function handleSubdistrictChange(rowKey: string, subdistrictId: string) {
    const targetRow = form.areaRows.find((row) => row.key === rowKey);
    const subdistricts = targetRow?.districtId ? subdistrictOptions[targetRow.districtId] ?? [] : [];
    const subdistrict = subdistricts.find((item) => item.id === subdistrictId);

    setForm((current) => ({
      ...current,
      areaRows: current.areaRows.map((row) =>
        row.key === rowKey
          ? {
              ...row,
              subdistrictId,
              subdistrict: subdistrictId === ALL_SUBDISTRICTS_VALUE ? ALL_SUBDISTRICTS_TEXT : subdistrict?.nameTh ?? "",
            }
          : row,
      ),
    }));
  }

  function addAreaRow() {
    setForm((current) => ({
      ...current,
      areaRows: [...current.areaRows, createAreaRow({}, `area-${nextAreaKeyRef.current++}`)],
    }));
  }

  function removeAreaRow(rowKey: string) {
    setForm((current) => {
      if (current.areaRows.length <= 1) {
        return {
          ...current,
          areaRows: [createAreaRow({}, `area-${nextAreaKeyRef.current++}`)],
        };
      }

      return {
        ...current,
        areaRows: current.areaRows.filter((row) => row.key !== rowKey),
      };
    });
  }

  function saveProfile() {
    startTransition(async () => {
      setResult({ type: "idle" });

      try {
        const response = await fetch("/api/app/setup-profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            store: {
              name: form.storeName.trim(),
              phone: form.storePhone.trim(),
              line_oa_id: form.storeLineOaId.trim(),
              logo_url: form.storeLogoUrl.trim(),
              description: form.storeDescription.trim(),
            },
            technician: {
              name: form.technicianName.trim(),
              phone: form.technicianPhone.trim(),
              avatar_url: form.technicianAvatarUrl.trim(),
              headline: form.technicianHeadline.trim(),
              experience_years: Number(form.experienceYears || 0),
              availability: form.availability,
              working_hours: form.workingHours.trim(),
              line_url: form.lineUrl.trim(),
              services: form.serviceLabels.map((label) => ({
                label,
                starting_price: Number(form.servicePrices[label] ?? 0),
              })),
              areas: form.areaRows
                .filter((row) => row.province && row.district)
                .map((row) => ({
                  province: row.province,
                  district: row.districtId === ALL_DISTRICTS_VALUE ? ALL_DISTRICTS_TEXT : row.district,
                  subdistrict: row.subdistrictId === ALL_SUBDISTRICTS_VALUE ? ALL_SUBDISTRICTS_TEXT : row.subdistrict,
                  label: buildAreaLabel(row),
                })),
            },
          }),
        });

        const payload = (await response.json()) as { error?: string; message?: string };
        if (!response.ok) {
          setResult({
            type: "error",
            message: payload.message ?? payload.error ?? "ยังบันทึกข้อมูลไม่สำเร็จ",
          });
          return;
        }

        setResult({
          type: "success",
          message: payload.message ?? "บันทึกข้อมูลเรียบร้อยแล้ว",
        });
        router.refresh();
      } catch {
        setResult({
          type: "error",
          message: "ยังเชื่อมต่อ API ไม่สำเร็จ ลองอีกครั้งอีกสักครู่",
        });
      }
    });
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col bg-surface-container-lowest pb-20">
      <TopAppBar
        title="ตั้งค่าร้านและโปรไฟล์ช่าง"
        left={
          <Link
            href="/portal/more"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low active:bg-surface-container"
          >
            <ArrowLeft className="h-5 w-5 text-on-surface" />
          </Link>
        }
      />

      <main className="space-y-6 px-4 py-6">
        <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
          <p className="text-sm leading-6 text-on-surface-variant">
            หน้านี้ใช้ตั้งค่าข้อมูลที่จะไปแสดงให้ลูกค้าเห็นในหน้าค้นหาช่างและหน้าโปรไฟล์ช่างของร้านคุณ
          </p>
        </section>

        <section className="overflow-hidden rounded-[1.8rem] bg-white shadow-sm ring-1 ring-black/[0.04]">
          <div className="flex items-start gap-3 border-b border-black/[0.04] px-5 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="headline-font text-xl font-bold text-on-surface">ข้อมูลร้าน</h2>
              <p className="mt-1 text-sm text-on-surface-variant">ข้อมูลส่วนนี้จะช่วยให้ลูกค้ารู้จักร้านของคุณมากขึ้น</p>
            </div>
          </div>

          <div className="space-y-4 px-5 py-5">
            <InputField
              id="store_name"
              label="ชื่อร้าน"
              value={form.storeName}
              onChange={(event) => setForm({ ...form, storeName: event.target.value })}
              placeholder="เช่น แอร์บ้านพร้อมเซอร์วิส"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                id="store_phone"
                label="เบอร์ร้าน"
                value={form.storePhone}
                onChange={(event) => setForm({ ...form, storePhone: event.target.value })}
                placeholder="08X-XXX-XXXX"
              />
              <InputField
                id="store_line_oa"
                label="LINE OA ID"
                value={form.storeLineOaId}
                onChange={(event) => setForm({ ...form, storeLineOaId: event.target.value })}
                placeholder="@yourshop"
              />
            </div>
            <InputField
              id="store_logo_url"
              label="ลิงก์รูปโลโก้ร้าน"
              value={form.storeLogoUrl}
              onChange={(event) => setForm({ ...form, storeLogoUrl: event.target.value })}
              placeholder="https://..."
            />
            <TextareaField
              id="store_description"
              label="คำอธิบายร้าน"
              rows={4}
              value={form.storeDescription}
              onChange={(event) => setForm({ ...form, storeDescription: event.target.value })}
              placeholder="เล่าให้ลูกค้ารู้ว่าร้านคุณเด่นเรื่องอะไร เช่น รับงานเร็ว ตรงเวลา หรือเชี่ยวชาญงานซ่อม"
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.8rem] bg-white shadow-sm ring-1 ring-black/[0.04]">
          <div className="flex items-start gap-3 border-b border-black/[0.04] px-5 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 className="headline-font text-xl font-bold text-on-surface">โปรไฟล์ช่างหลัก</h2>
              <p className="mt-1 text-sm text-on-surface-variant">ข้อมูลชุดนี้จะถูกใช้ในหน้าโปรไฟล์ที่ลูกค้าเลือกดู</p>
            </div>
          </div>

          <div className="space-y-4 px-5 py-5">
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                id="technician_name"
                label="ชื่อช่าง / ชื่อผู้ดูแลหลัก"
                value={form.technicianName}
                onChange={(event) => setForm({ ...form, technicianName: event.target.value })}
                placeholder="เช่น ช่างต้น"
              />
              <InputField
                id="technician_phone"
                label="เบอร์โทรช่าง"
                value={form.technicianPhone}
                onChange={(event) => setForm({ ...form, technicianPhone: event.target.value })}
                placeholder="08X-XXX-XXXX"
              />
            </div>

            <InputField
              id="technician_avatar"
              label="ลิงก์รูปช่าง"
              value={form.technicianAvatarUrl}
              onChange={(event) => setForm({ ...form, technicianAvatarUrl: event.target.value })}
              placeholder="https://..."
            />

            <TextareaField
              id="technician_headline"
              label="ข้อความแนะนำตัว"
              rows={3}
              value={form.technicianHeadline}
              onChange={(event) => setForm({ ...form, technicianHeadline: event.target.value })}
              placeholder="เช่น รับงานล้าง ซ่อม ติดตั้งแอร์บ้าน เดินทางไวในโซนบางนา"
            />

            <div className="grid gap-4 md:grid-cols-3">
              <InputField
                id="experience_years"
                type="number"
                min={0}
                label="ประสบการณ์ (ปี)"
                value={form.experienceYears}
                onChange={(event) => setForm({ ...form, experienceYears: event.target.value })}
              />
              <SelectField
                id="availability"
                label="สถานะรับงาน"
                value={form.availability}
                onChange={(event) =>
                  setForm({
                    ...form,
                    availability: event.target.value === "busy" ? "busy" : "available",
                  })
                }
                options={[
                  { value: "available", label: "พร้อมรับงาน" },
                  { value: "busy", label: "คิวแน่น" },
                ]}
              />
              <InputField
                id="line_url"
                label="ลิงก์ LINE"
                value={form.lineUrl}
                onChange={(event) => setForm({ ...form, lineUrl: event.target.value })}
                placeholder="https://line.me/..."
              />
            </div>

            <InputField
              id="working_hours"
              label="เวลาทำการ"
              value={form.workingHours}
              onChange={(event) => setForm({ ...form, workingHours: event.target.value })}
              placeholder="ทุกวัน 08:00 - 18:00"
            />

            <div className="space-y-3 pt-1">
              <p className="text-xs font-semibold text-on-surface">บริการที่รับและราคาเริ่มต้น</p>
              <div className="space-y-3">
                {servicePresets.map((service) => {
                  const checked = form.serviceLabels.includes(service.label);
                  return (
                    <div
                      key={service.label}
                      className={`rounded-[1.4rem] border p-4 transition-all ${
                        checked
                          ? "border-primary/25 bg-[linear-gradient(180deg,rgba(239,246,255,1),rgba(255,255,255,1))] shadow-[0_18px_36px_-28px_rgba(30,64,175,0.45)]"
                          : "border-black/[0.06] bg-surface-container-low"
                      }`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <button type="button" onClick={() => toggleService(service.label)} className="flex items-start gap-3 text-left">
                          <span
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                              checked ? "border-primary bg-primary text-on-primary" : "border-slate-300 bg-white text-transparent"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-on-surface">{service.label}</span>
                            <span className="mt-1 block text-xs leading-5 text-on-surface-variant">
                              ราคาเริ่มต้นแนะนำ {service.defaultPrice.toLocaleString()} บาท
                            </span>
                          </span>
                        </button>

                        <div className="min-w-0 md:w-[11rem]">
                          <label htmlFor={`price-${service.label}`} className="mb-1.5 block text-xs font-semibold text-on-surface">
                            ราคาเริ่มต้น
                          </label>
                          <div className="relative">
                            <Input
                              id={`price-${service.label}`}
                              type="number"
                              min={0}
                              disabled={!checked}
                              className={checked ? "pr-14" : "bg-white/60 text-on-surface-variant/40 pr-14"}
                              value={String(form.servicePrices[service.label] ?? service.defaultPrice)}
                              onChange={(event) =>
                                setForm({
                                  ...form,
                                  servicePrices: {
                                    ...form.servicePrices,
                                    [service.label]: Number(event.target.value || 0),
                                  },
                                })
                              }
                            />
                            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-on-surface-variant/50">
                              บาท
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-on-surface">พื้นที่ให้บริการ</p>
                  <p className="mt-1 text-xs leading-5 text-on-surface-variant">เลือกจังหวัด อำเภอ และตำบลที่คุณรับงานจริง เพื่อให้ลูกค้าค้นหาเจอได้ง่ายขึ้น</p>
                </div>
                <Button type="button" variant="outline" className="h-10 shrink-0 rounded-full px-4" onClick={addAreaRow}>
                  <Plus className="h-4 w-4" />
                  เพิ่มพื้นที่
                </Button>
              </div>

              <div className="space-y-3">
                {form.areaRows.map((row, index) => {
                  const districts = row.provinceId ? districtOptions[row.provinceId] ?? [] : [];
                  const subdistricts = row.districtId ? subdistrictOptions[row.districtId] ?? [] : [];
                  const areaLabel = buildAreaLabel(row);

                  return (
                    <div key={row.key} className="rounded-[1.4rem] border border-black/[0.06] bg-surface-container-low p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <MapPin className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-on-surface">พื้นที่ {index + 1}</p>
                            <p className="text-xs text-on-surface-variant">{areaLabel || "ยังไม่ได้เลือกพื้นที่"}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAreaRow(row.key)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-white active:bg-white"
                          aria-label="ลบพื้นที่"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <SelectField
                          id={`province-${row.key}`}
                          label="จังหวัด"
                          value={row.provinceId}
                          onChange={(event) => void handleProvinceChange(row.key, event.target.value)}
                          placeholder="เลือกจังหวัด"
                          options={provinces.map((item) => ({
                            value: item.id,
                            label: item.nameTh,
                          }))}
                        />
                        <SelectField
                          id={`district-${row.key}`}
                          label="อำเภอ / เขต"
                          value={row.districtId}
                          onChange={(event) => void handleDistrictChange(row.key, event.target.value)}
                          placeholder={row.provinceId ? "เลือกอำเภอ / เขต" : "เลือกจังหวัดก่อน"}
                          disabled={!row.provinceId}
                          options={[
                            { value: ALL_DISTRICTS_VALUE, label: "ทุกอำเภอ / ทุกเขตในจังหวัดนี้" },
                            ...districts.map((item) => ({
                              value: item.id,
                              label: item.nameTh,
                            })),
                          ]}
                        />
                        <SelectField
                          id={`subdistrict-${row.key}`}
                          label="ตำบล / แขวง"
                          value={row.subdistrictId}
                          onChange={(event) => handleSubdistrictChange(row.key, event.target.value)}
                          placeholder={getRowSubdistrictPlaceholder(row)}
                          disabled={!row.districtId || row.districtId === ALL_DISTRICTS_VALUE}
                          options={[
                            { value: ALL_SUBDISTRICTS_VALUE, label: "ทุกตำบล / ทุกแขวงในอำเภอนี้" },
                            ...subdistricts.map((item) => ({
                              value: item.id,
                              label: item.zipCode ? `${item.nameTh} (${item.zipCode})` : item.nameTh,
                            })),
                          ]}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-surface-container-low p-4 text-sm leading-6 text-on-surface-variant">
              <span className="font-semibold text-on-surface">ตัวอย่างที่ลูกค้าจะเห็น:</span>{" "}
              {form.serviceLabels.map(String).join(", ") || "ยังไม่ได้เลือกบริการ"} • {previewAreas.join(" | ") || "ยังไม่ได้ใส่พื้นที่"} •{" "}
              {form.technicianHeadline.trim() || "ยังไม่ได้ใส่ข้อความแนะนำตัว"}
            </div>
          </div>
        </section>

        {result.type === "idle" ? null : (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              result.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-[rgba(186,26,26,0.08)] text-error"
            }`}
          >
            {result.message}
          </div>
        )}

        <Button type="button" size="lg" className="h-14 w-full text-base font-bold" onClick={saveProfile} disabled={isPending}>
          {isPending ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              กำลังบันทึกข้อมูล...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              บันทึกข้อมูลร้านและโปรไฟล์ช่าง
            </>
          )}
        </Button>
      </main>
    </div>
  );
}

function getRowSubdistrictPlaceholder(row: AreaRow) {
  if (!row.districtId) return "เลือกอำเภอก่อน";
  if (row.districtId === ALL_DISTRICTS_VALUE) return "เลือกอำเภอเฉพาะก่อน";
  return "เลือกตำบล / แขวง";
}

async function hydrateSingleAreaRow(row: AreaRow, provinces: ThaiProvince[], active: boolean): Promise<AreaRow | null> {
  if (!row.province || !row.district) return row;

  const province = provinces.find((item) => item.nameTh === row.province);
  if (!province) return row;

  const districtPayload = await fetchGeoPayload(`/api/public/geo/districts?province_id=${province.id}`);
  const districts = Array.isArray(districtPayload.items)
    ? districtPayload.items.map((item) => normalizeDistrict(item))
    : [];

  if (!active) return null;

  if (row.district === ALL_DISTRICTS_TEXT) {
    return {
      ...row,
      provinceId: province.id,
      districtId: ALL_DISTRICTS_VALUE,
      subdistrictId: "",
      subdistrict: "",
    };
  }

  const district = districts.find((item) => item.nameTh === row.district);
  if (!district) return { ...row, provinceId: province.id };

  let nextRow: AreaRow = { ...row, provinceId: province.id, districtId: district.id };

  if (row.subdistrict === ALL_SUBDISTRICTS_TEXT) {
    nextRow = { ...nextRow, subdistrictId: ALL_SUBDISTRICTS_VALUE };
  } else if (row.subdistrict) {
    const subdistrictPayload = await fetchGeoPayload(`/api/public/geo/subdistricts?district_id=${district.id}`);
    const subdistricts = Array.isArray(subdistrictPayload.items)
      ? subdistrictPayload.items.map((item) => normalizeSubdistrict(item))
      : [];

    if (!active) return null;

    const subdistrict = subdistricts.find((item) => item.nameTh === row.subdistrict);
    if (subdistrict) {
      nextRow = { ...nextRow, subdistrictId: subdistrict.id };
    }
  }

  return nextRow;
}
