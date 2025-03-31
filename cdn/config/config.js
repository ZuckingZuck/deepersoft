require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  // Veritabanı konfigürasyonunu kaldırdık
  // mongodb: {
  //   uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/deepersoft',
  // },
  baseUrl: process.env.BASE_URL || 'http://localhost:5000',
  fileUpload: {
    fileSizeLimit: parseInt(process.env.FILE_SIZE_LIMIT || 100) * 1024 * 1024, // MB to bytes
    allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/gif,application/pdf,application/zip,application/x-rar-compressed,application/vnd.rar').split(','),
  }
};

module.exports = config; 