import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import mongoose from 'mongoose';

// 导入路由
import authRoutes from './routes/auth.js';
import membershipRoutes from './routes/membership.js';
import predictionsRoutes from './routes/predictions.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// 连接MongoDB - Serverless 优化
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-platform';

// Serverless 环境下的连接配置
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB 已连接');
  } catch (err) {
    console.error('❌ MongoDB 连接失败:', err);
  }
};

// 立即连接
connectDB();

// 注册路由
app.use('/api/auth', authRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/predictions', predictionsRoutes);

// 健康检查接口
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '追风观测后端服务运行中',
    timestamp: new Date().toISOString(),
    features: ['实时行情', '新闻资讯', '数据日历', '社区论坛', '预测投票'],
    apis: {
      auth: '/api/auth/wallet-login',
      membership: '/api/membership/activate',
      predictions: '/api/predictions'
    }
  });
});

app.get('/health', async (req, res) => {
  // 确保连接
  await connectDB();
  
  res.json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    readyState: mongoose.connection.readyState
  });
});

// 获取加密货币行情数据
app.get('/api/crypto/prices', async (req, res) => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 50,
        page: 1,
        sparkline: false
      }
    });
    
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('获取行情数据失败:', error.message);
    res.status(500).json({ 
      success: false, 
      error: '获取行情数据失败',
      message: error.message 
    });
  }
});

// 获取单个币种详情
app.get('/api/crypto/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`, {
      params: {
        localization: false,
        tickers: false,
        community_data: false,
        developer_data: false
      }
    });
    
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('获取币种详情失败:', error.message);
    res.status(500).json({ 
      success: false, 
      error: '获取币种详情失败' 
    });
  }
});

// WebSocket 连接 - 实时推送价格
io.on('connection', (socket) => {
  console.log('客户端已连接:', socket.id);
  
  // 定时推送价格更新
  const priceInterval = setInterval(async () => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 20,
          page: 1,
          sparkline: false
        }
      });
      
      socket.emit('crypto-prices', {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('推送价格失败:', error.message);
    }
  }, 10000); // 每10秒更新一次
  
  socket.on('disconnect', () => {
    console.log('客户端已断开:', socket.id);
    clearInterval(priceInterval);
  });
});

const PORT = process.env.PORT || 3000;

// 本地开发时启动服务器
if (process.env.NODE_ENV !== 'production') {
  httpServer.listen(PORT, () => {
    console.log(`🚀 服务器运行在端口 ${PORT}`);
    console.log(`📊 实时行情 API: http://localhost:${PORT}/api/crypto/prices`);
    console.log(`🌐 WebSocket 已启用`);
  });
}

// 导出 Express app 供 Vercel 使用
export default app;
