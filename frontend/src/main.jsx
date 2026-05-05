import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import AuthApp from './pages/Auth/AuthApp.jsx'
import HomePage from './pages/Home/HomePage.jsx'
import ModulePlaceholder from './pages/Home/ModulePlaceholder.jsx'
import PrivateRoute from './routes/PrivateRoute.jsx'

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
              <ModulePlaceholder
                title="Pomodoro module"
                description="This route is prepared from the authenticated dashboard. The final Pomodoro screen can be connected here once the feature branch is merged."
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/flashcards"
          element={
            <PrivateRoute>
              <ModulePlaceholder
                title="FlashCards module"
                description="This route is prepared from the authenticated dashboard. The final FlashCards screen can be connected here once the feature branch is merged."
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/filetree"
          element={
            <PrivateRoute>
              <ModulePlaceholder
                title="FileTree module"
                description="This route is prepared from the authenticated dashboard. The final FileTree screen can be connected here once the feature branch is merged."
              />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
