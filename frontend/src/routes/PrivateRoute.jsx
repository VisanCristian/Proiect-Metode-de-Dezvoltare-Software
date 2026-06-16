import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import NavBar from '../fragments/Navigation/NavBar';

const PrivateRoute = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <NavBar />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default PrivateRoute;
