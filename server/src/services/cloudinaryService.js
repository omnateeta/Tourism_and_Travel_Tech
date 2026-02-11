const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with the provided credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlp9y5x3m',
  api_key: process.env.CLOUDINARY_API_KEY || '568395644523214',
  api_secret: process.env.CLOUDINARY_API_SECRET || '68oTJf5e_5yjIW8TqiPeRcbb4i0'
});

// Create Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tourism_app/profile_images', // Folder in Cloudinary to store images
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // Limit size to 500x500
  }
});

// Initialize multer with Cloudinary storage
const upload = multer({ storage });

// Upload image to Cloudinary
const uploadImage = async (file) => {
  try {
    if (!file) {
      throw new Error('No file provided for upload');
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'tourism_app/profile_images',
      allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      console.log('No publicId provided, skipping deletion');
      return;
    }

    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Image deleted from Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

// Get image URL with transformations
const getImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    secure: true,
    transformation: []
  };

  if (options.width || options.height) {
    defaultOptions.transformation.push({
      width: options.width,
      height: options.height,
      crop: options.crop || 'fill'
    });
  }

  return cloudinary.url(publicId, defaultOptions);
};

module.exports = {
  upload,
  uploadImage,
  deleteImage,
  getImageUrl,
  cloudinary
};