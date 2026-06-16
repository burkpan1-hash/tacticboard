# Devir Dokümanı — Split-Screen Tanıtım Videoları + Sosyal Paylaşım Otomasyonu

> Bu doküman **cloud coworker (paylaşım otomasyonunu yapacak ajan)** içindir. İki kısım var:
> **(A)** Videolar burada nasıl hazırlanıyor — yani otomasyona NE girecek.
> **(B)** Paylaşım otomasyonunun planı — senin (cloud ajan) yapacağın iş.
> Doküman kendi kendine yeter; yerel hafıza notlarına ihtiyaç yok.

---

## Genel Akış

```
Burak: set hakkında bilgi yazar (maç, setin fikri)
  → Video burada (yerel Claude Code) hazırlanır:  content/combo_tr.mp4 + content/combo_en.mp4
Burak: videoları kontrol eder → "paylaş" der
  → CLOUD COWORKER: caption/hashtag/seri üretir + 4 platforma paylaşır (aşağıdaki kurallarla)
```

Hedef platformlar: **Instagram (Reels), X (Twitter), YouTube Shorts, TikTok.**
İki hesap: **bir Türkçe, bir İngilizce.** TR video → TR hesaplar, EN video → EN hesaplar.

---

## (A) VİDEO PIPELINE — Otomasyona ne giriyor

### Final çıktılar (paylaşılacak dosyalar)
- `content/combo_tr.mp4` — Türkçe hesaplar için
- `content/combo_en.mp4` — İngilizce hesaplar için
- Format: **9:16 dikey, 1080×1920, H.264/yuv420p, ~20 sn, AAC ses.** Tüm platformlara (Shorts/Reels/TikTok/X) uygun tek asset.

### Videonun yapısı (her ikisinde de baked-in)
1. Split-screen: **üstte gerçek maç görüntüsü**, **altta uygulama (basketballtacticboard.com) recreation'ı** (taktik diagramı).
2. Üst-ortada **kalıcı yarı saydam logo** (klip alınsa marka görünsün).
3. Setin kilit anından hemen önce ~4.5 sn **donma + "SETİN FİKRİ" kartı** (setin ana fikri 2-3 kısa satır).
4. Sonda fade ile **marka outro**: BASKETBALL/TACTIC BOARD + `basketballtacticboard.com` + CTA ("Kendi setini çiz · Link profilde" / "Draw your own plays · Link in bio").

### Nasıl üretiliyor (referans — otomasyonun değiştirmesine gerek yok)
- Tek komut: `scripts/make-video.sh` (ffmpeg + Pillow). Yardımcılar: `split-screen.sh`, `make_outro.py`, `make_watermark.py`, `make_explain.py`.
- Girdi: `content/real.mp4` (maç klibi, yt-dlp ile indirilir) + `content/app.mp4` (uygulamadan **1:1 export**).
- Marka: turuncu `#f97316`, koyu `#0f172a`, beyaz. URL `basketballtacticboard.com`.

