/**
 * Datos del evento. Todo el texto visible de la invitación sale de aquí.
 */
export const event = {
  firstName: "Kevyn",
  lastName: "Dávila",
  occasion: "Cumpleaños",
  headline: "Te invito a mi cumpleaños",
  subline: "Será un placer compartir este momento contigo.",
  experience: "Un día para celebrar, compartir y pasarla increíble.",
  closing: "¡Te espero!",

  /** Fecha y hora con zona horaria (Perú, UTC-5) para la cuenta regresiva y el correo. */
  startsAt: "2026-10-10T15:00:00-05:00",
  timeZone: "America/Lima",
  dateNumeric: "10/10/2026",
  dateShort: "10.10.26",
  weekday: "Sábado",
  day: "10",
  month: "Octubre",
  year: "2026",
  time: "3:00 pm",

  venue: "Villa Doña Martha",
  venueReference: "A pocos metros del Colegio Algarrobos.",
  mapsUrl: "https://www.google.com/maps?q=-6.799842834472656,-79.87979888916016&z=17&hl=es",
} as const;

export const navItems = [
  { href: "#inicio", label: "Inicio" },
  { href: "#detalles", label: "Detalles" },
  { href: "#ubicacion", label: "Ubicación" },
  { href: "#confirmar", label: "Confirmar" },
] as const;
