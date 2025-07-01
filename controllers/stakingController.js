const User = require('../models/User');
const { decrypt } = require('../utils/encrypt');
const { ethers } = require('ethers');


const stakingAbi = [/* ABI GOES HERE */];
const STAKING_CONTRACT_ADDRESS = '0xYourStakingContractAddress';

const provider = new ethers.JsonRpcProvider(process.env.INFURA_API_URL);

exports.stakeTokens = async (req, res) => {
  const userId = req.user.userId;
  const { amount } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || !user.walletAddress || !user.encryptedPrivateKey) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const privateKey = decrypt(user.encryptedPrivateKey);
    const wallet = new ethers.Wallet(privateKey, provider);

    const stakingContract = new ethers.Contract(
      STAKING_CONTRACT_ADDRESS,
      stakingAbi,
      wallet
    );

    const amountInWei = ethers.parseUnits(amount.toString(), 18); 

    const tx = await stakingContract.stake(amountInWei);
    await tx.wait();

    res.status(200).json({
      success: true,
      txHash: tx.hash,
      message: 'Staked successfully',
    });
  } catch (error) {
    console.error('Staking error:', error);
    res.status(500).json({ message: 'Staking failed' });
  }
};


exports.unstakeTokens = async (req, res) => {
    const userId = req.user.userId;
  
    try {
      const user = await User.findById(userId);
      if (!user || !user.walletAddress || !user.encryptedPrivateKey) {
        return res.status(404).json({ message: 'Wallet not found' });
      }
  
      const privateKey = decrypt(user.encryptedPrivateKey);
      const wallet = new ethers.Wallet(privateKey, provider);
  
      const stakingContract = new ethers.Contract(
        STAKING_CONTRACT_ADDRESS,
        stakingAbi,
        wallet
      );
  
      const tx = await stakingContract.unstake();
      await tx.wait();
  
      res.status(200).json({
        success: true,
        txHash: tx.hash,
        message: 'Unstaked successfully',
      });
    } catch (error) {
      console.error('Unstaking error:', error);
      res.status(500).json({ message: 'Unstaking failed' });
    }
  };
  

  exports.getStakingStatus = async (req, res) => {
    const userId = req.user.userId;
  
    try {
      const user = await User.findById(userId);
      if (!user || !user.walletAddress) {
        return res.status(404).json({ message: 'Wallet not found' });
      }
  
      const stakingContract = new ethers.Contract(
        STAKING_CONTRACT_ADDRESS,
        stakingAbi,
        provider // read-only, no need to sign
      );
  
      const [amount, startTime, active] = await stakingContract.getStake(user.walletAddress);
  
      res.status(200).json({
        success: true,
        stake: {
          amount: ethers.formatUnits(amount, 18),
          startTime,
          active
        }
      });
    } catch (error) {
      console.error('Get stake error:', error);
      res.status(500).json({ message: 'Failed to fetch stake info' });
    }
  };
  

  // POST /api/staking/plans - Admin creates plan
exports.createStakingPlan = async (req, res) => {
  const { name, description, durationDays, rewardRate } = req.body;

  try {
    const plan = await StakingPlan.create({
      name,
      description,
      durationDays,
      rewardRate
    });

    res.status(201).json({ success: true, plan });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ message: 'Failed to create staking plan' });
  }
};

// GET /api/staking/plans - Fetch all plans
exports.getAllStakingPlans = async (req, res) => {
  try {
    const plans = await StakingPlan.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plans' });
  }
};