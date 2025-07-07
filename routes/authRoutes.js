const express = require('express');
const { registerUser, loginUser, verifyLoginOTP, sendResetOTP, verifyResetOTP, resetPassword, loginWithMnemonic, verifyLoginMnemonicOTP } = require('../controllers/authController');

const router = express.Router();

// @route POST /api/auth/register
router.post('/register', registerUser);
// @route POST /api/auth/login (step 1: send OTP)
router.post('/login', loginUser);
// @route POST /api/auth/login/verify-otp (step 2: verify OTP)
router.post('/login/verify-otp', verifyLoginOTP);
// @route POST /api/auth/reset/send-otp (send OTP for password reset)
router.post('/reset/send-otp', sendResetOTP);
// @route POST /api/auth/reset/verify-otp (verify OTP for password reset)
router.post('/reset/verify-otp', verifyResetOTP);
// @route POST /api/auth/reset/password (reset password)
router.post('/reset/password', resetPassword);
// @route POST /api/auth/login-mnemonic (step 1: send OTP)
router.post('/login-mnemonic', loginWithMnemonic);
// @route POST /api/auth/login-mnemonic/verify-otp (step 2: verify OTP)
router.post('/login-mnemonic/verify-otp', verifyLoginMnemonicOTP);

module.exports = router;
