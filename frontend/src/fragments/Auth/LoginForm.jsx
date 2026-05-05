  import React, { useState } from 'react';
  import { useAuth } from '../../hooks/Auth/useAuth';

  const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { loginUser } = useAuth();

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      const result = await loginUser(username, password);
      if (!result.success) {
        setError(result.error);
      }
    };

    return (
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Authentication</h2>
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
        <button type="submit" className="auth-button">Login</button>
      </form>
    );
  };

  export default LoginForm;
