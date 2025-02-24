import axios from 'axios';

const API_URL = 'http://localhost:9191/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  };
  
  const login = async (username, password) => {
    try {
      const response = await api.post('/autenticacion/usuarios/login', { username, password });
      console.log('Full login response:', JSON.stringify(response.data, null, 2));
  
      if (response.data && response.data.isSuccess && response.data.response) {
        const responseData = response.data.response;
        console.log('Response data:', responseData);
  
        if (responseData.accessToken && responseData.refreshToken) {
          const userData = {
            accessToken: responseData.accessToken,
            refreshToken: responseData.refreshToken,
            expiresIn: responseData['access token expires in'] || responseData.accessTokenExpiresAt
          };
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('User data stored in localStorage:', userData);
          return userData;
        } else {
          console.error('Login failed: Missing tokens in response');
          throw new Error('Login failed: Missing tokens in response');
        }
      } else {
        console.error('Login failed: Invalid response format', response.data);
        throw new Error('Login failed: Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  const logout = async () => {
    const user = getCurrentUser();
    if (user) {
      try {
        const response = await api.post('/autenticacion/usuarios/logout', {
          accessToken: user.accessToken,
          refreshToken: user.refreshToken
        });
        console.log('Logout response:', response);
      } catch (error) {
        console.error('Logout error:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error data:', error.response.data);
          console.error('Error status:', error.response.status);
          console.error('Error headers:', error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', error.message);
        }
      }
    }
    localStorage.removeItem('user');
  };
  
  const register = async (username, password, role = "user") => {
    try {
      const response = await api.post('/usuarios/register', { username, password, role });
      console.log('Registration response:', response);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw error;
    }
  };
  
  const refreshToken = async () => {
    const user = getCurrentUser();
    if (user && user.refreshToken) {
      try {
        const response = await axios.post(`${API_URL}/usuarios/refresh-token`, null, {
          params: { token: user.refreshToken },
        });
        const newAccessToken = response.data.accessToken;
        user.accessToken = newAccessToken;
        localStorage.setItem('user', JSON.stringify(user));
        return newAccessToken;
      } catch (error) {
        console.error('Token refresh failed:', error);
        throw error;
      }
    }
    throw new Error('No refresh token available');
  };
  
  api.interceptors.request.use(
    (config) => {
      const user = getCurrentUser();
      if (user && user.accessToken) {
        config.headers['Authorization'] = 'Bearer ' + user.accessToken;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      try {
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newAccessToken = await refreshToken();
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
      return Promise.reject(error);
    }
  );
  
  export { api, login, logout, register, getCurrentUser };