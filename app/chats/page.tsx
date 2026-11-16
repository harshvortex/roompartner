"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useConversations, useChatMessages, useChecklist } from "@/lib/store";
import { getSupabase } from "@/lib/supabase";
import { realtimeAvailable, subscribeToConversation, sendRealtimeMessage } from "@/lib/realtime";

export default function ChatsPage() {
  const [convs] = useConversations();
  const [msgs, setMsgs] = useChatMessages();
  const [, setChecklist] = useChecklist();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const active = convs.find((c) => c.id === activeId) || convs[0];
  const thread = active ? msgs.filter((m) => m.conversationId === active.id) : [];
  const live = realtimeAvailable();
  // LIVE: subscribe to the active conversation's Realtime channel so the
  // other side's messages arrive live. DEMO: no subscription, local only.
  useEffect(() => {
    if (!live || !active) return;
    const sb = getSupabase();
    if (!sb) return;
    const unsub = subscribeToConversation(sb, active.id, (m) => {
      setMsgs((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, active?.id]);
  const send = () => {
    if (!active || !draft.trim()) return;
    const convId = active.id;
    setMsgs([...msgs, { id: `m-${Date.now()}`, conversationId: convId, sender: "me", body: draft.trim(), createdAt: new Date().toISOString() }]);
    // LIVE: also write to Supabase so the other side gets it via Realtime.
    // Fails silently for local demo conversation ids — the local message above still shows.
    const sb = getSupabase();
    if (sb) {
      try {
        const authUser = JSON.parse(localStorage.getItem("rp-auth-user") || "null");
        void sendRealtimeMessage(sb, convId, authUser?.id || "00000000-0000-0000-0000-000000000000", draft.trim());
      } catch { /* demo fallback already saved locally */ }
    }
    setDraft("");
    setChecklist((c) => Array.from(new Set([...c, "chat"])));
    // DEMO ONLY (skipped when Realtime is live): in demo mode there is no
    // real person on the other side, so the app replies once with a
    // clearly-labelled simulated message, so the chat flow can be
    // demonstrated end-to-end. This reply is never presented as a real person.
    if (live) return;
    window.setTimeout(() => {
      setMsgs((prev) => {
        if (prev.some((m) => m.conversationId === convId && m.body.startsWith("[Demo reply]"))) return prev;
        return [...prev, { id: `m-demo-${Date.now()}`, conversationId: convId, sender: "them", body: "[Demo reply] Thanks for reaching out! I'm free for a visit this weekend — does Saturday 11:00 work for you?", createdAt: new Date().toISOString() }];
      });
    }, 1500);
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Chats</h1>
      <p className="text-sm text-gray-500">Sending an interest opens a real thread here. Your phone number stays hidden until you both agree to chat.</p>
      {convs.length === 0 ? (
        <div className="rounded-2xl border bg-white p-8 text-center">
          <p className="font-semibold">No chats yet.</p>
          <p className="mt-1 text-sm text-gray-500">Express interest on a flatmate, room or rental — a thread opens here.</p>
          <Link href="/flatmates" className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Find flatmates</Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            {convs.map((c) => (
              <button key={c.id} onClick={() => setActiveId(c.id)} className={`w-full rounded-2xl border bg-white p-3 text-left shadow-sm ${active?.id === c.id ? "border-emerald-500" : ""}`}>
                <p className="font-semibold">{c.otherName}</p>
                <p className="text-xs text-gray-500">{c.title}</p>
                <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString("en-IN")}</p>
              </button>
            ))}
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm lg:col-span-2">
            {active ? (<>
              <h2 className="font-bold">{active.title}</h2>
              <div className="mt-3 space-y-2">
                {thread.length === 0 && <p className="text-sm text-gray-500">Say hi — introduce yourself and your move-in date.</p>}
                {thread.map((m) => (
                  <div key={m.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.sender === "me" ? "ml-auto bg-emerald-600 text-white" : "bg-gray-100"}`}>{m.body}</div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message…" className="flex-1 rounded-lg border p-2 text-sm" />
                <button onClick={send} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Send</button>
              </div>
              <p className="mt-2 text-xs text-gray-500">{live ? "Live: connected to Supabase Realtime — replies from the other side arrive here." : "Demo mode: replies marked “[Demo reply]” are simulated so the flow can be shown. Real two-way chat needs accounts and Supabase Realtime."}</p>
            </>) : <p className="text-sm text-gray-500">Pick a conversation.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
