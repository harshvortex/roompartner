/** Deposit escrow — DEMO ONLY state machine. No real money moves.
 *
 * Flow: created → held → released | refunded
 *              held → disputed → released | refunded
 * A deposit is "held" when the renter confirms move-in in demo mode, and
 * "released" to the owner (or "refunded" to the renter) by the admin/demo
 * action on the Dashboard. Real escrow needs a licensed escrow partner,
 * KYC and a payment gateway in live mode — none of that is wired here. */

import type { Escrow, EscrowStatus } from "./types";
export type { Escrow, EscrowStatus };

const TRANSITIONS: Record<EscrowStatus, EscrowStatus[]> = {
  created: ["held"],
  held: ["released", "refunded", "disputed"],
  disputed: ["released", "refunded"],
  released: [],
  refunded: [],
};

export function canTransition(from: EscrowStatus, to: EscrowStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextActions(status: EscrowStatus): EscrowStatus[] {
  return TRANSITIONS[status];
}

export function createEscrow(roomId: string, roomTitle: string, amount: number): Escrow {
  const now = new Date().toISOString();
  return { id: `esc-${Date.now()}`, roomId, roomTitle, amount, status: "created", createdAt: now, updatedAt: now };
}

export function transitionEscrow(escrow: Escrow, to: EscrowStatus): Escrow {
  if (!canTransition(escrow.status, to)) {
    throw new Error(`Invalid escrow transition: ${escrow.status} → ${to}`);
  }
  return { ...escrow, status: to, updatedAt: new Date().toISOString() };
}

export function escrowLabel(status: EscrowStatus): string {
  return { created: "Created — not held yet", held: "Held (demo)", released: "Released to owner (demo)", refunded: "Refunded to renter (demo)", disputed: "Disputed — awaiting decision" }[status];
}
