import { useEffect, useRef } from 'react'

interface Props {
  slotId?: string
  className?: string
}

// Renders a Google AdSense display unit.
// slotId: fill in once AdSense account is approved and an ad unit is created.
export default function AdSlot({ slotId = 'PENDING', className = '' }: Props) {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current || slotId === 'PENDING') return
    pushed.current = true
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch { /* AdSense not loaded */ }
  }, [slotId])

  if (slotId === 'PENDING') {
    return (
      <div className={`bg-slate-700/50 border border-slate-600/50 rounded-lg flex items-center justify-center text-slate-500 text-xs ${className}`}>
        Advertisement
      </div>
    )
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block' }}
      data-ad-client="ca-pub-6965917095403868"
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
