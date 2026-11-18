"use client";
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
    <div className="card space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="field-label">City
          <select value={value.city} onChange={(e) => onChange({ ...value, city: e.target.value })}>
            <option value="">All cities</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        {showFurnishing && (
          <label className="field-label">Furnishing
            <select value={value.furnishing} onChange={(e) => onChange({ ...value, furnishing: e.target.value })}>
              <option value="">Any</option><option value="furnished">Furnished</option><option value="semi-furnished">Semi-furnished</option><option value="unfurnished">Unfurnished</option>
            </select>
          </label>
        )}
        {showCategory && (
          <label className="field-label">Category
            <select value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })}>
              <option value="">All</option><option value="furniture">Furniture</option><option value="appliance">Appliance</option><option value="electronics">Electronics</option><option value="daily">Daily needs</option>
            </select>
          </label>
        )}
        <div className="col-span-2 sm:col-span-1">
          <span className="field-label">Max budget</span>
          <div className="mt-1.5 flex items-center gap-2">
            <input type="range" min={5000} max={50000} step={1000} value={value.maxBudget} onChange={(e) => onChange({ ...value, maxBudget: Number(e.target.value) })} aria-label="Maximum monthly budget" />
            <span className="shrink-0 rounded-lg bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700">₹{value.maxBudget.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-400">Sort</span>
        {SORTS.map((s) => (
          <button key={s.id} onClick={() => onChange({ ...value, sort: s.id })} aria-pressed={value.sort === s.id} className={value.sort === s.id ? "chip-active" : "chip"}>{s.label}</button>
        ))}
        <button onClick={() => onChange({ ...value, verifiedOnly: !value.verifiedOnly })} aria-pressed={value.verifiedOnly} className={value.verifiedOnly ? "chip-active" : "chip"}>✓ Verified only</button>
        {showBhkGender && (<>
          <select className="!w-auto rounded-full !py-1.5 !text-xs" value={value.bhk} onChange={(e) => onChange({ ...value, bhk: e.target.value })}>
            <option value="">Any BHK</option><option value="1BHK">1BHK</option><option value="2BHK">2BHK</option><option value="3BHK">3BHK</option><option value="PG">PG</option>
          </select>
          <select className="!w-auto rounded-full !py-1.5 !text-xs" value={value.gender} onChange={(e) => onChange({ ...value, gender: e.target.value })}>
            <option value="">Any gender pref</option><option value="any">Any</option><option value="female">Female</option><option value="male">Male</option>
          </select>
        </>)}
      </div>
    </div>
  );
}
