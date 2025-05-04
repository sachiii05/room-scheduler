// Authentication functions
import config from './config.js';

const auth = {
  login: async (email, password, role) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}${config.apiEndpoints.login}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'dashboard.html';
      }
      
      return data.user;
    } catch (error) {
      throw error;
    }
  },

  register: async (name, email, password, role) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}${config.apiEndpoints.register}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      return true;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  },

  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },

  getUser: () => {
    return JSON.parse(localStorage.getItem('user')) || null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  checkRole: (requiredRole) => {
    const user = auth.getUser();
    return user && user.role === requiredRole;
  }
};

// Export auth object
export default auth;
