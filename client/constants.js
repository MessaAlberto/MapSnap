const isDevelopment = import.meta.env.MODE === 'development';
const API_BASE_URL = isDevelopment ? '/api' : ''; 

if (isDevelopment) {
  console.log("Siamo in modalità sviluppo");
  // Esegui operazioni specifiche per lo sviluppo
} else {
  console.log("Siamo in modalità produzione");
  // Esegui operazioni specifiche per la produzione
}


export const API_ROUTES = {
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  CHECK_AUTH: `${API_BASE_URL}/auth`,
  CHECK_USERNAME: `${API_BASE_URL}/user/username`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  PHOTO: `${API_BASE_URL}/photo`,
  MY_PHOTO: `${API_BASE_URL}/photo/my`,
  DELETE_PHOTO: `${API_BASE_URL}/photo`,
};

export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  UPLOAD_PHOTO: '/upload-photo',
  MY_PHOTO: '/my-photo',
  MAP_SNAP: '/map-snap',
};

// export const EXPRESS_SERVER_API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
// export const EXPRESS_SERVER_API = 'http://localhost:3000';
export const EXPRESS_SERVER_API = 'https://310c-146-247-70-238.ngrok-free.app';
