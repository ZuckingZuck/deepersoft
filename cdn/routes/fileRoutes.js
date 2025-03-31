const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const upload = require('../middlewares/upload');
const { authenticateUser } = require('../middlewares/authMiddleware');

// Dosya yükleme (kimlik doğrulama gerekli)
router.post('/upload', authenticateUser, upload.single('file'), fileController.uploadFile);

// Proje ile ilişkili dosyaları getir (kimlik doğrulama gerekli)
router.get('/project/:projectId', authenticateUser, fileController.getFilesByProject);

// Dosyayı ID ile getir - herkes erişebilir
router.get('/:id', fileController.getFileById);

// Dosyayı sil (kimlik doğrulama gerekli)
router.delete('/:id', authenticateUser, fileController.deleteFile);

// Toplu dosya silme (kimlik doğrulama gerekli)
router.delete('/', authenticateUser, fileController.deleteFiles);

// Dosyayı projeye atama (kimlik doğrulama gerekli)
router.put('/:id/project/:projectId', authenticateUser, fileController.assignFileToProject);

module.exports = router; 