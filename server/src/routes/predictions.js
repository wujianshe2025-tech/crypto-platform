import express from 'express';
import Prediction from '../models/Prediction.js';
import Vote from '../models/Vote.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 获取所有预测
router.get('/', async (req, res) => {
  try {
    const predictions = await Prediction.find()
      .populate('creatorId', 'username walletAddress')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: predictions });
  } catch (error) {
    res.status(500).json({ error: '获取预测列表失败' });
  }
});

// 创建预测（普通用户可创建无奖预测，会员可创建有奖预测）
router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const { title, description, options, hasReward, rewardPerPerson, deadline } = req.body;
    
    // 如果要创建有奖预测，必须是会员
    if (hasReward && !user.isMember) {
      return res.status(403).json({ error: '只有会员才能创建有奖预测，请先升级会员' });
    }
    
    const prediction = await Prediction.create({
      creatorId: req.user.userId,
      title,
      description,
      options: options.map(text => ({ text, votes: [] })),
      hasReward: hasReward && user.isMember, // 只有会员才能创建有奖预测
      rewardPerPerson: (hasReward && user.isMember) ? rewardPerPerson : 0,
      deadline: new Date(deadline)
    });
    
    res.json({ success: true, data: prediction, message: '预测创建成功' });
  } catch (error) {
    console.error('创建预测失败:', error);
    res.status(500).json({ error: '创建预测失败', message: error.message });
  }
});

// 投票
router.post('/vote', authenticateToken, async (req, res) => {
  const { predictionId, optionIndex, amount, txHash } = req.body;
  
  try {
    const prediction = await Prediction.findById(predictionId);
    
    if (!prediction) {
      return res.status(404).json({ error: '预测不存在' });
    }
    
    if (prediction.status !== 'active') {
      return res.status(400).json({ error: '该预测已关闭' });
    }
    
    if (new Date() > prediction.deadline) {
      return res.status(400).json({ error: '投票已截止' });
    }
    
    // 检查是否已经投过票
    const existingVote = await Vote.findOne({
      predictionId,
      userId: req.user.userId
    });
    
    if (existingVote) {
      return res.status(400).json({ error: '您已经投过票了' });
    }
    
    // 创建投票记录
    const vote = await Vote.create({
      predictionId,
      userId: req.user.userId,
      optionIndex,
      amount: amount || 0,
      txHash: txHash || null
    });
    
    // 更新预测
    prediction.options[optionIndex].votes.push(req.user.userId);
    if (amount) {
      prediction.totalPool += amount;
    }
    await prediction.save();
    
    res.json({ success: true, message: '投票成功！', data: vote });
  } catch (error) {
    console.error('投票失败:', error);
    res.status(500).json({ error: '投票失败', message: error.message });
  }
});

// 获取预测详情
router.get('/:id', async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id)
      .populate('creatorId', 'username walletAddress');
    
    if (!prediction) {
      return res.status(404).json({ error: '预测不存在' });
    }
    
    const votes = await Vote.find({ predictionId: req.params.id })
      .populate('userId', 'username walletAddress');
    
    res.json({ success: true, data: { prediction, votes } });
  } catch (error) {
    res.status(500).json({ error: '获取预测详情失败' });
  }
});

export default router;
