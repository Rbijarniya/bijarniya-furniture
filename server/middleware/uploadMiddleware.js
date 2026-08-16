const multer = require('multer');

// Configure memory storage for Cloudinary upload
const storage = multer.memoryStorage();

// File filter for image formats (jpg, jpeg, png, webp)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image file format. Only JPG, PNG, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per image
  },
});

module.exports = upload;
