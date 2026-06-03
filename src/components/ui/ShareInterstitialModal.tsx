import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdSlot from './AdSlot'

const COUNTDOWN_SEC = 5

interface Props {
  onShare: () => Promise<string>
  onClose: () => void
}

export default function ShareInterstitialModal({ onShare, onClose }: Props) {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const ready = countdown === 0 && shareUrl !== null

  useEffect(() => {
    // Start share in background
    onShare().then(url => setShareUrl(url)).catch(() => setShareUrl(''))

    // Start countdown
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ready) return
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true)
        setTimeout(() => setShowUpgrade(true), 600)
      })
    }
  }, [ready, shareUrl])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm">
            {ready ? (copied ? '🔗 Link ready!' : 'Preparing link…') : 'Generating share link…'}
          </h2>
          {ready && (
            <button onClick={onClose} className="text-slate-400 hover:text-white text-lg leading-none">×</button>
          )}
        </div>

        {/* Ad slot */}
        {!ready && (
          <AdSlot className="h-[100px]" />
        )}

        {/* Countdown */}
        {!ready && (
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
            <div className="w-8 h-8 rounded-full border-2 border-orange-500 flex items-center justify-center text-orange-400 font-bold text-base">
              {countdown}
            </div>
            <span>Please wait…</span>
          </div>
        )}

        {/* Done state */}
        {ready && (
          <div className="flex flex-col gap-3">
            {copied ? (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
                <span className="text-green-400 text-lg">✓</span>
                <div>
                  <p className="text-green-400 font-semibold text-sm">Link copied to clipboard!</p>
                  <p className="text-slate-400 text-xs mt-0.5">Share it with your team.</p>
                </div>
              </div>
            ) : (
              <p className="text-red-400 text-sm">Could not generate link. Try again.</p>
            )}

            {showUpgrade && (
              <div className="bg-slate-700/60 rounded-xl p-4 flex flex-col gap-3 border border-slate-600">
                <div>
                  <p className="text-white font-semibold text-sm">Remove ads?</p>
                  <p className="text-slate-400 text-xs mt-0.5">Upgrade to Pro — no ads, unlimited plays.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { onClose(); navigate('/pricing') }}
                    className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors"
                  >
                    Upgrade to Pro
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
                  >
                    No thanks
                  </button>
                </div>
              </div>
            )}

            {!showUpgrade && (
              <button onClick={onClose} className="w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors">
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
