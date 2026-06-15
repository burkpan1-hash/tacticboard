#!/usr/bin/env bash
#
# split-screen.sh — Gerçek maç görüntüsü (üst) + uygulama recreation (alt)
# videolarını tek dikey çerçevede birleştirir. TikTok / Instagram Reels /
# YouTube Shorts (9:16) ve X / Twitter (1:1) için içerik üretir.
#
# Uygulama panelini app içinden 1:1 export et (yarı saha kareye yakındır,
# alt paneli en az boşlukla doldurur). Gerçek klibi kabaca kırp; ince
# senkronu --real-ss / --app-delay / --app-speed ile yap.
#
# Örnek:
#   scripts/split-screen.sh --real efes_fb.mp4 --app app.mp4 \
#     --out efes_fb_split --aspect all --audio real
#
set -euo pipefail

# ── Varsayılanlar ───────────────────────────────────────────────────────────
REAL=""
APP=""
OUT="split.mp4"
ASPECT="9:16"          # 9:16 | 1:1 | all
REAL_SS=""             # gerçek klibi şu andan başlat, örn. 00:00:03.2
APP_SS=""              # app klibini şu andan başlat
APP_DELAY="0"          # app'i şu kadar saniye geciktir (senkron)
REAL_DELAY="0"         # gerçeği şu kadar saniye geciktir
APP_SPEED="1"          # app hızı: >1 hızlı, <1 yavaş (gerçeğe esnetmek için)
AUDIO="real"           # real | app | none
SPLIT="50:50"          # üst:alt panel yükseklik oranı (örn. 60:40 = üst büyük)
TOP_FIT="contain"      # contain (kırpmaz, pad) | cover (kutuyu doldur, kırp)
BOT_FIT="contain"      # alt panel fit modu
BOT_ROTATE="none"      # alt paneli döndür: ccw | cw | 180 | none (çemberi sola almak için ccw)
BOT_CROP=""            # alt panel ön-kırpma W:H:X:Y (court'u panele doldurmak için)
LABELS="1"             # 1 = GERÇEK / UYGULAMA etiketleri çiz
LABEL_TOP="GERÇEK"
LABEL_BOT="UYGULAMA"
BG="0x0f172a"          # arka plan (app watermark arka planıyla aynı)
FONT="/System/Library/Fonts/Supplemental/Arial Bold.ttf"

usage() {
  cat <<'EOF'
Kullanım: split-screen.sh --real <dosya> --app <dosya> [seçenekler]

  --real <dosya>        Gerçek maç klibi (üst panel) — zorunlu
  --app <dosya>         Uygulama export'u (alt panel, 1:1 önerilir) — zorunlu
  --out <ad>            Çıktı dosyası/öneki (varsayılan: split.mp4)
  --aspect 9:16|1:1|all Çıktı oranı (varsayılan: 9:16). 'all' ikisini de üretir.
  --real-ss <ts>        Gerçek klibi şu andan başlat (örn. 00:00:03.2)
  --app-ss <ts>         App klibini şu andan başlat
  --real-delay <sn>     Gerçeği şu kadar sn geciktir
  --app-delay <sn>      App'i şu kadar sn geciktir (senkron)
  --app-speed <x>       App hızı (>1 hızlı, <1 yavaş; gerçeğe esnet)
  --audio real|app|none Hangi sesi koru (varsayılan: real)
  --split TOP:BOT       Üst:alt panel yükseklik oranı (örn. 60:40, varsayılan 50:50)
  --top-fit contain|cover  Üst panel: cover = kutuyu doldur+kırp (varsayılan contain)
  --bot-fit contain|cover  Alt panel fit modu (varsayılan contain)
  --bot-rotate ccw|cw|180|none  Alt paneli döndür (çemberi sola almak için ccw)
  --bot-crop W:H:X:Y    Alt paneli ön-kırp (court'u panele doldurmak için)
  --labels 0|1          Panel etiketlerini çiz (varsayılan: 1)
  --label-top <metin>   Üst panel etiketi (varsayılan: GERÇEK)
  --label-bot <metin>   Alt panel etiketi (varsayılan: UYGULAMA)
  -h, --help            Bu yardım

Örnek:
  split-screen.sh --real efes_fb.mp4 --app app.mp4 --out efes_fb_split \
    --aspect all --audio real
EOF
}

# ── Argüman ayrıştırma ──────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --real)        REAL="$2"; shift 2 ;;
    --app)         APP="$2"; shift 2 ;;
    --out)         OUT="$2"; shift 2 ;;
    --aspect)      ASPECT="$2"; shift 2 ;;
    --real-ss)     REAL_SS="$2"; shift 2 ;;
    --app-ss)      APP_SS="$2"; shift 2 ;;
    --real-delay)  REAL_DELAY="$2"; shift 2 ;;
    --app-delay)   APP_DELAY="$2"; shift 2 ;;
    --app-speed)   APP_SPEED="$2"; shift 2 ;;
    --audio)       AUDIO="$2"; shift 2 ;;
    --split)       SPLIT="$2"; shift 2 ;;
    --top-fit)     TOP_FIT="$2"; shift 2 ;;
    --bot-fit)     BOT_FIT="$2"; shift 2 ;;
    --bot-rotate)  BOT_ROTATE="$2"; shift 2 ;;
    --bot-crop)    BOT_CROP="$2"; shift 2 ;;
    --labels)      LABELS="$2"; shift 2 ;;
    --label-top)   LABEL_TOP="$2"; shift 2 ;;
    --label-bot)   LABEL_BOT="$2"; shift 2 ;;
    -h|--help)     usage; exit 0 ;;
    *) echo "Bilinmeyen seçenek: $1" >&2; usage; exit 1 ;;
  esac
