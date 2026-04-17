export type JobStatus =
  | "awaiting_shop"
  | "awaiting_quote"
  | "awaiting_confirm"
  | "scheduled"
  | "on_the_way"
  | "in_progress"
  | "completed"
  | "cancelled";

export type LeadStatus = "new" | "quoted" | "converted" | "cancelled";
export type LeadSource = "line_oa" | "find_technician";
export type Availability = "available" | "busy";

export type TimelineItem = {
  label: string;
  time: string;
  done: boolean;
};

export type PhotoItem = {
  label: string;
  image: string;
  kind?: string;
};

export type QuoteItem = {
  label: string;
  qty: number;
  amount: number;
};

export type TechnicianSummary = {
  id: string;
  slug: string;
  name: string;
  shopName: string;
  storeKind?: "solo" | "shop";
  rating: number;
  reviewCount: number;
  experienceYears: number;
  area: string[];
  services: string[];
  startingPrice: number;
  availability: Availability;
  hours: string;
  phone: string;
  lineUrl: string;
  headline: string;
  image?: string;
};

export type TechnicianReview = {
  user: string;
  rating: number;
  comment: string;
};

export type TechnicianDetail = TechnicianSummary & {
  gallery: string[];
  reviews: TechnicianReview[];
};

export type LeadSummary = {
  id: string;
  userName: string;
  phone: string;
  area: string;
  serviceType: string;
  units: number;
  symptom: string;
  source: LeadSource;
  time: string;
  status: LeadStatus;
  assignedTechnicianId?: string;
};

export type LeadDetail = LeadSummary & {
  airUnits: Array<{
    brand: string;
    btu: string;
    symptom: string;
  }>;
};

export type JobSummary = {
  id: string;
  code: string;
  userId: string;
  userName: string;
  phone: string;
  area: string;
  address: string;
  serviceType: string;
  status: JobStatus;
  appointmentDate: string;
  appointmentTime: string;
  total: number;
  assignedTechnicianId: string;
  assignedTechnicianName: string;
  source: LeadSource;
  symptom: string;
  paymentStatus: string;
  note: string;
  timeline: TimelineItem[];
  photos: PhotoItem[];
  quoteItems: QuoteItem[];
  mapUrl?: string;
};

export type DashboardData = {
  kpis: Array<{
    label: string;
    value: string;
  }>;
  urgentJobs: Array<{
    code: string;
    user: string;
    time: string;
    status: string;
    assignedTechnicianId?: string;
  }>;
  todayJobs: JobSummary[];
  latestLeads: LeadSummary[];
};

export type ScheduleDay = {
  date: string;
  jobs: JobSummary[];
};

export type StoreSummary = {
  id: string;
  name: string;
  kind: "shop" | "solo";
  phone?: string;
  lineOaId?: string;
  logoUrl?: string;
  description?: string;
};

export type UserSummary = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  area: string;
  totalSpend: number;
  jobsCount: number;
  note: string;
};
