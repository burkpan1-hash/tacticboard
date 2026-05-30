import { useState } from 'react'
import { useTranslation } from 'react-i18next'

// Drop-in replacement for <input type="password"> that adds an eye toggle on the right.
// Forwards all native input props except `type` (which it controls internally).

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>

export default function PasswordInput(props: Props) {
  const { t } = useTranslation()
  const [shown, setShown] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type={shown ? 'text' : 'password'}
        // Reserve room on the right for the toggle button so the value text doesn't
        // slide under the icon.
        className={`${props.className ?? ''} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShown(s => !s)}
        aria-label={t(shown ? 'auth.hidePassword' : 'auth.showPassword')}
        title={t(shown ? 'auth.hidePassword' : 'auth.showPassword')}
        // Vertically centered inside the input; semi-transparent so it doesn't compete
        // with the form's primary action.
        className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-200 focus:text-slate-200 focus:outline-none transition-colors"
        tabIndex={-1}
      >
        {shown ? (
          // Eye-off (Heroicons-style, 20×20)
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        ) : (
          // Eye
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  )
}
