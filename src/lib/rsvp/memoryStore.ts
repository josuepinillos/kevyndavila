import type { RsvpStore } from "./service";

type Row = {
  id: string;
  name: string;
  createdAt: string;
  emailStatus: "pending" | "sent" | "failed";
  emailError?: string;
};

/**
 * Almacén en memoria con la misma semántica que la función SQL `confirm_rsvp`.
 * Uso: tests y desarrollo local sin Supabase (RSVP_STORE=memory). Nunca en producción.
 */
export function memoryStore(rows = new Map<string, Row>()): RsvpStore & { rows: Map<string, Row> } {
  return {
    rows,
    async confirm(name, key) {
      // Comprobar y escribir en el mismo tick: atómico en un único proceso.
      const existing = rows.get(key);
      if (existing) return { id: existing.id, created: false, createdAt: existing.createdAt };
      const row: Row = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString(), emailStatus: "pending" };
      rows.set(key, row);
      return { id: row.id, created: true, createdAt: row.createdAt };
    },
    async recordEmail(id, outcome) {
      for (const row of rows.values()) {
        if (row.id !== id) continue;
        row.emailStatus = outcome.ok ? "sent" : "failed";
        row.emailError = outcome.ok ? undefined : outcome.error;
      }
    },
  };
}
