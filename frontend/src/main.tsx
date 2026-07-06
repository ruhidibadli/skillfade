import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Unregister any service worker left over from the previous PWA build and drop
// its caches. The old SW intercepted navigations (including /sitemap.xml,
// /robots.txt) and served a stale SPA shell. Gated behind a one-time flag so it
// stops running on every load once the old SW is gone from the field.
const SW_CLEANUP_FLAG = 'sw_cleanup_done_v1'
try {
  if (!localStorage.getItem(SW_CLEANUP_FLAG)) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister())
      }).catch(() => {})
    }
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key))
      }).catch(() => {})
    }
    localStorage.setItem(SW_CLEANUP_FLAG, '1')
  }
} catch {
  // localStorage unavailable (private mode / SSR) — skip; not worth blocking boot.
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
