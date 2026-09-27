import "server-only";

/**
 * Configuración del RSVP. Solo servidor: ninguna de estas variables usa NEXT_PUBLIC_,
 * así que nunca se incluyen en el JavaScript del navegador.
 */
export function rsvpConfig() {
  const env = process.env;
  return {
    supabaseUrl: env.SUPABASE_URL?.trim() ?? "",
    // Clave secreta (sb_secret_…) o, en proyectos antiguos, la service_role key.
    supabaseKey: (env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim(),
    resendKey: env.RESEND_API_KEY?.trim() ?? "",
    notifyTo: (env.RSVP_NOTIFICATION_EMAIL ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    from: env.EMAIL_FROM?.trim() ?? "",
    /** Solo desarrollo: guarda en memoria para probar sin Supabase. Ignorado en producción. */
    memoryStore: env.RSVP_STORE === "memory" && env.NODE_ENV !== "production",
  };
}

export type RsvpConfig = ReturnType<typeof rsvpConfig>;
