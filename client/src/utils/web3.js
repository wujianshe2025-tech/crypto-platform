// Web3 钱包连接工具

// USDT合约地址（BSC主网）
export const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
// 平台收款地址（需要替换为实际地址）
export const PLATFORM_ADDRESS = process.env.VITE_PLATFORM_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

// USDT合约ABI（简化版）
export const USDT_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
];

// 检查是否安装了MetaMask
export const isMetaMaskInstalled = () => {
  return typeof window.ethereum !== 'undefined';
};

// 连接钱包
export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('请先安装MetaMask钱包');
  }

  try {
    // 请求账户访问
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    return accounts[0];
  } catch (error) {
    console.error('连接钱包失败:', error);
    throw error;
  }
};

// 获取钱包地址
export const getWalletAddress = async () => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });
    return accounts[0] || null;
  } catch (error) {
    console.error('获取钱包地址失败:', error);
    return null;
  }
};

// 签名消息
export const signMessage = async (address, message) => {
  try {
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address]
    });
    return signature;
  } catch (error) {
    console.error('签名失败:', error);
    throw error;
  }
};

// 切换到BSC网络
export const switchToBSC = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x38' }], // BSC主网
    });
  } catch (error) {
    // 如果网络不存在，添加网络
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x38',
          chainName: 'Binance Smart Chain',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18
          },
          rpcUrls: ['https://bsc-dataseed.binance.org/'],
          blockExplorerUrls: ['https://bscscan.com/']
        }]
      });
    } else {
      throw error;
    }
  }
};

// 获取USDT余额
export const getUSDTBalance = async (address) => {
  if (!window.ethers) {
    throw new Error('Ethers.js未加载');
  }

  try {
    const provider = new window.ethers.providers.Web3Provider(window.ethereum);
    const contract = new window.ethers.Contract(USDT_ADDRESS, USDT_ABI, provider);
    const balance = await contract.balanceOf(address);
    return window.ethers.utils.formatUnits(balance, 18);
  } catch (error) {
    console.error('获取USDT余额失败:', error);
    return '0';
  }
};

// 转账USDT
export const transferUSDT = async (toAddress, amount) => {
  if (!window.ethers) {
    throw new Error('Ethers.js未加载');
  }

  try {
    const provider = new window.ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new window.ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
    
    const amountWei = window.ethers.utils.parseUnits(amount.toString(), 18);
    const tx = await contract.transfer(toAddress, amountWei);
    
    return tx;
  } catch (error) {
    console.error('转账失败:', error);
    throw error;
  }
};

// 监听账户变化
export const onAccountsChanged = (callback) => {
  if (isMetaMaskInstalled()) {
    window.ethereum.on('accountsChanged', callback);
  }
};

// 监听网络变化
export const onChainChanged = (callback) => {
  if (isMetaMaskInstalled()) {
    window.ethereum.on('chainChanged', callback);
  }
};

// 格式化地址
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
