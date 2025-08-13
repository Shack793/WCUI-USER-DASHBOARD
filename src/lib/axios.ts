import axios from 'axios';

// Ensure base URL doesn't have double slashes
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || 'https://admin.myeasydonate.com'
  return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl
}

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: false // Changed to false since we're using Bearer token auth
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('❌ Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      error: error.message,
      fullError: error.response?.data?.message || error.response?.data || error.message,
      headers: error.config?.headers
    });
    
    // Only redirect on 401 for auth-related endpoints, not all endpoints
    if (error.response?.status === 401) {
      const url = error.config?.url
      // Only auto-redirect for specific auth endpoints
      if (url?.includes('/me') || url?.includes('/user') || url?.includes('/dashboard')) {
        console.log('Authentication failed for protected endpoint, redirecting to login')
        localStorage.removeItem('authToken');
        // Use setTimeout to avoid immediate redirect during page load
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }, 100);
      } else {
        console.log('401 error but not auto-redirecting for endpoint:', url)
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 