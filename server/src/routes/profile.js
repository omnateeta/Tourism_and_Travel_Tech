const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const profileController = require('../controllers/profileController');

// Multer configuration for profile image upload
const { upload } = require('../services/cloudinaryService');

// Route to upload profile image
router.post('/upload-image', auth, upload.single('profileImage'), profileController.uploadProfileImage);

// Route to remove profile image
router.delete('/remove-image', auth, profileController.removeProfileImage);

// Route to get user profile (extends auth/me)
router.get('/me', auth, profileController.getFullProfile);

module.exports = router;