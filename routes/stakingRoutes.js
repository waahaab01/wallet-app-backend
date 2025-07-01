const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { stakeTokens, unstakeTokens, getStakingStatus, createStakingPlan, getAllStakingPlans } = require('../controllers/stakingController');
const { validate } = require('../middlewares/validate');
const { stakeSchema } = require('../validations/stakingValidation');

const router = express.Router();

// Stake tokens route
router.post('/stake', protect, validate(stakeSchema), stakeTokens);
router.post('/plans', protect, validate(createPlanSchema), createStakingPlan);
router.post('/unstake', protect, unstakeTokens);
router.get('/status', protect, getStakingStatus);
router.get('/plans', getAllStakingPlans);


module.exports = router;
