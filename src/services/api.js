import axios from 'axios'


const DEFAULT_BACKEND_URL = "https://e-learning-backend-xr7q.onrender.com";
const LOCAL_BACKEND_URL = "http://localhost:8080";
const USE_LOCAL_BACKEND = import.meta.env.VITE_USE_LOCAL_BACKEND === "true";
const BASE_URL = USE_LOCAL_BACKEND
  ? LOCAL_BACKEND_URL
  : import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL;

const api = axios.create({
  baseURL: BASE_URL,
})

// Request Interceptor: This runs before every request leaves the client
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('user_token')

    // Attaches the JWT token to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Optionally handles global 401/403 errors
api.interceptors.response.use(
  response => response,
  error => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.error('Authorization Failed. Token may be expired.')
    }
    return Promise.reject(error)
  }
)

export default api;
export {BASE_URL};

