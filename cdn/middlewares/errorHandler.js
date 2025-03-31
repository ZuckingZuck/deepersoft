const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Multer hataları için özel kontrol
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: true,
      message: 'Dosya boyutu çok büyük'
    });
  }

  res.status(statusCode).json({
    error: true,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler; 