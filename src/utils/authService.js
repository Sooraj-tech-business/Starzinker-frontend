import axios from 'axios';

// API base URL
const API_URL = 'http://localhost:5000/api';

// Set up axios with token
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get current user from localStorage
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Login user
const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, { email, password });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setAuthToken(response.data.token);
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setAuthToken(null);
};

// Initialize auth state (call this when app loads)
const initAuth = () => {
  const token = getToken();
  if (token) {
    setAuthToken(token);
  }
};

const authService = {
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  getToken,
  setAuthToken,
  initAuth
};

export default authService;