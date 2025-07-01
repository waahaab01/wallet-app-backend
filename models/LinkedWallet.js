const mongoose = require('mongoose');

const linkedWalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    walletType: {
      type: String, // 'MetaMask', 'Binance', 'TrustWallet', etc
      required: true,
    },
    walletAddress: {
      type: String,
      required: true,
    },
    chain: {
      type: String, // 'Ethereum', 'BSC', 'Polygon', etc
      required: true,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

const LinkedWallet = mongoose.model('LinkedWallet', linkedWalletSchema);

module.exports = LinkedWallet;
