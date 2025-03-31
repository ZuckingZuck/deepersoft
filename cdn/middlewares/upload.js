const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const config = require('../config/config');

// Storage klasörünü oluştur
const createStorageFolder = () => {
  const uploadPath = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

// Storage konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = createStorageFolder();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Benzersiz dosya adı oluştur
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  }
});

// Dosya filtresi
const fileFilter = (req, file, cb) => {
  const allowedTypes = config.fileUpload.allowedMimeTypes;
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Desteklenmeyen dosya türü: ${file.mimetype}. Desteklenen türler: ${allowedTypes.join(', ')}`), false);
  }
};

// Multer konfigürasyonu
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.fileUpload.fileSizeLimit,
  }
});

module.exports = upload; 