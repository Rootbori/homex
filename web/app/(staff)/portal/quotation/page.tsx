import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TopAppBar } from "@/components/shared/top-app-bar";

const presets = [
  { label: "ล้างแอร์ 9-12k BTU", price: "฿600", tone: "primary" },
  { label: "เติมน้ำยา R32/R410", price: "฿450", tone: "secondary" },
  { label: "ซ่อมคอมฯ Compressor", price: "฿2,500", tone: "tertiary" },
];

export default function QuotationPage() {
  return (
    <div>
      <TopAppBar
        title="สร้างใบเสนอราคา"
        left={
          <button className="rounded-full p-2 text-on-surface transition-transform active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
        }
        right={
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary">
            คน
          </div>
        }
      />
      <main className="mt-20 space-y-6 px-4">
        <section className="pb-4 pt-8">
          <p className="font-medium text-on-surface-variant">เลขที่เอกสาร: QT-20231027</p>
          <h2 className="headline-font text-4xl font-extrabold leading-tight tracking-tight text-on-surface">
            Precision
            <br />
            Quotation
          </h2>
        </section>

        <section className="space-y-4">
          <h3 className="px-1 text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
            เลือกบริการด่วน
          </h3>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {presets.map((preset) => (
              <div
                key={preset.label}
                className="w-40 flex-shrink-0 rounded-xl bg-surface-container-lowest p-4 shadow-sm"
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${
                    preset.tone === "primary"
                      ? "bg-primary-fixed text-primary"
                      : preset.tone === "secondary"
                        ? "bg-secondary-container text-secondary"
                        : "bg-tertiary-fixed text-tertiary"
                  }`}
                >
                  ◎
                </div>
                <p className="text-sm font-bold leading-tight text-on-surface">{preset.label}</p>
                <p
                  className={`mt-2 font-bold ${
                    preset.tone === "primary"
                      ? "text-primary"
                      : preset.tone === "secondary"
                        ? "text-secondary"
                        : "text-tertiary"
                  }`}
                >
                  {preset.price}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6 rounded-[2rem] bg-surface-container-low p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-on-surface">รายการที่เลือก</h3>
            <button className="text-sm font-semibold text-primary">เพิ่มรายการเอง</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-border/15 pb-4">
              <div className="space-y-1">
                <p className="font-bold text-on-surface">ล้างแอร์ 9000-12000 BTU</p>
                <p className="text-xs text-on-surface-variant">จำนวน: 2 เครื่อง x ฿600</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-on-surface">฿1,200</p>
                <button className="mt-1 text-xs text-error">ลบออก</button>
              </div>
            </div>
            <div className="flex items-start justify-between border-b border-border/15 pb-4">
              <div className="space-y-1">
                <p className="font-bold text-on-surface">เติมน้ำยาแอร์ R32</p>
                <p className="text-xs text-on-surface-variant">จำนวน: 1 รายการ</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-on-surface">฿450</p>
                <button className="mt-1 text-xs text-error">ลบออก</button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="ml-1 text-xs font-semibold uppercase text-on-surface-variant">
                ส่วนลด (฿)
              </label>
              <Input placeholder="0.00" type="number" />
            </div>
            <div className="space-y-1">
              <label className="ml-1 text-xs font-semibold uppercase text-on-surface-variant">
                ภาษี (%)
              </label>
              <select className="h-14 w-full rounded-xl border-none bg-surface-container-lowest px-4 text-on-surface outline-none focus:ring-2 focus:ring-primary">
                <option>7%</option>
                <option>0%</option>
                <option>หัก ณ ที่จ่าย 3%</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="ml-1 text-xs font-semibold uppercase text-on-surface-variant">
              บันทึกภายใน
            </label>
            <Textarea placeholder="ระบุรายละเอียดเพิ่มเติมสำหรับทีมงาน..." rows={2} />
          </div>
        </section>

        <section className="rounded-[2rem] bg-primary p-8 text-on-primary shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between opacity-80">
              <span className="text-sm">ยอดรวมรายการ</span>
              <span className="font-semibold">฿1,650.00</span>
            </div>
            <div className="flex items-center justify-between opacity-80">
              <span className="text-sm">ส่วนลด</span>
              <span className="font-semibold">-฿0.00</span>
            </div>
            <div className="flex items-center justify-between opacity-80">
              <span className="text-sm">ภาษีมูลค่าเพิ่ม (7%)</span>
              <span className="font-semibold">฿115.50</span>
            </div>
            <div className="flex items-end justify-between border-t border-white/20 pt-4">
              <span className="text-lg font-bold">ยอดรวมทั้งสิ้น</span>
              <span className="text-3xl font-extrabold tracking-tight">฿1,765.50</span>
            </div>
          </div>
        </section>
      </main>

      <div className="glass-bar fixed bottom-0 left-0 z-50 w-full p-4">
        <Button className="h-14 w-full font-bold">
          <Send className="h-5 w-5" />
          ส่งใบเสนอราคา (Send via LINE)
        </Button>
      </div>
    </div>
  );
}
