#!/usr/bin/env python3
"""Küçük yığılı marka watermark'ı (BASKETBALL / TACTIC BOARD) — şeffaf PNG.
Animasyon boyunca ekrana bindirmek için. Kullanım: make_watermark.py --out wm.png
"""
import argparse
from PIL import Image, ImageDraw, ImageFont

IMPACT = "/System/Library/Fonts/Supplemental/Impact.ttf"
ORANGE = (249, 115, 22, 255)
WHITE = (255, 255, 255, 255)


def tracked(draw, cx, baseline_y, text, font, fill, tracking):
    widths = [draw.textlength(ch, font=font) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = cx - total / 2
    for ch, w in zip(text, widths):
        draw.text((x, baseline_y), ch, font=font, fill=fill, anchor="ls")
        x += w + tracking


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--scale", type=float, default=1.0)
    a = ap.parse_args()

    s = a.scale
    f_top = ImageFont.truetype(IMPACT, int(56 * s))
    f_bot = ImageFont.truetype(IMPACT, int(29 * s))
    trk_top = 4 * s
    trk_bot = 11 * s
    # ölçü için geçici
    tmp = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    w_top = tmp.textlength("BASKETBALL", font=f_top) + trk_top * 9
    w_bot = tmp.textlength("TACTIC BOARD", font=f_bot) + trk_bot * 11
    W = int(max(w_top, w_bot)) + int(24 * s)
    H = int(110 * s)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = W // 2
    tracked(d, cx, int(60 * s), "BASKETBALL", f_top, ORANGE, trk_top)
    tracked(d, cx, int(96 * s), "TACTIC BOARD", f_bot, WHITE, trk_bot)
    img.save(a.out)
    print(a.out, img.size)


if __name__ == "__main__":
    main()
