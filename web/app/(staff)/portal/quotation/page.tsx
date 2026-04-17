import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { InputField } from "@/components/ui/input-field";
import { TextareaField } from "@/components/ui/textarea-field";

const presets = [
  { label: "ล้างแอร์ 9-12k BTU", price: "฿600" },
  { label: "เติมน้ำยา R32/R410", price: "฿450" },
  { label: "ซ่อมคอมเพรสเซอร์", price: "฿2,500" },
];

export default function QuotationPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link
            href="/portal/leads"
            className="text-on-surface-variant/50 hover:text-on-surface"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-on-surface">ใบเสนอราคา</h1>
            <p className="text-[11px] text-on-surface-variant/40">
              QT-20231027
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Quick presets */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-on-surface">เลือกบริการด่วน</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {presets.map((preset) => (
              <button
                key={preset.label}
                className="flex min-w-[140px] shrink-0 flex-col gap-1 rounded-xl bg-surface-container-low p-3 text-left transition-colors hover:bg-surface-container"
              >
                <span className="text-sm font-semibold text-on-surface">
                  {preset.label}
                </span>
                <span className="text-xs font-bold text-primary">
                  {preset.price}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Items */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface">รายการ</h2>
            <button className="text-xs font-semibold text-primary">
              + เพิ่มรายการ
            </button>
          </div>

          <div className="rounded-2xl bg-surface-container-low p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold text-on-surface">
                  ล้างแอร์ 9000-12000 BTU
                </p>
                <p className="text-xs text-on-surface-variant/40">
                  2 เครื่อง x ฿600
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-on-surface">฿1,200</p>
                <button className="text-[11px] text-red-400">ลบ</button>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-black/[0.04] pt-3 text-sm">
              <div>
                <p className="font-semibold text-on-surface">
                  เติมน้ำยาแอร์ R32
                </p>
                <p className="text-xs text-on-surface-variant/40">1 รายการ</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-on-surface">฿450</p>
                <button className="text-[11px] text-red-400">ลบ</button>
              </div>
            </div>
          </div>
        </section>

        {/* Options */}
        <section className="grid grid-cols-2 gap-2">
          <InputField
            id="discount"
            type="number"
            label="ส่วนลด (฿)"
            placeholder="0.00"
            containerClassName="w-full"
          />
          <div className="space-y-1.5">
            <label
              htmlFor="tax"
              className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/40"
            >
              ภาษี
            </label>
            <select
              id="tax"
              className="h-10 w-full rounded-xl bg-surface-container-low px-3 text-sm outline-none focus:ring-2 focus:ring-primary/10"
            >
              <option>7%</option>
              <option>0%</option>
              <option>หัก ณ ที่จ่าย 3%</option>
            </select>
          </div>
        </section>

        <TextareaField
          id="note"
          label="บันทึกภายใน"
          placeholder="หมายเหตุสำหรับทีมงาน..."
          rows={2}
        />

        {/* Total */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 p-5 text-white">
          <div className="space-y-1.5 text-sm opacity-80">
            <div className="flex justify-between">
              <span>ยอดรวมรายการ</span>
              <span>฿1,650.00</span>
            </div>
            <div className="flex justify-between">
              <span>ส่วนลด</span>
              <span>-฿0.00</span>
            </div>
            <div className="flex justify-between">
              <span>ภาษี (7%)</span>
              <span>฿115.50</span>
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between border-t border-white/20 pt-3">
            <span className="font-bold">ยอดรวมทั้งสิ้น</span>
            <span className="text-2xl font-extrabold">฿1,765.50</span>
          </div>
        </div>

        {/* CTA */}
        <div className="pb-4">
          <button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-on-surface text-sm font-bold text-white transition-all hover:bg-on-surface/90 active:scale-[0.98]">
            <Send className="h-4 w-4" />
            ส่งใบเสนอราคา
          </button>
        </div>
      </main>
    </div>
  );
}
