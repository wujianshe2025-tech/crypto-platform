import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// 健康检查接口
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '追风观测后端服务运行中',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// WebSocket 连接
io.on('connection', (socket) => {
  console.log('客户端已连接');
  
  socket.on('disconnect', () => {
    console.log('客户端已断开');
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
