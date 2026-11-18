"use client";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export interface FilterState {
  city: string;
  maxBudget: number;
  sort: "match" | "price" | "newest" | "verified";
  furnishing: string;
  category: string;
  verifiedOnly: boolean;
  bhk: string;
  gender: string;
}
export const DEFAULT_FILTERS: FilterState = { city: "", maxBudget: 25000, sort: "match", furnishing: "", category: "", verifiedOnly: false, bhk: "", gender: "" };

const SORTS: { id: FilterState["sort"]; label: string }[] = [
  { id: "match", label: "Best match" },
  { id: "price", label: "Lowest price" },
  { id: "newest", label: "Newest" },
  { id: "verified", label: "Verified first" },
];

// BHK and gender-preference controls are only shown where the page actually
// filters on them (rooms). On flatmates/rentals they were shown but ignored,
// which made the UI lie — pass showBhkGender={false} there.
export function Filters({ value, onChange, cities, showFurnishing = false, showCategory = false, showBhkGender = true }: {
  value: FilterState; onChange: (f: FilterState) => void; cities: string[];
  showFurnishing?: boolean; showCategory?: boolean; showBhkGender?: boolean;
}) {
  return (
    <Card className="space-y-4 p-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="filter-city">City</Label>
          <Select value={value.city || "all"} onValueChange={(v) => onChange({ ...value, city: v === "all" ? "" : v })}>
            <SelectTrigger id="filter-city"><SelectValue placeholder="All cities" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {showFurnishing && (
          <div className="space-y-1.5">
            <Label htmlFor="filter-furnishing">Furnishing</Label>
            <Select value={value.furnishing || "any"} onValueChange={(v) => onChange({ ...value, furnishing: v === "any" ? "" : v })}>
              <SelectTrigger id="filter-furnishing"><SelectValue placeholder="Any" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="furnished">Furnished</SelectItem>
                <SelectItem value="semi-furnished">Semi-furnished</SelectItem>
                <SelectItem value="unfurnished">Unfurnished</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {showCategory && (
          <div className="space-y-1.5">
            <Label htmlFor="filter-category">Category</Label>
            <Select value={value.category || "all"} onValueChange={(v) => onChange({ ...value, category: v === "all" ? "" : v })}>
              <SelectTrigger id="filter-category"><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="appliance">Appliance</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="daily">Daily needs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="filter-budget">Max budget</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <input id="filter-budget" type="range" min={5000} max={50000} step={1000} value={value.maxBudget} onChange={(e) => onChange({ ...value, maxBudget: Number(e.target.value) })} aria-label="Maximum monthly budget" />
            <span className="shrink-0 rounded-lg bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700">₹{value.maxBudget.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-400">Sort</span>
        {SORTS.map((s) => (
          <Button
            key={s.id}
            variant={value.sort === s.id ? "default" : "outline"}
            size="sm"
            onClick={() => onChange({ ...value, sort: s.id })}
            aria-pressed={value.sort === s.id}
            className="rounded-full"
          >
            {s.label}
          </Button>
        ))}
        <label htmlFor="filter-verified" className="flex cursor-pointer items-center gap-2 rounded-full border border-input bg-background px-3 py-1.5 text-xs font-semibold shadow-sm">
          <Switch id="filter-verified" checked={value.verifiedOnly} onCheckedChange={(v) => onChange({ ...value, verifiedOnly: v })} />
          Verified only
        </label>
        {showBhkGender && (<>
          <Select value={value.bhk || "any"} onValueChange={(v) => onChange({ ...value, bhk: v === "any" ? "" : v })}>
            <SelectTrigger className="h-9 w-auto rounded-full text-xs font-semibold"><SelectValue placeholder="Any BHK" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any BHK</SelectItem>
              <SelectItem value="1BHK">1BHK</SelectItem>
              <SelectItem value="2BHK">2BHK</SelectItem>
              <SelectItem value="3BHK">3BHK</SelectItem>
              <SelectItem value="PG">PG</SelectItem>
            </SelectContent>
          </Select>
          <Select value={value.gender || "any"} onValueChange={(v) => onChange({ ...value, gender: v === "any" ? "" : v })}>
            <SelectTrigger className="h-9 w-auto rounded-full text-xs font-semibold"><SelectValue placeholder="Any gender pref" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any gender pref</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
            </SelectContent>
          </Select>
        </>)}
      </div>
    </Card>
  );
}
