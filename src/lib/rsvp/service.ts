/**
 * Lógica del RSVP, independiente de Supabase/Resend (se inyectan).
 *
 *   validar → guardar (atómico) → responder al invitado
 *                         └─ solo si es NUEVO: enviar correo (en segundo plano)
 *                                              └─ registrar resultado del correo
 */
import { validateName } from "./name";

export type RsvpRecord = { id: string; name: string; createdAt: string };

export interface RsvpStore {
  /** Inserta o devuelve la existente. Debe ser atómico frente a peticiones simultáneas. */
  confirm(name: string, key: string): Promise<{ id: string; created: boolean; createdAt: string }>;
  recordEmail(id: string, outcome: { ok: true } | { ok: false; error: string }): Promise<void>;
}

export interface RsvpNotifier {
  notify(rsvp: RsvpRecord): Promise<void>;
}

export type RsvpResult =
  | { status: "confirmed"; name: string }
  | { status: "already_confirmed"; name: string }
  | { status: "invalid"; error: string }
  | { status: "rate_limited"; error: string }
  | { status: "error"; error: string };

export const MESSAGES = {
  error: "No pudimos confirmar tu asistencia. Inténtalo de nuevo en unos minutos.",
  rateLimited: "Demasiados intentos seguidos. Espera un momento y vuelve a intentarlo.",
} as const;

type Deps = {
  store: RsvpStore;
  notifier: RsvpNotifier;
  /** Programa trabajo tras responder (en Next: `after`). */
  defer: (task: () => Promise<void>) => void;
  log?: Pick<Console, "error" | "info">;
};

export async function processRsvp(rawName: unknown, deps: Deps): Promise<RsvpResult> {
  const { store, notifier, defer, log = console } = deps;

  const check = validateName(rawName);
  if (!check.ok) return { status: "invalid", error: check.error };

  let saved: Awaited<ReturnType<RsvpStore["confirm"]>>;
  try {
    saved = await store.confirm(check.name, check.key);
  } catch (err) {
    // Si la base de datos falla no se envía ningún correo.
    log.error("[rsvp] error guardando confirmación:", errorMessage(err));
    return { status: "error", error: MESSAGES.error };
  }

  if (!saved.created) {
    // Ya confirmado: sin registro nuevo y sin correo.
    return { status: "already_confirmed", name: check.name };
  }

  const record: RsvpRecord = { id: saved.id, name: check.name, createdAt: saved.createdAt };
  defer(() => sendNotification(record, { store, notifier, log }));

  return { status: "confirmed", name: check.name };
}

async function sendNotification(
  record: RsvpRecord,
  { store, notifier, log }: Pick<Deps, "store" | "notifier"> & { log: Pick<Console, "error" | "info"> },
) {
  let outcome: { ok: true } | { ok: false; error: string };
  try {
    await notifier.notify(record);
    outcome = { ok: true };
    log.info(`[rsvp] correo enviado (rsvp ${record.id})`);
  } catch (err) {
    // La confirmación ya está guardada: se conserva y se registra el fallo.
    outcome = { ok: false, error: errorMessage(err).slice(0, 500) };
    log.error(`[rsvp] fallo al enviar el correo (rsvp ${record.id}):`, outcome.error);
  }
  try {
    await store.recordEmail(record.id, outcome);
  } catch (err) {
    log.error(`[rsvp] no se pudo registrar el estado del correo (rsvp ${record.id}):`, errorMessage(err));
  }
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
  return String(err);
}
