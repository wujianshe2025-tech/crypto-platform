import { useState, useEffect } from 'react';
import { 
  getPredictions, 
  createPrediction, 
  votePrediction,
  getUser 
} from '../utils/api';
 

interface Prediction {
  _id: string;
  creatorId: { 
    _id: string;
    username: string;
    walletAddress: string;
  };
  title: string;
  description: string;
  options: Array<{ 
    text: string; 
    votes: string[];
  }>;
  hasReward: boolean;
  rewardPerPerson: number;
  totalPool: number;
  deadline: string;
  status: string;
  createdAt: string;
}

export default function Predictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [votingPrediction, setVotingPrediction] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'checking' | 'transferring' | 'confirming'>('idle');
  
  const [newPrediction, setNewPrediction] = useState({
    title: '',
    description: '',
    options: ['', ''],
    hasReward: false,
    rewardPerPerson: 0,
    deadline: ''
  });

  // 加载数据
  useEffect(() => {
    loadPredictions();
    loadUser();
  }, []);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      const data = await getPredictions();
      setPredictions(data || []);
    } catch (err: any) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadUser = () => {
    const userData = getUser();
    setUser(userData);
  };

  // 投票处理
  const handleVote = async (predictionId: string, optionIndex: number, hasReward: boolean, rewardAmount: number) => {
    if (!user) {
      alert('请先登录');
      return;
    }

    setVotingPrediction(predictionId);
    setError('');

    try {
      const txHash = null;
      await votePrediction(predictionId, optionIndex, 0, txHash);
      
      // 重新加载数据
      await loadPredictions();
      
      alert('✅ 投票成功！');
    } catch (err: any) {
      console.error('投票失败:', err);
      setError(err.message || '投票失败，请重试');
    } finally {
      setVotingPrediction(null);
      setPaymentStep('idle');
    }
  };

  // 创建预测
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('请先登录');
      return;
    }

    // 如果要创建有奖预测，必须是会员
    if (newPrediction.hasReward && !user.isMember) {
      alert('只有会员才能创建有奖预测，请先升级会员。\n\n普通用户可以创建无奖预测。');
      return;
    }

    if (!newPrediction.title || !newPrediction.deadline) {
      alert('请填写标题和截止时间');
      return;
    }

    const validOptions = newPrediction.options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      alert('至少需要2个选项');
      return;
    }

    try {
      setLoading(true);
      
      await createPrediction({
        title: newPrediction.title,
        description: newPrediction.description,
        options: validOptions,
        hasReward: newPrediction.hasReward,
        rewardPerPerson: newPrediction.rewardPerPerson,
        deadline: newPrediction.deadline
      });

      alert('✅ 预测创建成功！');
      setShowCreate(false);
      setNewPrediction({
        title: '',
        description: '',
        options: ['', ''],
        hasReward: false,
        rewardPerPerson: 0,
        deadline: ''
      });
      
      await loadPredictions();
    } catch (err: any) {
      alert(err.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加选项
  const addOption = () => {
    if (newPrediction.options.length < 10) {
      setNewPrediction({
        ...newPrediction,
        options: [...newPrediction.options, '']
      });
    }
  };

  // 删除选项
  const removeOption = (index: number) => {
    if (newPrediction.options.length > 2) {
      setNewPrediction({
        ...newPrediction,
        options: newPrediction.options.filter((_, i) => i !== index)
      });
    }
  };

  // 更新选项
  const updateOption = (index: number, value: string) => {
    const newOptions = [...newPrediction.options];
    newOptions[index] = value;
    setNewPrediction({
      ...newPrediction,
      options: newOptions
    });
  };

  const getTimeRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return `${days}天${hours}小时`;
    if (hours > 0) return `${hours}小时`;
    return '即将截止';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">预测投票</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          {showCreate ? '取消' : '发起预测'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">创建新预测</h2>
          
          {!user && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <p className="text-yellow-300">⚠️ 请先登录</p>
            </div>
          )}

          {user && !user.isMember && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
              <p className="text-blue-300">
                💡 <strong>提示：</strong>
                <br />• 普通用户可以创建<strong>无奖预测</strong>
                <br />• 升级会员后可以创建<strong>有奖预测</strong>
              </p>
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">预测标题 *</label>
              <input
                type="text"
                placeholder="例如：比特币会涨到10万美元吗？"
                className="w-full bg-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPrediction.title}
                onChange={(e) => setNewPrediction({ ...newPrediction, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">预测描述</label>
              <textarea
                placeholder="详细描述预测内容..."
                className="w-full bg-gray-700 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={newPrediction.description}
                onChange={(e) => setNewPrediction({ ...newPrediction, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">选项 *</label>
              <div className="space-y-2">
                {newPrediction.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`选项 ${index + 1}`}
                      className="flex-1 bg-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      required
                    />
                    {newPrediction.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="px-4 bg-red-600 rounded-lg hover:bg-red-700"
                      >
                        删除
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {newPrediction.options.length < 10 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                >
                  + 添加选项
                </button>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPrediction.hasReward}
                  onChange={(e) => setNewPrediction({ 
                    ...newPrediction, 
                    hasReward: e.target.checked,
                    rewardPerPerson: e.target.checked ? 10 : 0
                  })}
                  className="w-5 h-5"
                />
                <span className="text-white">有奖预测（参与者需要投注）</span>
              </label>
            </div>

            {newPrediction.hasReward && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">每人投注金额（USDT）</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="w-full bg-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newPrediction.rewardPerPerson}
                  onChange={(e) => setNewPrediction({ 
                    ...newPrediction, 
                    rewardPerPerson: parseFloat(e.target.value) || 0 
                  })}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  预测准确者将按投注比例分配奖池（扣除5%手续费）
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">截止时间 *</label>
              <input
                type="datetime-local"
                className="w-full bg-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPrediction.deadline}
                onChange={(e) => setNewPrediction({ ...newPrediction, deadline: e.target.value })}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading || !user}
              className="w-full px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '创建中...' : '创建预测'}
            </button>
          </form>
        </div>
      )}

      {loading && predictions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">加载中...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-300">❌ {error}</p>
        </div>
      )}

      {!loading && predictions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2">还没有预测</h3>
          <p className="text-gray-400 mb-6">成为第一个创建预测的人吧！</p>
          {user && (
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              创建预测
            </button>
          )}
          {!user && (
            <p className="text-gray-500 text-sm">请先登录</p>
          )}
        </div>
      )}

      <div className="space-y-6">
        {predictions.map((prediction) => {
          const totalVotes = prediction.options.reduce((sum, opt) => sum + opt.votes.length, 0);
          const hasVoted = user && prediction.options.some(opt => 
            opt.votes.includes(user.id)
          );
          const isVoting = votingPrediction === prediction._id;
          
          return (
            <div key={prediction._id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{prediction.title}</h3>
                  {prediction.description && (
                    <p className="text-gray-400 mb-3">{prediction.description}</p>
                  )}
                </div>
                <div className="ml-4 text-right">
                  {prediction.hasReward && (
                    <div className="px-3 py-1 bg-yellow-600 rounded text-sm mb-2">
                      💰 奖池: {prediction.totalPool || 0} USDT
                    </div>
                  )}
                  <div className={`px-3 py-1 rounded text-sm mb-2 ${
                    prediction.status === 'active' ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    {prediction.status === 'active' ? '进行中' : '已结束'}
                  </div>
                  <div className="text-xs text-gray-400">
                    剩余: {getTimeRemaining(prediction.deadline)}
                  </div>
                </div>
              </div>

              {isVoting && paymentStep !== 'idle' && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-blue-300">
                      {paymentStep === 'checking' && '检查余额中...'}
                      {paymentStep === 'transferring' && '请在钱包中确认交易...'}
                      {paymentStep === 'confirming' && '等待区块链确认...'}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-4">
                {prediction.options.map((option, optionIndex) => {
                  const percentage = totalVotes > 0 
                    ? ((option.votes.length / totalVotes) * 100).toFixed(1)
                    : '0';
                  const isVoted = user && option.votes.includes(user.id);
                  const canVote = user && !hasVoted && prediction.status === 'active';
                  
                  return (
                    <button
                      key={optionIndex}
                      onClick={() => canVote && handleVote(
                        prediction._id, 
                        optionIndex,
                        prediction.hasReward,
                        prediction.rewardPerPerson || 0
                      )}
                      disabled={!canVote || isVoting}
                      className={`w-full rounded-lg p-4 transition ${
                        isVoted 
                          ? 'bg-blue-600' 
                          : canVote
                          ? 'bg-gray-700 hover:bg-gray-600 cursor-pointer'
                          : 'bg-gray-700 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center">
                          {isVoted && <span className="mr-2">✓</span>}
                          {option.text}
                        </span>
                        <span className={isVoted ? 'text-white font-semibold' : 'text-blue-400'}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isVoted ? 'bg-white' : 'bg-blue-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {option.votes.length} 票
                        {prediction.hasReward && ` · ${prediction.rewardPerPerson} USDT`}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400 border-t border-gray-700 pt-4">
                <span>发起人: {prediction.creatorId.username}</span>
                <span>总投票: {totalVotes}</span>
                <span>截止: {new Date(prediction.deadline).toLocaleDateString('zh-CN')}</span>
              </div>

              {hasVoted && (
                <div className="mt-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg text-sm text-green-300">
                  ✓ 你已投票！{prediction.hasReward && '预测准确将获得奖励'}
                </div>
              )}

              {!user && (
                <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-sm text-yellow-300">
                  ⚠️ 请先登录后投票
                </div>
              )}
            </div>
          );
        })}
      </div>

      {predictions.length > 0 && (
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            💡 <strong>提示：</strong>
            {user 
              ? user.isMember 
                ? '你是会员，可以创建有奖预测和投票，预测准确者将获得加密货币奖励'
                : '你可以创建无奖预测和投票，升级会员后可以创建有奖预测'
              : '登录后可以创建预测和投票，升级会员后可以创建有奖预测'
            }
          </p>
        </div>
      )}
    </div>
  );
}
