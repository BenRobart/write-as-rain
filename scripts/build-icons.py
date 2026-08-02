#!/usr/bin/env python3
"""Regenerate favicon.ico, apple-touch-icon.png and og-image.png from favicon.svg.

Run from anywhere:   python scripts/build-icons.py

favicon.svg is the single source of truth for the mark - this script parses its
paths rather than duplicating the geometry, so the rasters cannot drift from it.
Re-run after any change to favicon.svg.

Needs Pillow (pip install Pillow). Playfair Display is downloaded on first run and
cached in scripts/.cache/ (gitignored); it is the same face the site loads from
Google Fonts, so the og:image matches the live headings.

Why this exists rather than a one-line ImageMagick call: there is no ImageMagick,
Inkscape or rsvg-convert on the machine this was built on, and `convert` on Windows'
PATH is the FAT-to-NTFS disk converter, which you very much do not want to run.
"""
import os
import re
import struct
import sys
import urllib.request

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("Pillow is required:  pip install Pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cache")
FONT_PATH = os.path.join(CACHE, "PlayfairDisplay.ttf")
FONT_URL = ("https://github.com/google/fonts/raw/main/ofl/playfairdisplay/"
            "PlayfairDisplay%5Bwght%5D.ttf")

# Light-theme tokens from styles.css, verbatim.
BG = (250, 245, 236)      # --bg      #faf5ec
INK = (43, 33, 24)        # --ink     #2b2118
ACCENT = (109, 31, 42)    # --accent  #6d1f2a
SOFT = tuple(round(a * .12 + b * .88) for a, b in zip(ACCENT, BG))
VB = 64.0                 # favicon.svg viewBox

TAGLINE = "Every word deserves a second pair of eyes."
SERVICES = "Proofreading  ·  Copyediting  ·  Developmental editing"

# --------------------------------------------------------------------------
# Minimal SVG path parser: M/m (with implicit lineto repeats), L/l, C/c, Z/z.
# The implicit-repeat rule is the subtle one and the reason this is hand-rolled:
# after an uppercase M a bare coordinate pair is an ABSOLUTE lineto, after a
# lowercase m it is relative. Getting that wrong silently draws off-canvas.
# --------------------------------------------------------------------------
TOKEN = re.compile(r'[MmLlCcZz]|-?\d*\.?\d+(?:e[-+]?\d+)?')


def _cubic(p0, p1, p2, p3, steps=48):
    out = []
    for i in range(1, steps + 1):
        t = i / steps
        u = 1 - t
        out.append((u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0],
                    u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]))
    return out


def parse_path(d):
    toks = TOKEN.findall(d)
    i = 0
    cur = start = (0.0, 0.0)
    subpaths, pts, cmd, seen_move = [], [], None, False

    def num():
        nonlocal i
        v = float(toks[i]); i += 1
        return v

    while i < len(toks):
        t = toks[i]
        if t in 'MmLlCcZz':
            cmd = t; i += 1
            if cmd in 'Zz':
                if pts:
                    subpaths.append((pts, True)); pts = []
                cur = start
                continue
            if cmd in 'Mm':
                if pts:
                    subpaths.append((pts, False)); pts = []
                x, y = num(), num()
                # the first moveto in a path is absolute even when lowercase
                cur = (cur[0] + x, cur[1] + y) if (cmd == 'm' and seen_move) else (x, y)
                seen_move = True
                start = cur
                pts = [cur]
                cmd = 'L' if cmd == 'M' else 'l'
                continue
        if cmd in 'Ll':
            x, y = num(), num()
            cur = (cur[0] + x, cur[1] + y) if cmd == 'l' else (x, y)
            pts.append(cur)
        elif cmd in 'Cc':
            c1 = (num(), num()); c2 = (num(), num()); pe = (num(), num())
            if cmd == 'c':
                c1 = (cur[0] + c1[0], cur[1] + c1[1])
                c2 = (cur[0] + c2[0], cur[1] + c2[1])
                pe = (cur[0] + pe[0], cur[1] + pe[1])
            pts.extend(_cubic(cur, c1, c2, pe))
            cur = pe
        else:
            raise ValueError(f"unhandled path command {cmd!r}")
    if pts:
        subpaths.append((pts, False))
    return subpaths


