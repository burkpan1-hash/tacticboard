#!/usr/bin/env bash
#
# make-video.sh — TEK KOMUTLA standart split-screen tanıtım videosu (TR + EN).
# Zincir: split-screen (9:16, court büyütme + senkron) → [opsiyonel SETİN FİKRİ
# duraklaması] → kalıcı logo watermark → fade ile marka outro. EN ve TR ayrı çıkar.
#
# Örnek (Saras seti):
#   scripts/make-video.sh \
#     --real content/real.mp4 --app content/app.mp4 --out content/combo \
#     --real-ss 00:00:02.0 --app-speed 1.78 --bot-crop 994:884:2:106 \
#     --explain-at 7.5 --explain-dur 4.5 \
#     --body-tr "1'e 1'i güçlü Tucker tepede topu alır\nDışarıdaki 4 oyuncu şutör — yardım gelemez\nTucker rahat 1'e 1'ini oynar" \
#     --body-en "Strong 1-on-1 Tucker gets the ball up top\n4 shooters outside — no help defense\nTucker plays his iso"
#
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"

# ── Varsayılanlar (Saras setinden; her video için ayarla) ────────────────────
REAL="content/real.mp4"; APP="content/app.mp4"; OUTPREFIX="content/combo"
REAL_SS="00:00:02.0"; APP_SPEED="1.78"; SPLIT="50:50"
# Adaptif court kırpma: saha dışında topu çıkaran oyuncu VARSA 994:884:2:106,
# YOKSA 954:848:63:142 (her ikisi de 1:1 app export'unun deterministik yerleşimi).
BOT_CROP="994:884:2:106"
WM_SCALE="1.4"; WM_ALPHA="0.82"; OUTRO_DUR="2.6"
EXPLAIN_AT=""; EXPLAIN_DUR="4.5"            # EXPLAIN_AT boşsa duraklama eklenmez
TITLE_TR="SETİN FİKRİ"; TITLE_EN="THE IDEA"; BODY_TR=""; BODY_EN=""
CTA_TR="Kendi setini çiz · Link profilde"
CTA_EN="Draw your own plays · Link in bio"

usage(){ grep -E '^#( |$)' "$0" | sed 's/^# \{0,1\}//'; }
while [[ $# -gt 0 ]]; do case "$1" in
  --real) REAL="$2";shift 2;; --app) APP="$2";shift 2;; --out) OUTPREFIX="$2";shift 2;;
  --real-ss) REAL_SS="$2";shift 2;; --app-speed) APP_SPEED="$2";shift 2;;
  --split) SPLIT="$2";shift 2;; --bot-crop) BOT_CROP="$2";shift 2;;
  --wm-scale) WM_SCALE="$2";shift 2;; --wm-alpha) WM_ALPHA="$2";shift 2;;
  --explain-at) EXPLAIN_AT="$2";shift 2;; --explain-dur) EXPLAIN_DUR="$2";shift 2;;
  --title-tr) TITLE_TR="$2";shift 2;; --title-en) TITLE_EN="$2";shift 2;;
  --body-tr) BODY_TR="$2";shift 2;; --body-en) BODY_EN="$2";shift 2;;
  --cta-tr) CTA_TR="$2";shift 2;; --cta-en) CTA_EN="$2";shift 2;;
  -h|--help) usage; exit 0;;
  *) echo "Bilinmeyen: $1" >&2; exit 1;; esac; done

command -v ffmpeg >/dev/null || { echo "HATA: ffmpeg yok"; exit 1; }
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

# ── 1) Split-screen taban (9:16, court büyütme + senkron) ────────────────────
BASE="$TMP/base.mp4"
"$HERE/split-screen.sh" --real "$REAL" --app "$APP" --out "$BASE" --aspect 9:16 \
  --audio real --real-ss "$REAL_SS" --top-fit cover --split "$SPLIT" \
  --app-speed "$APP_SPEED" --bot-crop "$BOT_CROP" >/dev/null
DUR="$(ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$BASE")"

# ── 2) Ortak watermark ───────────────────────────────────────────────────────
python3 "$HERE/make_watermark.py" --out "$TMP/wm.png" --scale "$WM_SCALE" >/dev/null

