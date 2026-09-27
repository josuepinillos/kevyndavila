import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { RsvpStore } from "@/lib/rsvp/service";

type ConfirmRow = { id: string; created: boolean; created_at: string };

let client: SupabaseClient | null = null;

function getClient(url: string, key: string) {
  client ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}

export function supabaseStore(url: string, key: string): RsvpStore {
  if (!url || !key) {
    return {
      confirm: async () => {
        throw new Error("Supabase no configurado: faltan SUPABASE_URL o SUPABASE_SECRET_KEY");
      },
      recordEmail: async () => {},
    };
  }
  const db = getClient(url, key);

  return {
    async confirm(name, key) {
      // Función SQL atómica (ver supabase/migrations): INSERT … ON CONFLICT DO NOTHING.
      const { data, error } = await db
        .rpc("confirm_rsvp", { p_name: name, p_name_normalized: key })
        .single<ConfirmRow>();
      if (error) throw new Error(`Supabase: ${error.message}`);
      if (!data) throw new Error("Supabase: respuesta vacía de confirm_rsvp");
      return { id: data.id, created: data.created, createdAt: data.created_at };
    },

    async recordEmail(id, outcome) {
      const patch = outcome.ok
        ? { email_status: "sent", email_error: null, email_sent_at: new Date().toISOString() }
        : { email_status: "failed", email_error: outcome.error };
      const { error } = await db.from("rsvps").update(patch).eq("id", id);
      if (error) throw new Error(`Supabase: ${error.message}`);
    },
  };
}
