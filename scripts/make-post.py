#!/usr/bin/env python3
"""
make-post.py — Post-pack üreticisi (TR + EN caption / hashtag / seri no)

Kullanım:
  python3 scripts/make-post.py \
    --match "Fenerbahçe Beko – Anadolu Efes" \
    --idea-tr "1'e 1'i güçlü Tucker tepede topu alır; yardım gelemez; Tucker rahat iso oynar" \
    --idea-en "Strong 1-on-1 Tucker gets the ball up top; no help defense; Tucker plays his iso" \
    --name saras        # → content/saras_post_tr.txt + content/saras_post_en.txt

Opsiyonlar:
  --no-increment   Seri sayacını artırma (önizleme modu)
  --out-dir        Çıktı klasörü (varsayılan: content)
"""

import argparse
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).parent
REPO = HERE.parent
SERIES_FILE = REPO / "content" / "series.json"


def load_series() -> dict:
    if SERIES_FILE.exists():
        return json.loads(SERIES_FILE.read_text())
    return {"n": 0}


def save_series(data: dict):
    SERIES_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2))


def slugify(text: str, hashtag: bool = False) -> str:
    """Türkçe karakterleri ASCII'ye çevir.
    hashtag=True → boşlukları kaldır (tire yok), hashtag uyumlu.
    hashtag=False → boşlukları tire yap (dosya adı vb.).
    """
    tr_map = str.maketrans("çğıöşüÇĞİÖŞÜ", "cgiosuCGIOSU")
    text = text.translate(tr_map)
    text = re.sub(r"[^\w\s]", "", text.lower())
    if hashtag:
        return re.sub(r"\s+", "", text)
    return re.sub(r"\s+", "-", text).strip("-")


def extract_teams(match: str) -> list[str]:
    """Maç adından takım isimlerini çıkar (– veya vs ile ayrılmış)."""
    parts = re.split(r"\s*[–\-vsVS]+\s*", match)
    return [p.strip() for p in parts if p.strip()]


def make_hashtags_tr(match: str, extra: list[str] = []) -> str:
    base = [
        "#euroleague",
        "#basketbol",
        "#basketballtactics",
        "#xsandos",
        "#taktikhane",
    ]
    teams = extract_teams(match)
    team_tags = [f"#{slugify(t, hashtag=True)}" for t in teams]
    all_tags = team_tags + base + [f"#{slugify(e, hashtag=True)}" for e in extra]
    return " ".join(all_tags)


def make_hashtags_en(match: str, extra: list[str] = []) -> str:
    base = [
        "#euroleague",
        "#basketball",
        "#basketballtactics",
        "#xsandos",
        "#nbatactics",
    ]
    teams = extract_teams(match)
    team_tags = [f"#{slugify(t, hashtag=True)}" for t in teams]
    all_tags = team_tags + base + [f"#{slugify(e, hashtag=True)}" for e in extra]
    return " ".join(all_tags)


def make_caption_tr(n: int, match: str, idea: str) -> str:
    return (
        f"Bu seti hatırlayan? 👀\n\n"
        f"Günün Seti #{n} — {match}\n\n"
        f"{idea}\n\n"
        f"Kendi setini çiz → basketballtacticboard.com (link profilde)"
    )


def make_caption_en(n: int, match: str, idea: str) -> str:
    return (
        f"Remember this set? 👀\n\n"
        f"Set of the Day #{n} — {match}\n\n"
        f"{idea}\n\n"
        f"Draw your own plays → basketballtacticboard.com (link in bio)"
    )


def main():
    parser = argparse.ArgumentParser(description="Post-pack üreticisi")
    parser.add_argument("--match", required=True, help='Maç adı, örn. "Fenerbahçe Beko – Anadolu Efes"')
    parser.add_argument("--idea-tr", required=True, help="Setin kısa fikri (Türkçe)")
    parser.add_argument("--idea-en", required=True, help="Setin kısa fikri (İngilizce)")
    parser.add_argument("--name", required=True, help="Çıktı dosya adı öneki, örn. 'saras'")
    parser.add_argument("--extra-tags", nargs="*", default=[], help="Ekstra hashtag kelimeleri")
    parser.add_argument("--no-increment", action="store_true", help="Sayacı artırma (önizleme)")
    parser.add_argument("--out-dir", default=str(REPO / "content"), help="Çıktı klasörü")
    args = parser.parse_args()

    series = load_series()
    n = series.get("n", 0) + 1

    caption_tr = make_caption_tr(n, args.match, args.idea_tr)
    hashtags_tr = make_hashtags_tr(args.match, args.extra_tags)
    caption_en = make_caption_en(n, args.match, args.idea_en)
    hashtags_en = make_hashtags_en(args.match, args.extra_tags)

    post_tr = f"{caption_tr}\n\n{hashtags_tr}"
    post_en = f"{caption_en}\n\n{hashtags_en}"

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    file_tr = out_dir / f"{args.name}_post_tr.txt"
    file_en = out_dir / f"{args.name}_post_en.txt"

    file_tr.write_text(post_tr, encoding="utf-8")
    file_en.write_text(post_en, encoding="utf-8")

    print(f"✅ Seri #{n}")
    print(f"   TR → {file_tr}")
    print(f"   EN → {file_en}")
    print()
    print("── TR ──────────────────────────────────────")
    print(post_tr)
    print()
    print("── EN ──────────────────────────────────────")
    print(post_en)

    if not args.no_increment:
        series["n"] = n
        save_series(series)
        print(f"\n📈 series.json güncellendi → n={n}")
    else:
        print("\n⏸  --no-increment: sayaç artırılmadı")


if __name__ == "__main__":
    main()
