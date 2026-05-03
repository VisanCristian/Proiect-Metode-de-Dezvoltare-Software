import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import FlashCard from './pages/FlashCard/FlashCardApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FlashCard />
  </StrictMode>,
)
