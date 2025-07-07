const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateWallet } = require("../utils/generateWallet");
const { encrypt } = require("../utils/encrypt");
const { generateOTP } = require("../utils/otp");
const { sendMail, getTemplate } = require("../utils/mailer");

// Utility: Send real OTP email
const sendOTP = async (email, otp, type) => {
  const html = getTemplate("otp.html", { otp, type });
  await sendMail({
    to: email,
    subject: `Your OTP for ${type} - Wallet App`,
    html,
  });
  console.log("OTP sent to:", email);
  console.log("OTP:", otp);
};

// User Registration
exports.registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate blockchain wallet
    const wallet = await generateWallet();
    console.log("Generated Wallet:", wallet);

    // Encrypt private key
    const encryptedPrivateKey = encrypt(wallet.privateKey);

    // Create user
    const user = await User.create({
      fullName,
      email,
      passwordHash,
      walletAddress: wallet.address,
      encryptedPrivateKey,
      role: req.body.role || 'user' // default role is 'user', can set 'admin' via Postman
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      success: true,
      token,
      wallet: {
        address: wallet.address,
        mnemonic: wallet.mnemonic, // show seed phrase now
      },
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// User Login (Step 1: send OTP)
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    // Generate OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    user.otpType = "login";
    await user.save();
    await sendOTP(user.email, otp, "login");
    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// User Login (Step 2: verify OTP)
exports.verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({
      email,
      otp,
      otpType: "login",
      otpExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP" });
    user.otp = null;
    user.otpExpires = null;
    user.otpType = null;
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    // Prepare wallet object for response (same as registration)
    const wallet = {
      address: user.walletAddress,
      mnemonic: null, // Not stored after registration, so null
    };
    res.status(200).json({
      success: true,
      token,
      wallet,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        walletAddress: user.walletAddress,
        encryptedPrivateKey: user.encryptedPrivateKey,
        role: user.role
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Send OTP for password reset
exports.sendResetOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not found" });
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    user.otpType = "reset";
    await user.save();
    await sendOTP(user.email, otp, "reset");
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify OTP for password reset
exports.verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({
      email,
      otp,
      otpType: "reset",
      otpExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP" });
    res.status(200).json({ message: "OTP verified, you can now reset password", role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset password after OTP verification
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({
      email,
      otpType: "reset",
      otpExpires: { $gt: Date.now() },
    });
    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid request or OTP expired" });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpires = null;
    user.otpType = null;
    await user.save();
    // Send password reset success email
    const html = getTemplate("reset-success.html", {});
    await sendMail({
      to: user.email,
      subject: "Password Reset Successful - Wallet App",
      html,
    });
    res.status(200).json({ message: "Password reset successful", role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// User Login with Mnemonic (Step 1: send OTP)
exports.loginWithMnemonic = async (req, res) => {
  const { mnemonic } = req.body;
  try {
    // Find user by matching mnemonic with wallet
    const { Wallet } = require('ethers');
    let user = null;
    let wallet = null;
    try {
      wallet = Wallet.fromPhrase(mnemonic);
      user = await User.findOne({ walletAddress: wallet.address });
    } catch (e) {
      return res.status(400).json({ message: 'Invalid mnemonic' });
    }
    if (!user) return res.status(400).json({ message: 'No user found for this mnemonic' });
    // Generate OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    user.otpType = "login-mnemonic";
    await user.save();
    await sendOTP(user.email, otp, "login-mnemonic");
    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// User Login with Mnemonic (Step 2: verify OTP)
exports.verifyLoginMnemonicOTP = async (req, res) => {
  const { mnemonic, otp } = req.body;
  try {
    const { Wallet } = require('ethers');
    let wallet = null;
    let user = null;
    try {
      wallet = Wallet.fromPhrase(mnemonic);
      user = await User.findOne({ walletAddress: wallet.address, otp, otpType: "login-mnemonic", otpExpires: { $gt: Date.now() } });
    } catch (e) {
      return res.status(400).json({ message: 'Invalid mnemonic' });
    }
    if (!user) return res.status(400).json({ message: "Invalid or expired OTP or mnemonic" });
    user.otp = null;
    user.otpExpires = null;
    user.otpType = null;
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.status(200).json({
      success: true,
      token,
      wallet: {
        address: user.walletAddress,
        mnemonic // return the mnemonic used for login
      },
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        walletAddress: user.walletAddress,
        encryptedPrivateKey: user.encryptedPrivateKey,
        role: user.role
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
