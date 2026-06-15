#!/usr/bin/env python3
"""Şeffaf PNG olarak ortalanmış (çok satırlı) metin üretir — ffmpeg overlay için.
Kullanım:
  make_text.py --text "Satır1\nSatır2" --out x.png --size 52 --color #ffffff \
    [--bg #0f172a --bgalpha 220 --pad 36 --radius 28 --shadow]
"""
import argparse
from PIL import Image, ImageDraw, ImageFont

FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def hexrgb(h):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--text", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--size", type=int, default=52)
    ap.add_argument("--color", default="#ffffff")
    ap.add_argument("--bg", default="")
    ap.add_argument("--bgalpha", type=int, default=220)
    ap.add_argument("--pad", type=int, default=36)
    ap.add_argument("--radius", type=int, default=28)
    ap.add_argument("--linespacing", type=int, default=16)
    ap.add_argument("--shadow", action="store_true")
    a = ap.parse_args()

    lines = a.text.split("\\n")
    font = ImageFont.truetype(FONT, a.size)
    tmp = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    dims = [tmp.textbbox((0, 0), ln, font=font) for ln in lines]
    line_h = max(b[3] - b[1] for b in dims)
    tw = max(b[2] - b[0] for b in dims)
    th = line_h * len(lines) + a.linespacing * (len(lines) - 1)
    W, H = tw + 2 * a.pad, th + 2 * a.pad

    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    if a.bg:
        draw.rounded_rectangle([0, 0, W - 1, H - 1], radius=a.radius,
                               fill=hexrgb(a.bg) + (a.bgalpha,))
    col = hexrgb(a.color) + (255,)
    cx = W // 2
    y = a.pad + line_h // 2
    for ln in lines:
        if a.shadow:
            draw.text((cx + 3, y + 3), ln, font=font, fill=(0, 0, 0, 170), anchor="mm")
        draw.text((cx, y), ln, font=font, fill=col, anchor="mm")
        y += line_h + a.linespacing
    img.save(a.out)
    print(a.out, W, H)


if __name__ == "__main__":
    main()
