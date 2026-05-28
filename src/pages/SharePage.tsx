import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlayStore } from '../store/usePlayStore'
import CourtCanvas from '../components/court/CourtCanvas'
import PlaybackControls from '../components/playback/PlaybackControls'
import type { PlaySet } from '../models/types'

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { setActiveSet, activeSet } = usePlayStore()
  const [title, setTitle] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null }
        return r.json()
      })
      .then((play) => {
        if (!play) return
        setTitle(play.title)
        setActiveSet(play.data as PlaySet)
      })
      .finally(() => setLoading(false))
  }, [token, setActiveSet])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Yükleniyor...</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400 text-lg">Play bulunamadı.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-2 rounded-lg"
        >
          Ana Sayfa
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 gap-4">
      <div className="flex items-center justify-between w-full max-w-2xl">
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
          Salt okunur
        </span>
      </div>
      {activeSet && (
        <>
          <CourtCanvas courtType={activeSet.courtType} attackBasket={activeSet.attackBasket} />
          <PlaybackControls />
        </>
      )}
    </div>
  )
}
