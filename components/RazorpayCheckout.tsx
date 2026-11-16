"use client";
import { useState } from "react";
import { PRODUCTS, formatRupees, type ProductId } from "@/lib/payments";

declare global {
  interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void }; }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/** Pay for a product — Razorpay TEST MODE ONLY, demo fallback.
 * 1) POST /api/payments/create-order (test order, or demo order if no keys).
 * 2) Live/test keys: opens Razorpay Checkout (test card only).
 *    Demo: simulates a test payment locally, clearly labelled.
 * 3) POST /api/payments/verify — the server checks the signature.
 * A successful payment is recorded in localStorage (rp-purchases). */
export function RazorpayCheckout({ product, label }: { product: ProductId; label?: string }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const p = PRODUCTS[product];

  const recordPurchase = (paymentId: string) => {
    try {
      const raw = JSON.parse(localStorage.getItem("rp-purchases") || "[]") as string[];
      localStorage.setItem("rp-purchases", JSON.stringify([...new Set([...raw, `${product}:${paymentId}`])]));
    } catch { /* storage blocked */ }
  };

  const pay = async () => {
    setBusy(true);
    setStatus("");
    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) { setStatus(order.error || "Could not create order."); return; }
      if (order.mode === "demo") {
        const paymentId = `pay_demo_${Date.now()}`;
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ razorpay_order_id: order.orderId, razorpay_payment_id: paymentId, product }),
        });
        const v = await verifyRes.json();
        if (v.verified) { recordPurchase(paymentId); setStatus(`Demo test payment done for ${p.name} (${formatRupees(p.amountPaise)}). No money moved — this was a simulated test payment.`); }
        else setStatus("Demo payment verification failed.");
        return;
      }
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) { setStatus("Could not load Razorpay Checkout. Check your connection and retry."); return; }
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "RoomPartner",
        description: `${p.name} — TEST MODE, no real charge`,
        order_id: order.orderId,
        handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...resp, product }),
          });
          const v = await verifyRes.json();
          if (v.verified) { recordPurchase(resp.razorpay_payment_id); setStatus(`${p.name} paid in TEST mode (${formatRupees(p.amountPaise)}). Test payment only — no real charge.`); }
          else setStatus("Payment signature verification failed. No purchase recorded.");
        },
        theme: { color: "#059669" },
      });
      rzp.open();
    } catch {
      setStatus("Payment failed — please retry.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button onClick={pay} disabled={busy} className="mt-2 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:bg-gray-300">
        {busy ? "Processing…" : label || `Pay ${formatRupees(p.amountPaise)} (test mode)`}
      </button>
      {status && <p className="mt-2 text-xs text-gray-600">{status}</p>}
    </div>
  );
}
