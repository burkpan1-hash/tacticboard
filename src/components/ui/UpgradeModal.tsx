import { useNavigate } from 'react-router-dom'

interface Props {
  onClose: () => void
}

export default function UpgradeModal({ onClose }: Props) {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="bg-slate-800 border border-slate-600 rounded-2xl p-8 w-full max-w-sm shadow-2xl flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-4xl mb-3">🏀</div>
          <h2 className="text-xl font-bold text-white mb-2">You've reached the free limit</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Free accounts can save up to <span className="text-white font-semibold">10 plays</span>.
            Upgrade to Pro for unlimited saves and no ads.
          </p>
        </div>

        <div className="bg-slate-700/60 rounded-xl p-4 flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-slate-300"><span className="text-green-400">✓</span> Unlimited saved plays</div>
          <div className="flex items-center gap-2 text-slate-300"><span className="text-green-400">✓</span> No ads</div>
          <div className="flex items-center gap-2 text-slate-300"><span className="text-green-400">✓</span> Priority support</div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => { onClose(); navigate('/pricing') }}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold transition-colors shadow-lg shadow-orange-500/20"
          >
            Upgrade to Pro →
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-sm transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
