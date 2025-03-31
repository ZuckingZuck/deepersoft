const fileService = require('../services/fileService');

/**
 * Dosya yükleme
 * @route POST /api/files/upload
 */
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: true,
        message: 'Lütfen bir dosya yükleyin'
      });
    }

    console.log('Yüklenen dosya:', req.file);
    const savedFile = await fileService.uploadFile(req.file, req.user);
    console.log('Kaydedildi, dönülen sonuç:', savedFile);
    
    res.status(201).json({
      error: false,
      message: 'Dosya başarıyla yüklendi',
      file: savedFile
    });
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    next(error);
  }
};

/**
 * Proje ID'sine göre dosyaları getir (veya tüm dosyaları listele)
 * @route GET /api/files/project/:projectId
 */
const getFilesByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const files = await fileService.getFilesByProject(projectId, req.user);
    res.json({
      error: false,
      count: files.length,
      files
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dosyayı adına göre getir
 * @route GET /api/files/:fileName
 */
const getFileById = async (req, res, next) => {
  try {
    const { id: fileName } = req.params; // id parametresini fileName olarak kullan
    const file = await fileService.getFileById(fileName);
    res.json({
      error: false,
      file
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dosyayı sil
 * @route DELETE /api/files/:fileName
 */
const deleteFile = async (req, res, next) => {
  try {
    const { id: fileName } = req.params; // id parametresini fileName olarak kullan
    const result = await fileService.deleteFile(fileName, req.user);
    res.json({
      error: false,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dosyaları toplu sil
 * @route DELETE /api/files
 */
const deleteFiles = async (req, res, next) => {
  try {
    const { fileIds: fileNames } = req.body; // fileIds'yi fileNames olarak kullan
    
    if (!fileNames || !Array.isArray(fileNames) || fileNames.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'Geçerli dosya adları sağlayın'
      });
    }
    
    const result = await fileService.deleteFiles(fileNames, req.user);
    res.json({
      error: false,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dosyaya proje atama
 * @route PUT /api/files/:fileName/project/:projectId
 */
const assignFileToProject = async (req, res, next) => {
  try {
    const { id: fileName, projectId } = req.params; // id parametresini fileName olarak kullan
    const file = await fileService.assignFileToProject(fileName, projectId, req.user);
    res.json({
      error: false,
      message: 'Dosya projeye başarıyla atandı',
      file
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile,
  getFilesByProject,
  getFileById,
  deleteFile,
  deleteFiles,
  assignFileToProject
}; 