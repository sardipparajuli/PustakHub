require('dotenv').config({ path: '.env' });

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: 'dhv6ws2eb',
  api_key: '995154125432121',
  api_secret: 'Bph8RKljS0borNbxaHms5lcyeM4',
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pustakhub',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 600, crop: 'fill' }],
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };