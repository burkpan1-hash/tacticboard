#!/usr/bin/env python3
"""1080x1920 şık marka kapanış kartı (outro) üretir.
  BASKETBALL (turuncu) / TACTIC BOARD (beyaz) wordmark + URL pill + CTA satırı.
Kullanım: make_outro.py --cta "Kendi setini çiz · Link profilde" --out outro_tr.png
"""
import argparse
from PIL import Image, ImageDraw, ImageFont

IMPACT = "/System/Library/Fonts/Supplemental/Impact.ttf"
ARIAL = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
W, H = 1080, 1920
ORANGE = (249, 115, 22)
WHITE = (255, 255, 255)
MUTED = (148, 163, 184)
PILL = (30, 41, 59)
BG_TOP = (15, 23, 42)
BG_BOT = (7, 11, 22)


def gradient_bg():
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / (H - 1)
        c = tuple(int(BG_TOP[i] + (BG_BOT[i] - BG_TOP[i]) * t) for i in range(3))
        d.line([(0, y), (W, y)], fill=c)
    return img


def tracked(draw, cx, baseline_y, text, font, fill, tracking):
    widths = [draw.textlength(ch, font=font) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = cx - total / 2
    for ch, w in zip(text, widths):
        draw.text((x, baseline_y), ch, font=font, fill=fill, anchor="ls")
        x += w + tracking


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cta", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--url", default="basketballtacticboard.com")
    a = ap.parse_args()

    img = gradient_bg().convert("RGBA")
    d = ImageDraw.Draw(img)
    cx = W // 2

    # Wordmark
    f_top = ImageFont.truetype(IMPACT, 168)
    f_bot = ImageFont.truetype(IMPACT, 92)
    tracked(d, cx, 880, "BASKETBALL", f_top, ORANGE, 4)
    tracked(d, cx, 980, "TACTIC BOARD", f_bot, WHITE, 26)

    # Orange divider accent
    d.rounded_rectangle([cx - 90, 1030, cx + 90, 1038], radius=4, fill=ORANGE)

    # URL pill
    f_url = ImageFont.truetype(ARIAL, 44)
    uw = d.textlength(a.url, font=f_url)
    pad_x, pad_y = 44, 26
    pill_w, pill_h = uw + 2 * pad_x, 44 + 2 * pad_y
    px0, py0 = cx - pill_w / 2, 1130
    d.rounded_rectangle([px0, py0, px0 + pill_w, py0 + pill_h], radius=pill_h / 2,
                        fill=PILL, outline=ORANGE, width=3)
    d.text((cx, py0 + pill_h / 2), a.url, font=f_url, fill=ORANGE, anchor="mm")

    # CTA line
    f_cta = ImageFont.truetype(ARIAL, 42)
    d.text((cx, 1290), a.cta, font=f_cta, fill=MUTED, anchor="mm")

    img.save(a.out)
    print(a.out, img.size)


if __name__ == "__main__":
    main()
