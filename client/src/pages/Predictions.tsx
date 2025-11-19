import { useState } from 'react';
import { mockPredictions } from '../data/mockData';

interface Prediction {
  _id: string;
  creatorId: { username: string };
  title: string;
  description: string;
  type: string;
  options: Array<{ text: string; votes: string[] }>;
  deadline: string;
  status: string;
  rewardPool: number;
  createdAt: string;
}

export default function Predictions() {
  const [predictions, setPredictions] = useState<Prediction[]>(mockPredictions);
  const [showCreate, setShowCreate] = useState(false);
  const [newPrediction, setNewPrediction] = useState({
    title: '',
    description: '',
    deadline: ''
  });

  const handleVote = (predictionId: string, optionIndex: number) => {
    setPredictions(predictions.map(pred => {
      if (pred._id === predictionId) {
        const newOptions = pred.options.map((opt, idx) => ({
          ...opt,
          votes: opt.votes.filter(v => v !== 'current-user')
        }));
        newOptions[optionIndex].votes.push('current-user');
        return { ...pred, options: newOptions };
      }
      return pred;
    }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrediction.title || !newPrediction.deadline) return;

    const prediction: Prediction = {
      _id: Date.now().toString(),
      creatorId: { username: '我' },
      title: newPrediction.title,
      description: newPrediction.description,
      type: 'event',
      options: [
        { text: '是', votes: [] },
        { text: '否', votes: [] }
      ],
      deadline: newPrediction.deadline,
      status: 'active',
      rewardPool: 100,
      createdAt: new Date().toISOString()
    };

    setPredictions([prediction, ...predictions]);
    setShowCreate(false);
    setNewPrediction({ title: '', description: '', deadline: '' });
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
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              placeholder="预测标题"
              className="w-full bg-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPrediction.title}
              onChange={(e) => setNewPrediction({ ...newPrediction, title: e.target.value })}
              required
            />
            <textarea
              placeholder="预测描述（可选）"
              className="w-full bg-gray-700 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={newPrediction.description}
              onChange={(e) => setNewPrediction({ ...newPrediction, description: e.target.value })}
            />
            <input
              type="datetime-local"
              className="w-full bg-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPrediction.deadline}
              onChange={(e) => setNewPrediction({ ...newPrediction, deadline: e.target.value })}
              required
            />
            <button 
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              创建预测
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {predictions.map((prediction) => {
          const totalVotes = prediction.options.reduce((sum, opt) => sum + opt.votes.length, 0);
          const hasVoted = prediction.options.some(opt => opt.votes.includes('current-user'));
          
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
                  <div className="px-3 py-1 bg-green-600 rounded text-sm mb-2">
                    奖池: {prediction.rewardPool} 币
                  </div>
                  <div className="text-xs text-gray-400">
                    剩余: {getTimeRemaining(prediction.deadline)}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {prediction.options.map((option, idx) => {
                  const percentage = totalVotes > 0 
                    ? ((option.votes.length / totalVotes) * 100).toFixed(1)
                    : '0';
                  const isVoted = option.votes.includes('current-user');
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handleVote(prediction._id, idx)}
                      className={`w-full rounded-lg p-4 transition ${
                        isVoted 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-gray-700 hover:bg-gray-600'
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
                  ✓ 你已投票！预测准确将获得奖励
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
        <p className="text-sm text-yellow-300">
          💡 <strong>交互演示：</strong>你可以创建预测和投票，完整版本中预测准确者将获得加密货币奖励
        </p>
      </div>
    </div>
  );
}
