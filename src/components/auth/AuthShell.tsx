import type { ReactNode } from 'react'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import Logo from '../ui/Logo'
import { useNoIndex } from '../../hooks/useNoIndex'

interface Props {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export default function AuthShell({ title, subtitle, children, footer }: Props) {
  useNoIndex()
  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <div className="flex justify-end p-4">
        <LanguageSwitcher />
      </div>
      <div className="flex-1 flex items-start sm:items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <Logo size={48} className="mb-4" />
            <h1 className="text-xl font-bold text-white text-center">{title}</h1>
            {subtitle && <p className="text-slate-400 text-sm mt-2 text-center">{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="mt-6 text-center text-slate-400 text-sm">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
