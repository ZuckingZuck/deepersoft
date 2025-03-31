const fs = require('fs-extra');
const path = require('path');
const config = require('../config/config');
const File = require('../models/File');

/**
 * Dosya yükle
 * @param {Object} fileData - Yüklenen dosya bilgileri
 * @param {Object} user - Kullanıcı bilgileri
 * @returns {Object} Dosya bilgileri
 */
const uploadFile = async (fileData, user) => {
  try {
    const { originalname, filename, path: filePath, mimetype, size } = fileData;
    
    // Dosya URL'ini oluştur
    const publicUrl = `${config.baseUrl}/files/${filename}`;
    console.log('Oluşturulan URL:', publicUrl);
    console.log('Dosya yolları:', { filePath, relativePath: `/files/${filename}` });

    // Veritabanında dosya kaydı oluştur
    const file = new File({
      originalName: originalname,
      fileName: filename,
      mimeType: mimetype,
      size: size,
      filePath: filePath,
      publicUrl: publicUrl,
      uploadedBy: user.id
    });

    await file.save();

    console.log('Veritabanına kaydedilen dosya:', file);
    return {
      id: file._id,
      originalName: file.originalName,
      fileName: file.fileName,
      fileType: file.mimeType,
      fileSize: file.size,
      publicUrl: file.publicUrl,
      createdAt: file.createdAt
    };
  } catch (error) {
    console.error('Dosya kaydetme hatası:', error);
    throw new Error(`Dosya kaydedilemedi: ${error.message}`);
  }
};

/**
 * Proje ID'sine göre dosya listesini getir
 * @param {String} projectId - Proje ID'si
 * @param {Object} user - Kullanıcı bilgileri
 * @returns {Array} Dosya listesi
 */
const getFilesByProject = async (projectId, user) => {
  try {
    // Veritabanından projeye ait ve silinmemiş dosyaları bul
    const files = await File.find({
      projectId: projectId,
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    // Formatlayıp döndür
    return files.map(file => ({
      id: file._id,
      originalName: file.originalName,
      fileName: file.fileName,
      fileType: file.mimeType,
      fileSize: file.size,
      publicUrl: file.publicUrl,
      createdAt: file.createdAt
    }));
  } catch (error) {
    throw new Error(`Dosyalar getirilemedi: ${error.message}`);
  }
};

/**
 * Dosyayı adına göre getir
 * @param {String} fileName - Dosya adı
 * @returns {Object} Dosya bilgileri
 */
const getFileById = async (fileName) => {
  try {
    // Veritabanından dosyayı bul
    const file = await File.findOne({
      fileName: fileName,
      isDeleted: false
    });
    
    if (!file) {
      throw new Error('Dosya bulunamadı');
    }
    
    return {
      id: file._id,
      originalName: file.originalName,
      fileName: file.fileName,
      fileType: file.mimeType,
      fileSize: file.size,
      publicUrl: file.publicUrl,
      createdAt: file.createdAt
    };
  } catch (error) {
    throw new Error(`Dosya getirilemedi: ${error.message}`);
  }
};

/**
 * Dosyayı adına göre sil
 * @param {String} fileName - Dosya adı
 * @param {Object} user - Kullanıcı bilgileri
 * @returns {Object} Sonuç mesajı
 */
const deleteFile = async (fileName, user) => {
  try {
    // Veritabanından dosyayı bul
    const file = await File.findOne({
      fileName: fileName,
      isDeleted: false
    });
    
    if (!file) {
      throw new Error('Dosya bulunamadı');
    }
    
    // Yönetici değilse ve kendisi yüklemediyse yetkisi yok
    if (user.userType !== 'Sistem Yetkilisi' && file.uploadedBy.toString() !== user.id.toString()) {
      throw new Error('Bu dosyayı silme yetkiniz yok');
    }

    // Dosyayı diskten sil
    const filePath = path.join(__dirname, '../uploads', fileName);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
    
    // Veritabanında işaretle
    file.isDeleted = true;
    await file.save();
    
    return { message: 'Dosya başarıyla silindi' };
  } catch (error) {
    throw new Error(`Dosya silinemedi: ${error.message}`);
  }
};

/**
 * Dosyaları topluca sil
 * @param {Array} fileNames - Dosya adları listesi
 * @param {Object} user - Kullanıcı bilgileri
 * @returns {Object} Sonuç mesajı
 */
const deleteFiles = async (fileNames, user) => {
  try {
    let deletedCount = 0;
    
    for (const fileName of fileNames) {
      try {
        // Her dosya için silme işlemini dene
        await deleteFile(fileName, user);
        deletedCount++;
      } catch (err) {
        console.error(`Dosya silinemedi: ${fileName}`, err.message);
        // Hata olsa bile diğer dosyalara devam et
      }
    }
    
    if (deletedCount === 0) {
      throw new Error('Hiçbir dosya silinemedi');
    }
    
    return { message: `${deletedCount}/${fileNames.length} dosya başarıyla silindi` };
  } catch (error) {
    throw new Error(`Dosyalar silinemedi: ${error.message}`);
  }
};

/**
 * Dosyaya proje ID'sini ekle
 * @param {String} fileName - Dosya adı
 * @param {String} projectId - Proje ID'si
 * @param {Object} user - Kullanıcı bilgileri
 * @returns {Object} Güncellenen dosya bilgileri
 */
const assignFileToProject = async (fileName, projectId, user) => {
  try {
    // Veritabanından dosyayı bul
    const file = await File.findOne({
      fileName: fileName,
      isDeleted: false
    });
    
    if (!file) {
      throw new Error('Dosya bulunamadı');
    }
    
    // Dosyayı projeye ata
    file.projectId = projectId;
    await file.save();
    
    return {
      id: file._id,
      originalName: file.originalName,
      fileName: file.fileName,
      fileType: file.mimeType,
      fileSize: file.size,
      publicUrl: file.publicUrl,
      projectId: file.projectId,
      createdAt: file.createdAt
    };
  } catch (error) {
    throw new Error(`Dosya projeye atanamadı: ${error.message}`);
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