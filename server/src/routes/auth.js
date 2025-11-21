import express from 'express';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import User from '../models/User.js';

const router = express.Router();

// 用户名密码注册
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email: email || null }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: '用户名或邮箱已被使用' });
    }
    
    // 创建新用户
    const user = await User.create({
      username,
      email,
      password,
      displayName: username
    });
    
    // 生成JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        isMember: user.isMember
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({ 
      success: true,
      message: '注册成功',
      token, 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        isMember: user.isMember
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败', message: error.message });
  }
});

// 用户名密码登录
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    // 查找用户（包含密码字段）
    const user = await User.findOne({ username }).select('+password');
    
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 验证密码
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 生成JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        isMember: user.isMember
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({ 
      success: true,
      message: '登录成功',
      token, 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        isMember: user.isMember,
        membershipDate: user.membershipDate
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败', message: error.message });
  }
});

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
