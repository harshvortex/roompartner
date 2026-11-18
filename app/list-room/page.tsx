"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_CITIES } from "@/lib/seed";
import { validateRoomListing } from "@/lib/validate";
import type { Room } from "@/lib/types";

const input = "w-full rounded-lg border p-2 text-sm";

export default function ListRoomPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", city: "Bengaluru", locality: "", rent: 10000, deposit: 20000, furnishing: "semi-furnished", bhk: "2BHK", ownerName: "", type: "room" });
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const save = () => {
    const errs = validateRoomListing(form);
    setErrors(errs);
    if (errs.length) return;
    const room: Room = { id: `room-${Date.now()}`, title: form.title, type: form.type as Room["type"], city: form.city, locality: form.locality, rent: form.rent, deposit: form.deposit, furnishing: form.furnishing as Room["furnishing"], bhk: form.bhk, availableFrom: "2026-12-01", genderPref: "any", foodPref: "flexible", smokingAllowed: false, petsAllowed: false, amenities: ["Wi-Fi"], photos: [], ownerName: form.ownerName, createdAt: new Date().toISOString().slice(0, 10) };
    const existing = JSON.parse(localStorage.getItem("rp-my-rooms") || "[]") as Room[];
    localStorage.setItem("rp-my-rooms", JSON.stringify([room, ...existing]));
    setDone(true);
  };
  if (done) return <div className="mx-auto max-w-xl empty-state shadow-sm"><h1 className="text-xl font-extrabold tracking-tight">Room listed ✓</h1><p className="mt-2 text-sm text-ink-600">Your room is live in demo mode with ₹0 brokerage. In production it goes to a manual review queue first.</p><button onClick={() => router.push("/rooms")} className="mt-4 btn-primary">View rooms →</button></div>;
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="page-title">List a room — ₹0 brokerage</h1>
      <div className="space-y-3 card">
        <label className="field-label">Title<input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Private room in 2BHK, HSR Layout" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="field-label">City<select className={input} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>{DEMO_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
          <label className="field-label">Locality<input className={input} value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} placeholder="HSR Layout" /></label>
          <label className="field-label">Rent (₹/mo)<input type="number" min={500} max={200000} className={input} value={form.rent} onChange={(e) => setForm({ ...form, rent: Number(e.target.value) })} /></label>
          <label className="field-label">Deposit (₹)<input type="number" min={0} max={2400000} className={input} value={form.deposit} onChange={(e) => setForm({ ...form, deposit: Number(e.target.value) })} /></label>
          <label className="field-label">Type<select className={input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="room">Room</option><option value="flat">Flat</option><option value="pg">PG</option></select></label>
          <label className="field-label">Furnishing<select className={input} value={form.furnishing} onChange={(e) => setForm({ ...form, furnishing: e.target.value })}><option value="furnished">Furnished</option><option value="semi-furnished">Semi-furnished</option><option value="unfurnished">Unfurnished</option></select></label>
          <label className="field-label">BHK<input className={input} value={form.bhk} onChange={(e) => setForm({ ...form, bhk: e.target.value })} /></label>
          <label className="field-label">Your name<input className={input} value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="Your name" /></label>
        </div>
        {errors.length > 0 && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <p className="font-semibold">Please fix the following:</p>
            <ul className="mt-1 list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
        )}
        <button onClick={save} className="btn-block">Publish room</button>
      </div>
    </div>
  );
}
