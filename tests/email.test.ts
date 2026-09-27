import { describe, expect, it } from "vitest";
import { buildRsvpEmail, RSVP_EMAIL_SUBJECT } from "@/lib/email/rsvpNotification";

describe("correo al organizador", () => {
  // 00:35 UTC del 26/09 = 7:35 p. m. del 25/09 en Perú (UTC-5)
  const email = buildRsvpEmail({ name: "Juan Pérez", createdAt: "2026-09-26T00:35:00Z" });

  it("usa el asunto indicado", () => {
    expect(RSVP_EMAIL_SUBJECT).toBe("Nueva confirmación — Cumpleaños Kevyn Dávila");
    expect(email.subject).toBe(RSVP_EMAIL_SUBJECT);
  });

  it("convierte la hora de confirmación a la zona horaria de Perú", () => {
    expect(email.text).toContain("Fecha de confirmación: 25 de septiembre de 2026");
    expect(email.text).toContain("Hora: 7:35 p. m.");
  });

  it("incluye invitado y datos del evento", () => {
    for (const s of [
      "Invitado: Juan Pérez",
      "Evento: Cumpleaños de Kevyn Dávila",
      "Fecha del evento: 10 de octubre de 2026",
      "Hora del evento: 3:00 p. m.",
      "Lugar: Villa Doña Martha",
    ]) {
      expect(email.text).toContain(s);
    }
    expect(email.html).toContain("Juan Pérez");
    expect(email.html).toContain("Nueva confirmación de asistencia");
  });

  it("escapa el nombre en el HTML", () => {
    const { html } = buildRsvpEmail({ name: `<img src=x onerror="alert(1)">`, createdAt: new Date() });
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  });
});
