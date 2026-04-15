import { ArrowLeft, CalendarDays, ImagePlus, Send, User, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { technicians } from "@/lib/mock-data";

const btuOptions = ["9,000", "12,000", "18,000", "24,000+"];

export default function CreateRequestPage() {
  return (
    <div>
      <TopAppBar
        title="Atmospheric"
        left={
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-transform active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
        }
        right={<ProfileBubble image={technicians[0]?.heroImage} />}
      />
      <main className="mt-24 max-w-lg px-6">
        <section className="mb-12 pt-8">
          <h1 className="headline-font text-4xl font-extrabold leading-tight tracking-tight text-on-surface">
            จองบริการ
            <br />
            <span className="text-primary">ดูแลความเย็น</span>
          </h1>
          <p className="mt-4 font-medium text-on-surface-variant opacity-80">
            เปลี่ยนบรรยากาศในบ้านให้สดชื่น ด้วยทีมช่างมืออาชีพที่ผ่านการรับรอง
          </p>
        </section>

        <form className="space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h2 className="headline-font text-xl font-bold text-on-surface">ข้อมูลผู้ติดต่อ</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  ชื่อ-นามสกุล
                </label>
                <Input placeholder="สมชาย มั่นใจ" />
              </div>
              <div className="space-y-1.5">
                <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  เบอร์โทรศัพท์
                </label>
                <Input placeholder="08x-xxx-xxxx" type="tel" />
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              <h2 className="headline-font text-xl font-bold text-on-surface">
                รายละเอียดเครื่องปรับอากาศ
              </h2>
            </div>
            <div className="space-y-4">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                ขนาดเครื่อง (BTU)
              </label>
              <div className="flex flex-wrap gap-2">
                {btuOptions.map((item, index) => (
                  <button
                    key={item}
                    className={
                      index === 0
                        ? "scale-95 rounded-full bg-primary px-6 py-3 font-bold text-on-primary shadow-lg shadow-primary/20"
                        : "rounded-full bg-surface-container-highest px-6 py-3 font-semibold text-on-surface-variant"
                    }
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                ประเภทแอร์
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-primary bg-surface-container-lowest p-4 text-center">
                  <Wrench className="h-7 w-7 text-primary" />
                  <span className="font-bold text-on-surface">ติดผนัง</span>
                </div>
                <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent bg-surface-container-low p-4 text-center opacity-60 grayscale">
                  <CalendarDays className="h-7 w-7" />
                  <span className="font-bold text-on-surface">แขวน/ฝังฝ้า</span>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="px-1 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                ยี่ห้อ (ถ้าทราบ)
              </label>
              <Input placeholder="ระบุยี่ห้อแอร์ เช่น Daikin, Mitsubishi" />
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              <h2 className="headline-font text-xl font-bold text-on-surface">อาการเบื้องต้น</h2>
            </div>
            <div className="space-y-4">
              <Textarea
                className="resize-none"
                placeholder="ระบุอาการ เช่น แอร์ไม่เย็น, มีเสียงดัง, น้ำหยด..."
                rows={4}
              />
              <div className="space-y-3">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  แนบรูปภาพอาการ (ไม่บังคับ)
                </label>
                <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
                  <label className="flex h-24 w-24 flex-shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface-container-high text-on-surface-variant transition-colors">
                    <input className="hidden" type="file" />
                    <ImagePlus className="h-7 w-7" />
                    <span className="mt-1 text-[10px] font-bold">เพิ่มรูป</span>
                  </label>
                  <div
                    className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-surface-container-high"
                    style={{
                      backgroundImage: `url(${technicians[0]?.gallery[0]})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6 pb-12">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h2 className="headline-font text-xl font-bold text-on-surface">วันและเวลาที่สะดวก</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant">
                    เลือกวันที่
                  </p>
                  <input
                    className="w-full bg-transparent p-0 font-bold text-on-surface outline-none"
                    type="date"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant">
                    เลือกเวลา
                  </p>
                  <input
                    className="w-full bg-transparent p-0 font-bold text-on-surface outline-none"
                    type="time"
                  />
                </div>
              </div>
            </div>
          </section>
        </form>
      </main>

      <div className="glass-bar fixed bottom-0 left-0 z-40 w-full p-6">
        <Button className="h-16 w-full text-lg font-bold">
          ส่งคำขอใช้บริการ
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
