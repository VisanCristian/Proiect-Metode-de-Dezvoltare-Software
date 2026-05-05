import React, { useState } from 'react';
import LoginForm from '../../fragments/Auth/LoginForm';
import RegisterForm from '../../fragments/Auth/RegisterForm';
import './auth.css';

const AuthApp = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-card">
        {isLogin ? (
          <LoginForm />
        ) : (
          <RegisterForm onRegisterSuccess={() => setIsLogin(true)} />
        )}
        
        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? " Register" : " Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthApp;
