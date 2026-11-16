/** Trust score — simulated in v5 (no real OTP / KYC wired in).
 *  Base 42 (new profile) + 30 phone verified + 20 profile complete = 92 max.
 *  Real Aadhaar / ID verification is a v2 step: it needs UIDAI approval and
 *  a privacy/legal review. Do not present this score as a government check. */
export function trustScore(opts: { phoneVerified: boolean; profileComplete: boolean }): number {
  let score = 42;
  if (opts.phoneVerified) score += 30;
  if (opts.profileComplete) score += 20;
  return Math.min(100, score);
}
export function trustLabel(score: number): string {
  if (score >= 85) return "Highly trusted";
  if (score >= 65) return "Trusted";
  if (score >= 45) return "Basic";
  return "New";
}
