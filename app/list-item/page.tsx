"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_CITIES } from "@/lib/seed";
import { validateRentalItem } from "@/lib/validate";
import type { RentalItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  if (done) return <div className="mx-auto max-w-xl empty-state shadow-sm"><h1 className="text-xl font-extrabold tracking-tight">Rental item listed ✓</h1><p className="mt-2 text-sm text-ink-600">Your item is live in demo mode. Start with small, low-risk items first — iron, induction, vacuum, cycle, chair — before appliances.</p><Button onClick={() => router.push("/rentals")} className="mt-4">View rentals →</Button></div>;
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <header>
        <p className="eyebrow">Earn from what you own</p>
        <h1 className="page-title">List a rental item</h1>
        <p className="page-sub">Rent out something you already own — neighbours pay monthly, you keep the item.</p>
      </header>
      <Card className="space-y-3 p-5">
        <div className="space-y-1.5">
          <Label htmlFor="item-title">Item</Label>
          <Input id="item-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Queen bed with storage" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="item-category">Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger id="item-category"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="appliance">Appliance</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="daily">Daily needs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-city">City</Label>
            <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v })}>
              <SelectTrigger id="item-city"><SelectValue /></SelectTrigger>
              <SelectContent>{DEMO_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-locality">Locality</Label>
            <Input id="item-locality" value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} placeholder="HSR Layout" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-owner">Your name</Label>
            <Input id="item-owner" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="Your name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-rent">Rent (₹/mo)</Label>
            <Input id="item-rent" type="number" min={50} max={50000} value={form.pricePerMonth} onChange={(e) => setForm({ ...form, pricePerMonth: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-deposit">Deposit (₹)</Label>
            <Input id="item-deposit" type="number" min={0} max={600000} value={form.deposit} onChange={(e) => setForm({ ...form, deposit: Number(e.target.value) })} />
          </div>
        </div>
        {errors.length > 0 && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <p className="font-semibold">Please fix the following:</p>
            <ul className="mt-1 list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
        )}
        <Button onClick={save} className="w-full">Publish item</Button>
      </Card>
    </div>
  );
}
