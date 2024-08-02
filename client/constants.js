const API_BASE_URL = '/api'; // prefix for all API routes

export const API_ROUTES = {
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  CHECK_AUTH: `${API_BASE_URL}/auth`,
  CHECK_USERNAME: `${API_BASE_URL}/user/username`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  PHOTO: `${API_BASE_URL}/photo`,
  MY_PHOTO: `${API_BASE_URL}/photo/my`,
};

export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  UPLOAD_PHOTO: '/upload-photo',
  MY_PHOTO: '/my-photo',
  MAP_SNAP: '/map-snap',
};

export const EXPRESS_SERVER_API = 'http://localhost:3000';
