const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

exports.getProfile = async (req, res) => {
  try {
    console.log('=== GET PROFILE START ===');
    console.log('req.user:', req.user);
    console.log('User ID:', req.user?.id);

    if (!req.user || !req.user.id) {
      console.log('ERROR: No user in request');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'profilePic', 'createdAt'],
    });

    if (!user) {
      console.log('ERROR: User not found in database');
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    console.log('User found:', user.name);

    const profileWithDefault = {
      ...user.toJSON(),
      profilePic: user.profilePic || null,
    };

    console.log('Sending response:', profileWithDefault);
    return res.status(200).json({ success: true, user: profileWithDefault });
  } catch (error) {
    console.error('=== GET PROFILE ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return res
      .status(500)
      .json({ success: false, message: 'Server error: ' + error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log('=== UPDATE PROFILE START ===');
    console.log('User ID:', req.user?.id);
    console.log('Body:', req.body);
    console.log('File:', req.file ? 'File received' : 'No file');

    const { name, email } = req.body;

    if (!req.user || !req.user.id) {
      console.log('ERROR: No user ID in request');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      console.log('ERROR: User not found in DB');
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (email && email.trim()) {
      user.email = email.trim();
    }

    if (req.file && req.file.path) {
      console.log('Setting profile pic to:', req.file.path);
      user.profilePic = req.file.path;
    }

    await user.save();
    console.log('User saved successfully');

    const response = {
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    };

    console.log('Sending response:', response);
    return res.status(200).json(response);
  } catch (error) {
    console.error('=== UPDATE PROFILE ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
};
