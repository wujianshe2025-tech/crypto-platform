// API工具函数

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
