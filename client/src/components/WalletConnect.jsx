import React, { useState, useEffect } from 'react';
import { 
  connectWallet, 
  signMessage, 
  formatAddress,
  isMetaMaskInstalled,
  onAccountsChanged 
} from '../utils/web3';
import { walletLogin, getCurrentUser, getUser } from '../utils/api';

export default function WalletConnect({ onUserChange }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 检查本地存储的用户信息
    const savedUser = getUser();
    if (savedUser) {
      setUser(savedUser);
      if (onUserChange) onUserChange(savedUser);
    }

    // 监听账户变化
    onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        handleLogout();
      }
    });
  }, []);

  const handleConnect = async () => {
    if (!isMetaMaskInstalled()) {
      setError('请先安装MetaMask钱包');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. 连接钱包
      const address = await connectWallet();
      
      // 2. 生成签名消息
      const message = `欢迎登录追风观测\n\n时间: ${new Date().toISOString()}\n地址: ${address}`;
      
      // 3. 请求签名
      const signature = await signMessage(address, message);
      
      // 4. 发送到后端验证
      const data = await walletLogin(address, message, signature);
      
      setUser(data.user);
      if (onUserChange) onUserChange(data.user);
      
    } catch (err) {
      console.error('连接失败:', err);
      setError(err.message || '连接失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    if (onUserChange) onUserChange(null);
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {user.isMember && (
          <span className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-full">
            ⭐ 会员
          </span>
        )}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-white">{formatAddress(user.walletAddress)}</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-gray-400 hover:text-white transition"
        >
          退出
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {error && (
        <span className="text-red-500 text-sm">{error}</span>
      )}
      <button
        onClick={handleConnect}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
      >
        {loading ? '连接中...' : '连接钱包'}
      </button>
    </div>
  );
}
