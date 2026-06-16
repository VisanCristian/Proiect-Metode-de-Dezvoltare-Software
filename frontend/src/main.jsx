import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './App.css'
import AuthApp from './pages/Auth/AuthApp.jsx'
import HomePage from './pages/Home/HomePage.jsx'
import PrivateRoute from './routes/PrivateRoute.jsx'
import FlashCardApp from './pages/FlashCard/FlashCardApp.jsx'
import FileTree from './pages/FileTree/FileTree.jsx'
import PomodoroPage from './pages/Pomodoro/PomodoroPage.jsx'
import Groups from './pages/Group/GroupList.jsx'
import Group from './pages/Group/Group.jsx'
import { PomodoroProvider } from './context/PomodoroContext.jsx'

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthApp />,
  },
  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" />,
      },
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "pomodoro",
        element: <PomodoroPage />,
      },
      {
        path: "flashcards",
        element: <FlashCardApp />,
      },
      {
        path: "filetree",
        element: <FileTree />,
      },
      {
        path: "group",
        element: <Groups />,
      },
      {
        path: 'group/:id',
        element: <Group />
      }
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PomodoroProvider>
      <RouterProvider router={router} />
    </PomodoroProvider>
  </React.StrictMode>,
)
