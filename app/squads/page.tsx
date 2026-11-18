"use client";
import { useState } from "react";
import { useSquads, useProfile } from "@/lib/store";
import { inr } from "@/lib/bundle";

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
          <article key={s.id} className="card">
            <h3 className="font-bold">{s.name}</h3>
            <p className="text-sm text-ink-500">{s.target} · {s.city}</p>
            <p className="mt-2 text-lg font-bold">{inr(s.budgetPerPerson)}<span className="text-sm font-normal text-ink-500">/person/mo</span></p>
            <p className="mt-1 text-sm text-ink-600">Members ({s.members.length}/{s.maxMembers}): {s.members.join(", ")}</p>
            <button onClick={() => join(s.id)} disabled={s.members.length >= s.maxMembers} className="mt-3 w-full btn-primary btn-sm disabled:bg-zinc-300">
              {s.members.length >= s.maxMembers ? "Squad full" : "Join squad"}
            </button>
          </article>
        ))}
      </div>
      <section className="card">
        <h2 className="font-bold">Create a squad</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="field-label">Squad name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. HSR Hunters" className="mt-1 w-full rounded-lg border p-2 text-sm" /></label>
          <label className="field-label">Hunting for<input value={target} onChange={(e) => setTarget(e.target.value)} className="mt-1 w-full rounded-lg border p-2 text-sm" /></label>
          <label className="field-label">City<input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-lg border p-2 text-sm" /></label>
          <label className="field-label">Budget per person (₹/mo)<input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="mt-1 w-full rounded-lg border p-2 text-sm" /></label>
        </div>
        <button onClick={create} className="mt-3 btn-primary">Create squad</button>
      </section>
    </div>
  );
}
