#!/usr/bin/env python3
"""Donma anında üst panele bindirilecek 'setin fikri' açıklama kartı (1080x1920 şeffaf).
Opak panel + gölgeli yazı + otomatik font sığdırma → yüksek okunabilirlik.
Watermark (üst ~y50-204) ile çakışmaması için panel y=290'dan başlar.
Kullanım: make_explain.py --title "SETİN FİKRİ" --body "Satır1\nSatır2\nSatır3" --out ex.png
"""
import argparse
from PIL import Image, ImageDraw, ImageFont

IMPACT = "/System/Library/Fonts/Supplemental/Impact.ttf"
ARIAL = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
W = 1080
ORANGE = (249, 115, 22)
WHITE = (255, 255, 255)
PANEL = (12, 18, 34)


def tracked(draw, cx, by, text, font, fill, trk):
    ws = [draw.textlength(c, font=font) for c in text]
    x = cx - (sum(ws) + trk * (len(text) - 1)) / 2
    for c, w in zip(text, ws):
        draw.text((x, by), c, font=font, fill=fill, anchor="ls")
        x += w + trk


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--title", required=True)
    ap.add_argument("--body", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    lines = a.body.split("\\n")

    img = Image.new("RGBA", (W, 1920), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = W // 2

    px0, px1 = 46, 1034
    inner = (px1 - px0) - 2 * 46
    # Gövde fontunu en uzun satıra göre sığdır (base 54, gerekirse küçült)
    base = 54
    f = ImageFont.truetype(ARIAL, base)
    longest = max(d.textlength(ln, font=f) for ln in lines)
    size = base if longest <= inner else max(34, int(base * inner / longest))
    f_body = ImageFont.truetype(ARIAL, size)
    line_h = size + 52

    p_y0 = 290
    title_block = 200
    p_y1 = p_y0 + title_block + line_h * len(lines) + 36

    # Panel gölgesi + opak panel
    d.rounded_rectangle([px0 + 8, p_y0 + 10, px1 + 8, p_y1 + 10], radius=40, fill=(0, 0, 0, 110))
    d.rounded_rectangle([px0, p_y0, px1, p_y1], radius=40, fill=PANEL + (248,),
                        outline=ORANGE + (255,), width=4)

    f_title = ImageFont.truetype(IMPACT, 62)
    tracked(d, cx, p_y0 + 118, a.title, f_title, ORANGE, 9)
    d.rounded_rectangle([cx - 80, p_y0 + 150, cx + 80, p_y0 + 159], radius=4, fill=ORANGE)

    y = p_y0 + title_block + line_h // 2
    for ln in lines:
        d.text((cx + 2, y + 2), ln, font=f_body, fill=(0, 0, 0, 200), anchor="mm")  # gölge
        d.text((cx, y), ln, font=f_body, fill=WHITE, anchor="mm")
        y += line_h
    img.save(a.out)
    print(a.out, img.size, "bodysize", size)


if __name__ == "__main__":
    main()
