const { Wallet } = require('ethers');
const bip39 = require('bip39');

const generateWallet = async () => {
  // Generate mnemonic (seed phrase)
  const mnemonic = bip39.generateMnemonic();

  // Derive wallet from mnemonic
  const wallet = Wallet.fromPhrase(mnemonic);

  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic
  };
};

module.exports = { generateWallet };
