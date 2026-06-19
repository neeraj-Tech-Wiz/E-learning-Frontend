// import axios from 'axios';

// The full Ngrok URL must be correct here
// const API_URL = 'https://unquerulous-chae-uncharitably.ngrok-free.app/api/auth/'; 
const API_URL = 'https://unquerulous-chae-uncharitably.ngrok-free.dev/api/auth/'; 
// Note: Axios is still imported and used for the secure 'api' instance elsewhere.

const login = async (email, password) => {
  try {
    // FIX: Use the native fetch API for guaranteed successful login execution
    const response = await fetch(API_URL + 'login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        // Throw an error if status is 400, 401, etc.
        throw new Error('Authentication failed with status ' + response.status);
    }
    
    const userData = await response.json();
    
    if (userData.token) {
      // Store the token and user details upon successful login
      // NOTE: Your working code used localStorage.setItem('token', ...), 
      // but the context should use 'user_token' for consistency.
      localStorage.setItem('user_token', userData.token);
      localStorage.setItem('user_role', userData.role);
      localStorage.setItem('user_id', userData.id);

      // Return user data (token, role, id)
      return userData;
    }
  } catch (error) {
    console.error("Login attempt failed:", error.message);
    throw error;
  }
}

const logout = () => {
  localStorage.removeItem('user_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_id');
}

const getCurrentUserToken = () => {
  return localStorage.getItem('user_token');
}

const authService = {
  login,
  logout,
  getCurrentUserToken
}

export default authService;