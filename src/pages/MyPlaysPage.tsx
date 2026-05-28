import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient } from '../lib/authClient'

interface CloudPlay {
  id: string
  title: string
  shareToken: string | null
  createdAt: string
  updatedAt: string
}

export default function MyPlaysPage() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const [plays, setPlays] = useState<CloudPlay[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/plays')
      .then((r) => r.json())
      .then((data) => setPlays(data))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    await fetch(`/api/plays/${id}`, { method: 'DELETE' })
    setPlays((prev) => prev.filter((p) => p.id !== id))
  }

  async function handleShare(id: string) {
    const res = await fetch(`/api/plays/${id}/share`, { method: 'POST' })
    const { shareToken } = await res.json()
    const url = `${window.location.origin}/share/${shareToken}`
    await navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    setPlays((prev) => prev.map((p) => (p.id === id ? { ...p, shareToken } : p)))
  }

  async function handleLogout() {
    await authClient.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Play'lerim</h1>
          <p className="text-slate-400 text-sm mt-1">{session?.user.email}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Ana Sayfa
          </button>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      {plays.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <div className="text-5xl mb-4">🏀</div>
          <p className="text-lg">Henüz kaydedilmiş play yok.</p>
          <button
            onClick={() => navigate('/setup')}
            className="mt-4 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Yeni Play Oluştur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plays.map((play) => (
            <div key={play.id} className="bg-slate-800 rounded-xl p-5">
              <p className="font-semibold text-white truncate mb-1">{play.title}</p>
              <p className="text-xs text-slate-500 mb-4">
                {new Date(play.updatedAt).toLocaleDateString('tr-TR')}
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => navigate(`/editor/${play.id}?cloud=1`)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  Aç
                </button>
                <button
                  onClick={() => handleShare(play.id)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  {copiedId === play.id ? 'Kopyalandı!' : play.shareToken ? 'Link Kopyala' : 'Paylaş'}
                </button>
                <button
                  onClick={() => handleDelete(play.id)}
                  className="text-slate-400 hover:text-red-400 px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
