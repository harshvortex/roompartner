/** Pricing structure — shown in the app, NOT live billing.
 *  No payment gateway is wired in this build: Razorpay is test-mode only and needs
 *  business KYC before any real charge. Never charge a % of rent/deposit. */
export const PRICING = {
  seekerPass: { name: "Seeker Pass", price: 99, period: "/month", note: "No auto-renew. Unlock unlimited chats + contacts + AI ranking." },
  verification: { name: "Verification", price: 99, period: "one-off", note: "Phone + profile verification, visible badge." },
  ownerBoost: { name: "Owner boost", price: 199, period: "/7 days", note: "₹199–299 per 7 days, featured placement — only once there is traffic." },
  rentalCommission: { name: "P2P rental commission", price: 12, period: "%", note: "12–15% total, only with escrow + damage cover (not in v5)." },
};
