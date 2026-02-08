import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Enforce true dark mode by default for the redesigned theme
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark')
}

createRoot(document.getElementById('root')!).render(<App />)
