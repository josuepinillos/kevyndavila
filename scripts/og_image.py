"""
Genera la imagen Open Graph (1200×630) para compartir la invitación.

- Usa la fotografía recortada existente (assets/processed/foto_02-cutout.png) sin
  modificar a la persona: solo escala, posición y un fundido inferior del fondo.
- Usa las mismas fuentes del sitio (src/app/fonts).
- Lee fecha y hora de src/config/event.ts (única fuente de verdad).

Salida:
  src/app/opengraph-image.jpg   (Next.js genera og:image, dimensiones y tipo)
  src/app/twitter-image.jpg     (misma imagen para twitter:image)
  src/app/*.alt.txt             (texto alternativo)

Uso:  python scripts/og_image.py
"""

from __future__ import annotations

import re
import shutil
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "src" / "app" / "fonts"
OUT_OG = ROOT / "src" / "app" / "opengraph-image.jpg"
OUT_TW = ROOT / "src" / "app" / "twitter-image.jpg"
PHOTO = ROOT / "assets" / "processed" / "foto_02-cutout.png"

W, H = 1200, 630
S = 2  # supersampling: se dibuja a 2× y se reduce al final
NIGHT = (6, 21, 37)
CREAM = (247, 243, 234)
GOLD_STOPS = [(0.0, (157, 116, 39)), (0.22, (230, 196, 119)), (0.45, (200, 155, 60)),
              (0.6, (244, 224, 168)), (0.78, (183, 137, 47)), (1.0, (230, 196, 119))]


def event_data() -> dict[str, str]:
    src = (ROOT / "src" / "config" / "event.ts").read_text("utf-8")
    get = lambda k: re.search(rf'{k}:\s*"([^"]+)"', src).group(1)  # noqa: E731
    return {k: get(k) for k in ("firstName", "lastName", "headline", "weekday", "dateNumeric", "time")}


def font(name: str, size: int, weight: int, italic: bool = False) -> ImageFont.FreeTypeFont:
    files = {
        "serif": "cormorant-garamond-latin-italic-var.woff2" if italic else "cormorant-garamond-latin-var.woff2",
        "sans": "manrope-latin-var.woff2",
    }
    f = ImageFont.truetype(str(FONTS / files[name]), size * S)
    f.set_variation_by_axes([weight])
    return f


def gold_gradient(w: int, h: int) -> Image.Image:
    x = np.linspace(0, 1, w)
    cols = np.zeros((w, 3))
    for c in range(3):
        cols[:, c] = np.interp(x, [s for s, _ in GOLD_STOPS], [col[c] for _, col in GOLD_STOPS])
    return Image.fromarray(np.repeat(cols[None, :, :], h, axis=0).astype(np.uint8), "RGB")


def draw_tracked(mask: Image.Image, xy: tuple[int, int], text: str, f: ImageFont.FreeTypeFont, tracking: float) -> int:
    """Dibuja texto con espaciado entre letras (tracking en em). Devuelve el ancho."""
    d = ImageDraw.Draw(mask)
    x, y = xy
    em = f.size
    for i, ch in enumerate(text):
        d.text((x, y), ch, font=f, fill=255)
        x += f.getlength(ch) + (tracking * em if i < len(text) - 1 else 0)
    return int(x - xy[0])


def paint(canvas: Image.Image, mask: Image.Image, fill: Image.Image | tuple, glow: float = 0.0) -> None:
    if glow:
        halo = mask.filter(ImageFilter.GaussianBlur(18 * S)).point(lambda v: int(v * glow))
        canvas.paste((216, 174, 85), (0, 0), halo)
    layer = fill if isinstance(fill, Image.Image) else Image.new("RGB", canvas.size, fill)
    canvas.paste(layer, (0, 0), mask)


def sparkle(d: ImageDraw.ImageDraw, cx: float, cy: float, r: float, color) -> None:
    k = r * 0.22
    pts = [(cx, cy - r), (cx + k, cy - k), (cx + r, cy), (cx + k, cy + k),
           (cx, cy + r), (cx - k, cy + k), (cx - r, cy), (cx - k, cy - k)]
    d.polygon([(x * S, y * S) for x, y in pts], fill=color)


