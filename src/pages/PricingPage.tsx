import { useNavigate } from 'react-router-dom'
import Logo from '../components/ui/Logo'

export default function PricingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen p-6 sm:p-12 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <button onClick={() => navigate('/')}><Logo /></button>
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white text-sm transition-colors">← Back to Home</button>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">Simple, transparent pricing</h1>
        <p className="text-slate-400 text-lg">Start free. Upgrade when you're ready.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Free */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 flex flex-col">
          <div className="mb-6">
            <div className="text-slate-400 text-sm font-semibold uppercase tracking-wide mb-2">Free</div>
            <div className="text-5xl font-bold text-white">$0</div>
            <div className="text-slate-500 text-sm mt-1">forever</div>
          </div>
          <ul className="flex flex-col gap-3 text-sm text-slate-300 flex-1 mb-8">
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Full court &amp; half court editor</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> All action types (pass, cut, screen…)</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Animated playback</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Share plays via link</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> GIF export</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Up to 10 saved plays</li>
            <li className="flex items-center gap-2"><span className="text-slate-500">–</span> <span className="text-slate-500">Ads shown</span></li>
          </ul>
          <button
            onClick={() => navigate('/register')}
            className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
          >
            Get started free
          </button>
        </div>

        {/* Pro */}
        <div className="bg-slate-800 rounded-2xl p-8 border-2 border-orange-500 flex flex-col relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
            Most popular
          </div>
          <div className="mb-6">
            <div className="text-orange-400 text-sm font-semibold uppercase tracking-wide mb-2">Pro</div>
            <div className="flex items-end gap-2">
              <div className="text-5xl font-bold text-white">$4.99</div>
              <div className="text-slate-400 text-sm mb-2">/month</div>
            </div>
            <div className="text-slate-500 text-sm mt-1">or $39.99/year <span className="text-green-400 font-medium">(save 33%)</span></div>
          </div>
          <ul className="flex flex-col gap-3 text-sm text-slate-300 flex-1 mb-8">
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Everything in Free</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> <strong className="text-white">Unlimited</strong> saved plays</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> <strong className="text-white">No ads</strong></li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Priority support</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Early access to new features</li>
          </ul>
          <button
            onClick={() => navigate('/register')}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold transition-colors shadow-lg shadow-orange-500/30"
          >
            Start free trial
          </button>
        </div>
      </div>

      <p className="text-center text-slate-500 text-xs mt-10">
        Cancel anytime · No refunds · No hidden fees.{' '}
        <a href="/refund" className="hover:text-orange-400 transition-colors">Refund policy</a>
        {' · '}
        Questions? <a href="mailto:support@basketballtacticboard.com" className="text-orange-400 hover:text-orange-300">support@basketballtacticboard.com</a>
      </p>
    </div>
  )
}
