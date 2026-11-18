"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_CITIES } from "@/lib/seed";
import { validateRoomListing } from "@/lib/validate";
import type { Room } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  if (done) return <div className="mx-auto max-w-xl empty-state shadow-sm"><h1 className="text-xl font-extrabold tracking-tight">Room listed ✓</h1><p className="mt-2 text-sm text-ink-600">Your room is live in demo mode with ₹0 brokerage. In production it goes to a manual review queue first.</p><Button onClick={() => router.push("/rooms")} className="mt-4">View rooms →</Button></div>;
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <header>
        <p className="eyebrow">₹0 brokerage</p>
        <h1 className="page-title">List a room</h1>
        <p className="page-sub">Your room reaches people looking for a broker-free place — no commission, no middleman.</p>
      </header>
      <Card className="space-y-3 p-5">
        <div className="space-y-1.5">
          <Label htmlFor="room-title">Title</Label>
          <Input id="room-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Private room in 2BHK, HSR Layout" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="room-city">City</Label>
            <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v })}>
              <SelectTrigger id="room-city"><SelectValue /></SelectTrigger>
              <SelectContent>{DEMO_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="room-locality">Locality</Label>
            <Input id="room-locality" value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} placeholder="HSR Layout" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="room-rent">Rent (₹/mo)</Label>
            <Input id="room-rent" type="number" min={500} max={200000} value={form.rent} onChange={(e) => setForm({ ...form, rent: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="room-deposit">Deposit (₹)</Label>
            <Input id="room-deposit" type="number" min={0} max={2400000} value={form.deposit} onChange={(e) => setForm({ ...form, deposit: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="room-type">Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger id="room-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="room">Room</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="pg">PG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="room-furnishing">Furnishing</Label>
            <Select value={form.furnishing} onValueChange={(v) => setForm({ ...form, furnishing: v })}>
              <SelectTrigger id="room-furnishing"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="furnished">Furnished</SelectItem>
                <SelectItem value="semi-furnished">Semi-furnished</SelectItem>
                <SelectItem value="unfurnished">Unfurnished</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="room-bhk">BHK</Label>
            <Input id="room-bhk" value={form.bhk} onChange={(e) => setForm({ ...form, bhk: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="room-owner">Your name</Label>
            <Input id="room-owner" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="Your name" />
          </div>
        </div>
        {errors.length > 0 && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <p className="font-semibold">Please fix the following:</p>
            <ul className="mt-1 list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
        )}
        <Button onClick={save} className="w-full">Publish room</Button>
      </Card>
    </div>
  );
}
