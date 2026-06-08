import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import AuthApp from './pages/Auth/AuthApp.jsx'
import HomePage from './pages/Home/HomePage.jsx'
import ModulePlaceholder from './pages/Home/ModulePlaceholder.jsx'
import PrivateRoute from './routes/PrivateRoute.jsx'
import FlashCardApp from './pages/FlashCard/FlashCardApp.jsx'
import FileTree from './pages/FileTree/FileTree.jsx'
import PomodoroPage from './pages/Pomodoro/PomodoroPage.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/auth" element={<AuthApp />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/pomodoro"
          element={
            <PrivateRoute>
              <PomodoroPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/flashcards"
          element={
            <PrivateRoute>
              <FlashCardApp />
            </PrivateRoute>
          }
        />
        <Route
          path="/filetree"
          element={
            <PrivateRoute>
              <FileTree />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
