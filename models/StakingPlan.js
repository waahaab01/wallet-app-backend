const mongoose = require('mongoose');

const StakingPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    durationDays: {
      type: Number,
      required: true
    },
    rewardRate: {
      type: Number, // e.g., 0.05 means 5% return
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('StakingPlan', StakingPlanSchema);
