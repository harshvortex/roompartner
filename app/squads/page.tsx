"use client";
import { useState } from "react";
import { useSquads, useProfile } from "@/lib/store";
import { inr } from "@/lib/bundle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";

export default function SquadsPage() {
  const [squads, setSquads] = useSquads();
  const [profile] = useProfile();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("2BHK in HSR Layout");
  const [city, setCity] = useState("Bengaluru");
  const [budget, setBudget] = useState(11000);
  const join = (id: string) => {
    const me = profile.name || "You";
    setSquads(squads.map((s) => s.id === id && !s.members.includes(me) && s.members.length < s.maxMembers ? { ...s, members: [...s.members, me] } : s));
  };
  const create = () => {
    if (!name.trim()) return;
    setSquads([...squads, { id: `squad-${Date.now()}`, name: name.trim(), target, city, budgetPerPerson: budget, members: [profile.name || "You"], maxMembers: 3, createdAt: new Date().toISOString().slice(0, 10) }]);
    setName("");
  };
  return (
    <div className="space-y-4">
      <h1 className="page-title">Squad Mode</h1>
      <p className="text-sm text-ink-500">Team up as 2–3 people and hunt a 2/3BHK together — split the rent, split the furnishing, move in as a group.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {squads.map((s) => (
          <Card key={s.id} className="p-5">
            <h3 className="flex items-center gap-2 font-bold"><Users className="h-4 w-4 text-brand-600" /> {s.name}</h3>
            <p className="text-sm text-ink-500">{s.target} · {s.city}</p>
            <p className="mt-2 text-lg font-bold">{inr(s.budgetPerPerson)}<span className="text-sm font-normal text-ink-500">/person/mo</span></p>
            <p className="mt-1 text-sm text-ink-600">Members ({s.members.length}/{s.maxMembers}): {s.members.join(", ")}</p>
            <Button onClick={() => join(s.id)} disabled={s.members.length >= s.maxMembers} size="sm" className="mt-3 w-full">
              {s.members.length >= s.maxMembers ? "Squad full" : "Join squad"}
            </Button>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create a squad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="squad-name">Squad name</Label>
              <Input id="squad-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. HSR Hunters" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="squad-target">Hunting for</Label>
              <Input id="squad-target" value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="squad-city">City</Label>
              <Input id="squad-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="squad-budget">Budget per person (₹/mo)</Label>
              <Input id="squad-budget" type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
            </div>
          </div>
          <Button onClick={create} className="mt-3">Create squad</Button>
        </CardContent>
      </Card>
    </div>
  );
}
