const User = require('../models/User');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash -encryptedPrivateKey -otp -otpExpires -otpType');
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single user by ID (admin only)
exports.getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-passwordHash -encryptedPrivateKey -otp -otpExpires -otpType');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
