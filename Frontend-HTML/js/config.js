// API configuration
const config = {
  apiBaseUrl: 'http://localhost:5001', // Backend server URL
  apiEndpoints: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    rooms: '/api/rooms',
    bookings: '/api/bookings',
    userBookings: '/api/bookings/user'
  }
};

export default config;
