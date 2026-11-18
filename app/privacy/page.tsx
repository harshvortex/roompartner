import Link from "next/link";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Privacy Policy — RoomPartner" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="page-title">Privacy Policy</h1>
      <p className="text-sm text-ink-500">Last updated: 17 November 2026 · RoomPartner (demo build v9)</p>
      <Card className="space-y-2 p-5 text-sm">
        <h2 className="font-bold">1. What we collect</h2>
        <p>When you create a profile we collect the details you enter: name, age, gender, occupation, city, budget, food, smoking, sleep and cleanliness preferences, languages and bio. When you list a room or rental item we collect the listing details you enter. When you chat, your messages are stored so the other person can read them. When you pay in test mode, Razorpay (test mode) processes the payment — we never see or store your card details.</p>
        <h2 className="font-bold">2. How your data is stored</h2>
        <p>In demo mode (no Supabase keys set) your profile, saved items, bundle, chats and escrow records live only in your own browser (localStorage) — nothing is sent to a server. When Supabase is configured, data is stored in a Supabase Postgres database with Row Level Security: only you can edit your profile, and only chat participants can read a conversation. See supabase/schema.sql in the codebase.</p>
        <h2 className="font-bold">3. Phone verification and identity</h2>
        <p>Phone verification in the demo is simulated — no OTP is sent and no number is checked. In live mode, phone OTP goes through Supabase Auth. We do not collect Aadhaar or government ID in this build; any future ID verification will need your explicit consent, UIDAI approval and a separate privacy review, and will be announced before it is switched on.</p>
        <h2 className="font-bold">4. What we do not do</h2>
        <p>We do not sell your data, share your phone number with anyone until you both agree to chat, or charge brokerage or a percentage of rent/deposit. We do not run advertising trackers in this build.</p>
        <h2 className="font-bold">5. Your rights</h2>
        <p>You can edit or delete your profile and listings from My Space, clear the demo data from the Dashboard, and sign out at any time. In demo mode, clearing your browser storage deletes your local data. To request deletion of live-mode data, contact the team — contact details will be published when live mode opens.</p>
        <h2 className="font-bold">6. Changes</h2>
        <p>If this policy changes, the date above will change and the new version will be posted here before it takes effect.</p>
      </Card>
      <p className="text-sm"><Link href="/terms" className="underline">Terms of Use</Link> · <Link href="/" className="underline">Back to Home</Link></p>
    </div>
  );
}
