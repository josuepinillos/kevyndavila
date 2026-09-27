import "server-only";
import { Resend } from "resend";
import { buildRsvpEmail } from "@/lib/email/rsvpNotification";
import type { RsvpNotifier } from "@/lib/rsvp/service";

export function resendNotifier({
  apiKey,
  from,
  to,
}: {
  apiKey: string;
  from: string;
  to: string[];
}): RsvpNotifier {
  return {
    async notify(rsvp) {
      const missing = [!apiKey && "RESEND_API_KEY", !from && "EMAIL_FROM", !to.length && "RSVP_NOTIFICATION_EMAIL"].filter(Boolean);
      if (missing.length) throw new Error(`Correo no configurado: falta ${missing.join(", ")}`);

      const { subject, html, text } = buildRsvpEmail(rsvp);
      const { error } = await new Resend(apiKey).emails.send(
        { from, to, subject, html, text },
        // Si el envío se reintenta, Resend no duplica el correo de la misma confirmación.
        { idempotencyKey: `rsvp-confirmed/${rsvp.id}` },
      );
      if (error) throw new Error(`Resend: ${error.name ?? "error"} — ${error.message}`);
    },
  };
}
