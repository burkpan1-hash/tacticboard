# Split-Screen İçerik Üretimi

`split-screen.sh` — gerçek maç görüntüsünü (üst) uygulamadaki recreation ile (alt)
tek dikey çerçevede birleştirir. TikTok / Instagram Reels / YouTube Shorts (`9:16`)
ve X / Twitter (`1:1`) için içerik üretir.

> Bu, uygulamanın bir parçası değil — Burak'ın pazarlama içeriği için bir araç.
> `src/utils/export/*` (uygulama içi MP4 export) hiçbir şekilde değiştirilmez.

## Kurulum

Tek bağımlılık `ffmpeg`:

```bash
brew install ffmpeg
```

## Genel Akış

1. **Gerçek klibi hazırla** — setin oynandığı bölümü kabaca kırp (16:9, yatay).
2. **Uygulama videosu** — app'te seti aç → **Export** → **1:1** indir.
   `1:1` öneriliyor çünkü yarı saha kareye yakın; alt paneli en az boşlukla doldurur.
   (App export'unda `basketballtacticboard.com` watermark'ı zaten gömülü → branding hazır.)
3. **Birleştir:**

```bash
scripts/split-screen.sh --real efes_fb.mp4 --app app.mp4 \
  --out efes_fb_split --aspect all --audio real
```

Çıktı:
- `efes_fb_split_9x16.mp4` → TikTok / Reels / Shorts (1080×1920)
- `efes_fb_split_1x1.mp4` → X / Twitter (1080×1080)

## Yerleşim

```
9:16 (1080x1920)               1:1 (1080x1080)
┌──────────────┐               ┌──────────────┐
│  GERÇEK MAÇ  │ 1080x960      │  GERÇEK MAÇ  │ 1080x540
├──────────────┤               ├──────────────┤
│  UYGULAMA    │ 1080x960      │  UYGULAMA    │ 1080x540
└──────────────┘               └──────────────┘
```

Her panel oranını koruyarak kutusuna sığar (kırpma yok); kalan alan arka plan
rengiyle (`#0f172a`) doldurulur.

## Senkron (en önemli kısım)

Uygulama animasyonunun süresi aksiyon mesafelerinden hesaplanır, gerçek klibin
temposuyla birebir tutmaz. Hizalamak için:

| Flag | Ne yapar |
|------|----------|
| `--real-ss 00:00:03.2` | Gerçek klibi 3.2. saniyeden başlatır (setin başına denk getir) |
| `--app-ss <ts>` | App klibini şu andan başlatır |
| `--app-delay 0.5` | App'i 0.5 sn geciktirir |
| `--real-delay <sn>` | Gerçeği geciktirir |
| `--app-speed 1.2` | App'i %20 hızlandırır (gerçeğin süresine esnetmek için) |

İpucu: Önce iki klibin de **başlangıcını** aynı ana getir (`--real-ss`),
sonra süre farkı varsa `--app-speed` ile app'i gerçeğe esnet. `v1` davranışı:
kısa olan klip bitince video biter (`-shortest`).

## Tüm Seçenekler

```
--real <dosya>        Gerçek maç klibi (üst) — zorunlu
--app <dosya>         Uygulama export'u (alt, 1:1 önerilir) — zorunlu
--out <ad>            Çıktı dosyası/öneki (varsayılan: split.mp4)
--aspect 9:16|1:1|all Çıktı oranı (varsayılan: 9:16)
--real-ss <ts>        Gerçek klip başlangıcı
--app-ss <ts>         App klip başlangıcı
--real-delay <sn>     Gerçeği geciktir
--app-delay <sn>      App'i geciktir
--app-speed <x>       App hızı (>1 hızlı, <1 yavaş)
--audio real|app|none Ses kaynağı (varsayılan: real — salon sesi)
--labels 0|1          GERÇEK / UYGULAMA etiketleri (varsayılan: 1)
--label-top <metin>   Üst etiket (varsayılan: GERÇEK)
--label-bot <metin>   Alt etiket (varsayılan: UYGULAMA)
```

## Çıktıyı Doğrulama

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,pix_fmt \
  -of default=noprint_wrappers=1 efes_fb_split_9x16.mp4
# → width=1080 height=1920 pix_fmt=yuv420p
```
