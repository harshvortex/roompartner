import Link from "next/link";

export const metadata = { title: "Terms of Use — RoomPartner" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="page-title">Terms of Use</h1>
      <p className="text-sm text-ink-500">Last updated: 17 November 2026 · RoomPartner (demo build v9)</p>
      <section className="card space-y-2 text-sm">
        <h2 className="font-bold">1. What RoomPartner is</h2>
        <p>RoomPartner helps you find a compatible room partner and a broker-free room, and rent household items from other users. We are a listing and matching platform — we are not a broker, not a landlord, and not a party to any tenancy, rental or sale between users.</p>
        <h2 className="font-bold">2. No brokerage, ever</h2>
        <p>We never charge brokerage or a percentage of rent or deposit. The paid products are: Seeker Pass ₹99/month (no auto-renew), Verification ₹99 one-off, and Owner boost ₹199–299 per 7 days. In this build all payments run in Razorpay TEST mode (or are simulated in demo mode) — no real money is charged.</p>
        <h2 className="font-bold">3. Your responsibilities</h2>
        <p>Listings must be accurate and yours to offer. Do not post fake photos, wrong prices, broker listings, or anyone else&apos;s contact details. Do not ask for or send advance payments outside the platform&apos;s escrow flow. Meet in a public place for a first visit, and verify the room and the person yourself before paying anything.</p>
        <h2 className="font-bold">4. Trust score and verification</h2>
        <p>The trust score (42 → 92) in this build is simulated — it reflects a completed profile and a simulated phone check, not a government ID check. Do not treat it as proof of identity. Real Aadhaar/ID verification is a future step and will be clearly labelled when it exists.</p>
        <h2 className="font-bold">5. Escrow (demo)</h2>
        <p>The deposit escrow flow in this build is a demo state machine (created → held → released / refunded / disputed). No real money is held. Real escrow needs a licensed escrow partner and will be governed by that partner&apos;s terms when it goes live.</p>
        <h2 className="font-bold">6. Moderation</h2>
        <p>Listings are auto-flagged by rules (banned phrases, suspicious prices, duplicate phones) and reviewed by moderators. We may pause or remove a listing, or suspend an account, for spam, fraud, harassment or repeated false listings. Reports are reviewed in the order they are filed.</p>
        <h2 className="font-bold">7. Liability</h2>
        <p>RoomPartner is provided &quot;as is&quot; in demo mode. We are not liable for the behaviour of other users, the condition of a room or item, or any loss from a tenancy or rental you arrange through the platform. Always do your own checks before moving in or paying.</p>
        <h2 className="font-bold">8. Changes</h2>
        <p>These terms may change; the date above will change and the new version will be posted here before it takes effect. Continued use after a change means you accept the new terms.</p>
      </section>
      <p className="text-sm"><Link href="/privacy" className="underline">Privacy Policy</Link> · <Link href="/" className="underline">Back to Home</Link></p>
    </div>
  );
}
