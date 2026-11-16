import type { MyProfile, RoommateProfile } from "./types";

export interface ScoreBreakdown {
  budget: number;
  food: number;
  smoking: number;
  sleep: number;
  cleanliness: number;
  work: number;
  guests: number;
}

export interface CompatibilityResult {
  score: number; // 0-100
  breakdown: ScoreBreakdown;
  notes: string[];
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** Hard filters: same city, gender preference, rent within budget. Returns false when incompatible. */
export function passesHardFilters(me: MyProfile, other: RoommateProfile): boolean {
  if (!me.city || !other.city) return true; // unset fields get neutral credit, not a fail
  if (me.city.toLowerCase() !== other.city.toLowerCase()) return false;
  return true;
}

/** Weighted 0-100 compatibility score with an explainable breakdown.
 *  These are the weights used in the synopsis and the viva deck — 7 factors, summing to 100:
 *  budget 25, food 15, sleep 15, cleanliness 15, smoking 10, guests 10, work/WFH 10.
 *  Pets is shown on the profile as information, but it is NOT scored — it is not
 *  one of the seven factors, so it cannot inflate or deflate a match.
 *  City is a hard filter (0 if different cities), not a scored factor.
 *  Unset fields score neutrally (half credit) so a new profile is not punished.
 *  The weights are design assumptions, not survey-derived, and no accuracy is
 *  claimed — see the evaluation plan in the project documentation.
 */
export function compatibilityScore(me: MyProfile, other: RoommateProfile): CompatibilityResult {
  const notes: string[] = [];
  const neutral = (max: number) => Math.round(max / 2);

  const budget = me.budgetMax && other.budgetMax
    ? (Math.abs(me.budgetMax - other.budgetMax) <= 2000 ? 25 : Math.abs(me.budgetMax - other.budgetMax) <= 5000 ? 12 : 0)
    : neutral(25);
  const food = me.food && other.food
    ? me.food === other.food ? 15 : me.food === "flexible" || other.food === "flexible" ? 8 : 0
    : neutral(15);
  const smoking = me.smoking && other.smoking ? (me.smoking === other.smoking ? 10 : 0) : neutral(10);
  const sleep = me.sleepTime && other.sleepTime
    ? (Math.abs(toMinutes(me.sleepTime) - toMinutes(other.sleepTime)) < 60 ? 15
      : Math.abs(toMinutes(me.sleepTime) - toMinutes(other.sleepTime)) < 120 ? 8 : 0)
    : neutral(15);
  const cleanliness = me.cleanliness && other.cleanliness
    ? (Math.abs(me.cleanliness - other.cleanliness) <= 1 ? 15 : Math.abs(me.cleanliness - other.cleanliness) === 2 ? 8 : 0)
    : neutral(15);
  const work = me.workHours && other.workHours
    ? (me.workHours === other.workHours ? 10 : me.wfh === other.wfh ? 5 : 0)
    : neutral(10);
  const guests = me.guestsOk && other.guestsOk ? (me.guestsOk === other.guestsOk ? 10 : 0) : neutral(10);

  const breakdown: ScoreBreakdown = {
    budget, food, smoking, sleep, cleanliness, work, guests,
  };
  const score = passesHardFilters(me, other)
    ? budget + food + smoking + sleep + cleanliness + work + guests
    : 0;

  if (food === 15) notes.push("Food habits match");
  else if (food === 0) notes.push("Food habits differ");
  if (sleep === 15) notes.push("Sleep schedule matches");
  else if (sleep === 0) notes.push("Sleep schedule differs");
  if (cleanliness === 15) notes.push("Cleanliness matches");
  else if (cleanliness <= 8) notes.push("Cleanliness differs");
  if (smoking === 0) notes.push("Smoking preference differs");
  return { score, breakdown, notes };
}

export function matchLabel(score: number): string {
  if (score >= 85) return "Great match";
  if (score >= 70) return "Good match";
  if (score >= 50) return "Decent match";
  return "Low match";
}
