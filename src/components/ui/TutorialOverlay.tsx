import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

const TUTORIAL_SEEN_KEY = 'btb_tutorial_seen'

interface Step {
  targetIds?: string[]
  titleKey: string
  bodyKey: string
}

const STEPS: Step[] = [
  { titleKey: 'tutorial.step0Title', bodyKey: 'tutorial.step0Body' },
  { targetIds: ['tutorial-toolbar', 'tutorial-toolbar-mobile'], titleKey: 'tutorial.step1Title', bodyKey: 'tutorial.step1Body' },
  { targetIds: ['tutorial-court'], titleKey: 'tutorial.step2Title', bodyKey: 'tutorial.step2Body' },
  { targetIds: ['tutorial-playback'], titleKey: 'tutorial.step3Title', bodyKey: 'tutorial.step3Body' },
]

function getVisibleElement(ids: string[]): HTMLElement | null {
  for (const id of ids) {
    const el = document.getElementById(id)
    if (el && el.offsetParent !== null) return el
  }
  return null
}

interface TooltipPos {
  top?: number | string
  left?: number | string
  transform?: string
}

export default function TutorialOverlay() {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState<TooltipPos>({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!localStorage.getItem(TUTORIAL_SEEN_KEY)) setVisible(true)
  }, [])

  const currentStep = STEPS[step]

  useLayoutEffect(() => {
    if (!visible || !currentStep.targetIds) {
      setPos({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })
      return
    }
    const target = getVisibleElement(currentStep.targetIds)
    if (!target) {
      setPos({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })
      return
    }
    const rect = target.getBoundingClientRect()
    const tw = tooltipRef.current?.offsetWidth ?? 288
    const th = tooltipRef.current?.offsetHeight ?? 160
    const margin = 12

    // Try: right of target
    if (rect.right + tw + margin <= window.innerWidth) {
      setPos({
        top: Math.max(8, Math.min(window.innerHeight - th - 8, rect.top + rect.height / 2 - th / 2)),
        left: rect.right + margin,
      })
    // Try: above target
    } else if (rect.top - th - margin >= 8) {
      setPos({
        top: rect.top - th - margin,
        left: Math.max(8, Math.min(window.innerWidth - tw - 8, rect.left + rect.width / 2 - tw / 2)),
      })
    // Try: below target
    } else if (rect.bottom + th + margin <= window.innerHeight) {
      setPos({
        top: rect.bottom + margin,
        left: Math.max(8, Math.min(window.innerWidth - tw - 8, rect.left + rect.width / 2 - tw / 2)),
      })
    } else {
      setPos({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })
    }
  }, [step, visible])

  function dismiss() {
    localStorage.setItem(TUTORIAL_SEEN_KEY, '1')
    setVisible(false)
  }

  function next() {
    if (step >= STEPS.length - 1) dismiss()
    else setStep(s => s + 1)
  }

  if (!visible) return null

  const isWelcome = step === 0
  const isDone = step === STEPS.length - 1

  const nextLabel = isWelcome
    ? t('tutorial.startButton')
    : isDone
    ? t('tutorial.doneButton')
    : t('tutorial.nextButton')

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 pointer-events-none">
      <div
        ref={tooltipRef}
        className="absolute pointer-events-auto bg-slate-800 border border-orange-500/40 rounded-2xl p-5 shadow-2xl w-72"
        style={pos as React.CSSProperties}
      >
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>

        <h3 className="text-white font-bold text-base pr-5">{t(currentStep.titleKey)}</h3>
        <p className="text-slate-300 text-sm mt-1.5 leading-relaxed">{t(currentStep.bodyKey)}</p>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${i === step ? 'w-4 h-1.5 bg-orange-400' : 'w-1.5 h-1.5 bg-slate-600'}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {isWelcome && (
              <button onClick={dismiss} className="text-slate-400 hover:text-white text-sm transition-colors">
                {t('tutorial.skipButton')}
              </button>
            )}
            <button
              onClick={next}
              className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors"
            >
              {nextLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
