export type JobStatus =
  | "awaiting_shop"
  | "awaiting_quote"
  | "awaiting_confirm"
  | "scheduled"
  | "on_the_way"
  | "in_progress"
  | "completed"
  | "cancelled";

export type LeadSource = "line_oa" | "find_technician";

export type Technician = {
  id: string;
  slug: string;
  name: string;
  shopName: string;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  area: string[];
  services: string[];
  startingPrice: number;
  availability: "available" | "busy";
  hours: string;
  phone: string;
  lineUrl: string;
  headline: string;
  heroImage: string;
  gallery: string[];
};

export type Lead = {
  id: string;
  customerName: string;
  phone: string;
  area: string;
  serviceType: string;
  units: number;
  symptom: string;
  source: LeadSource;
  time: string;
  status: "new" | "quoted" | "converted";
  assignedTechnicianId?: string;
};

export type Job = {
  id: string;
  code: string;
  customerName: string;
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
  paymentStatus: "pending" | "paid";
  note: string;
  timeline: { label: string; time: string; done: boolean }[];
  photos: { label: string; image: string }[];
  quoteItems: { label: string; qty: number; amount: number }[];
};

export type StaffCustomer = {
  id: string;
  name: string;
  phone: string;
  area: string;
  totalSpend: number;
  jobsCount: number;
  note: string;
  lastService: string;
};

