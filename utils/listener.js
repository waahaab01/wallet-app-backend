const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ethers = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.INFURA_API_URL);

async function startReceiveListener() {
  // 1. Sabhi users ke addresses nikaalein
  const users = await User.find({}, '_id walletAddress');
  const addressMap = {};
  users.forEach(user => {
    if (user.walletAddress) {
      addressMap[user.walletAddress.toLowerCase()] = user._id;
    }
  });

  // 2. Pending txs par listen karein
  provider.on('block', async (blockNumber) => {
    console.log(`New block received: #${blockNumber}`);
    try {
      const block = await provider.getBlock(blockNumber);
      if (!block) {
        console.log(`Block #${blockNumber} not found.`);
        return;
      }
      if (!block.transactions || block.transactions.length === 0) {
        console.log(`Block #${blockNumber} has no transactions.`);
        return;
      }
      console.log(`Block #${blockNumber} has ${block.transactions.length} transactions.`);

      for (const txHash of block.transactions) {
        const tx = await provider.getTransaction(txHash);
        if (tx && tx.to && addressMap[tx.to.toLowerCase()]) {
          console.log(`User received ETH! Block: ${blockNumber}, TxHash: ${tx.hash}, From: ${tx.from}, To: ${tx.to}, Amount: ${ethers.formatEther(tx.value)}`);
          await Transaction.create({
            userId: addressMap[tx.to.toLowerCase()],
            from: tx.from,
            to: tx.to,
            txHash: tx.hash,
            type: 'receive',
            status: 'confirmed',
            amount: ethers.formatEther(tx.value),
            chain: 'Ethereum',
          });
        }
      }
    } catch (err) {
      console.error('Listener error:', err);
    }
  });

  console.log('Real-time receive listener started for all user wallets.');
}

startReceiveListener();
