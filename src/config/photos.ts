/**
 * Sistema de 3 fotografías.
 *
 * Las versiones recortadas (fondo transparente) se generan con:
 *   npm run photos            (o: python scripts/process_photos.py --force)
 *
 * El script lee los originales de `assets/` (foto_02, foto_01, foto_03),
 * guarda los recortes en `assets/processed/` y las variantes web en
 * `public/images/kevyn-0N-{480,800,1200}.webp`, y actualiza el manifest
 * que se importa abajo. Para reemplazar una foto basta con sustituir el
 * original en `assets/` y volver a ejecutar el script: los componentes no cambian.
 */
import generated from "@/data/photos.generated.json";

export type PhotoVariant = { src: string; width: number; height: number };

export type Photo = {
  id: string;
  alt: string;
  variants: PhotoVariant[];
};

const alts: Record<string, string> = {
  "kevyn-01": "Kevyn Dávila con camisa celeste y gafas de sol",
  "kevyn-02": "Kevyn Dávila en la playa, mirando hacia un lado",
  "kevyn-03": "Kevyn Dávila con camisa a rayas y brazos cruzados",
};

export const photos: Photo[] = generated.map((p) => ({
  id: p.id,
  alt: alts[p.id] ?? "Kevyn Dávila",
  variants: p.variants,
}));

/** Tiempo que cada fotografía permanece en pantalla (ms). */
export const PHOTO_INTERVAL = 5200;

export function srcSet(photo: Photo) {
  return photo.variants.map((v) => `${v.src} ${v.width}w`).join(", ");
}
