// Stacked wordmark:
//   BASKETBALL  ← orange, top, sets the visual width of the whole logo
//   TACTIC BOARD ← white, bottom, smaller font but wide letter-spacing so it
//                  reads as part of the same block beneath BASKETBALL
//
// CSS-based rather than SVG — earlier SVG version used `textLength="spacing"`
// which compressed glyphs at small render sizes, causing letters to overlap.
// Plain HTML+CSS lets the text render at its natural per-letter width regardless
// of the container size; only the inter-letter spacing on the bottom row is tuned
// so its visual width approximates the top row.

interface Props {
  /** Height of the BASKETBALL row in px. Default 56. Total logo height ≈ size × 1.5. */
  size?: number
  className?: string
}

export default function Logo({ size = 56, className = '' }: Props) {
  const fontFamily = '"Anton", "Arial Black", system-ui, sans-serif'

  // Top row dominates. Bottom row at ~52% of top — readable without looking small.
  const topFontSize = size
  const botFontSize = Math.round(size * 0.52)
  const gap = Math.round(size * 0.08)

  return (
    <div
      className={`inline-flex flex-col items-center select-none leading-none ${className}`}
      aria-label="Basketball Tactic Board"
      role="img"
    >
      <span
        style={{
          fontFamily,
          fontSize: topFontSize,
          color: '#f97316',
          lineHeight: 1,
          letterSpacing: '0.02em',
        }}
      >
        BASKETBALL
      </span>
      <span
        style={{
          fontFamily,
          fontSize: botFontSize,
          color: '#ffffff',
          lineHeight: 1,
          // Wide tracking spreads "TACTIC BOARD" to roughly match BASKETBALL's natural width.
          // Anton's tight default gaps + this tracking ≈ same span as the top row at any size.
          letterSpacing: '0.32em',
          marginTop: gap,
          // Trailing letter-spacing reserves a gap after the last letter; nudge left to recenter.
          paddingLeft: '0.32em',
        }}
      >
        TACTIC BOARD
      </span>
    </div>
  )
}
