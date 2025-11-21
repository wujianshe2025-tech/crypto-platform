import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // 传统登录方式
  username: {
    type: String,
    unique: true,
    sparse: true, // 允许 null，但如果有值则必须唯一
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    select: false // 默认查询时不返回密码
  },
  
  // 钱包登录方式（可选）
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  
  // 用户信息
  displayName: {
    type: String,
    default: function() {
      if (this.username) return this.username;
      if (this.walletAddress) return `用户${this.walletAddress.slice(0, 6)}`;
      return '匿名用户';
    }
  },
  avatar: String,
  
  // 会员信息
  isMember: {
    type: Boolean,
    default: false
  },
  membershipDate: Date,
  membershipTxHash: String,
  membershipExpiry: Date, // 会员到期时间
  
  // 时间戳
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  // 如果密码被修改，则加密
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  next();
});

// 验证密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
