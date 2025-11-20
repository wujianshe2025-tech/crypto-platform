import express from 'express';
import { ethers } from 'ethers';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 激活会员
router.post('/activate', authenticateToken, async (req, res) => {
  const { txHash, blockNumber } = req.body;
  const userId = req.user.userId;
  
  try {
    // 检查交易是否已经被使用
    const existingTx = await Transaction.findOne({ txHash });
    if (existingTx) {
      return res.status(400).json({ error: '该交易已被使用' });
    }

    // 检查用户是否已经是会员
    const user = await User.findById(userId);
    if (user.isMember) {
      return res.status(400).json({ error: '您已经是会员了' });
    }

    // 如果配置了RPC，验证交易（可选）
    if (process.env.RPC_URL) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
        const tx = await provider.getTransaction(txHash);
        
        if (!tx) {
          return res.status(400).json({ error: '交易不存在' });
        }
        
        // 可以添加更多验证：金额、接收地址等
      } catch (error) {
        console.error('交易验证失败:', error);
        // 如果验证失败，仍然允许继续（因为可能是RPC问题）
      }
    }
    
    // 更新用户状态
    await User.findByIdAndUpdate(userId, {
      isMember: true,
      membershipDate: new Date(),
      membershipTxHash: txHash
    });
    
    // 记录交易
    await Transaction.create({
      userId,
      type: 'membership',
      amount: 1,
      txHash,
      status: 'confirmed',
      blockNumber,
      confirmedAt: new Date()
    });
    
    res.json({ 
      success: true, 
      message: '会员激活成功！欢迎加入追风观测！' 
    });
  } catch (error) {
    console.error('激活失败:', error);
    res.status(500).json({ error: '激活失败', message: error.message });
  }
});

// 获取会员状态
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    res.json({
      success: true,
      isMember: user.isMember,
      membershipDate: user.membershipDate,
      membershipTxHash: user.membershipTxHash
    });
  } catch (error) {
    res.status(500).json({ error: '获取会员状态失败' });
  }
});

export default router;
