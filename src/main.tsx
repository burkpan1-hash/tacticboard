import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { initSentry, SentryErrorBoundary } from './lib/sentry'
import { initAnalytics } from './lib/analytics'
import './i18n'
import './index.css'

// Must run before render so any errors during initial mount are captured.
initSentry()
// Analytics waits for cookie consent internally — safe to call at any point.
initAnalytics()

const tree = (
  <React.StrictMode>
    <SentryErrorBoundary
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100 p-6">
          <div className="text-6xl mb-4" aria-hidden>🏀</div>
          <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
          <p className="text-slate-400 text-center max-w-md mb-6">
            An unexpected error occurred. We've been notified and will look into it.
          </p>
          <button
            onClick={() => window.location.assign('/')}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium"
          >
            Reload
          </button>
        </div>
      }
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SentryErrorBoundary>
  </React.StrictMode>
)

const container = document.getElementById('root')!
// Prerendered routes (scripts/prerender.mjs) ship with real markup already
// inside #root — hydrate that instead of wiping and re-rendering, so
// hydrateRoot can match it up with zero flash. Every other route still gets
// a plain client render, unchanged.
if (container.firstChild) {
  ReactDOM.hydrateRoot(container, tree)
} else {
  ReactDOM.createRoot(container).render(tree)
}
