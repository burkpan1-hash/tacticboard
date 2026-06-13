import { useEffect } from 'react'

// Injects noindex on pages that must never show ads or appear in search
// (auth flows, error pages, setup). Removed on unmount so it doesn't bleed
// into subsequent SPA navigations.
export function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => { meta.remove() }
  }, [])
}
