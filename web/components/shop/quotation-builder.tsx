"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, Mail, Plus, Save, Send, Trash2 } from "lucide-react";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { TextareaField } from "@/components/ui/textarea-field";
import { formatCurrency } from "@/lib/format";
import type { UserSummary } from "@/lib/api-types";

type QuoteItem = {
  id: string;
  label: string;
  quantity: number;
  unitPrice: number;
};

type QuotationBuilderProps = {
  customers: UserSummary[];
  storeName: string;
};

const presetItems = [
  { label: "ล้างแอร์ 9,000-12,000 BTU", unitPrice: 600 },
  { label: "ล้างแอร์ 12,000-24,000 BTU", unitPrice: 750 },
  { label: "เติมน้ำยา R32/R410", unitPrice: 450 },
  { label: "ซ่อมแอร์ / ตรวจเช็กอาการ", unitPrice: 900 },
  { label: "ติดตั้งแอร์ใหม่", unitPrice: 3500 },
];

function newItem(label = "", unitPrice = 0): QuoteItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    quantity: 1,
    unitPrice,
  };
}

export function QuotationBuilder({ customers, storeName }: Readonly<QuotationBuilderProps>) {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState("");
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [result, setResult] = useState<{
    type: "idle" | "error" | "success";
    message?: string;
    code?: string;
    gmailUrl?: string;
  }>({ type: "idle" });
  const [isPending, startTransition] = useTransition();

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items],
  );
  const total = Math.max(0, subtotal - discount);

  function handleCustomerChange(value: string) {
    setSelectedUserId(value);
    const customer = customers.find((item) => item.id === value);
    if (!customer) {
      return;
    }

    setRecipientName(customer.name);
    setRecipientEmail(customer.email ?? "");
  }

  function addPreset(label: string, unitPrice: number) {
    setItems((current) => [...current, newItem(label, unitPrice)]);
  }

  function updateItem(id: string, patch: Partial<QuoteItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function addCustomItem() {
    setItems((current) => [...current, newItem()]);
  }

  function goBack() {
    if (globalThis.window !== undefined && globalThis.window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/portal/more");
  }

  function submit(sendViaEmail: boolean) {
    const normalizedItems = items
      .map((item) => ({
        label: item.label.trim(),
        quantity: Math.max(1, item.quantity),
        unit_price: Math.max(0, item.unitPrice),
      }))
      .filter((item) => item.label.length > 0);

    if (!recipientName.trim() || !recipientEmail.trim() || normalizedItems.length === 0) {
      setResult({
        type: "error",
        message: "กรอกชื่อผู้รับ, อีเมล และรายการอย่างน้อย 1 รายการก่อน",
      });
      return;
    }

    const popup =
      sendViaEmail && globalThis.window !== undefined
        ? globalThis.window.open("about:blank", "_blank", "noopener,noreferrer")
        : null;

    startTransition(async () => {
      setResult({ type: "idle" });

      try {
        const response = await fetch("/api/app/quotations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient_name: recipientName.trim(),
            recipient_email: recipientEmail.trim(),
            discount,
            note: note.trim(),
            send_via_email: sendViaEmail,
            items: normalizedItems,
          }),
        });

        const payload = (await response.json()) as {
          error?: string;
          message?: string;
          quotation?: { code?: string };
          email_preview?: { gmail_url?: string };
        };

        if (!response.ok) {
          popup?.close();
          setResult({
            type: "error",
            message: payload.message ?? payload.error ?? "ยังบันทึกใบเสนอราคาไม่สำเร็จ",
          });
          return;
        }

        const gmailUrl = payload.email_preview?.gmail_url;
        if (sendViaEmail && gmailUrl) {
          if (popup) {
            popup.location.href = gmailUrl;
          } else {
            globalThis.window.open(gmailUrl, "_blank", "noopener,noreferrer");
          }
        } else {
          popup?.close();
        }

        setResult({
          type: "success",
          message: payload.message ?? "บันทึกใบเสนอราคาเรียบร้อยแล้ว",
          code: payload.quotation?.code,
          gmailUrl,
        });
      } catch {
        popup?.close();
        setResult({
          type: "error",
          message: "ยังเชื่อมต่อระบบเพื่อสร้างใบเสนอราคาไม่สำเร็จ",
        });
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4">
          <button
            type="button"
            onClick={goBack}
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant/50 transition-colors hover:bg-surface-container-low hover:text-on-surface active:bg-surface-container"
            aria-label="กลับหน้าก่อนหน้า"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-on-surface">ใบเสนอราคา</h1>
            <p className="text-[11px] text-on-surface-variant/40">
              บันทึกรายการของ {storeName} แล้วเปิด Gmail พร้อมเนื้อหาอีเมลให้ทันที
            </p>
          </div>
        </div>
      </header>

      <main className="space-y-6 px-4 py-6">
        <section className="rounded-2xl bg-surface-container-low p-4 text-sm leading-6 text-on-surface-variant">
          รายชื่อลูกค้าด้านล่างดึงเฉพาะลูกค้าที่อยู่ในร้าน <span className="font-semibold text-on-surface">{storeName}</span> เท่านั้น
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-black/[0.04]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                id="selected_user"
                label="ลูกค้าในระบบ"
                value={selectedUserId}
                onChange={(event) => handleCustomerChange(event.target.value)}
                placeholder="เลือกจากรายชื่อลูกค้า"
                options={customers.map((customer) => ({
                  value: customer.id,
                  label: customer.email ? `${customer.name} • ${customer.email}` : customer.name,
                }))}
              />

              <InputField
                id="recipient_email"
                type="email"
                label="อีเมลผู้รับ"
                required
                value={recipientEmail}
                onChange={(event) => setRecipientEmail(event.target.value)}
                placeholder="customer@gmail.com"
              />
            </div>

            <InputField
              id="recipient_name"
              type="text"
              label="ชื่อผู้รับ"
              required
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              placeholder="ชื่อลูกค้าหรือชื่อผู้ติดต่อ"
            />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface">บริการด่วน</h2>
            <button
              type="button"
              onClick={addCustomItem}
              className="text-xs font-semibold text-primary"
            >
              + เพิ่มรายการเอง
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {presetItems.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => addPreset(preset.label, preset.unitPrice)}
                className="flex min-w-[170px] shrink-0 flex-col gap-1 rounded-xl bg-surface-container-low p-3 text-left transition-colors hover:bg-surface-container"
              >
                <span className="text-sm font-semibold text-on-surface">{preset.label}</span>
                <span className="text-xs font-bold text-primary">{formatCurrency(preset.unitPrice)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-black/[0.04]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface">รายการใบเสนอราคา</h2>
            <button type="button" onClick={addCustomItem} className="text-xs font-semibold text-primary">
              <Plus className="mr-1 inline h-3.5 w-3.5" />
              เพิ่มรายการ
            </button>
          </div>

          <div className="space-y-4">
            {items.length > 0 ? (
              items.map((item, index) => {
                const amount = item.quantity * item.unitPrice;
                return (
                  <div key={item.id} className="rounded-2xl bg-surface-container-low p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-on-surface">รายการ {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-on-surface-variant/50 transition-colors hover:text-red-500"
                        aria-label={`ลบรายการ ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[1.8fr,0.7fr,1fr]">
                      <InputField
                        id={`label-${item.id}`}
                        type="text"
                        label="รายการ"
                        value={item.label}
                        onChange={(event) => updateItem(item.id, { label: event.target.value })}
                        placeholder="เช่น ล้างแอร์ 12,000 BTU"
                      />
                      <InputField
                        id={`qty-${item.id}`}
                        type="number"
                        min={1}
                        label="จำนวน"
                        value={String(item.quantity)}
                        onChange={(event) =>
                          updateItem(item.id, { quantity: Number(event.target.value || 1) })
                        }
                      />
                      <InputField
                        id={`price-${item.id}`}
                        type="number"
                        min={0}
                        label="ราคา/หน่วย"
                        value={String(item.unitPrice)}
                        onChange={(event) =>
                          updateItem(item.id, { unitPrice: Number(event.target.value || 0) })
                        }
                      />
                    </div>

                    <div className="mt-3 text-right text-sm font-bold text-on-surface">
                      รวมรายการนี้ {formatCurrency(amount)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl bg-surface-container-low px-4 py-8 text-center">
                <p className="text-sm font-semibold text-on-surface">ยังไม่มีรายการในใบเสนอราคา</p>
                <p className="mt-1 text-xs leading-6 text-on-surface-variant">
                  กดเพิ่มรายการเอง หรือเลือกจากบริการด่วนด้านบนได้เลย
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <InputField
            id="discount"
            type="number"
            min={0}
            label="ส่วนลด (บาท)"
            value={String(discount)}
            onChange={(event) => setDiscount(Number(event.target.value || 0))}
          />
          <TextareaField
            id="quotation_note"
            label="หมายเหตุ"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="เช่น ราคานี้รวมค่าแรงแล้ว / รับประกันงาน 30 วัน"
          />
        </section>

        <section className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 p-5 text-white">
          <div className="space-y-2 text-sm text-white/80">
            <div className="flex justify-between">
              <span>ยอดรวมรายการ</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>ส่วนลด</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between border-t border-white/20 pt-3">
            <span className="font-bold">ยอดรวมทั้งสิ้น</span>
            <span className="text-2xl font-extrabold">{formatCurrency(total)}</span>
          </div>
        </section>

        {result.type === "idle" ? null : (
          <section
            className={`rounded-2xl p-4 text-sm ${
              result.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-[rgba(186,26,26,0.08)] text-error"
            }`}
          >
            <p>{result.message}</p>
            {result.code ? <p className="mt-1 font-semibold">เลขที่ใบเสนอราคา: {result.code}</p> : null}
            {result.type === "success" && result.gmailUrl ? (
              <a
                href={result.gmailUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 font-semibold underline"
              >
                <Mail className="h-4 w-4" />
                เปิด Gmail อีกครั้ง
              </a>
            ) : null}
          </section>
        )}

        <div className="grid gap-3 pb-4 md:grid-cols-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => submit(false)}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-surface-container-low text-sm font-bold text-on-surface transition-all hover:bg-surface-container active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            บันทึกร่าง
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => submit(true)}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-on-surface text-sm font-bold text-white transition-all hover:bg-on-surface/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            บันทึกและเปิด Gmail
          </button>
        </div>
      </main>
    </div>
  );
}
