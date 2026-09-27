/**
 * Correo al organizador por cada nueva confirmación.
 * HTML con tablas y estilos en línea (compatible con Gmail, Outlook y Apple Mail).
 */
import { event } from "@/config/event";

const LOCALE = "es";

const fmtDate = new Intl.DateTimeFormat(LOCALE, {
  timeZone: event.timeZone,
  day: "numeric",
  month: "long",
  year: "numeric",
});
const fmtTime = new Intl.DateTimeFormat(LOCALE, {
  timeZone: event.timeZone,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export function formatDate(d: Date) {
  return fmtDate.format(d);
}
export function formatTime(d: Date) {
  // Intl usa espacios finos/no separables en "p. m."; se normalizan para el correo.
  return fmtTime.format(d).replace(/[  ]/g, " ");
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const RSVP_EMAIL_SUBJECT = `Nueva confirmación — Cumpleaños ${event.firstName} ${event.lastName}`;

export function buildRsvpEmail({ name, createdAt }: { name: string; createdAt: string | Date }) {
  const confirmed = new Date(createdAt);
  const eventStart = new Date(event.startsAt);
  const host = `${event.firstName} ${event.lastName}`;

  const rows: [string, string][] = [
    ["Invitado", name],
    ["Fecha de confirmación", formatDate(confirmed)],
    ["Hora", formatTime(confirmed)],
    ["Evento", `Cumpleaños de ${host}`],
    ["Fecha del evento", formatDate(eventStart)],
    ["Hora del evento", formatTime(eventStart)],
    ["Lugar", event.venue],
  ];

  const text = [
    "Nueva confirmación de asistencia",
    "",
    `Una nueva persona confirmó su asistencia al cumpleaños de ${host}.`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    event.mapsUrl ? `Ubicación: ${event.mapsUrl}` : "",
  ]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n")
    .trim();

  const serif = "Georgia, 'Times New Roman', Times, serif";
  const sans = "Helvetica, Arial, sans-serif";

  const rowsHtml = rows
    .map(
      ([k, v], i) => `
          <tr>
            <td style="padding:${i === 0 ? "0" : "18px"} 0 0 0;">
              <div style="font-family:${sans};font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#D8AE55;font-weight:bold;">${escapeHtml(k)}</div>
              <div style="font-family:${serif};font-size:${i === 0 ? "26px" : "19px"};line-height:1.3;color:#F7F3EA;padding-top:4px;">${escapeHtml(v)}</div>
            </td>
          </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>${escapeHtml(RSVP_EMAIL_SUBJECT)}</title>
</head>
<body style="margin:0;padding:0;background-color:#061525;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(name)} confirmó su asistencia · ${escapeHtml(formatDate(confirmed))}, ${escapeHtml(formatTime(confirmed))}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#061525" style="background-color:#061525;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
          <tr>
            <td align="center" style="padding:0 0 22px 0;font-family:${serif};font-size:15px;letter-spacing:6px;text-transform:uppercase;color:#E6C477;">
              ${escapeHtml(host)}
            </td>
          </tr>
          <tr>
            <td bgcolor="#0B2036" style="background-color:#0B2036;border:1px solid #5C4B26;border-radius:18px;padding:36px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:${serif};font-size:28px;line-height:1.2;color:#E6C477;padding-bottom:12px;">
                    Nueva confirmación de asistencia
                  </td>
                </tr>
                <tr>
                  <td style="font-family:${sans};font-size:15px;line-height:1.6;color:#C9CED6;padding-bottom:26px;">
                    Una nueva persona confirmó su asistencia al cumpleaños de ${escapeHtml(host)}.
                  </td>
                </tr>
                <tr>
                  <td style="border-top:1px solid #3A3522;padding-top:26px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rowsHtml}
                    </table>
                  </td>
                </tr>${
                  event.mapsUrl
                    ? `
                <tr>
                  <td style="padding-top:30px;">
                    <a href="${escapeHtml(event.mapsUrl)}" style="display:inline-block;font-family:${sans};font-size:11px;letter-spacing:2.5px;text-transform:uppercase;font-weight:bold;color:#061525;background-color:#D8AE55;text-decoration:none;padding:13px 22px;border-radius:999px;">Ver ubicación</a>
                  </td>
                </tr>`
                    : ""
                }
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:22px 0 0 0;font-family:${sans};font-size:11px;line-height:1.6;color:#6F7A89;">
              Notificación automática de la invitación digital.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: RSVP_EMAIL_SUBJECT, html, text };
}
