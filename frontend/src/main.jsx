import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import FlashCardApp from './pages/FlashCard/FlashCardApp.jsx'
import FileTree from './pages/FileTree/FileTree.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/filetree" element={<FileTree />} />
        <Route path="/flashcards" element={<FlashCardApp />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)


