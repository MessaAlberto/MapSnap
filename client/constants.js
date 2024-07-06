const API_BASE_URL = '/api'; // prefix for all API routes

export const API_ROUTES = {
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  CHECK_USERNAME: `${API_BASE_URL}/users/username`,
};

export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
};