export const technicians: Technician[] = [
  {
    id: "tech-01",
    slug: "cool-care-bangkok",
    name: "ช่างบอย",
    shopName: "Cool Care Bangkok",
    rating: 4.9,
    reviewCount: 128,
    experienceYears: 12,
    area: ["ลาดพร้าว", "บางกะปิ", "วังทองหลาง"],
    services: ["ล้างแอร์", "ซ่อมแอร์", "เติมน้ำยา"],
    startingPrice: 650,
    availability: "available",
    hours: "ทุกวัน 08:00 - 20:00",
    phone: "089-000-1111",
    lineUrl: "https://line.me/R/ti/p/@coolcare",
    headline: "ช่างแอร์คอนโดและบ้าน ดูแลงานจบในรอบเดียวถ้าอะไหล่พร้อม",
    heroImage:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1621905252472-e8f124f25d4d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "tech-02",
    slug: "bluewind-service",
    name: "ช่างเจ",
    shopName: "Bluewind Service",
    rating: 4.8,
    reviewCount: 91,
    experienceYears: 8,
    area: ["บางนา", "พระโขนง", "อ่อนนุช"],
    services: ["ล้างแอร์", "ติดตั้ง", "ซ่อม"],
    startingPrice: 790,
    availability: "busy",
    hours: "จันทร์ - เสาร์ 09:00 - 18:30",
    phone: "081-555-2323",
    lineUrl: "https://line.me/R/ti/p/@bluewind",
    headline: "ทีมงานชัดเจน ตรงเวลา เหมาะกับงานติดตั้งและแก้ระบบ",
    heroImage:
      "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

export const leads: Lead[] = [
  {
    id: "lead-1201",
    customerName: "คุณมุก",
    phone: "089-000-1111",
    area: "ลาดพร้าว 71",
    serviceType: "ล้างแอร์",
    units: 2,
    symptom: "แอร์ไม่ค่อยเย็น มีน้ำหยด",
    source: "line_oa",
    time: "09:15",
    status: "new",
    assignedTechnicianId: "tech-01",
  },
  {
    id: "lead-1202",
    customerName: "คุณต้น",
    phone: "081-555-2323",
    area: "บางนา",
    serviceType: "ซ่อมแอร์",
    units: 1,
    symptom: "เปิดไม่ติด",
    source: "find_technician",
    time: "10:10",
    status: "quoted",
    assignedTechnicianId: "tech-02",
  },
  {
    id: "lead-1203",
    customerName: "คุณแพรว",
    phone: "094-882-1144",
    area: "รามคำแหง",
    serviceType: "เติมน้ำยา",
    units: 1,
    symptom: "เย็นช้า เสียงดัง",
    source: "find_technician",
    time: "11:40",
    status: "converted",
    assignedTechnicianId: "tech-01",
  },
];

export const jobs: Job[] = [
  {
    id: "job-2048",
    code: "JOB-2048",
    customerName: "คุณแพร",
    phone: "095-232-4444",
    area: "รามคำแหง",
    address: "คอนโด The Base ชั้น 9 ห้อง 912",
    serviceType: "ล้างแอร์",
    status: "scheduled",
    appointmentDate: "17 เม.ย. 2026",
    appointmentTime: "13:00 - 15:00",
    total: 1800,
    assignedTechnicianId: "tech-01",
    assignedTechnicianName: "ช่างบอย",
    source: "find_technician",
    symptom: "มีน้ำหยดจากเครื่องในห้องนอน",
    paymentStatus: "pending",
    note: "นิติบุคคลให้แลกบัตรก่อนเข้าตึก",
    timeline: [
      { label: "รับคำขอแล้ว", time: "16 เม.ย. 09:12", done: true },
      { label: "ส่งใบเสนอราคา", time: "16 เม.ย. 09:40", done: true },
      { label: "ลูกค้ายืนยัน", time: "16 เม.ย. 10:05", done: true },
      { label: "นัดหมายแล้ว", time: "16 เม.ย. 10:15", done: true },
      { label: "ช่างกำลังเดินทาง", time: "รออัปเดต", done: false },
      { label: "งานเสร็จแล้ว", time: "รออัปเดต", done: false },
    ],
    photos: [
      {
        label: "ก่อนล้าง",
        image:
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      },
      {
        label: "หลังล้าง",
        image:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
      },
    ],
    quoteItems: [
      { label: "ล้างแอร์ 9,000 - 12,000 BTU", qty: 2, amount: 1800 },
    ],
  },
  {
    id: "job-2049",
    code: "JOB-2049",
    customerName: "คุณนนท์",
    phone: "098-555-8888",
    area: "อ่อนนุช",
    address: "บ้านเลขที่ 88 หมู่บ้านสวนหลวง",
    serviceType: "เติมน้ำยา",
    status: "on_the_way",
    appointmentDate: "16 เม.ย. 2026",
    appointmentTime: "16:00 - 17:00",
    total: 1500,
    assignedTechnicianId: "tech-02",
    assignedTechnicianName: "ช่างเจ",
    source: "line_oa",
    symptom: "คอมเพรสเซอร์ทำงาน แต่ไม่เย็น",
    paymentStatus: "pending",
    note: "เข้าซอยลึก โทรก่อนถึง 10 นาที",
    timeline: [
      { label: "รับคำขอแล้ว", time: "16 เม.ย. 08:30", done: true },
      { label: "ส่งใบเสนอราคา", time: "16 เม.ย. 08:50", done: true },
      { label: "ลูกค้ายืนยัน", time: "16 เม.ย. 09:05", done: true },
      { label: "นัดหมายแล้ว", time: "16 เม.ย. 09:10", done: true },
      { label: "ช่างกำลังเดินทาง", time: "16 เม.ย. 15:35", done: true },
      { label: "งานเสร็จแล้ว", time: "รออัปเดต", done: false },
    ],
    photos: [
      {
        label: "เครื่องลูกค้า",
        image:
          "https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=800&q=80",
      },
      {
        label: "หลังตรวจเช็ก",
        image:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
      },
    ],
    quoteItems: [{ label: "เติมน้ำยาแอร์", qty: 1, amount: 1500 }],
  },
];

export const staffCustomers: StaffCustomer[] = [
  {
    id: "cust-01",
    name: "คุณแพร",
    phone: "095-232-4444",
    area: "รามคำแหง",
    totalSpend: 4200,
    jobsCount: 3,
    note: "คอนโด มีที่จอด visitor จำกัด",
    lastService: "17 เม.ย. 2026",
  },
  {
    id: "cust-02",
    name: "คุณนนท์",
    phone: "098-555-8888",
    area: "อ่อนนุช",
    totalSpend: 1500,
    jobsCount: 1,
    note: "สะดวกคุยผ่าน LINE มากกว่าโทร",
    lastService: "16 เม.ย. 2026",
  },
];

export const dashboard = {
  kpis: [
    { label: "Lead ใหม่วันนี้", value: "7" },
    { label: "งานกำลังทำ", value: "5" },
    { label: "ใบเสนอราคาค้าง", value: "3" },
    { label: "งานเสร็จแล้ว", value: "18" },
    { label: "รายได้เดือนนี้", value: "84,200" },
  ],
  urgentJobs: [
    { code: "JOB-2049", customer: "คุณนนท์", time: "16:00", status: "กำลังไป" },
    { code: "JOB-2051", customer: "คุณฟ้า", time: "18:30", status: "รอยืนยัน" },
  ],
};

export function getTechnician(slug: string) {
  return technicians.find((item) => item.slug === slug);
}

export function getTechnicianById(id: string) {
  return technicians.find((item) => item.id === id);
}

export function getJob(id: string) {
  return jobs.find((item) => item.id === id);
}

export function getLead(id: string) {
  return leads.find((item) => item.id === id);
}

export function getCustomer(id: string) {
  return staffCustomers.find((item) => item.id === id);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);
}