done

# ── Ön kontroller ───────────────────────────────────────────────────────────
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "HATA: ffmpeg bulunamadı. Kur:  brew install ffmpeg" >&2
  exit 1
fi
if [[ -z "$REAL" || -z "$APP" ]]; then
  echo "HATA: --real ve --app zorunlu." >&2; usage; exit 1
fi
for f in "$REAL" "$APP"; do
  [[ -f "$f" ]] || { echo "HATA: dosya yok: $f" >&2; exit 1; }
done
case "$ASPECT" in 9:16|1:1|all) ;; *) echo "HATA: --aspect 9:16|1:1|all olmalı." >&2; exit 1 ;; esac

# Etiketler drawtext filtresi + font gerektirir; ikisinden biri yoksa kapat
if [[ "$LABELS" == "1" ]]; then
  if ! ffmpeg -hide_banner -filters 2>/dev/null | grep -q ' drawtext '; then
    echo "UYARI: ffmpeg'de drawtext yok (libfreetype'sız derleme) → etiketler kapatıldı." >&2
    echo "       İstersen: brew reinstall ffmpeg  (ya da freetype'lı bir derleme)" >&2
    LABELS="0"
  elif [[ ! -f "$FONT" ]]; then
    echo "UYARI: font yok ($FONT) → etiketler kapatıldı." >&2
    LABELS="0"
  fi
fi

# ── Bir panelin fit zinciri ─────────────────────────────────────────────────
# $1=W $2=H $3=fit(contain|cover) → filtre zincirini yazdırır
panel_chain() {
  local w="$1" h="$2" fit="$3"
  if [[ "$fit" == "cover" ]]; then
    # Kutuyu tamamen doldur, taşan kenarları kırp (yanlardan/üst-alttan feragat)
    echo "scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},setsar=1"
  else
    # Oranı koru, kutuya sığdır, kalanı arka planla doldur (kırpmaz)
    echo "scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=${BG},setsar=1"
  fi
}

