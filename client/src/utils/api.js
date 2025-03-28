import axios from 'axios';

// API URL'ini .env dosyasından al veya varsayılan olarak 9090 portunu kullan
const API_URL = import.meta.env.VITE_API || 'http://localhost:9090';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL
});

// Request interceptor - her istekte token eklemek için
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - token süresi dolmuşsa kullanıcıyı çıkış yaptırmak için
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token geçersiz veya süresi dolmuş
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 