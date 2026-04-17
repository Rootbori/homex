import "server-only";

import { cookies } from "next/headers";
import type {
  CustomerSummary,
  DashboardData,
  JobStatus,
  JobSummary,
  LeadDetail,
  LeadSource,
  LeadSummary,
  ScheduleDay,
  TechnicianDetail,
  TechnicianSummary,
  TimelineItem,
} from "@/lib/api-types";
import { formatDateLabel, formatTimeLabel } from "@/lib/format";
import { proxyToApi, readProxyPayload } from "@/lib/server-api";

const fallbackTimeline: Array<{ type: string; label: string }> = [
  { type: "lead_created", label: "รับคำขอแล้ว" },
  { type: "quoted", label: "ส่งใบเสนอราคา" },
  { type: "confirmed", label: "ลูกค้ายืนยัน" },
  { type: "scheduled", label: "นัดหมายแล้ว" },
  { type: "on_the_way", label: "ช่างกำลังเดินทาง" },
  { type: "in_progress", label: "กำลังดำเนินงาน" },
  { type: "completed", label: "งานเสร็จแล้ว" },
];

const jobProgressByStatus: Record<JobStatus, number> = {
  awaiting_shop: 0,
  awaiting_quote: 1,
  awaiting_confirm: 2,
  scheduled: 3,
  on_the_way: 4,
  in_progress: 5,
  completed: 6,
  cancelled: 0,
};

async function actorHeaders() {
  const cookieStore = await cookies();
  const headers: Record<string, string> = {};

  const role = cookieStore.get("homex_role")?.value;
  const userId = cookieStore.get("homex_user_id")?.value;
  const storeId = cookieStore.get("homex_store_id")?.value;
  const customerId = cookieStore.get("homex_customer_id")?.value;
  const technicianId = cookieStore.get("homex_technician_id")?.value;

  if (role) headers["X-Actor-Role"] = role;
  if (userId) headers["X-Actor-User-ID"] = userId;
  if (storeId) headers["X-Store-ID"] = storeId;
  if (customerId) headers["X-Customer-ID"] = customerId;
  if (technicianId) headers["X-Technician-ID"] = technicianId;

  return headers;
}

