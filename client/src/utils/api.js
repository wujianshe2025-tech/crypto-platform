// API工具函数

// 智能判断 API 地址
const getApiBaseUrl = () => {
  // 如果是本地开发环境
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:3000';
  }
  
  // 生产环境 - 使用你的后端 API 地址
  return 'https://crypto-platform-api.vercel.app';
};

const API_BASE_URL = getApiBaseUrl();

// 调试信息 - 可以在控制台看到实际使用的 API 地址
console.log('🔗 API Base URL:', API_BASE_URL);

// 获取token
const getToken = () => {
  return localStorage.getItem('token');
};

// 获取用户信息
const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// 保存用户信息
const saveUser = (user, token) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
};

// 清除用户信息
const clearUser = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// 用户名密码注册
export const register = async (username, password, email) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password, email })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || '注册失败');
  }

  saveUser(data.user, data.token);
  return data;
};

// 用户名密码登录
export const login = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || '登录失败');
  }

  saveUser(data.user, data.token);
  return data;
};

// 钱包登录
export const walletLogin = async (address, message, signature) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/wallet-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ address, message, signature })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || '登录失败');
  }

  saveUser(data.user, data.token);
  return data;
};

// 获取当前用户信息
export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    clearUser();
    return null;
  }

  const data = await response.json();
  return data.user;
};

// 激活会员
export const activateMembership = async (txHash, blockNumber) => {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}/api/membership/activate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ txHash, blockNumber })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || '激活失败');
  }

  return data;
};

// 获取会员状态
export const getMembershipStatus = async () => {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}/api/membership/status`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  return data;
};

// 获取预测列表
export const getPredictions = async () => {
  const response = await fetch(`${API_BASE_URL}/api/predictions`);
  const data = await response.json();
  return data.data;
};

// 创建预测
export const createPrediction = async (predictionData) => {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}/api/predictions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(predictionData)
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || '创建失败');
  }

  return data.data;
};

// 投票
export const votePrediction = async (predictionId, optionIndex, amount, txHash) => {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}/api/predictions/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ predictionId, optionIndex, amount, txHash })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || '投票失败');
  }

  return data;
};

// 获取预测详情
export const getPredictionDetail = async (predictionId) => {
  const response = await fetch(`${API_BASE_URL}/api/predictions/${predictionId}`);
  const data = await response.json();
  return data.data;
};

export { getToken, getUser, saveUser, clearUser };
