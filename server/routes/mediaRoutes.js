const express = require('express');
const cloudinary = require('cloudinary').v2;
const upload = require('../middleware/uploadMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/upload
 * Protected endpoint: Upload single or multiple images to Cloudinary
 */
router.post('/', requireAuth, (req, res) => {
  // Use array upload allowing up to 10 images at once
  const uploadHandler = upload.array('images', 10);

  uploadHandler(req, res, async (err) => {
    if (err) {
      console.error('Upload Middleware Error:', err.message);
      return res.status(400).json({ error: err.message || 'Image upload failed.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided for upload.' });
    }

    try {
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'bijarniya_furniture' },
            (error, result) => {
              if (result) {
                resolve(result.secure_url);
              } else {
                reject(error);
              }
            }
          );
          stream.end(file.buffer);
        });
      });

      const fileUrls = await Promise.all(uploadPromises);

      return res.json({
        message: 'Image(s) uploaded successfully',
        urls: fileUrls,
        url: fileUrls[0], // primary image URL shortcut
      });
    } catch (uploadError) {
      console.error('Cloudinary Upload Error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload images to Cloudinary.' });
    }
  });
});

module.exports = router;
