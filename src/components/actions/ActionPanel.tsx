import ActionCard from './ActionCard'
import { usePlayStore } from '../../store/usePlayStore'

export default function ActionPanel() {
  const {
    activeSet, activeStep,
    setActiveStep, deleteAction, startActionCreation, setOptionText,
  } = usePlayStore()

  if (!activeSet) return null

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700">
      <div className="p-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300">
          Aksiyonlar <span className="text-slate-500">({activeSet.actions.length})</span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeSet.actions.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">
            Aksiyon eklemek için sol araç çubuğundan bir tip seç
          </p>
        )}

        {activeSet.actions.map((action, i) => (
          <ActionCard
            key={action.id}
            index={i}
            action={action}
            isActive={activeStep === i + 1}
            onClick={() => setActiveStep(i + 1)}
            onDelete={() => deleteAction(action.id)}
            onEdit={() => startActionCreation(action.type)}
            onOptionTextChange={(text) => setOptionText(action.id, text)}
          />
        ))}
      </div>
    </div>
  )
}
