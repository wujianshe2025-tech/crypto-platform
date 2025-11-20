import express from 'express';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import User from '../models/User.js';

const router = express.Router();

// 钱包连接登录
router.post('/wallet-login', async (req, res) => {
  const { address, message, signature } = req.body;
  
  try {
    // 验证签名
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: '签名验证失败' });
    }
    
    // 查找或创建用户
    let user = await User.findOne({ walletAddress: address.toLowerCase() });
    if (!user) {
      user = await User.create({
        walletAddress: address.toLowerCase(),
        username: `用户${address.slice(0, 6)}`
      });
    }
    
    // 生成JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        address: user.walletAddress,
        isMember: user.isMember
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({ 
      success: true,
      token, 
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        isMember: user.isMember,
        membershipDate: user.membershipDate
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败', message: error.message });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        isMember: user.isMember,
        membershipDate: user.membershipDate
      }
    });
  } catch (error) {
    res.status(403).json({ error: '令牌无效或已过期' });
  }
});

export default router;
