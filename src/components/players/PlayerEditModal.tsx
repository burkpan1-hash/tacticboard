import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Player } from '../../models/types'

interface Props {
  player: Player
  onSave: (updates: { number: number; name: string }) => void
  onClose: () => void
}

const NAME_MAX = 16
const NUM_MIN = 0
const NUM_MAX = 99

export default function PlayerEditModal({ player, onSave, onClose }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState(player.name ?? '')
  const [numberInput, setNumberInput] = useState(String(player.number))
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { nameRef.current?.focus() }, [])

  function clampedNumber(): number {
    const n = parseInt(numberInput, 10)
    if (Number.isNaN(n)) return player.number
    return Math.max(NUM_MIN, Math.min(NUM_MAX, n))
  }

  function commit() {
    onSave({ number: clampedNumber(), name: name.slice(0, NAME_MAX) })
    onClose()
  }

  const swatch = player.team === 'offense' ? '#f97316' : '#1d4ed8'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-slate-800 border border-slate-600 rounded-xl p-5 w-80 flex flex-col gap-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold border-2 border-white"
            style={{ backgroundColor: swatch }}
          >{clampedNumber()}</div>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-sm">{t('playerEdit.title')}</span>
            <span className="text-slate-400 text-xs">{player.team === 'offense' ? t('toolbar.offenseHeader') : t('toolbar.defenseHeader')}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-400 text-xs font-medium">{t('playerEdit.nameLabel')}</label>
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
            placeholder={t('playerEdit.namePlaceholder')}
            maxLength={NAME_MAX}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') onClose()
            }}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-500 border border-slate-600"
          />
          <span className="text-slate-500 text-[10px] self-end">{name.length}/{NAME_MAX}</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-400 text-xs font-medium">{t('playerEdit.numberLabel')}</label>
          <input
            type="number"
            min={NUM_MIN}
            max={NUM_MAX}
            value={numberInput}
            onChange={(e) => setNumberInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') onClose()
            }}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 border border-slate-600"
          />
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={commit}
            className="w-full py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors"
          >{t('playerEdit.saveButton')}</button>
          <button
            onClick={onClose}
            className="w-full py-2 text-slate-400 hover:text-white transition-colors text-sm"
          >{t('common.cancelButton')}</button>
        </div>
      </div>
    </div>
  )
}
