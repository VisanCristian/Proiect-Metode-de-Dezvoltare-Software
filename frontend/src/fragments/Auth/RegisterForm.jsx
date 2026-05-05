import React, { useState } from 'react';
import { useAuth } from '../../hooks/Auth/useAuth';

const RegisterForm = ({ onRegisterSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [re_password, setRePassword] = useState('');
  const [error, setError] = useState('');
  const { registerUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== re_password) {
      setError('Passwords do not match.');
      return;
    }

    const result = await registerUser(username, password, re_password);
    if (result.success) {
      alert('Account created successfully! You can now log in.');
      onRegisterSuccess();
    } else {
      setError('Error creating account. Please try a different username.');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Register</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="input-group">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <input
          type="password"
          placeholder="Confirm Password"
          value={re_password}
          onChange={(e) => setRePassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="auth-button">Create Account</button>
    </form>
  );
};

export default RegisterForm;