build_lang(){ # $1=lang $2=cta $3=title $4=body
  local lang="$1" cta="$2" title="$3" body="$4"
  local outro="$TMP/outro_$lang.png" out="${OUTPREFIX}_$lang.mp4"
  python3 "$HERE/make_outro.py" --cta "$cta" --out "$outro" >/dev/null

  local AF="aformat=sample_rates=48000:channel_layouts=stereo"
  local SIL="anullsrc=r=48000:cl=stereo"
  local WM="[1:v]format=rgba,colorchannelmixer=aa=${WM_ALPHA}[wm]"

  if [[ -n "$EXPLAIN_AT" ]]; then
    [[ -n "$body" ]] || { echo "HATA: --explain-at verildi ama --body-$lang boş"; exit 1; }
    local explain="$TMP/explain_$lang.png"
    python3 "$HERE/make_explain.py" --title "$title" --body "$body" --out "$explain" >/dev/null
    local P="$EXPLAIN_AT" D="$EXPLAIN_DUR"
    local PF FO; PF=$(awk -v p="$P" 'BEGIN{printf "%.3f",p+0.034}')
    FO=$(awk -v d="$DUR" -v dd="$D" 'BEGIN{printf "%.3f",d+dd-0.4}')
    ffmpeg -hide_banner -loglevel error -y -i "$BASE" -i "$TMP/wm.png" -i "$explain" \
      -loop 1 -t "$OUTRO_DUR" -i "$outro" -filter_complex "
      [0:v]trim=0:${P},setpts=PTS-STARTPTS[a];
      [0:v]trim=${P}:${PF},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=${D}[fz];
      [fz][2:v]overlay=0:0[fzt];
      [0:v]trim=${P},setpts=PTS-STARTPTS[b];
      [a][fzt][b]concat=n=3:v=1[body];
      ${WM};[body][wm]overlay=(W-w)/2:50[bw];
      [bw]fade=t=out:st=${FO}:d=0.4:color=0x0f172a,setsar=1[v0];
      [3:v]fade=t=in:st=0:d=0.4,setsar=1[v1];[v0][v1]concat=n=2:v=1:a=0[outv];
      [0:a]atrim=0:${P},asetpts=PTS-STARTPTS,${AF}[aa];
      ${SIL},atrim=0:${D},${AF}[asil];
      [0:a]atrim=${P},asetpts=PTS-STARTPTS,${AF}[ab];
      [aa][asil][ab]concat=n=3:v=0:a=1[bd];
      [bd]afade=t=out:st=${FO}:d=0.4[a0];
      ${SIL},atrim=0:${OUTRO_DUR},${AF}[a1];
      [a0][a1]concat=n=2:v=0:a=1[outa]" \
      -map "[outv]" -map "[outa]" -c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium \
      -c:a aac -b:a 128k -movflags +faststart "$out"
  else
    local FO; FO=$(awk -v d="$DUR" 'BEGIN{printf "%.3f",d-0.4}')
    ffmpeg -hide_banner -loglevel error -y -i "$BASE" -i "$TMP/wm.png" \
      -loop 1 -t "$OUTRO_DUR" -i "$outro" -filter_complex "
      ${WM};[0:v][wm]overlay=(W-w)/2:50[bw];
      [bw]fade=t=out:st=${FO}:d=0.4:color=0x0f172a,setsar=1[v0];
      [2:v]fade=t=in:st=0:d=0.4,setsar=1[v1];[v0][v1]concat=n=2:v=1:a=0[outv];
      [0:a]${AF},afade=t=out:st=${FO}:d=0.4[a0];
      ${SIL},atrim=0:${OUTRO_DUR},${AF}[a1];
      [a0][a1]concat=n=2:v=0:a=1[outa]" \
      -map "[outv]" -map "[outa]" -c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium \
      -c:a aac -b:a 128k -movflags +faststart "$out"
  fi
  echo "✓ $out"
}

build_lang tr "$CTA_TR" "$TITLE_TR" "$BODY_TR"
build_lang en "$CTA_EN" "$TITLE_EN" "$BODY_EN"
echo "Bitti → ${OUTPREFIX}_tr.mp4 + ${OUTPREFIX}_en.mp4"
