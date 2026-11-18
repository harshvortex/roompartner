"use client";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useProfile, useChecklist } from "@/lib/store";
import { DEMO_CITIES } from "@/lib/seed";
import { validateProfile } from "@/lib/validate";
import type { MyProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const field = (label: string, children: ReactNode) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="page-title">Complete your match profile</h1>
      <p className="text-sm text-ink-500">2 minutes. This drives your % match scores — nothing is shared until you send an interest.</p>
      <Card className="space-y-3 p-5">
        {field("Name", <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" />)}
        <div className="grid grid-cols-2 gap-3">
          {field("Age", <Input type="number" min={18} max={70} value={form.age} onChange={(e) => set("age", Number(e.target.value))} />)}
          {field("Gender", (
            <Select value={form.gender} onValueChange={(v) => set("gender", v as MyProfile["gender"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          ))}
          {field("City", (
            <Select value={form.city || "none"} onValueChange={(v) => set("city", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Choose a city" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Choose a city</SelectItem>
                {DEMO_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          ))}
          {field("Occupation", <Input value={form.occupation} onChange={(e) => set("occupation", e.target.value)} placeholder="e.g. Software Engineer" />)}
          {field("Budget min (₹/mo)", <Input type="number" min={500} max={200000} value={form.budgetMin} onChange={(e) => set("budgetMin", Number(e.target.value))} />)}
          {field("Budget max (₹/mo)", <Input type="number" min={500} max={200000} value={form.budgetMax} onChange={(e) => set("budgetMax", Number(e.target.value))} />)}
          {field("Move-in date", <Input type="date" value={form.moveInDate} onChange={(e) => set("moveInDate", e.target.value)} />)}
          {field("Food", (
            <Select value={form.food} onValueChange={(v) => set("food", v as MyProfile["food"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="veg">Veg</SelectItem>
                <SelectItem value="non-veg">Non-veg</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          ))}
          {field("Smoking", (
            <Select value={form.smoking} onValueChange={(v) => set("smoking", v as MyProfile["smoking"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          ))}
          {field("Sleep time", <Input type="time" value={form.sleepTime} onChange={(e) => set("sleepTime", e.target.value)} />)}
          {field("Wake time", <Input type="time" value={form.wakeTime} onChange={(e) => set("wakeTime", e.target.value)} />)}
          <div className="space-y-1.5">
            <Label>Cleanliness (1–5)</Label>
            <input type="range" min={1} max={5} value={form.cleanliness} onChange={(e) => set("cleanliness", Number(e.target.value))} className="w-full accent-brand-600" />
            <span className="text-sm text-ink-800">{form.cleanliness}/5</span>
          </div>
          {field("Work hours", (
            <Select value={form.workHours} onValueChange={(v) => set("workHours", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="9-6">9–6</SelectItem>
                <SelectItem value="night">Night shift</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          ))}
          {field("Work from home", (
            <Select value={form.wfh} onValueChange={(v) => set("wfh", v as MyProfile["wfh"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          ))}
          {field("Pets", (
            <Select value={form.pets} onValueChange={(v) => set("pets", v as MyProfile["pets"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          ))}
          {field("Guests OK", (
            <Select value={form.guestsOk} onValueChange={(v) => set("guestsOk", v as MyProfile["guestsOk"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          ))}
        </div>
        {field("About you", <Textarea rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="A line or two about how you live…" />)}
        {errors.length > 0 && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <p className="font-semibold">Please fix the following:</p>
            <ul className="mt-1 list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
        )}
        <Button onClick={save} className="w-full">Save profile &amp; see my matches →</Button>
      </Card>
    </div>
  );
}