### Otomasyonun bilmesi gereken meta (her video için Burak verir / karttan gelir)
- **Maç/eşleşme** (örn. "Fenerbahçe Beko – Anadolu Efes").
- **Setin kısa fikri** (videodaki kartın metni — caption'da kullanılabilir).
- Örnek (Saras seti): "1'e 1'i güçlü Tucker tepede topu alır; dışarıdaki 4 oyuncu şutör olduğu için yardım gelemez; Tucker rahat 1'e 1'ini oynar."

---

## (B) PAYLAŞIM OTOMASYONU — Cloud coworker'ın yapacağı iş

### Dürüst kısıtlar (planı bunlar belirliyor — ezme!)
1. **Trend ses + şutu beat'e denk getirme OTOMATİKLEŞTİRİLEMEZ.** Trend ses platformun lisanslı kütüphanesinden, **sadece telefonda uygulama içinde** eklenir. API/tarayıcıyla gömülen şarkı YouTube/IG'de Content-ID/telif cezası alır ve "bu sesi kullan" keşif avantajı oluşmaz. → **TikTok & IG Reels telefondan paylaşılır** (trend ses orada eklenir).
2. **X:** ücretsiz API kalktı (Şub 2026), pay-per-use (~$0.01/gönderi). API yerine tarayıcı tercih edilebilir.
3. **Instagram (Reels) API:** Business/Creator hesabı + Meta app review + videonun **public URL'de** barınması gerekir (curl'leniyor). Uygulamanın Fly.io sunucusu (basketballtacticboard.com) bir public dosya endpoint'i ile bunu sağlayabilir — ama IG için yine de trend ses telefonda; bu yüzden IG telefon önerilir.
4. **TikTok Content Posting API:** herkese açık "direct post" için **app audit** şart; audit yoksa sadece taslak/özel. + trend ses telefonda.
5. **Tarayıcı otomasyonu** (giriş yapılmış oturumda, API'siz): YouTube/X için mümkün ama platform ToS'una aykırı, **ban riski** taşır, kırılgan. Kademeli/gözetimli kullan.
6. Burak **aggregator servise (Ayrshare/Blotato vb.) para ödemek istemiyor**, kendi ortamında/hesaplarında halletmek istiyor. **Hesaplar var, API erişimi yok.**

### Önerilen yaklaşım (hibrit — Burak onayladı)
- **Otomasyonun kesin kazandığı kısım = caption/hashtag/seri** üretimi. Önce bunu yap.
- **YouTube Shorts (+ opsiyonel X):** giriş yapılmış oturumda tarayıcı otomasyonuyla otomatik yükle (TR & EN). Önce TEK hesapta + unlisted ile doğrula, sonra public.
- **TikTok + Instagram Reels:** otomasyon videoyu + caption'ı hazır sunar; **Burak telefonda** trend sesi ekler, şutu beat'e denk getirir, caption'ı yapıştırır, paylaşır (~1 dk/platform).

### Post-pack spesifikasyonu (caption + hashtag + seri)
Her video için TR ve EN ayrı metin üret:
- **Seri sayacı:** kalıcı dosyada tut (örn. `content/series.json`), her pakette artır → "Günün Seti #N" (TR) / "Set of the Day #N" (EN).
- **Caption (yorum çağıran kanca + bağlam + fikir + CTA):**
  - TR örnek: `Bu seti hatırlayan? 👀\n\nGünün Seti #N — Fenerbahçe Beko vs Anadolu Efes\n\n{setin kısa fikri}\n\nKendi setini çiz → basketballtacticboard.com (link profilde)`
  - EN örnek: `Remember this set? 👀\n\nSet of the Day #N — Fenerbahçe Beko vs Anadolu Efes\n\n{the idea, short}\n\nDraw your own plays → basketballtacticboard.com (link in bio)`
- **Hashtag:** `#euroleague #fenerbahçe #anadoluefes #basketball #basketballtactics #xsandos` (+ maça özel etiketler). EN tarafında Türkçe karakterli etiketleri sadeleştir (örn. `#fenerbahce`).
- Çıktı önerisi: `content/<isim>_post_tr.txt` ve `_post_en.txt` (kopyala-yapıştır hazır).

### "Paylaş" akışı (Burak "paylaş" deyince)
```
1) Post-pack üret (TR + EN caption/hashtag/seri no).
2) YouTube Shorts'a yükle (TR hesabı → combo_tr.mp4 ; EN hesabı → combo_en.mp4) — tarayıcı, başlık+açıklama post-pack'ten, #Shorts.
3) (Opsiyonel) X'e gönder (tarayıcı).
4) TikTok + IG için: combo dosyaları + caption .txt'leri hazır klasöre koy → Burak telefondan paylaşır.
```

### Riskler / notlar
- Tarayıcı otomasyonu = ToS-gri + ban riski. Düşük hacim, insan-benzeri, gözetimli. Sorun olan platformu telefona al.
- Platform UI değişince selector güncelle.
- Oturum: Burak'ın giriş yapılmış tarayıcı profili gerekir (2FA/expire olabilir).
- **Seri" #N" tutarlılığı:** TR ve EN için aynı N kullan; sayaç dosyasını paylaşımdan sonra artır (başarısız paylaşımda artırma).

---

## Cloud coworker için ilk adımlar
1. Bu repodaki `content/combo_tr.mp4` + `combo_en.mp4`'ü gir (paylaşılacak asset'ler).
2. Faz 1: `post-pack` üreticisini kur (yerel, risksiz). Doğrula.
3. Faz 2: YouTube Shorts tarayıcı yüklemesini TEK hesapta + unlisted ile doğrula, sonra genişlet.
4. TikTok/IG'yi telefon-elle akışı olarak bırak (trend ses).
5. Her şeyi Burak'ın hesaplarını riske atmadan, kademeli kur.
