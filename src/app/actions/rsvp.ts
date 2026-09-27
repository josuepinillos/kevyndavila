"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { rsvpConfig } from "@/lib/server/config";
import { createRateLimiter } from "@/lib/server/rateLimit";
import { resendNotifier } from "@/lib/server/resendNotifier";
import { supabaseStore } from "@/lib/server/supabaseStore";
import { memoryStore } from "@/lib/rsvp/memoryStore";
import { MESSAGES, processRsvp, type RsvpResult, type RsvpStore } from "@/lib/rsvp/service";
import { cleanName } from "@/lib/rsvp/name";

// 8 intentos cada 10 minutos por IP (una familia puede confirmar a varias personas).
const allow = createRateLimiter({ limit: 8, windowMs: 10 * 60 * 1000 });

const devStore = globalThis as unknown as { __rsvpMemoryStore?: RsvpStore };

/**
 * Server Action: confirma la asistencia de un invitado.
 * Flujo: validación → Supabase → respuesta → (en segundo plano) correo vía Resend.
 */
export async function confirmAttendance(input: { name?: unknown; website?: unknown }): Promise<RsvpResult> {
  // Honeypot: campo invisible que solo rellenan los bots. Se responde "éxito" sin guardar.
  if (typeof input?.website === "string" && input.website.trim() !== "") {
    return { status: "confirmed", name: typeof input.name === "string" ? cleanName(input.name) : "" };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  if (!allow(ip)) return { status: "rate_limited", error: MESSAGES.rateLimited };

  const cfg = rsvpConfig();
  const store = cfg.memoryStore
    ? (devStore.__rsvpMemoryStore ??= memoryStore())
    : supabaseStore(cfg.supabaseUrl, cfg.supabaseKey);

  return processRsvp(input?.name, {
    store,
    notifier: resendNotifier({ apiKey: cfg.resendKey, from: cfg.from, to: cfg.notifyTo }),
    // El correo se envía después de responder: el invitado no espera al proveedor de email
    // y un fallo del correo nunca afecta a la confirmación ya guardada.
    defer: (task) => after(task),
  });
}
