import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://127.0.0.1:8080';

export const useAuth = () => {
  const navigate = useNavigate();

  const loginUser = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/token/login/`, {
        username,
        password,
      });
      const token = response.data.auth_token;
      localStorage.setItem('token', token);
      navigate('/home');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Invalid username or password.' };
    }
  };

  const registerUser = async (username, password, re_password) => {
    try {
      await axios.post(`${API_URL}/api/auth/users/`, {
        username,
        password,
        re_password,
      });
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.response?.data || 'Eroare la înregistrare' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  return { loginUser, registerUser, logout };
};
