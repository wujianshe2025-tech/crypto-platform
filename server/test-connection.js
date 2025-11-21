// 简单的 MongoDB 连接测试脚本
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('连接字符串前缀:', MONGODB_URI.substring(0, 30) + '...');

async function testConnection() {
  try {
    console.log('开始连接...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ 连接成功!');
    console.log('Host:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.name);
    console.log('ReadyState:', mongoose.connection.readyState);
    
    await mongoose.disconnect();
    console.log('已断开连接');
    process.exit(0);
  } catch (err) {
    console.error('❌ 连接失败:', err.message);
    console.error('详细错误:', err);
    process.exit(1);
  }
}

testConnection();
