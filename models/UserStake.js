const mongoose = require('mongoose');

const UserStakeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: String,
    startTime: Date,
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StakingPlan'
    },
    txHash: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserStake', UserStakeSchema);
