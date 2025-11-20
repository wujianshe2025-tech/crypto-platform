import React, { useState } from 'react';
import { transferUSDT, PLATFORM_ADDRESS, getUSDTBalance } from '../utils/web3';
import { activateMembership } from '../utils/api';

export default function MembershipPayment({ user, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('idle'); // idle, checking, transferring, confirming, done

  const handleBecomeMember = async () => {
    setLoading(true);
    setError('');
    setStep('checking');

    try {
      // 1. 检查余额
      const balance = await getUSDTBalance(user.walletAddress);
      if (parseFloat(balance) < 1) {
        throw new Error('USDT余额不足，至少需要1 USDT');
      }

      // 2. 发起转账
      setStep('transferring');
      const tx = await transferUSDT(PLATFORM_ADDRESS, 1);
      
      // 3. 等待确认
      setStep('confirming');
      const receipt = await tx.wait();
      
      // 4. 通知后端
      await activateMembership(receipt.transactionHash, receipt.blockNumber);
      
      setStep('done');
      
      // 更新用户信息
      const updatedUser = { ...user, isMember: true, membershipDate: new Date() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      if (onSuccess) {
        onSuccess(updatedUser);
      }
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      console.error('支付失败:', err);
      setError(err.message || '支付失败，请重试');
      setStep('idle');
    } finally {
      setLoading(false);
    }
  };

  if (user?.isMember) {
    return (
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">⭐</span>
          <div>
            <h3 className="text-xl font-bold">尊贵会员</h3>
            <p className="text-sm opacity-90">
              成为会员于 {new Date(user.membershipDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="bg-white/20 rounded-lg p-4">
          <h4 className="font-semibold mb-2">会员特权：</h4>
          <ul className="space-y-1 text-sm">
            <li>✓ 创建预测投票</li>
            <li>✓ 参与有奖预测</li>
            <li>✓ 获得创建者奖励</li>
            <li>✓ 专属会员标识</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">💎</span>
        <div>
          <h3 className="text-xl font-bold">成为会员</h3>
          <p className="text-sm opacity-90">解锁全部功能，仅需 1 USDT</p>
        </div>
      </div>

      <div className="bg-white/20 rounded-lg p-4 mb-4">
        <h4 className="font-semibold mb-2">会员权益：</h4>
        <ul className="space-y-1 text-sm">
          <li>✓ 创建预测投票</li>
          <li>✓ 参与有奖预测</li>
          <li>✓ 获得创建者奖励（1%）</li>
          <li>✓ 专属会员标识</li>
          <li>✓ 优先功能体验</li>
        </ul>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {step !== 'idle' && step !== 'done' && (
        <div className="bg-white/20 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span className="text-sm">
              {step === 'checking' && '检查余额中...'}
              {step === 'transferring' && '请在钱包中确认交易...'}
              {step === 'confirming' && '等待区块链确认...'}
            </span>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-4">
          <p className="text-sm">✅ 恭喜成为会员！页面即将刷新...</p>
        </div>
      )}

      <button
        onClick={handleBecomeMember}
        disabled={loading || !user}
        className="w-full py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '处理中...' : '立即成为会员 (1 USDT)'}
      </button>

      <p className="text-xs text-center mt-3 opacity-75">
        支付将通过BSC网络进行，请确保钱包已切换到BSC主网
      </p>
    </div>
  );
}
