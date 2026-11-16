/** Move-in Services — partner referral pricing (no service is operated in-app).
 *  The platform takes a referral, it does not run packers/cleaning itself. */
export interface MoveInService { id: string; name: string; detail: string; priceFrom: number; note: string; }
export const MOVE_IN_SERVICES: MoveInService[] = [
  { id: "agreement", name: "Rental agreement (e-stamp)", detail: "Drafted agreement + e-stamping, both parties sign online.", priceFrom: 499, note: "Plus stamp duty at actuals. White-labelled partner." },
  { id: "cleaning", name: "Deep cleaning", detail: "Full deep clean before move-in, 1BHK–3BHK.", priceFrom: 1800, note: "₹1,800–₹3,000 depending on size." },
  { id: "pest", name: "Pest control", detail: "General pest treatment for the flat.", priceFrom: 3500, note: "₹3,500–₹4,500 depending on size." },
  { id: "movers", name: "Packers & movers", detail: "Local move with packing, transport and unpacking.", priceFrom: 5000, note: "Local 1BHK ~₹5,000 · 2BHK ~₹8,000 · intercity from ~₹15,000." },
];
