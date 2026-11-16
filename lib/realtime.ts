/** Supabase Realtime two-way chat.
 *
 * LIVE (Supabase configured): messages are inserted into the `messages`
 * table and every open client subscribes to a Postgres-changes channel for
 * that conversation, so a reply from the other side arrives live.
 * DEMO (no Supabase env vars): `realtimeAvailable()` is false, the chat
 * page keeps localStorage + the clearly-labelled "[Demo reply]".
 * Channel names are pure and unit-testable; the subscription itself needs
 * a live Supabase client (see getSupabase in lib/supabase.ts). */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatMessage } from "./types";

export function realtimeAvailable(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function channelNameForConversation(conversationId: string): string {
  return `messages:conv:${conversationId}`;
}

/** Subscribe to new messages on a conversation. Returns an unsubscribe fn. */
export function subscribeToConversation(
  sb: SupabaseClient,
  conversationId: string,
  onMessage: (msg: ChatMessage) => void,
): () => void {
  const channel = sb
    .channel(channelNameForConversation(conversationId))
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
      (payload) => {
        const row = payload.new as { id: string; sender_id: string; body: string; created_at: string };
        onMessage({ id: String(row.id), conversationId, sender: "them", body: row.body, createdAt: row.created_at });
      },
    )
    .subscribe();
  return () => {
    sb.removeChannel(channel);
  };
}

/** Insert a message into Supabase (live mode). Returns false if it fails
 *  (e.g. the conversation id is a local demo id, not a UUID) — the caller
 *  then falls back to the local store. */
export async function sendRealtimeMessage(
  sb: SupabaseClient,
  conversationId: string,
  senderId: string,
  body: string,
): Promise<boolean> {
  const { error } = await sb.from("messages").insert({
    conversation_id: conversationId,
    sender_id: senderId,
    body,
  });
  return !error;
}
