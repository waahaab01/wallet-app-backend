const express = require('express');
const { linkWallet, getUserWallets, getWalletBalance, getTransactionHistory, sendEthFromMainWallet, importWalletFromMnemonic, buyTokenDummy } = require('../controllers/walletController');
const { protect } = require('../middlewares/authMiddleware');
const { sendSchema } = require('../validations/walletValidation');
const { validate } = require('../middlewares/validate');

const router = express.Router();

// send amount
router.post('/send', protect, validate(sendSchema), sendEthFromMainWallet);
// Link a new wallet
router.post('/link', protect, linkWallet);
// Get all wallets of the user
router.get('/my-wallets', protect, getUserWallets);
router.get('/balance/:walletId', protect, getWalletBalance);
// get transaction history
router.get('/transactions', protect, getTransactionHistory);
// import wallet for new user
router.post('/import', protect, importWalletFromMnemonic);
// buy dummy token
router.post('/buy-dummy', protect, buyTokenDummy);

// Get main wallet receive address
router.get('/receive-address', protect, require('../controllers/walletController').getReceiveAddress);

// Get all received transactions for the logged-in user
router.get('/received', protect, require('../controllers/walletController').getReceivedTransactions);

module.exports = router;