def main() -> None:
    ev = event_data()
    cw, ch = W * S, H * S

    # ── Fondo: azul noche con luz ambiental a la derecha y viñeteado ──
    yy, xx = np.mgrid[0:ch, 0:cw].astype(np.float32)
    light = np.exp(-(((xx - 0.72 * cw) / (0.42 * cw)) ** 2 + ((yy - 0.42 * ch) / (0.75 * ch)) ** 2))
    base = np.array(NIGHT, np.float32)
    deep = np.array((18, 58, 90), np.float32)
    bg = base + (deep - base) * light[..., None] * 0.95
    vign = np.clip(1 - 0.35 * (((xx - cw / 2) / (cw / 2)) ** 2 + ((yy - ch / 2) / (ch / 2)) ** 2), 0.55, 1)
    canvas = Image.fromarray(np.clip(bg * vign[..., None], 0, 255).astype(np.uint8), "RGB")

    # ── Composición de la persona (derecha) ──
    cx, cy, r = 900, 262, 228  # centro y radio del halo
    glow = Image.new("L", (cw, ch), 0)
    ImageDraw.Draw(glow).ellipse([(cx - 150) * S, (cy - 170) * S, (cx + 150) * S, (cy + 130) * S], fill=70)
    canvas.paste((216, 174, 85), (0, 0), glow.filter(ImageFilter.GaussianBlur(90 * S)))

    ring = Image.new("L", (cw, ch), 0)
    rd = ImageDraw.Draw(ring)
    rd.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S], outline=210, width=int(1.6 * S))
    dots = Image.new("L", (cw, ch), 0)
    dd = ImageDraw.Draw(dots)
    for a in np.arange(0, 360, 2.2):
        t = np.deg2rad(a)
        px, py = (cx + (r + 22) * np.cos(t)) * S, (cy + (r + 22) * np.sin(t)) * S
        dd.ellipse([px - 1.2 * S, py - 1.2 * S, px + 1.2 * S, py + 1.2 * S], fill=90)
    canvas.paste(gold_gradient(cw, ch), (0, 0), ring)
    canvas.paste((216, 174, 85), (0, 0), dots)
    rd2 = ImageDraw.Draw(canvas)
    rd2.ellipse([(cx - 4) * S, (cy - r - 4) * S, (cx + 4) * S, (cy - r + 4) * S], fill=(230, 196, 119))

    person = Image.open(PHOTO).convert("RGBA")
    a = np.asarray(person.getchannel("A")) > 64
    top = int(np.where(a.any(axis=1))[0][0])
    widths = a.sum(axis=1)
    probe = widths[top + 10: top + person.height // 20]
    head_w = float(np.median(probe[probe > 0]))
    scale = (118 * S) / (head_w * 1.35)  # altura de cabeza ≈ 118 px en la imagen final
    person = person.resize((round(person.width * scale), round(person.height * scale)), Image.LANCZOS)
    band = a[top: top + int(head_w * 1.35)]
    head_cx = np.where(band.any(axis=0))[0].mean() * scale
    px, py = int(cx * S - head_cx), int(58 * S - top * scale)
    # fundido inferior del fondo (no altera a la persona, solo su borde inferior en la composición)
    fade = np.ones(person.height, np.float32)
    y0, y1 = int((H * 0.55) * S - py), int((H * 0.93) * S - py)
    fade[max(0, y0):] = np.clip(1 - (np.arange(max(0, y0), person.height) - y0) / max(1, y1 - y0), 0, 1)
    alpha = (np.asarray(person.getchannel("A"), np.float32) * fade[:, None]).astype(np.uint8)
    person.putalpha(Image.fromarray(alpha))
    canvas.paste(person, (px, py), person)

    # arco delantero (el halo cruza por delante del hombro)
    front = Image.new("L", (cw, ch), 0)
    ImageDraw.Draw(front).arc([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S], start=12, end=64,
                              fill=190, width=int(1.8 * S))
    canvas.paste(gold_gradient(cw, ch), (0, 0), front)

    d = ImageDraw.Draw(canvas)
    for sx, sy, sr, col in [(640, 150, 9, (230, 196, 119)), (1110, 120, 6, (241, 220, 164)),
                            (1135, 360, 7, (216, 174, 85)), (690, 430, 5, (216, 174, 85)),
                            (560, 70, 4, (241, 220, 164))]:
        sparkle(d, sx, sy, sr, col)

    # ── Texto (izquierda) ──
    left = 78
    name_font = font("serif", 132, 500)
    gold = gold_gradient(cw, ch)
    m = Image.new("L", (cw, ch), 0)
    draw_tracked(m, (left * S, 88 * S), ev["firstName"].upper(), name_font, 0.045)
    draw_tracked(m, ((left + 62) * S, 200 * S), ev["lastName"].upper(), name_font, 0.045)
    paint(canvas, m, gold, glow=0.35)

    m = Image.new("L", (cw, ch), 0)
    ImageDraw.Draw(m).text((left * S, 372 * S), ev["headline"], font=font("serif", 50, 400, italic=True), fill=255)
    paint(canvas, m, CREAM)

    # línea dorada con rombo
    d = ImageDraw.Draw(canvas)
    ly = 468
    d.line([(left * S, ly * S), ((left + 150) * S, ly * S)], fill=(200, 155, 60), width=S)
    mx = left + 170
    d.polygon([(mx * S, (ly - 7) * S), ((mx + 7) * S, ly * S), (mx * S, (ly + 7) * S), ((mx - 7) * S, ly * S)],
              outline=(216, 174, 85), width=S)
    d.line([((mx + 20) * S, ly * S), ((mx + 170) * S, ly * S)], fill=(200, 155, 60), width=S)

    date = ev["dateNumeric"].replace("/", ".")
    line = f'{ev["weekday"]}  ·  {date}  ·  {ev["time"]}'.upper()
    m = Image.new("L", (cw, ch), 0)
    draw_tracked(m, (left * S, 500 * S), line, font("sans", 25, 600), 0.16)
    paint(canvas, m, (230, 196, 119))

    # ── Grano sutil y salida ──
    rng = np.random.default_rng(7)
    noise = Image.fromarray((rng.normal(128, 10, (ch, cw))).clip(0, 255).astype(np.uint8), "L").convert("RGB")
    canvas = Image.blend(canvas, ImageChops.overlay(canvas, noise), 0.35)
    final = canvas.resize((W, H), Image.LANCZOS)
    final.save(OUT_OG, "JPEG", quality=86, optimize=True, progressive=True)
    shutil.copyfile(OUT_OG, OUT_TW)
    # Texto alternativo (Next.js lo publica como og:image:alt / twitter:image:alt)
    alt = f'Invitación al cumpleaños de {ev["firstName"]} {ev["lastName"]} · {ev["weekday"]} {date} · {ev["time"]}'
    for out in (OUT_OG, OUT_TW):
        out.with_name(out.stem + ".alt.txt").write_text(alt, "utf-8")
    print(f"{OUT_OG.relative_to(ROOT)}  {final.size}  {OUT_OG.stat().st_size // 1024} KB")
    print(f"{OUT_TW.relative_to(ROOT)}  (copia)")
    print(f"alt: {alt}")


if __name__ == "__main__":
    main()
