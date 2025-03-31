const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT token'ı doğrulayan middleware
 * @param {Object} req - İstek nesnesi
 * @param {Object} res - Yanıt nesnesi
 * @param {Function} next - Sonraki middleware'e geçmek için fonksiyon
 */
const authenticateUser = async (req, res, next) => {
  try {
    // Authorization header'dan token'ı al
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Yetkilendirme hatası: Token bulunamadı'
      });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kullanıcıyı veritabanından kontrol et
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Yetkilendirme hatası: Geçersiz kullanıcı'
      });
    }

    if (user.status !== 'Aktif') {
      return res.status(403).json({
        error: true,
        message: 'Yetkilendirme hatası: Hesap aktif değil'
      });
    }

    // Kullanıcı bilgilerini request'e ekle
    req.user = {
      id: user._id,
      userType: user.userType,
      fullName: user.fullName,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Yetkilendirme hatası:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: true,
        message: 'Yetkilendirme hatası: Geçersiz token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: true,
        message: 'Yetkilendirme hatası: Token süresi doldu'
      });
    }
    
    return res.status(500).json({
      error: true,
      message: 'Sunucu hatası: Yetkilendirme başarısız'
    });
  }
};

/**
 * Admin yetkisini kontrol eden middleware
 * @param {Object} req - İstek nesnesi
 * @param {Object} res - Yanıt nesnesi
 * @param {Function} next - Sonraki middleware'e geçmek için fonksiyon
 */
const authorizeAdmin = (req, res, next) => {
  if (req.user.userType !== "Sistem Yetkilisi") {
    return res.status(403).json({
      error: true,
      message: 'Yetki hatası: Bu işlem için admin yetkisi gereklidir'
    });
  }
  next();
};

module.exports = {
  authenticateUser,
  authorizeAdmin
}; 