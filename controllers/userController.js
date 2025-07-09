const User = require('../models/User');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { Wallet } = require('ethers');
    
    const users = await User.find({}, '-passwordHash -otp -otpExpires -otpType');
    // Add mnemonic to each user in the response
    const usersWithMnemonic = users.map(user => ({
      ...user.toObject(),
      mnemonic: user.mnemonic
    }));
    res.status(200).json({ success: true, users: usersWithMnemonic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single user by ID (admin only)
exports.getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-passwordHash  -otp -otpExpires -otpType');
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Add mnemonic to the user response
    const userWithMnemonic = {
      ...user.toObject(),
      mnemonic: user.mnemonic
    };
    res.status(200).json({ success: true, user: userWithMnemonic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
