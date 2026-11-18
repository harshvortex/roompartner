"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile, useChecklist } from "@/lib/store";
import { DEMO_CITIES } from "@/lib/seed";
import { validateProfile } from "@/lib/validate";
import type { MyProfile } from "@/lib/types";

const input = "w-full rounded-lg border p-2 text-sm";

export default function OnboardingPage() {
  const [profile, setProfile] = useProfile();
  const [, setChecklist] = useChecklist();
  const [form, setForm] = useState<MyProfile>(profile);
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();
  const set = <K extends keyof MyProfile>(k: K, v: MyProfile[K]) => setForm({ ...form, [k]: v });
  const save = () => {
    const errs = validateProfile(form);
    setErrors(errs);
    if (errs.length) return;
    setProfile(form);
    setChecklist((c) => Array.from(new Set([...c, "profile"])));
    router.push("/flatmates");
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="page-title">Complete your match profile</h1>
      <p className="text-sm text-ink-500">2 minutes. This drives your % match scores — nothing is shared until you send an interest.</p>
      <div className="space-y-3 card">
        <label className="field-label">Name<input className={input} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="field-label">Age<input type="number" min={18} max={70} className={input} value={form.age} onChange={(e) => set("age", Number(e.target.value))} /></label>
          <label className="field-label">Gender
            <select className={input} value={form.gender} onChange={(e) => set("gender", e.target.value as MyProfile["gender"])}><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select></label>
          <label className="field-label">City
            <select className={input} value={form.city} onChange={(e) => set("city", e.target.value)}><option value="">Choose a city</option>{DEMO_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
          <label className="field-label">Occupation<input className={input} value={form.occupation} onChange={(e) => set("occupation", e.target.value)} placeholder="e.g. Software Engineer" /></label>
          <label className="field-label">Budget min (₹/mo)<input type="number" min={500} max={200000} className={input} value={form.budgetMin} onChange={(e) => set("budgetMin", Number(e.target.value))} /></label>
          <label className="field-label">Budget max (₹/mo)<input type="number" min={500} max={200000} className={input} value={form.budgetMax} onChange={(e) => set("budgetMax", Number(e.target.value))} /></label>
          <label className="field-label">Move-in date<input type="date" className={input} value={form.moveInDate} onChange={(e) => set("moveInDate", e.target.value)} /></label>
          <label className="field-label">Food
            <select className={input} value={form.food} onChange={(e) => set("food", e.target.value as MyProfile["food"])}><option value="veg">Veg</option><option value="non-veg">Non-veg</option><option value="flexible">Flexible</option></select></label>
          <label className="field-label">Smoking
            <select className={input} value={form.smoking} onChange={(e) => set("smoking", e.target.value as MyProfile["smoking"])}><option value="no">No</option><option value="yes">Yes</option></select></label>
          <label className="field-label">Sleep time<input type="time" className={input} value={form.sleepTime} onChange={(e) => set("sleepTime", e.target.value)} /></label>
          <label className="field-label">Wake time<input type="time" className={input} value={form.wakeTime} onChange={(e) => set("wakeTime", e.target.value)} /></label>
          <label className="field-label">Cleanliness (1–5)<input type="range" min={1} max={5} value={form.cleanliness} onChange={(e) => set("cleanliness", Number(e.target.value))} className="w-full accent-brand-600" /><span className="text-sm text-ink-800">{form.cleanliness}/5</span></label>
          <label className="field-label">Work hours
            <select className={input} value={form.workHours} onChange={(e) => set("workHours", e.target.value)}><option value="9-6">9–6</option><option value="night">Night shift</option><option value="flexible">Flexible</option></select></label>
          <label className="field-label">Work from home
            <select className={input} value={form.wfh} onChange={(e) => set("wfh", e.target.value as MyProfile["wfh"])}><option value="yes">Yes</option><option value="no">No</option></select></label>
          <label className="field-label">Pets
            <select className={input} value={form.pets} onChange={(e) => set("pets", e.target.value as MyProfile["pets"])}><option value="no">No</option><option value="yes">Yes</option></select></label>
          <label className="field-label">Guests OK
            <select className={input} value={form.guestsOk} onChange={(e) => set("guestsOk", e.target.value as MyProfile["guestsOk"])}><option value="yes">Yes</option><option value="no">No</option></select></label>
        </div>
        <label className="field-label">About you<textarea rows={3} className={input} value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="A line or two about how you live…" /></label>
        {errors.length > 0 && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <p className="font-semibold">Please fix the following:</p>
            <ul className="mt-1 list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
        )}
        <button onClick={save} className="btn-block">Save profile & see my matches →</button>
      </div>
    </div>
  );
}