def load_marks():
    svg = open(os.path.join(ROOT, "favicon.svg"), encoding="utf-8").read()
    svg = re.sub(r"<!--.*?-->", "", svg, flags=re.S)
    marks = []
    for m in re.finditer(r'<path\b([^>]*)>', svg):
        a = m.group(1)
        w = re.search(r'stroke-width="([\d.]+)"', a)
        marks.append((re.search(r'\bd="([^"]+)"', a).group(1),
                      float(w.group(1)) if w else 4.2,
                      'fill="none"' not in a))
    if len(marks) != 3:
        sys.exit(f"expected 3 paths in favicon.svg, found {len(marks)}")
    return marks


MARKS = load_marks()


def _stroke(dr, pts, colour, w, closed=False):
    p = list(pts) + ([pts[0]] if closed else [])
    dr.line(p, fill=colour, width=max(1, int(round(w))), joint="curve")
    r = w / 2.0
    for x, y in p:                      # round caps and joins
        dr.ellipse([x - r, y - r, x + r, y + r], fill=colour)


def draw_mark(img, x0, y0, size):
    dr = ImageDraw.Draw(img)
    k = size / VB
    for d, w, filled in MARKS:
        for sp, closed in parse_path(d):
            pts = [(x0 + p[0] * k, y0 + p[1] * k) for p in sp]
            if filled:
                dr.polygon(pts, fill=SOFT)
            _stroke(dr, pts, ACCENT, w * k, closed=closed and filled)


def tile(size, ss=8, rounded=True, pad=0.0):
    S = size * ss
    img = Image.new("RGB", (S, S), BG)
    draw_mark(img, S * pad, S * pad, S * (1 - 2 * pad))
    img = img.resize((size, size), Image.LANCZOS)
    if not rounded:
        return img.convert("RGBA")
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1],
                                           radius=int(12 * (S / VB)), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask.resize((size, size), Image.LANCZOS))
    return out


def get_font():
    if not os.path.exists(FONT_PATH):
        os.makedirs(CACHE, exist_ok=True)
        print("downloading Playfair Display...")
        urllib.request.urlretrieve(FONT_URL, FONT_PATH)
    return FONT_PATH


def font(px, weight="Regular"):
    f = ImageFont.truetype(get_font(), px)
    try:
        f.set_variation_by_name(weight)
    except Exception:
        pass
    return f


def og_image():
    ss = 2
    img = Image.new("RGB", (1200 * ss, 630 * ss), BG)
    m = 150 * ss
    draw_mark(img, (1200 * ss - m) / 2, 74 * ss, m)
    img = img.resize((1200, 630), Image.LANCZOS)
    dr = ImageDraw.Draw(img)

    def centred(y, text, f, fill):
        w = dr.textbbox((0, 0), text, font=f)[2]
        dr.text(((1200 - w) // 2, y), text, font=f, fill=fill)

    centred(258, "Write as Rain", font(92, "SemiBold"), ACCENT)
    dr.rectangle([540, 382, 660, 383],
                 fill=tuple(round(a * .35 + b * .65) for a, b in zip(ACCENT, BG)))
    centred(410, TAGLINE, font(38, "Regular"), INK)
    centred(486, SERVICES, font(26, "Medium"),
            tuple(round(a * .62 + b * .38) for a, b in zip(INK, BG)))
    dr.rectangle([0, 622, 1200, 630], fill=ACCENT)   # brand bar
    return img


def main():
    ico = os.path.join(ROOT, "favicon.ico")
    tile(256).save(ico, format="ICO",
                   sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

    # iOS masks its own corners, so this one is square, opaque and padded
    tile(180, rounded=False, pad=0.10).convert("RGB").save(
        os.path.join(ROOT, "apple-touch-icon.png"), format="PNG")

    og_image().save(os.path.join(ROOT, "og-image.png"), format="PNG", optimize=True)

    d = open(ico, "rb").read()
    n = struct.unpack("<H", d[4:6])[0]
    sizes = ", ".join(f"{d[6+j*16] or 256}x{d[7+j*16] or 256}" for j in range(n))
    print(f"favicon.ico       {n} sizes ({sizes})")
    print("apple-touch-icon.png  180x180")
    print("og-image.png          1200x630")


if __name__ == "__main__":
    main()
