#!/usr/bin/env python3
"""
Deriva los logos de co-organizadores a marcas blancas sobre transparente.

Los originales vienen con fondo opaco (JPEG morado sobre gris, PNG oscuro sobre
blanco, JPEG verde sobre verde), así que no sirve el truco CSS de
`brightness-0 invert`: un fondo opaco se convierte en un bloque blanco sólido.

En vez de recortar a mano, se usa la luminancia como canal alfa: se lleva el
fondo a 0 y la marca a 1 con un nivel, se pinta todo blanco y se recorta al
bounding box. El antialiasing del original sobrevive porque el nivel es una
rampa, no un umbral duro.

Uso:  python3 scripts/generate-organizer-marks.py
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "organizadores"

# (origen, destino, invertir_luminancia, nivel_lo, nivel_hi)
# invertir = la marca es más oscura que el fondo
MARKS = [
    ("ailabs.jpeg", "ai-labs.png", False, 70, 140),
    ("nucleo-logo.png", "nucleo-labs.png", True, 60, 180),
    ("open2.jpeg", "open2.png", False, 90, 200),
]

PADDING = 2


def build(src_name, out_name, invert, lo, hi):
    img = Image.open(SRC / src_name).convert("RGB")
    lum = img.convert("L")
    if invert:
        lum = Image.eval(lum, lambda v: 255 - v)

    # Nivel: todo <= lo es fondo, todo >= hi es marca, el medio es antialiasing
    span = hi - lo
    alpha = Image.eval(lum, lambda v: 0 if v <= lo else 255 if v >= hi else round((v - lo) * 255 / span))

    white = Image.new("RGBA", img.size, (255, 255, 255, 0))
    white.putalpha(alpha)

    box = alpha.getbbox()
    if box:
        left, top, right, bottom = box
        white = white.crop((
            max(left - PADDING, 0),
            max(top - PADDING, 0),
            min(right + PADDING, img.width),
            min(bottom + PADDING, img.height),
        ))

    white.save(SRC / out_name)
    print(f"{src_name} -> {out_name}  {white.size[0]}x{white.size[1]}")


if __name__ == "__main__":
    for mark in MARKS:
        build(*mark)