async function fetchApiJson<T>(path: string, init?: RequestInit) {
  const response = await proxyToApi(path, {
    ...init,
    headers: {
      ...(await actorHeaders()),
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await readProxyPayload(response)) as T & {
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message ?? payload.error ?? `request failed for ${path}`);
  }

  return payload;
}

function stringValue(value: unknown, fallback = "") {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed !== "" ? trimmed : fallback;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function numberValue(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function stringList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => stringValue(item))
      .filter(Boolean);
  }

  const text = stringValue(value);
  if (!text) {
    return [];
  }

  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeLeadSource(value: unknown): LeadSource {
  return value === "line_oa" ? "line_oa" : "find_technician";
}

function normalizeJobStatus(value: unknown): JobStatus {
  switch (value) {
    case "awaiting_shop":
    case "awaiting_quote":
    case "awaiting_confirm":
    case "scheduled":
    case "on_the_way":
    case "in_progress":
    case "completed":
    case "cancelled":
      return value;
    default:
      return "awaiting_shop";
  }
}

function buildTimeline(status: JobStatus, rawTimeline: unknown, createdAt = ""): TimelineItem[] {
  const progressIndex = jobProgressByStatus[status];
  const source =
    Array.isArray(rawTimeline) && rawTimeline.length > 0
      ? rawTimeline.map((item, index) => {
          const entry = (item ?? {}) as Record<string, unknown>;
          return {
            type: stringValue(entry.type, fallbackTimeline[index]?.type ?? `step-${index + 1}`),
            label: stringValue(entry.label, fallbackTimeline[index]?.label ?? `ขั้นตอน ${index + 1}`),
          };
        })
      : fallbackTimeline;

  return source.map((item, index) => ({
    label: item.label,
    time: index <= progressIndex && createdAt ? formatTimeLabel(createdAt) : index <= progressIndex ? "อัปเดตแล้ว" : "รออัปเดต",
    done: index <= progressIndex,
  }));
}

function normalizeTechnician(raw: unknown): TechnicianSummary {
  const item = (raw ?? {}) as Record<string, unknown>;
  const shopName = stringValue(item.shop_name) || stringValue(item.name, "Technician");
  const displayName = stringValue(item.display_name) || shopName;

  return {
    id: stringValue(item.id),
    slug: stringValue(item.slug),
    name: displayName,
    shopName,
    rating: numberValue(item.rating, 0),
    reviewCount: numberValue(item.reviews ?? item.review_count, 0),
    experienceYears: numberValue(item.experience ?? item.experience_years, 0),
    area: stringList(item.area),
    services: stringList(item.services),
    startingPrice: numberValue(item.starting_price, 0),
    availability: stringValue(item.availability) === "busy" ? "busy" : "available",
    hours: stringValue(item.working_hours, "ทุกวัน 08:00 - 18:00"),
    phone: stringValue(item.phone, "-"),
    lineUrl: stringValue(item.line_url, "#"),
    headline: stringValue(item.headline, "ทีมช่างแอร์พร้อมดูแลงานหน้างานอย่างรวดเร็ว"),
    image: stringValue(item.hero_image) || stringValue(item.avatar_url),
  };
}

function normalizeLead(raw: unknown): LeadSummary {
  const item = (raw ?? {}) as Record<string, unknown>;

  return {
    id: stringValue(item.id),
    customerName: stringValue(item.customer_name, "ลูกค้า"),
    phone: stringValue(item.phone, "-"),
    area: stringValue(item.area),
    serviceType: stringValue(item.service_type),
    units: numberValue(item.units, 0),
    symptom: stringValue(item.symptom),
    source: normalizeLeadSource(item.source),
    time: formatTimeLabel(stringValue(item.created_at)),
    status: stringValue(item.status) === "quoted" ? "quoted" : stringValue(item.status) === "converted" ? "converted" : stringValue(item.status) === "cancelled" ? "cancelled" : "new",
    assignedTechnicianId: stringValue(item.assigned_technician),
  };
}

function normalizeJob(raw: unknown, extras?: Record<string, unknown>): JobSummary {
  const item = (raw ?? {}) as Record<string, unknown>;
  const extra = extras ?? {};
  const status = normalizeJobStatus(item.status);
  const quotation = (extra.quotation ?? {}) as Record<string, unknown>;

  const quoteItems = Array.isArray(quotation.items)
    ? quotation.items.map((quoteItem) => {
        const entry = (quoteItem ?? {}) as Record<string, unknown>;
        return {
          label: stringValue(entry.label),
          qty: numberValue(entry.qty ?? entry.quantity, 1),
          amount: numberValue(entry.amount, 0),
        };
      })
    : [];

  const photos = Array.isArray(extra.photos)
    ? extra.photos.map((photo) => {
        const entry = (photo ?? {}) as Record<string, unknown>;
        return {
          label: stringValue(entry.caption || entry.kind, "รูปงาน"),
          image: stringValue(entry.image_url),
          kind: stringValue(entry.kind),
        };
      })
    : [];

  return {
    id: stringValue(item.id),
    code: stringValue(item.job_code, stringValue(item.id)),
    customerId: stringValue(item.customer_user_id),
    customerName: stringValue(item.customer_name, "ลูกค้า"),
    phone: stringValue(item.customer_phone, "-"),
    area: stringValue(item.area, stringValue(item.area_label)),
    address: stringValue(item.address_line, "-"),
    serviceType: stringValue(item.service_type),
    status,
    appointmentDate: formatDateLabel(stringValue(item.scheduled_date)),
    appointmentTime: stringValue(item.scheduled_time, "-"),
    total: numberValue(item.quotation_total ?? quotation.total, 0),
    assignedTechnicianId: stringValue(item.assigned_technician),
    assignedTechnicianName: stringValue(item.assigned_technician_name, "ยังไม่ได้มอบหมาย"),
    source: normalizeLeadSource(item.source),
    symptom: stringValue(item.symptom, "-"),
    paymentStatus: stringValue(item.payment_status, "pending"),
    note: stringValue(item.internal_note ?? item.note, "-"),
    timeline: buildTimeline(status, item.timeline, stringValue(item.created_at)),
    photos,
    quoteItems,
    mapUrl: stringValue(extra.map_url),
  };
}

function normalizeDashboard(raw: unknown): DashboardData {
  const item = (raw ?? {}) as Record<string, unknown>;
  const kpis = (item.kpis ?? {}) as Record<string, unknown>;
  const todayJobs = Array.isArray(item.today_jobs) ? item.today_jobs.map((job) => normalizeJob(job)) : [];
  const latestLeads = Array.isArray(item.latest_leads) ? item.latest_leads.map((lead) => normalizeLead(lead)) : [];
  const urgentJobs = Array.isArray(item.urgent_jobs)
    ? item.urgent_jobs.map((job) => {
        const entry = (job ?? {}) as Record<string, unknown>;
        return {
          code: stringValue(entry.job_code, stringValue(entry.id)),
          customer: stringValue(entry.customer, "ลูกค้า"),
          time: stringValue(entry.time, "-"),
          status: stringValue(entry.status, "-"),
          assignedTechnicianId: stringValue(entry.assigned_technician),
        };
      })
    : [];

  return {
    kpis: [
      { label: "Lead ใหม่วันนี้", value: String(numberValue(kpis.new_leads_today, 0)) },
      { label: "งานกำลังทำ", value: String(numberValue(kpis.jobs_in_progress, 0)) },
      { label: "ใบเสนอราคาค้าง", value: String(numberValue(kpis.pending_quotes, 0)) },
      { label: "งานเสร็จแล้ว", value: String(numberValue(kpis.completed_jobs, 0)) },
      { label: "รายได้เดือนนี้", value: String(numberValue(kpis.revenue_this_month, 0)) },
    ],
    urgentJobs,
    todayJobs,
    latestLeads,
  };
}

function normalizeCustomer(raw: unknown): CustomerSummary {
  const item = (raw ?? {}) as Record<string, unknown>;

  return {
    id: stringValue(item.id),
    name: stringValue(item.name, stringValue(item.full_name, "ลูกค้า")),
    phone: stringValue(item.phone, "-"),
    area: stringValue(item.area, "-"),
    totalSpend: numberValue(item.total_spend, 0),
    jobsCount: numberValue(item.jobs_count, 0),
    note: stringValue(item.note, "-"),
  };
}

export async function getPublicTechnicians(searchParams?: URLSearchParams | Record<string, string | string[] | undefined>) {
  try {
    const query = new URLSearchParams();

    if (searchParams instanceof URLSearchParams) {
      searchParams.forEach((value, key) => query.set(key, value));
    } else if (searchParams) {
      for (const [key, value] of Object.entries(searchParams)) {
        if (typeof value === "string" && value) {
          query.set(key, value);
        }
      }
    }

    const path = `/v1/public/technicians${query.toString() ? `?${query.toString()}` : ""}`;
    const payload = await fetchApiJson<{ items?: unknown[] }>(path);
    return Array.isArray(payload.items) ? payload.items.map((item) => normalizeTechnician(item)) : [];
  } catch {
    return [];
  }
}

export async function getPublicTechnicianDetail(slug: string): Promise<TechnicianDetail | null> {
  try {
    const payload = await fetchApiJson<{
      technician?: unknown;
      gallery?: Array<{ image_url?: string }>;
      reviews?: Array<{ customer?: string; rating?: number; comment?: string }>;
    }>(`/v1/public/technicians/${slug}`);

    if (!payload.technician) {
      return null;
    }

    const base = normalizeTechnician(payload.technician);
    return {
      ...base,
      gallery: Array.isArray(payload.gallery)
        ? payload.gallery.map((item) => stringValue(item.image_url)).filter(Boolean)
        : [],
      reviews: Array.isArray(payload.reviews)
        ? payload.reviews.map((item) => ({
            customer: stringValue(item.customer, "ลูกค้า"),
            rating: numberValue(item.rating, 5),
            comment: stringValue(item.comment),
          }))
        : [],
    };
  } catch {
    return null;
  }
}

export async function getCustomerJobs() {
  try {
    const payload = await fetchApiJson<{ items?: unknown[] }>("/v1/customer/jobs");
    return Array.isArray(payload.items) ? payload.items.map((item) => normalizeJob(item)) : [];
  } catch {
    return [];
  }
}

export async function getCustomerJob(id: string) {
  try {
    const payload = await fetchApiJson<{
      job?: unknown;
      quotation?: Record<string, unknown>;
      photos?: unknown[];
    }>(`/v1/customer/jobs/${id}`);

    if (!payload.job) {
      return null;
    }

    return normalizeJob(payload.job, {
      quotation: payload.quotation,
      photos: payload.photos,
    });
  } catch {
    return null;
  }
}

export async function getDashboard() {
  try {
    const payload = await fetchApiJson<{ dashboard?: unknown }>("/v1/app/dashboard");
    return normalizeDashboard(payload.dashboard);
  } catch {
    return {
      kpis: [],
      urgentJobs: [],
      todayJobs: [],
      latestLeads: [],
    } satisfies DashboardData;
  }
}

export async function getLeads() {
  try {
    const payload = await fetchApiJson<{ items?: unknown[] }>("/v1/app/leads");
    return Array.isArray(payload.items) ? payload.items.map((item) => normalizeLead(item)) : [];
  } catch {
    return [];
  }
}

export async function getLead(id: string): Promise<LeadDetail | null> {
  try {
    const payload = await fetchApiJson<{
      lead?: unknown;
      air_units?: Array<{ brand?: string; btu?: string; symptom?: string }>;
    }>(`/v1/app/leads/${id}`);

    if (!payload.lead) {
      return null;
    }

    const lead = normalizeLead(payload.lead);
    return {
      ...lead,
      airUnits: Array.isArray(payload.air_units)
        ? payload.air_units.map((item) => ({
            brand: stringValue(item.brand, "-"),
            btu: stringValue(item.btu, "-"),
            symptom: stringValue(item.symptom, "-"),
          }))
        : [],
    };
  } catch {
    return null;
  }
}

export async function getJobs() {
  try {
    const payload = await fetchApiJson<{ items?: unknown[] }>("/v1/app/jobs");
    return Array.isArray(payload.items) ? payload.items.map((item) => normalizeJob(item)) : [];
  } catch {
    return [];
  }
}

export async function getJob(id: string) {
  try {
    const payload = await fetchApiJson<{
      job?: unknown;
      quotation?: Record<string, unknown>;
      photos?: unknown[];
      map_url?: string;
    }>(`/v1/app/jobs/${id}`);

    if (!payload.job) {
      return null;
    }

    return normalizeJob(payload.job, {
      quotation: payload.quotation,
      photos: payload.photos,
      map_url: payload.map_url,
    });
  } catch {
    return null;
  }
}

export async function getSchedule(): Promise<ScheduleDay[]> {
  try {
    const payload = await fetchApiJson<{ days?: Array<{ date?: string; jobs?: unknown[] }> }>("/v1/app/schedule");
    return Array.isArray(payload.days)
      ? payload.days.map((day) => ({
          date: stringValue(day.date),
          jobs: Array.isArray(day.jobs) ? day.jobs.map((job) => normalizeJob(job)) : [],
        }))
      : [];
  } catch {
    return [];
  }
}

export async function getTechnicians() {
  try {
    const payload = await fetchApiJson<{ items?: unknown[] }>("/v1/app/technicians");
    return Array.isArray(payload.items) ? payload.items.map((item) => normalizeTechnician(item)) : [];
  } catch {
    return [];
  }
}

export async function getCustomers() {
  try {
    const payload = await fetchApiJson<{ items?: unknown[] }>("/v1/app/customers");
    return Array.isArray(payload.items) ? payload.items.map((item) => normalizeCustomer(item)) : [];
  } catch {
    return [];
  }
}

export async function getStaffTechnicianByID(id: string) {
  const technicians = await getTechnicians();
  return technicians.find((item) => item.id === id) ?? null;
}

export async function getCustomerByID(id: string) {
  const customers = await getCustomers();
  return customers.find((item) => item.id === id) ?? null;
}

export async function getJobsForTechnician(id: string) {
  const jobs = await getJobs();
  return jobs.filter((job) => job.assignedTechnicianId === id);
}

export async function getJobsForCustomer(id: string) {
  const jobs = await getJobs();
  return jobs.filter((job) => job.customerId === id);
}
