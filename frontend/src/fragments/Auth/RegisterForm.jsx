import React, { useState } from 'react';
import { useAuth } from '../../hooks/Auth/useAuth';

const extractErrorMessages = (value) => {
  if (!value) return [];
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(extractErrorMessages);
  if (typeof value === 'object') {
    return Object.entries(value).flatMap(([field, fieldErrors]) => {
      const messages = extractErrorMessages(fieldErrors);
      return messages.map((message) =>
        field === 'non_field_errors' || field === 'detail'
          ? message
          : `${field}: ${message}`
      );
    });
  }
  return [];
};

const formatRegisterError = (error) => {
  const messages = extractErrorMessages(error);
  return messages.length > 0
    ? [...new Set(messages)].join(' ')
    : 'Error creating account.';
};

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
      setError(formatRegisterError(result.error));
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