# ── Tek bir orana göre render eden fonksiyon ────────────────────────────────
# $1 = aspect (9:16|1:1), $2 = çıktı dosyası
render() {
  local aspect="$1" outfile="$2"
  local W H
  case "$aspect" in
    9:16) W=1080; H=1920 ;;
    1:1)  W=1080; H=1080 ;;
  esac

  # Panel yükseklikleri (--split TOP:BOT). H çift + topH çift → botH de çift.
  local st="${SPLIT%%:*}" sb="${SPLIT##*:}"
  local topH=$(( H * st / (st + sb) ))
  topH=$(( topH - topH % 2 ))
  local botH=$(( H - topH ))

  local top_chain bot_chain
  top_chain="$(panel_chain "$W" "$topH" "$TOP_FIT")"
  bot_chain="$(panel_chain "$W" "$botH" "$BOT_FIT")"

  # Alt panel rotasyonu (çemberi sola almak için ccw) — ölçeklemeden önce uygula
  case "$BOT_ROTATE" in
    ccw)  bot_chain="transpose=2,${bot_chain}" ;;
    cw)   bot_chain="transpose=1,${bot_chain}" ;;
    180)  bot_chain="transpose=1,transpose=1,${bot_chain}" ;;
    none) ;;
    *) echo "HATA: --bot-rotate ccw|cw|180|none olmalı." >&2; exit 1 ;;
  esac

  # Alt panel ön-kırpma (court'u panele doldurmak için) — ham app pikselleri üzerinde
  if [[ -n "$BOT_CROP" ]]; then
    bot_chain="crop=${BOT_CROP},${bot_chain}"
  fi

  # App hız ayarı (senkron için zaman esnetme)
  if [[ "$APP_SPEED" != "1" ]]; then
    bot_chain="setpts=PTS/${APP_SPEED},${bot_chain}"
  fi

  # Etiketler
  if [[ "$LABELS" == "1" ]]; then
    local fsizeT=$(( topH / 16 )) fsizeB=$(( botH / 16 ))
    top_chain="${top_chain},drawtext=fontfile='${FONT}':text='${LABEL_TOP}':fontcolor=white:fontsize=${fsizeT}:box=1:boxcolor=${BG}@0.55:boxborderw=12:x=24:y=24"
    bot_chain="${bot_chain},drawtext=fontfile='${FONT}':text='${LABEL_BOT}':fontcolor=white:fontsize=${fsizeB}:box=1:boxcolor=${BG}@0.55:boxborderw=12:x=24:y=24"
  fi

  # Input seviyesinde trim / delay
  local in_real=() in_app=()
  [[ -n "$REAL_SS" ]] && in_real+=(-ss "$REAL_SS")
  [[ -n "$APP_SS"  ]] && in_app+=(-ss "$APP_SS")
  [[ "$REAL_DELAY" != "0" ]] && in_real+=(-itsoffset "$REAL_DELAY")
  [[ "$APP_DELAY"  != "0" ]] && in_app+=(-itsoffset "$APP_DELAY")

  # Ses haritası
  local amap=()
  case "$AUDIO" in
    real) amap=(-map "0:a?") ;;
    app)  amap=(-map "1:a?") ;;
    none) amap=(-an) ;;
  esac

  echo "→ ${aspect} üretiliyor: ${outfile}  (${W}x${H})"
  ffmpeg -hide_banner -loglevel error -y \
    ${in_real[@]+"${in_real[@]}"} -i "$REAL" \
    ${in_app[@]+"${in_app[@]}"}  -i "$APP" \
    -filter_complex "[0:v]${top_chain}[top];[1:v]${bot_chain}[bot];[top][bot]vstack=inputs=2[out]" \
    -map "[out]" "${amap[@]}" \
    -c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium \
    -c:a aac -b:a 128k -movflags +faststart -shortest \
    "$outfile"
  echo "✓ ${outfile}"
}

# ── Çalıştır ────────────────────────────────────────────────────────────────
# OUT bir önek mi yoksa tam dosya adı mı? 'all' veya çoklu üretimde önek kullan.
base="${OUT%.mp4}"

if [[ "$ASPECT" == "all" ]]; then
  render "9:16" "${base}_9x16.mp4"
  render "1:1"  "${base}_1x1.mp4"
else
  # Tek oran: OUT .mp4 ile bitiyorsa onu kullan, değilse oranı ekle
  if [[ "$OUT" == *.mp4 ]]; then
    render "$ASPECT" "$OUT"
  else
    suffix="${ASPECT/:/x}"
    render "$ASPECT" "${base}_${suffix}.mp4"
  fi
fi

echo "Bitti."
