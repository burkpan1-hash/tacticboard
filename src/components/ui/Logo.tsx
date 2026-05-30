// Stacked wordmark:
//   BASKETBALL  ← orange, top, larger
//   TACTIC BOARD ← white, bottom, slightly smaller — but stretched to the SAME width
//                   as the top row so the block looks compact and balanced.
//
// Rendered via SVG so we can force both rows to identical width with `textLength` +
// `lengthAdjust="spacing"` — which adjusts inter-letter gaps only, preserving the
// Anton glyph shapes. CSS-only stacking can't guarantee width match because Anton's
// natural width of "BASKETBALL" (10 chars) and "TACTIC BOARD" (11 chars + space)
// differ for any given font-size.

interface Props {
  /** Total height of the logo block in px. Default 80. */
  size?: number
  className?: string
}

export default function Logo({ size = 80, className = '' }: Props) {
  // viewBox 200 wide × 130 tall. Internal balance:
  //   TOP_SIZE: BASKETBALL height — stays large/dominant
  //   BOT_SIZE: TACTIC BOARD height — bumped up so it's actually readable + close to top
  //   GAP: visual gap between rows (cap of bottom to baseline of top)
  //   TEXT_LEN_PCT: both rows stretched to this width so the wordmark is one solid block
  const VB_W = 200, VB_H = 130
  const TOP_SIZE = 80
  const BOT_SIZE = 50
  const GAP = 6
  const TEXT_LEN_PCT = 0.96

  const textLen = VB_W * TEXT_LEN_PCT
  const topY = TOP_SIZE
  const botY = TOP_SIZE + GAP + BOT_SIZE

  // Final pixel width derives from the size (height) prop and the viewBox aspect ratio.
  const pxWidth = Math.round((size * VB_W) / VB_H)

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={pxWidth}
      height={size}
      className={`select-none ${className}`}
      role="img"
      aria-label="Basketball Tactic Board"
    >
      <text
        x={VB_W / 2}
        y={topY}
        textAnchor="middle"
        fontFamily="'Anton', 'Arial Black', system-ui, sans-serif"
        fontSize={TOP_SIZE}
        fill="#f97316"
        textLength={textLen}
        lengthAdjust="spacing"
      >
        BASKETBALL
      </text>
      <text
        x={VB_W / 2}
        y={botY}
        textAnchor="middle"
        fontFamily="'Anton', 'Arial Black', system-ui, sans-serif"
        fontSize={BOT_SIZE}
        fill="#ffffff"
        textLength={textLen}
        lengthAdjust="spacing"
      >
        TACTIC BOARD
      </text>
    </svg>
  )
}
