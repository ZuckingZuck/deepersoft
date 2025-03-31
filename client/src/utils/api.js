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
    console.log("🚀 API İsteği gönderiliyor:", {
      url: config.url, 
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ API İstek hatası:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - token süresi dolmuşsa kullanıcıyı çıkış yaptırmak için
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Yanıtı alındı:", {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error("❌ API Yanıt hatası:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
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