#!/usr/bin/env bash
#
# add-pauses.sh — Bir videoda verilen anlarda kareyi dondurur (idrak duraklaması).
# Hem görüntü hem ses birlikte durur (araya sessizlik eklenir), böylece senkron korunur.
# Split-screen videoda iki panel tek kare olduğu için ikisi birlikte donar.
#
# Örnek:
#   scripts/add-pauses.sh --in content/sample_A_big.mp4 \
#     --pauses "1.7,2.8,3.8,4.8,5.8,6.6,7.5,8.3,9.1" --dur 0.6 \
#     --out content/sample_A_paused.mp4
#
set -euo pipefail

IN=""
OUT=""
PAUSES=""        # virgülle ayrılmış saniyeler (artan sırada)
DUR="0.6"        # her duraklamanın süresi (sn)
AUDIO="silence"  # silence (donmada sessizlik) | none (sesi at)

usage() {
  cat <<'EOF'
Kullanım: add-pauses.sh --in <video> --pauses "t1,t2,..." [--dur 0.6] --out <video>
  --in <video>      Girdi videosu
  --out <video>     Çıktı
  --pauses "..."    Virgülle saniyeler (artan), her birinde kare donar
  --dur <sn>        Duraklama süresi (varsayılan 0.6)
  --audio silence|none  Donmada sessizlik ekle | sesi tamamen at
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --in)     IN="$2"; shift 2 ;;
    --out)    OUT="$2"; shift 2 ;;
    --pauses) PAUSES="$2"; shift 2 ;;
    --dur)    DUR="$2"; shift 2 ;;
    --audio)  AUDIO="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Bilinmeyen seçenek: $1" >&2; usage; exit 1 ;;
  esac
done

command -v ffmpeg >/dev/null || { echo "HATA: ffmpeg yok." >&2; exit 1; }
[[ -f "$IN" ]] || { echo "HATA: girdi yok: $IN" >&2; exit 1; }
[[ -n "$OUT" && -n "$PAUSES" ]] || { echo "HATA: --out ve --pauses zorunlu." >&2; usage; exit 1; }

# Girdi fps -> kare süresi
RFR=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=nk=1:nw=1 "$IN")
FPS=$(awk -F/ '{ if ($2) print $1/$2; else print $1 }' <<<"$RFR")
FDUR=$(awk -v f="$FPS" 'BEGIN{ printf "%.5f", 1.0/f }')

IFS=',' read -r -a PARR <<<"$PAUSES"
N=${#PARR[@]}

# ── Görüntü filtre zinciri: segment + dondurma + segment ... concat ──────────
vf=""; vlabels=""; vi=0; prev="0"
for p in "${PARR[@]}"; do
  vf+="[0:v]trim=${prev}:${p},setpts=PTS-STARTPTS[v${vi}];"
  vlabels+="[v${vi}]"; vi=$((vi+1))
  pend=$(awk -v a="$p" -v d="$FDUR" 'BEGIN{printf "%.5f", a+d}')
  vf+="[0:v]trim=${p}:${pend},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=${DUR}[v${vi}];"
  vlabels+="[v${vi}]"; vi=$((vi+1))
  prev="$p"
done
vf+="[0:v]trim=${prev},setpts=PTS-STARTPTS[v${vi}];"
vlabels+="[v${vi}]"; vi=$((vi+1))
vf+="${vlabels}concat=n=${vi}:v=1:a=0[outv]"

MAPS=(-map "[outv]")
AFILTER=""

if [[ "$AUDIO" == "silence" ]] && ffprobe -v error -select_streams a:0 -show_entries stream=index -of csv=p=0 "$IN" | grep -q .; then
  AFMT="aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo"
  af=""; alabels=""; ai=0; prev="0"
  for p in "${PARR[@]}"; do
    af+="[0:a]atrim=${prev}:${p},asetpts=PTS-STARTPTS,${AFMT}[a${ai}];"
    alabels+="[a${ai}]"; ai=$((ai+1))
    af+="anullsrc=r=48000:cl=stereo,atrim=duration=${DUR},${AFMT}[a${ai}];"
    alabels+="[a${ai}]"; ai=$((ai+1))
    prev="$p"
  done
  af+="[0:a]atrim=${prev},asetpts=PTS-STARTPTS,${AFMT}[a${ai}];"
  alabels+="[a${ai}]"; ai=$((ai+1))
  af+="${alabels}concat=n=${ai}:v=0:a=1[outa]"
  AFILTER=";${af}"
  MAPS+=(-map "[outa]" -c:a aac -b:a 128k)
fi

echo "→ ${N} duraklama (${DUR}s) ekleniyor: ${OUT}"
ffmpeg -hide_banner -loglevel error -y -i "$IN" \
  -filter_complex "${vf}${AFILTER}" \
  "${MAPS[@]}" \
  -c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium -movflags +faststart \
  "$OUT"
echo "✓ ${OUT}"
