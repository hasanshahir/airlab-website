import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// Handle dynamic import errors automatically when a new version is deployed
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error detected, reloading to fetch latest deployment...', event)
  // Prevent infinite reload loops if there is an actual persistent network outage
  const lastReload = sessionStorage.getItem('airlab_chunk_reload')
  const now = Date.now()
  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
    sessionStorage.setItem('airlab_chunk_reload', now.toString())
    window.location.reload()
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)

