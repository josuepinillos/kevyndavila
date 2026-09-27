/**
 * Validación y normalización de nombres.
 * Módulo puro: lo usa el cliente (feedback inmediato) y el servidor (validación real).
 */

export const NAME_MIN = 2;
export const NAME_MAX = 100;

// Letras de cualquier idioma, tildes, ñ, espacios, apóstrofes, guiones y puntos (p. ej. "Ma. José").
const ALLOWED = /^[\p{L}\p{M}\s'’‘ʼ.\-‐‑–]+$/u;
const APOSTROPHES = /[’‘ʼ`´]/g;
const DASHES = /[‐‑–—]/g;

/** Nombre para mostrar/guardar: solo se recortan y unifican espacios. */
export function cleanName(raw: string): string {
  return raw.normalize("NFC").replace(/\s+/g, " ").trim();
}

/**
 * Clave de comparación para detectar duplicados:
 * "  Juan   Pérez " y "juan perez" → "juan perez".
 * Se eliminan tildes y diéresis, pero la ñ se conserva (Peña ≠ Pena).
 */
export function nameKey(raw: string): string {
  return cleanName(raw)
    .normalize("NFD")
    .replace(/\p{M}/gu, (mark, offset: number, str: string) =>
      mark === "̃" && /[nN]/.test(str[offset - 1] ?? "") ? mark : "",
    )
    .normalize("NFC")
    .replace(APOSTROPHES, "'")
    .replace(DASHES, "-")
    .toLocaleLowerCase("es");
}

export type NameCheck =
  | { ok: true; name: string; key: string }
  | { ok: false; error: string };

export function validateName(raw: unknown): NameCheck {
  if (typeof raw !== "string") return { ok: false, error: "Escribe tu nombre para confirmar." };
  const name = cleanName(raw);
  if (!name) return { ok: false, error: "Escribe tu nombre para confirmar." };
  if (name.length > NAME_MAX) {
    return { ok: false, error: `El nombre es demasiado largo (máximo ${NAME_MAX} caracteres).` };
  }
  const letters = name.match(/\p{L}/gu)?.length ?? 0;
  if (name.length < NAME_MIN || letters < NAME_MIN) {
    return { ok: false, error: "Escribe tu nombre completo." };
  }
  if (!ALLOWED.test(name)) {
    return { ok: false, error: "Usa solo letras, espacios, apóstrofes o guiones." };
  }
  return { ok: true, name, key: nameKey(name) };
}

/** Primer nombre para el saludo ("¡Gracias, Juan!"). Solo visual: no altera lo guardado. */
export function firstNameOf(name: string): string {
  const first = cleanName(name).split(" ")[0] ?? "";
  return first.charAt(0).toLocaleUpperCase("es") + first.slice(1);
}
