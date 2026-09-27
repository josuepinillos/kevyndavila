"""
Pipeline de fotografías: FOTO → ELIMINACIÓN DE FONDO → PERSONA RECORTADA → COMPOSICIÓN

- Lee los originales de `assets/` (foto_01, foto_02, foto_03, con cualquier extensión,
  incluido HEIC). Los originales NUNCA se modifican.
- Elimina el fondo con rembg. Solo se genera una máscara alfa: los píxeles de la
  persona se conservan tal cual (sin retoque, sin IA generativa).
- Guarda la persona recortada a resolución completa en `assets/processed/`.
- Normaliza el encuadre (misma altura de cabeza y escala) para que las 3 fotos
  se crucen sin saltos, y exporta variantes WebP responsivas a `public/images/`.
- Escribe `src/data/photos.generated.json`, que el sitio lee automáticamente.

Uso:
    python scripts/process_photos.py            # procesa solo lo que falte
    python scripts/process_photos.py --force    # vuelve a recortar todo

Para reemplazar una foto: sustituye el archivo en `assets/` (mismo nombre base),
ejecuta con --force y listo. El orden lo define PHOTO_ORDER.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

try:
    import pillow_heif

    pillow_heif.register_heif_opener()
except ImportError:  # HEIC opcional
    pass

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
PROCESSED = ASSETS / "processed"
PUBLIC = ROOT / "public" / "images"
MANIFEST = ROOT / "src" / "data" / "photos.generated.json"

# Orden de aparición en el sitio. foto_02 es la fotografía principal.
PHOTO_ORDER = ["foto_02", "foto_01", "foto_03"]
EXTENSIONS = [".jpeg", ".jpg", ".png", ".webp", ".heic", ".HEIC", ".JPG", ".JPEG", ".PNG"]

# Lienzo común para todas las fotos (proporción retrato 4:5).
CANVAS_W, CANVAS_H = 1600, 2000
HEAD_TOP = 0.08  # margen sobre la cabeza, como fracción de la altura del lienzo
HEAD_TO_CANVAS = 0.19  # altura de la cabeza (aprox.) respecto a la altura del lienzo
WIDTHS = [480, 800, 1200]
MODEL = "birefnet-portrait"


def find_source(stem: str) -> Path | None:
    # Usa el nombre real del archivo (respeta mayúsculas de la extensión).
    exts = {e.lower() for e in EXTENSIONS}
    for p in sorted(ASSETS.iterdir()):
        if p.is_file() and p.stem == stem and p.suffix.lower() in exts:
            return p
    return None


def cutout(src: Path, dst: Path, session) -> Image.Image:
    from rembg import remove

    img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    # Solo se calcula la máscara; los colores RGB son los del original.
    mask = remove(img, session=session, only_mask=True, post_process_mask=True)
    mask = mask.convert("L")
    # Conserva solo la región conectada más grande (la persona) para
    # eliminar objetos sueltos del fondo que el modelo haya incluido.
    mask = keep_largest_component(mask)
    out = img.copy()
    out.putalpha(mask)
    bbox = mask.point(lambda v: 255 if v > 8 else 0).getbbox()
    out = out.crop(bbox)
    dst.parent.mkdir(parents=True, exist_ok=True)
    out.save(dst, optimize=True)
    return out


def keep_largest_component(mask: Image.Image) -> Image.Image:
    try:
        from scipy import ndimage
    except ImportError:
        return mask
    arr = np.asarray(mask)
    labels, n = ndimage.label(arr > 32)
    if n <= 1:
        return mask
    sizes = ndimage.sum(np.ones_like(arr), labels, range(1, n + 1))
    keep = labels == (int(np.argmax(sizes)) + 1)
    keep = ndimage.binary_dilation(keep, iterations=6)
    return Image.fromarray(np.where(keep, arr, 0).astype(np.uint8))


def head_metrics(person: Image.Image) -> tuple[int, int, int]:
    """Estima (top, alto de cabeza, centro x de la cabeza) a partir de la silueta.

    La cabeza se detecta como la zona superior de la silueta antes de que
    el ancho se dispare (hombros)."""
    a = np.asarray(person.getchannel("A")) > 64
    rows = np.where(a.any(axis=1))[0]
    top = int(rows[0])
    widths = a.sum(axis=1)
    # ancho típico de la cabeza: mediana de las filas justo debajo de la coronilla
    probe = widths[top + 10 : top + max(40, person.height // 20)]
    head_w = float(np.median(probe[probe > 0])) if probe.size else person.width * 0.25
    head_h = int(head_w * 1.35)
    band = a[top : top + head_h]
    cols = np.where(band.any(axis=0))[0]
    cx = int(cols.mean()) if cols.size else person.width // 2
    return top, max(head_h, 1), cx


def compose(person: Image.Image) -> tuple[Image.Image, dict]:
    top, head_h, cx = head_metrics(person)
    scale = (CANVAS_H * HEAD_TO_CANVAS) / head_h
    resized = person.resize(
        (round(person.width * scale), round(person.height * scale)), Image.LANCZOS
    )
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    x = round(CANVAS_W / 2 - cx * scale)
    y = round(CANVAS_H * HEAD_TOP - top * scale)
    canvas.paste(resized, (x, y), resized)  # admite offsets negativos
    return canvas, {"scale": round(scale, 4)}


def export_webp(canvas: Image.Image, slug: str) -> list[dict]:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    out = []
    for w in WIDTHS:
        h = round(CANVAS_H * w / CANVAS_W)
        path = PUBLIC / f"{slug}-{w}.webp"
        canvas.resize((w, h), Image.LANCZOS).save(
            path, "WEBP", quality=84, method=6, exact=True
        )
        out.append({"src": f"/images/{path.name}", "width": w, "height": h})
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="recalcular recortes")
    ap.add_argument("--model", default=MODEL)
    args = ap.parse_args()

    session = None
    manifest = []
    for i, stem in enumerate(PHOTO_ORDER, start=1):
        src = find_source(stem)
        if not src:
            print(f"[skip] {stem}: no existe en assets/")
            continue
        cut_path = PROCESSED / f"{stem}-cutout.png"
        if args.force or not cut_path.exists():
            if session is None:
                from rembg import new_session

                print(f"Cargando modelo {args.model}...")
                session = new_session(args.model)
            print(f"[cutout] {src.name} -> {cut_path.relative_to(ROOT)}")
            person = cutout(src, cut_path, session)
        else:
            person = Image.open(cut_path).convert("RGBA")
        canvas, meta = compose(person)
        slug = f"kevyn-{i:02d}"
        variants = export_webp(canvas, slug)
        manifest.append(
            {
                "id": slug,
                "source": f"assets/{src.name}",
                "cutout": f"assets/processed/{cut_path.name}",
                "variants": variants,
                **meta,
            }
        )
        print(f"[ok] {slug}: {', '.join(v['src'] for v in variants)}")

    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", "utf-8")
    print(f"Manifest -> {MANIFEST.relative_to(ROOT)} ({len(manifest)} fotos)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
