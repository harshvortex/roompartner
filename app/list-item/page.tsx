"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_CITIES } from "@/lib/seed";
import { validateRentalItem } from "@/lib/validate";
import type { RentalItem } from "@/lib/types";

const input = "w-full rounded-lg border p-2 text-sm";

export default function ListItemPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", category: "furniture", pricePerMonth: 499, deposit: 998, city: "Bengaluru", locality: "", ownerName: "" });
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const save = () => {
    const errs = validateRentalItem(form);
    setErrors(errs);
    if (errs.length) return;
    const item: RentalItem = { id: `rent-${Date.now()}`, title: form.title, category: form.category as RentalItem["category"], pricePerMonth: form.pricePerMonth, deposit: form.deposit, condition: "good", city: form.city, locality: form.locality, ownerName: form.ownerName, photos: [], createdAt: new Date().toISOString().slice(0, 10) };
    const existing = JSON.parse(localStorage.getItem("rp-my-rentals") || "[]") as RentalItem[];
    localStorage.setItem("rp-my-rentals", JSON.stringify([item, ...existing]));
    setDone(true);
  };
  if (done) return <div className="mx-auto max-w-xl empty-state shadow-sm"><h1 className="text-xl font-extrabold tracking-tight">Rental item listed ✓</h1><p className="mt-2 text-sm text-ink-600">Your item is live in demo mode. Start with small, low-risk items first — iron, induction, vacuum, cycle, chair — before appliances.</p><button onClick={() => router.push("/rentals")} className="mt-4 btn-primary">View rentals →</button></div>;
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="page-title">List a rental item</h1>
      <p className="text-sm text-ink-500">Rent out something you already own — neighbours pay monthly, you keep the item.</p>
      <div className="space-y-3 card">
        <label className="field-label">Item<input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Queen bed with storage" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="field-label">Category<select className={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="furniture">Furniture</option><option value="appliance">Appliance</option><option value="electronics">Electronics</option><option value="daily">Daily needs</option></select></label>
          <label className="field-label">City<select className={input} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>{DEMO_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
          <label className="field-label">Locality<input className={input} value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} placeholder="HSR Layout" /></label>
          <label className="field-label">Your name<input className={input} value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="Your name" /></label>
          <label className="field-label">Rent (₹/mo)<input type="number" min={50} max={50000} className={input} value={form.pricePerMonth} onChange={(e) => setForm({ ...form, pricePerMonth: Number(e.target.value) })} /></label>
          <label className="field-label">Deposit (₹)<input type="number" min={0} max={600000} className={input} value={form.deposit} onChange={(e) => setForm({ ...form, deposit: Number(e.target.value) })} /></label>
        </div>
        {errors.length > 0 && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <p className="font-semibold">Please fix the following:</p>
            <ul className="mt-1 list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
        )}
        <button onClick={save} className="btn-block">Publish item</button>
      </div>
    </div>
  );
}
