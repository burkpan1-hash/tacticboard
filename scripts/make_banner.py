#!/usr/bin/env python3
"""X/Twitter banner (1500x500) — full BASKETBALL / TACTIC BOARD wordmark + URL pill.
Avatar sol-alta bindiği için içerik ortada/üstte güvenli alanda. Kullanım: make_banner.py --out banner.png
"""
import argparse
from PIL import Image, ImageDraw, ImageFont

IMPACT = "/System/Library/Fonts/Supplemental/Impact.ttf"
ARIAL = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
W, H = 1500, 500
ORANGE = (249, 115, 22)
WHITE = (255, 255, 255)
MUTED = (148, 163, 184)
PILL = (30, 41, 59)
BG_TOP = (17, 26, 48)
BG_BOT = (7, 11, 22)


def tracked(draw, cx, by, text, font, fill, trk):
    ws = [draw.textlength(c, font=font) for c in text]
    x = cx - (sum(ws) + trk * (len(text) - 1)) / 2
    for c, w in zip(text, ws):
        draw.text((x, by), c, font=font, fill=fill, anchor="ls")
        x += w + trk


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--url", default="basketballtacticboard.com")
    a = ap.parse_args()

    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / (H - 1)
        d.line([(0, y), (W, y)], fill=tuple(int(BG_TOP[i] + (BG_BOT[i] - BG_TOP[i]) * t) for i in range(3)))

    # Hafif saha motifi (sağ ve sol, çok soluk) — derinlik
    fade = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    fd = ImageDraw.Draw(fade)
    for cxm in (140, 1360):
        fd.ellipse([cxm - 150, H // 2 - 150, cxm + 150, H // 2 + 150], outline=ORANGE + (28,), width=5)
        fd.ellipse([cxm - 80, H // 2 - 80, cxm + 80, H // 2 + 80], outline=ORANGE + (20,), width=4)
    img = Image.alpha_composite(img.convert("RGBA"), fade)
    d = ImageDraw.Draw(img)

    cx = W // 2
    tracked(d, cx, 220, "BASKETBALL", ImageFont.truetype(IMPACT, 150), ORANGE, 4)
    tracked(d, cx, 300, "TACTIC BOARD", ImageFont.truetype(IMPACT, 80), WHITE, 26)
    d.rounded_rectangle([cx - 80, 330, cx + 80, 338], radius=4, fill=ORANGE)

    f_url = ImageFont.truetype(ARIAL, 40)
    uw = d.textlength(a.url, font=f_url)
    pw, ph = uw + 84, 80
    px, py = cx - pw / 2, 372
    d.rounded_rectangle([px, py, px + pw, py + ph], radius=ph / 2, fill=PILL + (255,),
                        outline=ORANGE + (255,), width=3)
    d.text((cx, py + ph / 2), a.url, font=f_url, fill=ORANGE, anchor="mm")

    img.convert("RGB").save(a.out)
    print(a.out, img.size)


if __name__ == "__main__":
    main()
