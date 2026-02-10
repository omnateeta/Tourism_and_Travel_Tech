const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({
      email,
      password,
      name,
      preferences: {
        interests: [],
        budget: 'medium',
        language: 'en'
      }
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

exports.getMe = async (req, res) => {
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
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Failed to get user', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log('=== UPDATE PROFILE START ===');
    console.log('Request user:', req.user);
    console.log('Request body:', req.body);
    
    if (!req.user || !req.user._id) {
      console.log('ERROR: No user in request');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { name, lastName, age, gender, phoneNumber, address, profileImage } = req.body;
    
    // Build update object dynamically
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (age !== undefined && age !== '') updateData.age = parseInt(age);
    if (gender !== undefined) updateData.gender = gender;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    
    if (address !== undefined) {
      updateData.address = {
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        country: address.country || '',
        zipCode: address.zipCode || ''
      };
    }
    
    console.log('Update data to save:', updateData);
    console.log('User ID:', req.user._id);
    
    // Try to find user first
    const existingUser = await User.findById(req.user._id);
    console.log('Existing user found:', existingUser ? 'YES' : 'NO');
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update using save method
    Object.keys(updateData).forEach(key => {
      existingUser[key] = updateData[key];
    });
    
    console.log('About to save...');
    await existingUser.save();
    console.log('Save successful!');
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: existingUser._id,
        email: existingUser.email,
        name: existingUser.name,
        lastName: existingUser.lastName || '',
        age: existingUser.age,
        gender: existingUser.gender || 'prefer-not-to-say',
        phoneNumber: existingUser.phoneNumber || '',
        address: existingUser.address || {
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: ''
        },
        profileImage: existingUser.profileImage || '',
        preferences: existingUser.preferences
      }
    });
    
    console.log('=== UPDATE PROFILE END ===');
  } catch (error) {
    console.error('=== UPDATE PROFILE ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to update profile', 
      error: error.message,
      name: error.name 
    });
  }
};
