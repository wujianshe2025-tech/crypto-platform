import React, { useState } from 'react';
import { activateMembership } from '../utils/api';

export default function MembershipPayment({ user, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('idle');

  const handleBecomeMember = async () => {
    setLoading(true);
    setError('');
    try {
      const orderId = window.prompt('请输入扫码支付成功后的订单号');
      if (!orderId) { setLoading(false); return; }
      await activateMembership(orderId, null);
      const updatedUser = { ...user, isMember: true, membershipDate: new Date() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (onSuccess) onSuccess(updatedUser);
      setStep('done');
      setTimeout(() => { window.location.reload(); }, 1500);
    } catch (err) {
      console.error('激活失败:', err);
      setError(err.message || '激活失败，请重试');
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

      <div className="bg-white/20 rounded-lg p-4 mb-4">
        <p className="text-sm">请使用支持 BSC 链的钱包扫码支付 1 USDT，支付完成后输入订单号进行激活。</p>
      </div>

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
        {loading ? '处理中...' : '输入订单号激活会员'}
      </button>
      
    </div>
  );
}
