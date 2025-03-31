import api from './api';

// Ortam değişkenlerini veya varsayılan değeri kullan
const CDN_API_URL = import.meta.env.VITE_CDN_URL || 'http://localhost:5000';

/**
 * Dosya adını güvenli hale getiren yardımcı fonksiyon
 * @param {string} fileName - Orijinal dosya adı
 * @returns {string} - Güvenli hale getirilmiş dosya adı
 */
const sanitizeFileName = (fileName) => {
  // Dosya adında boşluk ve özel karakterleri düzelt
  let safeFileName = fileName
    .replace(/\s+/g, '_') // Boşlukları alt çizgiyle değiştir
    .replace(/[^a-zA-Z0-9._-]/g, ''); // Sadece alfanümerik karakterler, nokta, alt çizgi ve tire kalacak
  
  // Dosya adının uzunluğunu kontrol et
  if (safeFileName.length > 100) {
    const extension = safeFileName.split('.').pop();
    safeFileName = safeFileName.substring(0, 90) + '.' + extension;
  }
  
  console.log('Orijinal dosya adı:', fileName);
  console.log('Güvenli dosya adı:', safeFileName);
  
  return safeFileName;
};

/**
 * Dosya yükleme fonksiyonu
 * @param {File} file - Yüklenecek dosya
 * @returns {Promise} - CDN'e yüklenen dosya bilgileri
 */
export const uploadFile = async (file) => {
  if (!file) {
    throw new Error('Lütfen bir dosya seçin');
  }

  // Token kontrolü
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Oturum sonlanmış. Lütfen tekrar giriş yapın.');
  }

  // Dosya adını güvenli hale getir
  const originalName = file.name;
  const safeFileName = sanitizeFileName(originalName);
  
  // Dosya türünü kontrol et ve gerekirse düzelt
  let fileType = file.type;
  
  // ZIP dosyaları için backend'in desteklediği MIME türüne dönüştür
  if (fileType === 'application/x-zip-compressed' || 
      fileType === 'application/x-zip' || 
      fileType === 'application/octet-stream') {
    // Dosya uzantısını kontrol et
    const extension = originalName.split('.').pop().toLowerCase();
    if (extension === 'zip') {
      console.log(`MIME türü düzeltiliyor: ${fileType} -> application/zip`);
      fileType = 'application/zip';
    }
  }
  
  // Yeni bir File nesnesi oluştur (güvenli ad ve düzeltilmiş MIME türü ile)
  const renamedFile = new File([file], safeFileName, { type: fileType });
  console.log('Yüklenecek dosya:', safeFileName, 'Tür:', fileType);

  const formData = new FormData();
  formData.append('file', renamedFile);

  try {
    const response = await fetch(`${CDN_API_URL}/api/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Dosya yüklenirken bir hata oluştu');
    }

    return await response.json();
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    throw error;
  }
};

/**
 * Projeye dosya ekleme
 * @param {File} file - Yüklenecek dosya
 * @param {string} projectId - Projenin ID'si
 * @returns {Promise} - API yanıtı
 */
export const uploadProjectFile = async (file, projectId) => {
  try {
    // Token kontrolü
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Oturum sonlanmış. Lütfen tekrar giriş yapın.');
    }

    // 1. Önce dosyayı CDN'e yükle
    const uploadResponse = await uploadFile(file);
    const fileId = uploadResponse.file.fileName; // ID yerine fileName kullanılıyor artık

    // 2. Dosyayı projeye bağla
    await fetch(`${CDN_API_URL}/api/files/${fileId}/project/${projectId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // 3. Proje dosyaları tablosuna ekle (backend sunucu tarafında)
    const projectFileData = {
      projectId,
      fileId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUrl: uploadResponse.file.publicUrl
    };

    const response = await api.post('/api/projects/files', projectFileData);
    return response.data;
  } catch (error) {
    console.error('Proje dosyası yükleme hatası:', error);
    throw error;
  }
};

/**
 * Proje dosyalarını getir
 * @param {string} projectId - Projenin ID'si
 * @returns {Promise} - Proje dosyaları
 */
export const getProjectFiles = async (projectId) => {
  try {
    const response = await api.get(`/api/projects/${projectId}/files`);
    return response.data;
  } catch (error) {
    console.error('Proje dosyaları getirme hatası:', error);
    throw error;
  }
};

/**
 * Dosya sil
 * @param {string} fileId - Silinecek dosyanın ID'si
 * @param {string} projectId - Projenin ID'si (opsiyonel)
 * @returns {Promise} - API yanıtı
 */
export const deleteFile = async (fileId, projectId = null) => {
  try {
    // Token kontrolü
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Oturum sonlanmış. Lütfen tekrar giriş yapın.');
    }

    // 1. Önce CDN'den dosyayı sil
    await fetch(`${CDN_API_URL}/api/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // 2. Proje ilişkisi varsa, proje dosyaları tablosundan da sil
    if (projectId) {
      await api.delete(`/api/projects/${projectId}/files/${fileId}`);
    }

    return { success: true, message: 'Dosya başarıyla silindi' };
  } catch (error) {
    console.error('Dosya silme hatası:', error);
    throw error;
  }
};

/**
 * Dosya URL'i oluştur
 * @param {string} fileUrl - Dosyanın URL'i
 * @returns {string} - Dosyanın tam URL'i
 */
export const getFileUrl = (fileUrl) => {
  console.log('getFileUrl çağrıldı, gelen URL:', fileUrl);
  
  if (!fileUrl) {
    console.log('URL boş, null döndürülüyor');
    return null;
  }
  
  // Eğer fileUrl tam bir URL ise doğrudan döndür
  if (fileUrl.startsWith('http')) {
    console.log('Tam URL tespit edildi, direkt döndürülüyor:', fileUrl);
    return fileUrl;
  }
  
  // Değilse CDN URL'i ile birleştir
  const fullUrl = `${CDN_API_URL}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
  console.log('Oluşturulan tam URL:', fullUrl);
  return fullUrl;
};

export default {
  uploadFile,
  uploadProjectFile,
  getProjectFiles,
  deleteFile,
  getFileUrl
}; 