import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import AuthApp from './pages/Auth/AuthApp.jsx'
import HomePage from './pages/Home/HomePage.jsx'

// Protection for private routes
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/auth" />;
};

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
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
