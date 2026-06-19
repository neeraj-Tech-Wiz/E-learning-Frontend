import axios from 'axios'

// IMPORTANT: Use your specific IP address if testing across two laptops
// Otherwise, keep 'http://localhost:8080/api'
const BASE_URL = "https://unquerulous-chae-uncharitably.ngrok-free.dev";

const api = axios.create({
  baseURL: BASE_URL,
})

// Request Interceptor: This runs before every request leaves the client
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('user_token')

    // 🔑 Attaches the JWT token to the Authorization header
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
    // You can add logic here to automatically log out the user if the token is expired (401)
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
