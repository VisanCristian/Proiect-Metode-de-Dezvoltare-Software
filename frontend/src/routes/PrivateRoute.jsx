import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import NavBar from '../fragments/Navigation/NavBar';
import ChatbotPanel from '../fragments/Chatbot/ChatbotPanel.jsx';
import { getTotalTokens } from '../services/agents_api.js';

const PrivateRoute = () => {
  const token = localStorage.getItem('token');
  const [totalTokens, setTotalTokens] = useState(0);

  useEffect(() => {
    getTotalTokens().then(setTotalTokens).catch(() => {});
  }, []);

  if (!token) {
    return <Navigate to="/" />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <NavBar />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </div>
      <ChatbotPanel scope="personal" tokensLeft={totalTokens} />
    </div>
  );
};

export default PrivateRoute;
