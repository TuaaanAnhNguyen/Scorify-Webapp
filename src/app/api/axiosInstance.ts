import axios from 'axios';

// Get base URL from environment variables, strictly SCORIFY_BASE_URL as requested
const baseURL = import.meta.env.SCORIFY_BASE_URL;

const defaultConfig = {
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
};

const axiosInstance = axios.create(defaultConfig);

export const publicAxiosInstance = axios.create(defaultConfig);

// Add a request interceptor if needed (e.g., for auth tokens)
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add authorization headers here if the API requires them
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleApiError = (error: any) => {
  console.error('API Error:', error.response?.data || error.message);
  return Promise.reject(error);
};

// Add a response interceptor for global error handling
axiosInstance.interceptors.response.use((response) => response, handleApiError);
publicAxiosInstance.interceptors.response.use((response) => response, handleApiError);

export default axiosInstance;
