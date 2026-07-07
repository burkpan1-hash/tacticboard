import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PRESETS } from '../data/presets'

// Dev-only tool: not linked from anywhere in the public UI, only reachable at
// /dev/presets, and only routed at all when `import.meta.env.DEV` (see
// App.tsx) — production builds never mount this page or its "Yayınla" fetch
// call, which POSTs to a dev-server-only Vite middleware
// (vite-plugins/publishPresetPlugin.ts) that doesn't exist once deployed.
export default function PresetDraftsPage() {
  const drafts = PRESETS.filter((p) => p.status === 'draft')
  const [busySlug, setBusySlug] = useState<string | null>(null)
  const [errorSlug, setErrorSlug] = useState<{ slug: string; message: string } | null>(null)

  async function publish(slug: string) {
    setBusySlug(slug)
    setErrorSlug(null)
    try {
      const res = await fetch('/__dev/publish-preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setErrorSlug({ slug, message: body.error ?? `HTTP ${res.status}` })
        setBusySlug(null)
        return
      }
      // The registry module needs a fresh read of the patched file — a full
      // reload is simpler and more reliable here than waiting on HMR.
      window.location.reload()
    } catch (e) {
      setErrorSlug({ slug, message: e instanceof Error ? e.message : String(e) })
      setBusySlug(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Hazır Set Taslakları</h1>
        <p className="text-slate-400 text-sm mb-8">
          {drafts.length} taslak. Önizle ile /sets/&lt;slug&gt; sayfasını (ve oradan editörü) kontrol et, sorun yoksa Yayınla'ya bas — dosyada status: 'draft' → 'published' olur.
        </p>

        {drafts.length === 0 ? (
          <p className="text-slate-500">Bekleyen taslak yok.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {drafts.map((preset) => (
              <div
                key={preset.slug}
                className="flex items-center justify-between gap-4 bg-slate-800 border border-slate-700 rounded-lg p-4"
              >
                <div>
                  <div className="font-semibold">{preset.title}</div>
                  <div className="text-xs text-slate-500">
                    {preset.category}
                    {preset.family && <> · aile: {preset.family.title}</>}
                    {' · '}{preset.slug}
                  </div>
                  {errorSlug?.slug === preset.slug && (
                    <div className="text-xs text-red-400 mt-1">{errorSlug.message}</div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/sets/${preset.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-sm rounded-md border border-slate-600 hover:border-orange-400 hover:text-orange-400 transition-colors"
                  >
                    Önizle
                  </Link>
                  <button
                    onClick={() => publish(preset.slug)}
                    disabled={busySlug === preset.slug}
                    className="px-3 py-1.5 text-sm rounded-md bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
                  >
                    {busySlug === preset.slug ? 'Yayınlanıyor…' : 'Yayınla'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
