#!/usr/bin/env python3
"""Kare marka avatar (profil fotosu) — B (turuncu) / TB (beyaz) monogram, #0f172a.
X/Instagram daire kırpımına uygun, tam-taşma arka plan. Kullanım: make_avatar.py --out avatar.png
"""
import argparse
from PIL import Image, ImageDraw, ImageFont

IMPACT = "/System/Library/Fonts/Supplemental/Impact.ttf"
ORANGE = (249, 115, 22)
WHITE = (255, 255, 255)
BG_TOP = (17, 26, 48)
BG_BOT = (8, 12, 24)
S = 1000


def tracked(draw, cx, by, text, font, fill, trk):
    ws = [draw.textlength(c, font=font) for c in text]
    x = cx - (sum(ws) + trk * (len(text) - 1)) / 2
    for c, w in zip(text, ws):
        draw.text((x, by), c, font=font, fill=fill, anchor="ls")
        x += w + trk


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    a = ap.parse_args()

    img = Image.new("RGB", (S, S))
    d = ImageDraw.Draw(img)
    for y in range(S):  # hafif dikey gradient (derinlik)
        t = y / (S - 1)
        d.line([(0, y), (S, y)], fill=tuple(int(BG_TOP[i] + (BG_BOT[i] - BG_TOP[i]) * t) for i in range(3)))

    cx = S // 2
    f_b = ImageFont.truetype(IMPACT, 540)
    d.text((cx, 400), "B", font=f_b, fill=ORANGE, anchor="mm")
    f_tb = ImageFont.truetype(IMPACT, 200)
    tracked(d, cx, 800, "TB", f_tb, WHITE, 34)

    img.save(a.out)
    print(a.out, img.size)


if __name__ == "__main__":
    main()
