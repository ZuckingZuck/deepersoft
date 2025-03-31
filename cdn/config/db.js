const mongoose = require('mongoose');

/**
 * MongoDB veritabanına bağlanma
 * @returns {Promise} MongoDB bağlantısı
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Bağlantısı Başarılı: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Bağlantı Hatası: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 