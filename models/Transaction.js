const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    from: String,
    to: String,
    txHash: String,
    type: String, // 'send' | 'stake' | 'unstake'
    status: String, // 'pending', 'confirmed'
    amount: String,
    chain: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', TransactionSchema);
