const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dcwba68qp',
  api_key: process.env.CLOUDINARY_API_KEY || '235775971192878',
  api_secret: process.env.CLOUDINARY_API_SECRET || '1bkYfm2_X9wgUeYB8CVPrOhHlkk',
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });

module.exports = upload;

