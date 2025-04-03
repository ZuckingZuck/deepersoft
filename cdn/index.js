const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const config = require('./config/config');
const errorHandler = require('./middlewares/errorHandler');
const fileRoutes = require('./routes/fileRoutes');

// Veritabanı bağlantısını etkinleştir
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyaları serve et
app.use('/files', express.static(path.join(__dirname, 'uploads')));

// Ana route
app.get('/', (req, res) => {
  res.json({
    message: 'AYCTRACKING CDN API',
    version: '1.0.0'
  });
});

// Sağlık kontrolü
app.get('/health', (req, res) => {
  res.json({
    status: 'up',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/files', fileRoutes);

// Hata yakalama
app.use(errorHandler);

// 404 - Bulunamadı
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Sayfa bulunamadı'
  });
});

// Sunucuyu başlat
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`CDN Sunucusu ${PORT} portunda çalışıyor...`);
}); 