# SetPlay — Basketball Tactical Board
## Design Spec

**Uygulama adı:** SetPlay
**Tagline:** Create. Animate. Share your plays.

## Context

Sıfırdan bir basketbol taktik tahtası uygulaması. Mevcut araçların (thehoopsgeek, vb.) kullanımı karmaşık — bu uygulamanın ana fark noktası **kolay kullanım**. Hedef kitle: antrenörler, içerik üreticiler, analistler, taraftarlar.

Çalışma dizini: `/Users/burakbozkurt/Desktop/basketball board tactics`

---

## Teknoloji Stack

| Katman | Seçim |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Canvas | react-konva (Konva.js) |
| State | Zustand |
| Stil | Tailwind CSS v4 |
| GIF Export | gif.js |
| Video Export | MediaRecorder API |
| Depolama (MVP) | localStorage |
| Dev Ortamı | Docker (setplay.sh start/stop) |

---

## Oyuncu Yapısı

- Hücum: 1–5 numara, **turuncu** (`#F97316`)
- Savunma: 1–5 numara, **koyu mavi** (`#1D4ED8`)
- Kurulumda sadece "kaç hücum / kaç savunma" seçilir

---

## Kort

- **Yarım kort** (Half Court): 560×470 px canvas (500px kort + her yanda 30px `COURT_PADDING_X`)
- **Tam kort** (Full Court): 560×940 px canvas
- Koordinat sistemi: normalize `{x: 0–1, y: 0–1}` — y=0 basket ucu (üst), y=1 orta saha (alt)
- `COURT_PADDING_X = 30`: canvas yanlara genişletilmiş, kort çizgileri ve oyuncular `Group x={30}` offset ile ortalanır. Drag normalizasyonu (`node.x() / HALF_COURT_W`) bozulmaz — Konva `node.x()` parent Group'a göre yerel koordinat döndürür.

### Kort Çizgileri

- Üç nokta yayı: merkez (250, 53), r=238, `angle=136°` (köşe-yay bağlantısı piksel hassasiyetinde)
- Köşe çizgileri: x=30 / x=470, y=0'dan y=144'e (yay kesişim noktasıyla eşleşecek şekilde)
- **Post çizgileri (block marks)**: key'in her iki yanında y=100 ve y=135'te 15px yatay çizgiler
- **Post dikdörtgenleri**: key dışında, restricted arc seviyesinde (y=50), 15×20px outlined kutucuklar
- Tüm bu çizgiler HalfCourt ve FullCourt (üst + alt) bileşenlerinde mevcut

---

## Dizilimler

### Hücum (6 adet — tümü yarım korta özel)

| ID | İsim |
|---|---|
| five-out | 5-Out |
| four-out-one-in | 4-Out 1-In |
| one-four-high | 1-4 High |
| horns | Horns |
| high-post | High Post |
| double-post | Double Post |

### Savunma (8 adet)

| ID | İsim | Sadece Yarım Kort? | Özellik |
|---|---|---|---|
| man-to-man | Man-to-Man | Hayır | Hücum varsa oyuncuların dibine yerleşir |
| two-three-zone | 2-3 Zone | **Evet** | — |
| three-two-zone | 3-2 Zone | **Evet** | — |
| one-three-one | 1-3-1 Zone | **Evet** | — |
| two-one-two-zone | 2-1-2 Zone | **Evet** | — |
| one-two-two-zone | 1-2-2 Zone | **Evet** | — |
| full-court-press | Full Court Press | Hayır | — |
| half-court-trap | Half Court Trap | Hayır | — |

> `FormationPreset.courtOnly?: 'half' | 'full'` — set ise yalnızca o kort tipinde gösterilir.
> Man-to-Man: Hücum oyuncuları yerleştirilmişse savunmacılar `oN` pozisyonuna +y:-0.05 offset ile otomatik yerleşir.

---

## Aksiyon Tipleri (6 adet)

| Tip | Kimler Yapabilir | Çizgi | Uç Sembol |
|---|---|---|---|
| Pas | Toplu oyuncu | Kesik çizgi `- - -` | Ok başı `→` |
| Dribble | Toplu oyuncu | Dalgalı çizgi `∿` | Ok başı `→` |
| Kesme (Cut) | Herhangi oyuncu | Düz çizgi `—` | Ok başı `→` |
| Ekran (Screen) | Herhangi oyuncu | Düz çizgi `—` | Dik bar `⊣` |
| Şut | Toplu oyuncu | Kesik çizgi `- - -` | Hedef `⊕` |
| Handoff | Toplu oyuncu | Düz çizgi `—` | Çift artı `╋╋` |

---

## Veri Modeli (mevcut — `src/models/types.ts`)

