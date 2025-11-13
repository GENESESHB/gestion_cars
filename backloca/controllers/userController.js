const User = require('../models/User');

// Fetch user by ID
exports.getUserById = async (req, res) => {
  try {
    console.log('Request received for user ID:', req.params.id); // Log request
    const user = await User.findById(req.params.id); // Fetch user by ID
    if (!user) {
      console.log('User not found'); // Log if user not found
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user information
exports.updateUserProfile = async (req, res) => {
  try {
    console.log('Incoming request body:', req.body); // Log request body
    console.log('Files:', req.files); // Log uploaded files
    console.log('User from token:', req.user.id); // Log user ID from token

    const { fullName, email, phoneNumber, city } = req.body;
    const userId = req.user.id; // Extract user ID from authenticated token

    // Prepare update data
    const updateData = {
      fullName,
      email,
      phoneNumber,
      city,
      profilePicture: req.files['profilePicture'] ? req.files['profilePicture'][0].path : undefined,
      coverPhoto: req.files['coverPhoto'] ? req.files['coverPhoto'][0].path : undefined
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Update user in the database
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Updated user data:', updatedUser); // Log updated user data
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
