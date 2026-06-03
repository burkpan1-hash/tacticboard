import { useTranslation } from 'react-i18next'
import { passwordStrength, checkPassword } from '../../lib/passwordPolicy'

interface Props {
  password: string
}

const STRENGTH_LABEL_KEYS = [
  'auth.strengthVeryWeak',
  'auth.strengthWeak',
  'auth.strengthFair',
  'auth.strengthGood',
  'auth.strengthStrong',
] as const

const STRENGTH_COLORS = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-500']

const WEAK_RULE_KEYS: Record<string, string> = {
  tooShort: 'auth.weakTooShort',
  tooLong:  'auth.weakTooLong',
  noUpper:  'auth.weakNoUpper',
  noLower:  'auth.weakNoLower',
  noDigit:  'auth.weakNoDigit',
  common:   'auth.weakCommon',
}

export default function PasswordStrengthMeter({ password }: Props) {
  const { t } = useTranslation()
  const score = passwordStrength(password)
  const check = checkPassword(password)

  // Hide entirely until user starts typing — avoids a "very weak / add upper" flash on empty input.
  if (!password) {
    return <p className="text-slate-500 text-xs mt-1">{t('auth.passwordRule')}</p>
  }

  return (
    <div className="mt-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded ${i <= score - 1 ? STRENGTH_COLORS[score - 1] : 'bg-slate-700'}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mt-1.5 text-xs">
        <span className="text-slate-400">
          {t('auth.strengthLabel')}: <span className="text-slate-200">{t(STRENGTH_LABEL_KEYS[Math.max(0, score - 1)])}</span>
        </span>
        {!check.ok && check.failedRule && (
          <span className="text-orange-300">{t(WEAK_RULE_KEYS[check.failedRule])}</span>
        )}
      </div>
    </div>
  )
}
