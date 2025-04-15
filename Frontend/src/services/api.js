import axios from 'axios';

const API_URL = 'http://localhost:5001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Making request:', config.method.toUpperCase(), config.url);
    
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Adding auth token to request');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No auth token found');
    }
    
    if (config.data) {
      console.log('Request data:', config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.response) {
      // Server responded with error
      console.error('Server error details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network error - no response');
      return Promise.reject(new Error('Network error - could not connect to server'));
    } else {
      // Request setup error
      console.error('Request setup error:', error.message);
      return Promise.reject(new Error(error.message || 'Request failed'));
    }
  }
);

// Auth service
export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      const data = response.data;
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          ...data.user,
          userId: data.user._id
        }));
      }
      return { 
        success: true, 
        user: {
          ...data.user,
          userId: data.user._id
        }, 
        token: data.token 
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  },

  register: async (userData) => {
    try {
      console.log('Registering user:', userData);
      // Ensure role is included in the request
      const { name, email, password, role } = userData;
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password,
        role: role || 'user' // Use provided role or default to user
      });
      
      const data = response.data;
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          ...data.user,
          userId: data.user._id
        }));
      }
      return { 
        success: true, 
        user: {
          ...data.user,
          userId: data.user._id
        }, 
        token: data.token 
      };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    }
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage');
        return null;
      }

      // Set the token in the axios instance headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const response = await api.get('/api/auth/me');
      const data = response.data;
      
      return { 
        user: {
          ...data.user,
          userId: data.user._id
        }, 
        token: token 
      };
    } catch (error) {
      console.error('Get current user error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

// Room service
export const roomService = {
  getAllRooms: async () => {
    try {
      console.log('Fetching all rooms...');
      const token = localStorage.getItem('token');
      console.log('Using token:', token);
      
      const response = await api.get('/api/rooms', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Room response:', response);
      console.log('Response headers:', response.headers);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      if (Array.isArray(response.data)) {
        console.log('Found rooms:', response.data.length);
        return response.data;
      } else {
        console.error('Invalid room response:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Get all rooms error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      return [];
    }
  },

  getPendingRooms: async () => {
    try {
      const response = await api.get('/api/rooms/pending');
      return response.data || [];
    } catch (error) {
      console.error('Get pending rooms error:', error);
      throw error;
    }
  },

  createRoom: async (roomData) => {
    try {
      const response = await api.post('/api/rooms', roomData);
      console.log('Create room response:', response);
      return response.data;
    } catch (error) {
      console.error('Create room error:', error);
      throw error;
    }
  },

  approveRoom: async (roomId) => {
    try {
      const response = await api.put(`/api/rooms/${roomId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Approve room error:', error);
      throw error;
    }
  },

  rejectRoom: async (roomId) => {
    try {
      const response = await api.put(`/api/rooms/${roomId}/reject`);
      return response.data;
    } catch (error) {
      console.error('Reject room error:', error);
      throw error;
    }
  },

  updateRoom: async (roomId, roomData) => {
    try {
      const response = await api.put(`/api/rooms/${roomId}`, roomData);
      return response.data;
    } catch (error) {
      console.error('Update room error:', error);
      throw error;
    }
  },

  deleteRoom: async (roomId) => {
    try {
      const response = await api.delete(`/api/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      console.error('Delete room error:', error);
      throw error;
    }
  }
};

// Booking service
export const bookingService = {
  getAllBookings: async () => {
    try {
      const response = await api.get('/api/bookings/pending');
      return response.data;
    } catch (error) {
      console.error('Get all bookings error:', error);
      throw error;
    }
  },

  getUserBookings: async () => {
    try {
      const response = await api.get('/api/bookings/user');
      return response.data;
    } catch (error) {
      console.error('Get user bookings error:', error);
      throw error;
    }
  },

  getRoomBookings: async (roomId) => {
    try {
      const response = await api.get(`/api/bookings/room/${roomId}`);
      return response;
    } catch (error) {
      console.error('Get room bookings error:', error);
      throw error;
    }
  },

  createBooking: async (bookingData) => {
    try {
      console.log('Creating booking with data:', bookingData);
      
      // Verify required fields
      if (!bookingData.room) {
        throw new Error('Room ID is required for booking');
      }
      
      // First, verify the room exists
      const roomResponse = await api.get(`/api/rooms/${bookingData.room}`);
      console.log('Room verification response:', roomResponse);

      // Create the booking
      const response = await api.post('/api/bookings', bookingData);
      console.log('Booking created successfully:', response);
      return response;
    } catch (error) {
      console.error('Create booking error:', error);
      console.error('Error details:', {
        message: error.message,
        data: error.response?.data,
        bookingData,
      });
      throw error;
    }
  },

  updateBooking: async (id, bookingData) => {
    try {
      const response = await api.put(`/api/bookings/${id}/approval`, bookingData);
      return response;
    } catch (error) {
      console.error('Update booking error:', error);
      throw error;
    }
  },

  deleteBooking: async (id) => {
    try {
      const response = await api.delete(`/api/bookings/${id}`);
      return response;
    } catch (error) {
      console.error('Delete booking error:', error);
      throw error;
    }
  }
};

export default api;
