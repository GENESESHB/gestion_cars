// middleware/upload.js
const upload = require('../config/cloudinary');
const multer = require('multer');

const handleUploadErrors = (error, req, res, next) => {
  if (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Fichier trop volumineux. Taille maximale: 5MB'
        });
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Champ de fichier inattendu'
        });
      }
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next();
};

module.exports = { upload, handleUploadErrors };
