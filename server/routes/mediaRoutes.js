const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * POST /api/upload
 * Protected endpoint: Upload single or multiple images
 */
router.post('/', requireAuth, (req, res) => {
  // Use array upload allowing up to 10 images at once
  const uploadHandler = upload.array('images', 10);

  uploadHandler(req, res, (err) => {
    if (err) {
      console.error('Upload Error:', err.message);
      return res.status(400).json({ error: err.message || 'Image upload failed.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided for upload.' });
    }

    // Return array of file URLs relative to server origin
    const fileUrls = req.files.map((file) => `/uploads/${file.filename}`);
    return res.json({
      message: 'Image(s) uploaded successfully',
      urls: fileUrls,
      url: fileUrls[0], // primary image URL shortcut
    });
  });
});

module.exports = router;
