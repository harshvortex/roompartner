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
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Messages</p>
          <h1 className="page-title">Chats</h1>
          <p className="page-sub">Sending an interest opens a real thread here. Your phone number stays hidden until you both agree to chat.</p>
        </div>
        {live && <span className="badge-verified">● Live — Realtime connected</span>}
      </header>
      {convs.length === 0 ? (
        <div className="empty-state">
          <p className="font-semibold">No chats yet.</p>
          <p className="mt-1 text-sm text-ink-500">Express interest on a flatmate, room or rental — a thread opens here.</p>
          <Link href="/flatmates" className="mt-4 inline-block btn-primary">Find flatmates</Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            {convs.map((c) => (
              <button key={c.id} onClick={() => setActiveId(c.id)} className={`flex w-full items-center gap-3 rounded-2xl border bg-white p-3 text-left shadow-sm transition ${active?.id === c.id ? "border-brand-500 ring-2 ring-brand-100" : "border-zinc-200/80 hover:border-brand-200"}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white">{c.otherName.charAt(0).toUpperCase()}</span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{c.otherName}</span>
                  <span className="block truncate text-xs text-ink-500">{c.title}</span>
                  <span className="block text-xs text-ink-400">{new Date(c.createdAt).toLocaleString("en-IN")}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="card lg:col-span-2">
            {active ? (<>
              <div className="flex items-center gap-3 border-b pb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white">{active.otherName.charAt(0).toUpperCase()}</span>
                <div>
                  <h2 className="font-bold leading-tight">{active.title}</h2>
                  <p className="text-xs text-ink-500">{active.otherName} · {live ? "online — messages arrive live" : "demo mode"}</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {thread.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">💬</div>
                    <p className="mt-2 font-semibold">Say hi to {active.otherName}</p>
                    <p className="mt-1 text-sm text-ink-500">Introduce yourself and your move-in date to get the conversation going.</p>
                  </div>
                )}
                {thread.map((m) => (
                  <div key={m.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.sender === "me" ? "ml-auto bg-brand-600 text-white" : "bg-surface-muted"}`}>{m.body}</div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message…" className="flex-1" />
                <button onClick={send} className="btn-primary">Send</button>
              </div>
              <p className="mt-2 text-xs text-ink-500">{live ? "Live: connected to Supabase Realtime — replies from the other side arrive here." : "Demo mode: replies marked “[Demo reply]” are simulated so the flow can be shown. Real two-way chat needs accounts and Supabase Realtime."}</p>
            </>) : <p className="text-sm text-ink-500">Pick a conversation.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
