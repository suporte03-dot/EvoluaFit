import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

document.documentElement.removeAttribute('data-theme')
try {
  localStorage.removeItem('evoluafit-theme')
  localStorage.removeItem('arena360-theme')
} catch {
  /* ignore */
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
