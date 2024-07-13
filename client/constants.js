const API_BASE_URL = '/api'; // prefix for all API routes

export const API_ROUTES = {
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  CHECK_USERNAME: `${API_BASE_URL}/users/username`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
};

export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  MAP_SNAP: '/map-snap',
};

export const EXPRESS_SERVER_API = 'http://localhost:3000';
