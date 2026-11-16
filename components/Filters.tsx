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

// BHK and gender-preference controls are only shown where the page actually
// filters on them (rooms). On flatmates/rentals they were shown but ignored,
// which made the UI lie — pass showBhkGender={false} there.
export function Filters({ value, onChange, cities, showFurnishing = false, showCategory = false, showBhkGender = true }: {
  value: FilterState; onChange: (f: FilterState) => void; cities: string[];
  showFurnishing?: boolean; showCategory?: boolean; showBhkGender?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="text-xs font-medium text-gray-600">City
          <select className="mt-1 w-full rounded-lg border p-2 text-sm" value={value.city} onChange={(e) => onChange({ ...value, city: e.target.value })}>
            <option value="">All cities</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-gray-600">Sort by
          <select className="mt-1 w-full rounded-lg border p-2 text-sm" value={value.sort} onChange={(e) => onChange({ ...value, sort: e.target.value as FilterState["sort"] })}>
            <option value="match">Best match</option><option value="price">Lowest price</option><option value="newest">Newest</option><option value="verified">Verified first</option>
          </select>
        </label>
        {showFurnishing && (
          <label className="text-xs font-medium text-gray-600">Furnishing
            <select className="mt-1 w-full rounded-lg border p-2 text-sm" value={value.furnishing} onChange={(e) => onChange({ ...value, furnishing: e.target.value })}>
              <option value="">Any</option><option value="furnished">Furnished</option><option value="semi-furnished">Semi-furnished</option><option value="unfurnished">Unfurnished</option>
            </select>
          </label>
        )}
        {showCategory && (
          <label className="text-xs font-medium text-gray-600">Category
            <select className="mt-1 w-full rounded-lg border p-2 text-sm" value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })}>
              <option value="">All</option><option value="furniture">Furniture</option><option value="appliance">Appliance</option><option value="electronics">Electronics</option><option value="daily">Daily needs</option>
            </select>
          </label>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onChange({ ...value, verifiedOnly: !value.verifiedOnly })} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${value.verifiedOnly ? "bg-emerald-600 text-white border-emerald-600" : "bg-white"}`}>✓ Verified only</button>
        {showBhkGender && (<>
          <select className="rounded-full border bg-white px-3 py-1.5 text-xs" value={value.bhk} onChange={(e) => onChange({ ...value, bhk: e.target.value })}>
            <option value="">Any BHK</option><option value="1BHK">1BHK</option><option value="2BHK">2BHK</option><option value="3BHK">3BHK</option><option value="PG">PG</option>
          </select>
          <select className="rounded-full border bg-white px-3 py-1.5 text-xs" value={value.gender} onChange={(e) => onChange({ ...value, gender: e.target.value })}>
            <option value="">Any gender pref</option><option value="any">Any</option><option value="female">Female</option><option value="male">Male</option>
          </select>
        </>)}
      </div>
      <label className="block text-xs font-medium text-gray-600">Max budget — ₹{value.maxBudget.toLocaleString("en-IN")}/mo
        <input type="range" min={5000} max={50000} step={1000} value={value.maxBudget} onChange={(e) => onChange({ ...value, maxBudget: Number(e.target.value) })} className="w-full accent-emerald-600" />
      </label>
    </div>
  );
}