```typescript
type CourtType = 'half' | 'full'
type Team = 'offense' | 'defense'
type ActionType = 'pass' | 'cut' | 'dribble' | 'screen' | 'shot' | 'handoff'

interface NormalizedPosition { x: number; y: number }
type PositionMap = Record<string, NormalizedPosition>

interface Player {
  id: string           // 'o1'–'o5' hücum, 'd1'–'d5' savunma
  number: 1 | 2 | 3 | 4 | 5
  team: Team
}

interface BallState { holderId: string }

// optionText: animasyon sırasında ball holder yanında badge olarak gösterilir
interface PassAction    { id: string; type: 'pass';    fromId: string; toId: string; optionText?: string }
interface CutAction     { id: string; type: 'cut';     playerId: string; toPosition: NormalizedPosition; optionText?: string }
interface DribbleAction { id: string; type: 'dribble'; playerId: string; toPosition: NormalizedPosition; optionText?: string }
interface ScreenAction  { id: string; type: 'screen';  screenerId: string; screenPosition: NormalizedPosition; optionText?: string }
interface ShotAction    { id: string; type: 'shot';    shooterId: string; optionText?: string }
interface HandoffAction { id: string; type: 'handoff'; fromId: string; toId: string; meetPosition: NormalizedPosition; optionText?: string }

type Action = PassAction | CutAction | DribbleAction | ScreenAction | ShotAction | HandoffAction

interface PlaySet {
  id: string
  name: string
  courtType: CourtType
  players: Player[]
  initialPositions: PositionMap
  initialBall: BallState
  actions: Action[]   // event sourcing — tüm aksiyonlar sırayla uygulanır
}
```

---

## Kullanıcı Akışı (MVP)

### Aşama 1 — Yeni Set Oluştur ✅
- Set'e isim ver
- Kort tipi: Yarım / Tam
- Kaç hücum (1–5) + kaç savunma (0–5)

### Aşama 2 — Başlangıç Kurulumu ✅
- Hücum ve/veya savunma dizilimi seç (kort tipine göre filtrelenir)
- Man-to-Man: hücum varsa otomatik dibe konumlar
- Sürükle-bırak ile fine-tune
- Topa sahip oyuncuyu seç → "Hazır"

### Aşama 3 — Aksiyon Ekle (Plan 2)
- Araç çubuğundan aksiyon tipi seçilir
- 2-adımlı tıklama: kaynak → hedef
- Aksiyon eklenince oyuncu pozisyonu güncellenir

### Aşama 4 — Aksiyon Yönetimi (Plan 2)
- ✏️ düzenle, ✕ sil (onay dialog)
- Ctrl+Z undo
- Herhangi bir aksiyon kartına tıkla → o adıma git
- `optionText`: aksiyon sonrası badge metni (animasyonda görünür)

### Aşama 5 — Animasyon & Export (Plan 3)
- ▶ Oynat → tüm aksiyon dizisi animasyonla oynar
- optionText badge → Konva shape olarak canvas'ta (GIF/MP4'e gömülür)
- Hız: Yavaş / Normal / Hızlı
- Export: **GIF** veya **Video (MP4)**

---

## Klasör Yapısı

```
src/
  models/
    types.ts
  store/
    usePlayStore.ts
  utils/
    stateEngine.ts        ← Plan 2
    formations.ts         ← ✅ 6 hücum + 8 savunma dizilimi
    courtCoords.ts        ← ✅
  components/
    court/
      CourtCanvas.tsx     ← ✅
      HalfCourt.tsx       ← ✅
      FullCourt.tsx       ← ✅
    players/
      PlayerNode.tsx      ← ✅
    actions/              ← Plan 2
    toolbar/              ← Plan 2
    setup/
      PlayerSetup.tsx     ← ✅
      FormationPicker.tsx ← ✅ (courtType filtresi dahil)
    playback/             ← Plan 3
    export/               ← Plan 3
  pages/
    HomePage.tsx          ← ✅
    EditorPage.tsx        ← stub (Plan 2'de tamamlanacak)
    SetupPage.tsx         ← ✅
  App.tsx                 ← ✅
  main.tsx                ← ✅
setplay.sh                ← ✅ Docker/npm start+stop scripti
Dockerfile                ← ✅
docker-compose.yml        ← ✅
```

---

## Geliştirme Ortamı

```bash
./setplay.sh start   # Docker varsa container, yoksa npm dev server
./setplay.sh stop    # Tüm servisleri durdur
```

Uygulama: `http://localhost:5173`

---

## Faz Durumu

| Faz | İçerik | Durum |
|---|---|---|
| Plan 1 | Scaffold, kort canvas, kurulum akışı, dizilimler | ✅ Tamamlandı |
| Plan 2 | State engine, 6 aksiyon tipi, editor page | Bekliyor |
| Plan 3 | Animasyon, playback, GIF/MP4 export | Bekliyor |

---

## MVP Kapsam Dışı

- Kullanıcı hesabı / bulut kayıt
- Community / Publish
- Real-time collaboration
