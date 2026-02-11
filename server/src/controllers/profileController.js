const { User } = require('../models');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const userId = req.user._id;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user already has a profile image, delete it from Cloudinary
    if (user.profileImagePublicId) {
      try {
        await deleteImage(user.profileImagePublicId);
      } catch (deleteError) {
        console.error('Error deleting old image from Cloudinary:', deleteError);
        // Continue anyway, don't fail the upload due to old image deletion failure
      }
    }

    // Upload new image to Cloudinary
    const imageData = await uploadImage(req.file);

    // Update user with new image data
    user.profileImage = imageData.url;
    user.profileImagePublicId = imageData.publicId;
    user.profileImageFormat = imageData.format;
    user.profileImageSize = imageData.size;

    await user.save();

    res.json({
      message: 'Profile image uploaded successfully',
      profileImage: user.profileImage,
      publicId: user.profileImagePublicId
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ message: 'Failed to upload profile image', error: error.message });
  }
};

// Remove profile image
exports.removeProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user has a profile image, delete it from Cloudinary
    if (user.profileImagePublicId) {
      try {
        await deleteImage(user.profileImagePublicId);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
        // Continue anyway, just log the error
      }
    }

    // Reset profile image fields
    user.profileImage = '';
    user.profileImagePublicId = '';
    user.profileImageFormat = '';
    user.profileImageSize = 0;

    await user.save();

    res.json({
      message: 'Profile image removed successfully',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Remove profile image error:', error);
    res.status(500).json({ message: 'Failed to remove profile image', error: error.message });
  }
};

// Get full profile (extends the existing getMe functionality)
exports.getFullProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        lastName: user.lastName || '',
        age: user.age,
        gender: user.gender || 'prefer-not-to-say',
        phoneNumber: user.phoneNumber || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: ''
        },
        profileImage: user.profileImage || '',
        profileImagePublicId: user.profileImagePublicId || '',
        profileImageFormat: user.profileImageFormat || '',
        profileImageSize: user.profileImageSize || 0,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Get full profile error:', error);
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
};