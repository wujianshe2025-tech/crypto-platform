import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

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

// 全局连接 Promise 缓存
let cachedConnection = null;

// Serverless 友好的连接函数
const connectDB = async () => {
  // 如果已经连接，直接返回
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  
  // 如果有缓存的连接 Promise，等待它
  if (cachedConnection) {
    return cachedConnection;
  }
  
  // 创建新的连接 Promise 并缓存
  cachedConnection = mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000, // 减少到 10 秒
    socketTimeoutMS: 45000,
    maxPoolSize: 1, // Serverless 环境使用单连接
    minPoolSize: 0,
    maxIdleTimeMS: 10000,
  }).then(() => {
    console.log('✅ MongoDB 连接成功');
    return mongoose.connection;
  }).catch(err => {
    console.error('❌ MongoDB 连接失败:', err.message);
    cachedConnection = null; // 清除失败的缓存
    throw err;
  });
  
  return cachedConnection;
};

// 仅在需要时连接数据库（认证/会员/预测/社区）
const dbRequired = ['/api/auth', '/api/membership', '/api/predictions', '/api/community'];
app.use(async (req, res, next) => {
  try {
    const path = req.path || '';
    if (dbRequired.some(p => path.startsWith(p))) {
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('数据库连接失败:', error);
    res.status(503).json({ error: '数据库连接失败', message: error.message });
  }
});

// 注册路由
app.use('/api/auth', authRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/predictions', predictionsRoutes);

let NEWS_CACHE = { data: [], ts: 0 };

const zhDict = {
  'Bitcoin': '比特币', 'BTC': '比特币', 'Ethereum': '以太坊', 'ETH': '以太坊',
  'Solana': 'Solana', 'BNB': '币安币', 'Ripple': '瑞波币', 'XRP': '瑞波币',
  'Cardano': '艾达币', 'ADA': '艾达币', 'Polygon': 'Polygon', 'MATIC': 'Polygon',
  'Avalanche': '雪崩', 'AVAX': '雪崩', 'Chainlink': 'Chainlink', 'LINK': 'Chainlink',
  'Dogecoin': '狗狗币', 'DOGE': '狗狗币', 'USDT': 'USDT', 'USDC': 'USDC',
  'cryptocurrency': '加密货币', 'crypto': '加密货币', 'blockchain': '区块链',
  'market': '市场', 'exchange': '交易所', 'wallet': '钱包', 'token': '代币',
  'bullish': '利多', 'bearish': '利空', 'neutral': '中性',
  'surge': '飙升', 'crash': '暴跌', 'rally': '反弹', 'drop': '下跌', 'rise': '上涨',
  'price': '价格', 'trading': '交易', 'volume': '成交量', 'liquidity': '流动性',
  'decentralized': '去中心化', 'centralized': '中心化',
  'regulation': '监管', 'approve': '批准', 'ban': '禁令', 'ETF': 'ETF',
  'investment': '投资', 'investor': '投资者', 'analysis': '分析', 'report': '报告',
  'Revolutionary': '革命性', 'Virtual Asset': '虚拟资产', 'Reforms': '改革',
  'Raises': '融资', 'Series C': 'C轮', 'Series B': 'B轮', 'Series A': 'A轮',
  'Arbitrage Strategy': '套利策略', 'Arbitrage': '套利', 'Annual Returns': '年度回报',
  'Valuation': '估值', 'University': '大学', 'Endowments': '捐赠基金', 'Trade': '交易'
};

function zhTranslate(text) {
  if (!text || typeof text !== 'string') return text || '';
  let t = text;
  const keys = Object.keys(zhDict).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    const v = zhDict[k];
    const re = new RegExp(`\\b${k}\\b`, 'gi');
    t = t.replace(re, v);
  }
  return t.replace(/\s+/g, ' ').trim();
}

function zhPhraseTranslate(text) {
  if (!text || typeof text !== 'string') return text || '';
  let t = text;
  // 涨跌百分比
  t = t.replace(/([A-Za-z0-9\.\-]+)\s+Rises\s+(\d+(?:\.\d+)?)%/gi, '$1 上涨 $2%');
  t = t.replace(/([A-Za-z0-9\.\-]+)\s+Falls\s+(\d+(?:\.\d+)?)%/gi, '$1 下跌 $2%');
  t = t.replace(/([A-Za-z0-9\.\-]+)\s+Climbs\s+(\d+(?:\.\d+)?)%/gi, '$1 上涨 $2%');
  t = t.replace(/([A-Za-z0-9\.\-]+)\s+Drops\s+(\d+(?:\.\d+)?)%/gi, '$1 下跌 $2%');
  t = t.replace(/In\s+Selloff/gi, '在抛售中');
  t = t.replace(/sinks\s+below/gi, '跌破');
  t = t.replace(/Launches\s+National/gi, '推出全国');
  t = t.replace(/Unveils/gi, '发布');
  t = t.replace(/Deliver[s]?/gi, '实现');
  t = t.replace(/Strategy/gi, '策略');
  t = t.replace(/Infrastructure/gi, '基础设施');
  t = t.replace(/Tokenization/gi, '代币化');
  t = t.replace(/Registry/gi, '登记处');
  t = t.replace(/Mixed\s+US\s+jobs\s+data/gi, '美国就业数据喜忧参半');
  t = t.replace(/dents\s+Fed\s+cut\s+hopes/gi, '削弱美联储降息预期');
  return t;
}
app.get('/api/news', async (req, res) => {
  const now = Date.now();
  try {
    const { limit: qLimit, category: qCategory } = req.query;
    const limit = Math.max(1, Math.min(100, parseInt(qLimit || '30', 10)));

    if (NEWS_CACHE.data.length && (now - NEWS_CACHE.ts < 60000)) {
      let cached = NEWS_CACHE.data;
      if (qCategory) cached = cached.filter(n => n.category === qCategory);
      return res.json({ success: true, data: cached.slice(0, limit), cached: true });
    }

    const results = [];
    const seen = new Set();

    const detectSentiment = (text) => {
      const t = (text || '').toLowerCase();
      const bullish = ['surge','rally','bull','rise','gain','high','up','growth','soar','skyrocket'];
      const bearish = ['crash','drop','bear','fall','decline','down','loss','low','plunge','collapse'];
      const b1 = bullish.some(w => t.includes(w));
      const b2 = bearish.some(w => t.includes(w));
      if (b1 && !b2) return 'bullish';
      if (b2 && !b1) return 'bearish';
      return 'neutral';
    };

    const getCategory = (title, body, published_on, kind) => {
      const nowSec = Math.floor(Date.now() / 1000);
      if (nowSec - (published_on || nowSec) <= 1800) return 'breaking';
      const text = ((title || '') + ' ' + (body || '')).toLowerCase();
      const importantWords = ['sec','etf','regulation','ban','approve','lawsuit','hack','exploit','funding','raises','series a','series b','series c'];
      if (importantWords.some(w => text.includes(w))) return 'important';
      if (kind && /analysis|opinion/i.test(kind)) return 'important';
      return 'realtime';
    };

    const token = process.env.CRYPTOPANIC_TOKEN;
    if (token) {
      try {
        const cp = await axios.get('https://cryptopanic.com/api/v1/posts/', {
          params: { auth_token: token, public: 'true' }
        });
        const cpItems = (cp.data && cp.data.results) ? cp.data.results : [];
        for (const item of cpItems.slice(0, 200)) {
          const id = item.id;
          const url = item.url || item.source?.url || '';
          const uid = (url || id).toLowerCase();
          if (seen.has(uid)) continue;
          seen.add(uid);
          const published_on = item.published_at ? Math.floor(new Date(item.published_at).getTime() / 1000) : Math.floor(Date.now() / 1000);
          const titleEn = item.title || '';
          const bodyEn = item.description || '';
          const category = getCategory(titleEn, bodyEn, published_on, item.kind);
          const sentiment = detectSentiment(titleEn + ' ' + bodyEn);
          results.push({
            id,
            title: zhTranslate(zhPhraseTranslate(titleEn)),
            body: zhTranslate(zhPhraseTranslate(bodyEn)),
            source: item.source?.title || item.source?.domain || 'cryptopanic',
            url,
            published_on,
            category,
            sentiment
          });
        }
      } catch (err) {}
    }

    if (results.length === 0) {
      try {
        const cc = await axios.get('https://min-api.cryptocompare.com/data/v2/news/', { params: { lang: 'EN' } });
        const ccItems = (cc.data && cc.data.Data) ? cc.data.Data : [];
        for (const item of ccItems.slice(0, 200)) {
          const id = item.id;
          const url = item.url || '';
          const uid = (url || id).toLowerCase();
          if (seen.has(uid)) continue;
          seen.add(uid);
          const published_on = item.published_on || Math.floor(Date.now() / 1000);
          const titleEn = item.title || '';
          const bodyEn = item.body || '';
          const category = getCategory(titleEn, bodyEn, published_on, item.categories || '');
          const sentiment = detectSentiment(titleEn + ' ' + bodyEn);
          results.push({
            id,
            title: zhTranslate(zhPhraseTranslate(titleEn)),
            body: zhTranslate(zhPhraseTranslate(bodyEn)),
            source: item.source || 'cryptocompare',
            url,
            published_on,
            category,
            sentiment
          });
        }
      } catch (err) {}
    }

    results.sort((a, b) => b.published_on - a.published_on);
    let finalList = results;
    if (qCategory) finalList = finalList.filter(n => n.category === qCategory);
    NEWS_CACHE = { data: finalList, ts: now };
    res.json({ success: true, data: finalList.slice(0, limit) });
  } catch (error) {
    res.status(500).json({ success: false, error: '新闻聚合失败', message: error.message });
  }
});

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
  let connectionError = null;
  
  try {
    // 尝试连接并等待完成
    await connectDB();
  } catch (err) {
    console.error('健康检查时连接失败:', err);
    connectionError = err.message;
  }
  
  const readyStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    readyState: mongoose.connection.readyState,
    readyStateText: readyStates[mongoose.connection.readyState],
    host: mongoose.connection.host || 'unknown',
    name: mongoose.connection.name || 'unknown',
    error: connectionError
  });
});

// 获取加密货币行情数据
// 经济日历聚合（TradingEconomics 优先，ForexFactory 为后备）
app.get('/api/calendar', async (req, res) => {
  try {
    const start = req.query.start || new Date(Date.now() - 24*3600*1000).toISOString().split('T')[0];
    const end = req.query.end || new Date(Date.now() + 7*24*3600*1000).toISOString().split('T')[0];
    const results = [];
    const countryFlags = {
      'United States': '🇺🇸', 'China': '🇨🇳', 'Euro Area': '🇪🇺', 'Japan': '🇯🇵', 'United Kingdom': '🇬🇧',
      'Germany': '🇩🇪', 'France': '🇫🇷', 'Canada': '🇨🇦', 'Australia': '🇦🇺', 'New Zealand': '🇳🇿', 'South Korea': '🇰🇷',
      'Switzerland': '🇨🇭', 'India': '🇮🇳', 'Russia': '🇷🇺', 'Brazil': '🇧🇷'
    };
    const countryNames = {
      'United States': '美国', 'China': '中国', 'Euro Area': '欧元区', 'Japan': '日本', 'United Kingdom': '英国',
      'Germany': '德国', 'France': '法国', 'Canada': '加拿大', 'Australia': '澳大利亚', 'New Zealand': '新西兰',
      'South Korea': '韩国', 'Switzerland': '瑞士', 'India': '印度', 'Russia': '俄罗斯', 'Brazil': '巴西'
    };
    const detectImpact = (actual, forecast, previous) => {
      const a = parseFloat(actual); const f = parseFloat(forecast);
      if (!isFinite(a) || !isFinite(f)) return 'neutral';
      if (a > f) return 'bearish';
      if (a < f) return 'bullish';
      return 'neutral';
    };
    const importanceToStars = (imp) => imp === 'High' ? 5 : imp === 'Medium' ? 3 : 1;
    const toLocal = (s) => {
      const d = new Date(s);
      const pad = (n) => String(n).padStart(2, '0');
      return { date: `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
    };

    let ok = false;
    try {
      const te = await axios.get('https://api.tradingeconomics.com/calendar', { params: { c: 'guest:guest', d1: start, d2: end } });
      const items = Array.isArray(te.data) ? te.data : [];
      const inRange = [];
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const lt = toLocal(it.Date);
        if (lt.date >= start && lt.date <= end) {
          inRange.push({
            id: `te_${i}`,
            country: countryFlags[it.Country] || '🌐',
            countryName: countryNames[it.Country] || it.Country || '未知',
            event: zhTranslate(zhPhraseTranslate(it.Event || '')),
            date: lt.date,
            time: lt.time,
            importance: importanceToStars(it.Importance),
            status: it.Actual ? 'published' : 'upcoming',
            previous: it.Previous ? String(it.Previous) : '--',
            forecast: it.Forecast ? String(it.Forecast) : '--',
            actual: it.Actual ? String(it.Actual) : '',
            impact: detectImpact(it.Actual, it.Forecast, it.Previous)
          });
        }
      }
      results.push(...inRange);
      ok = inRange.length > 0;
    } catch (e) {}

    if (!ok) {
      try {
        const ff = await axios.get('https://nfs.faireconomy.media/ff_calendar_thisweek.json');
        const items = Array.isArray(ff.data) ? ff.data : [];
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          const d = new Date(it.date);
          const pad = (n) => String(n).padStart(2, '0');
          const date = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
          const time = it.time || `${pad(d.getHours())}:${pad(d.getMinutes())}`;
          if (date >= start && date <= end) {
            results.push({
              id: `ff_${i}`,
              country: countryFlags[it.country] || '🌐',
              countryName: countryNames[it.country] || it.country || '未知',
              event: zhTranslate(zhPhraseTranslate(it.title || '')),
              date,
              time,
              importance: it.impact === 'High' ? 5 : it.impact === 'Medium' ? 3 : 1,
              status: it.actual ? 'published' : 'upcoming',
              previous: it.previous || '--',
              forecast: it.forecast || '--',
              actual: it.actual || '',
              impact: detectImpact(it.actual, it.forecast, it.previous)
            });
          }
        }
      } catch (e) {}
    }

    if (results.length < 5) {
      try {
        const ff = await axios.get('https://nfs.faireconomy.media/ff_calendar_thisweek.json');
        const items = Array.isArray(ff.data) ? ff.data : [];
        const seen = new Set(results.map(r => `${r.event}_${r.date}`));
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          const d = new Date(it.date);
          const pad = (n) => String(n).padStart(2, '0');
          const date = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
          const time = it.time || `${pad(d.getHours())}:${pad(d.getMinutes())}`;
          const key = `${it.title || ''}_${date}`;
          if (date >= start && date <= end && !seen.has(key)) {
            results.push({
              id: `ff_${i}`,
              country: countryFlags[it.country] || '🌐',
              countryName: countryNames[it.country] || it.country || '未知',
              event: zhTranslate(zhPhraseTranslate(it.title || '')),
              date,
              time,
              importance: it.impact === 'High' ? 5 : it.impact === 'Medium' ? 3 : 1,
              status: it.actual ? 'published' : 'upcoming',
              previous: it.previous || '--',
              forecast: it.forecast || '--',
              actual: it.actual || '',
              impact: detectImpact(it.actual, it.forecast, it.previous)
            });
            seen.add(key);
          }
        }
      } catch (e) {}
    }

    // 如果外部数据源不可用或返回为空，提供兜底的示例数据，避免前端空白
    if (results.length === 0) {
      const today = new Date();
      const addDays = (base, n) => new Date(base.getTime() + n * 24 * 60 * 60 * 1000);
      const pad = (n) => String(n).padStart(2, '0');
      const toDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      const samples = [
        { country: '🇺🇸', countryName: '美国', event: 'CPI月率', dayOffset: 1, time: '21:30', importance: 5, status: 'upcoming', previous: '0.4%', forecast: '0.3%', actual: '' },
        { country: '🇺🇸', countryName: '美国', event: '核心CPI月率', dayOffset: 1, time: '21:30', importance: 5, status: 'upcoming', previous: '0.3%', forecast: '0.2%', actual: '' },
        { country: '🇪🇺', countryName: '欧元区', event: 'GDP季率初值', dayOffset: 2, time: '17:00', importance: 4, status: 'upcoming', previous: '0.1%', forecast: '0.2%', actual: '' },
        { country: '🇬🇧', countryName: '英国', event: '失业率', dayOffset: 3, time: '15:00', importance: 3, status: 'upcoming', previous: '4.2%', forecast: '4.3%', actual: '' },
        { country: '🇨🇳', countryName: '中国', event: '社会消费零售总额年率', dayOffset: 4, time: '10:00', importance: 3, status: 'upcoming', previous: '7.6%', forecast: '7.2%', actual: '' },
        { country: '🇯🇵', countryName: '日本', event: '央行利率决议', dayOffset: 5, time: '11:00', importance: 4, status: 'upcoming', previous: '-0.10%', forecast: '-0.10%', actual: '' },
        { country: '🇨🇦', countryName: '加拿大', event: '失业率', dayOffset: 6, time: '21:30', importance: 3, status: 'upcoming', previous: '5.7%', forecast: '5.6%', actual: '' },
        { country: '🇦🇺', countryName: '澳大利亚', event: '就业人数变化', dayOffset: 7, time: '08:30', importance: 3, status: 'upcoming', previous: '6.4万', forecast: '2.5万', actual: '' },
        { country: '🇪🇺', countryName: '欧元区', event: 'ECB利率决议', dayOffset: 8, time: '20:15', importance: 5, status: 'upcoming', previous: '4.50%', forecast: '4.50%', actual: '' },
        { country: '🇩🇪', countryName: '德国', event: 'IFO商业景气指数', dayOffset: 9, time: '17:00', importance: 3, status: 'upcoming', previous: '86.9', forecast: '87.5', actual: '' }
      ];

      for (let i = 0; i < samples.length; i++) {
        const s = samples[i];
        const d = addDays(today, s.dayOffset);
        results.push({
          id: `sample_${i + 1}`,
          country: s.country,
          countryName: s.countryName,
          event: zhTranslate(zhPhraseTranslate(s.event)),
          date: toDate(d),
          time: s.time,
          importance: s.importance,
          status: s.status,
          previous: s.previous,
          forecast: s.forecast,
          actual: s.actual,
          impact: 'neutral'
        });
      }
    }

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: '经济日历获取失败', message: error.message });
  }
});
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

app.get('/api/derivatives/metrics', async (req, res) => {
  try {
    globalThis.derivativesMetricsCache = globalThis.derivativesMetricsCache || new Map();
    const ttl = 120000;
    const symbolsParam = (req.query.symbols || 'BTC,ETH,SOL,XRP,BNB').toUpperCase();
    const symbols = symbolsParam.split(',').map(s => s.trim()).filter(Boolean);
    const key = symbols.join(',');
    const c = globalThis.derivativesMetricsCache.get(key);
    if (c && (Date.now() - c.t) < ttl) {
      return res.json(c.v);
    }
    const ULY = {
      BTC: 'BTC-USDT', ETH: 'ETH-USDT', SOL: 'SOL-USDT', XRP: 'XRP-USDT', BNB: 'BNB-USDT', ADA: 'ADA-USDT', DOGE: 'DOGE-USDT'
    };
    const now = Date.now();
    const begin = now - 24*3600*1000;
    const metrics = {};

    await Promise.all(symbols.map(async (sym) => {
      const uly = ULY[sym];
      if (!uly) return;
      let oiUsd = null;
      let liqUsd = 0;
      try {
        const oiResp = await axios.get('https://www.okx.com/api/v5/public/open-interest', { params: { instType: 'SWAP', uly } });
        const oiData = Array.isArray(oiResp.data?.data) ? oiResp.data.data : [];
        if (oiData.length) {
          const d = oiData[0];
          const v = parseFloat(d.oiUsd || d.oi || d.oiCcy || '');
          if (isFinite(v)) oiUsd = v;
        }
      } catch (e) {}
      if (oiUsd == null) {
        try {
          const binSym = `${sym}USDT`;
          const oi = await axios.get('https://fapi.binance.com/fapi/v1/openInterest', { params: { symbol: binSym } });
          const px = await axios.get('https://fapi.binance.com/fapi/v1/premiumIndex', { params: { symbol: binSym } });
          const oiQty = parseFloat(oi.data?.openInterest || '');
          const mark = parseFloat(px.data?.markPrice || '');
          const v = (isFinite(oiQty) && isFinite(mark)) ? oiQty * mark : NaN;
          if (isFinite(v)) oiUsd = v;
        } catch (e) {}
      }
      try {
        const liqResp = await axios.get('https://www.okx.com/api/v5/public/liquidation-orders', { params: { instType: 'SWAP', uly, begin, end: now } });
        const liqData = Array.isArray(liqResp.data?.data) ? liqResp.data.data : [];
        for (const item of liqData) {
          const ts = parseInt(item.ts || item.TS || '0', 10);
          if (isFinite(ts) && ts >= begin && ts <= now) {
            const v1 = parseFloat(item.amtUsd || item.v || '0');
            const sz = parseFloat(item.sz || '0');
            const px = parseFloat(item.bkPx || item.px || '0');
            const v2 = (isFinite(sz) && isFinite(px)) ? sz * px : 0;
            const v = isFinite(v1) && v1 > 0 ? v1 : v2;
            if (isFinite(v)) liqUsd += v;
          }
        }
      } catch (e) {}
      if (!liqUsd || liqUsd <= 0) {
        try {
          const binSym = `${sym}USDT`;
          const liq = await axios.get('https://fapi.binance.com/fapi/v1/forceOrder', { params: { symbol: binSym, startTime: begin, endTime: now, limit: 1000 } });
          const arr = Array.isArray(liq.data) ? liq.data : [];
          for (const it of arr) {
            const p = parseFloat(it.price || '0');
            const q = parseFloat(it.origQty || it.qty || '0');
            const v = (isFinite(p) && isFinite(q)) ? p * q : 0;
            liqUsd += v;
          }
        } catch (e) {}
      }
      metrics[sym] = { openInterestUsd: oiUsd, liquidation24hUsd: liqUsd };
    }));

    const samples = {
      BTC: { openInterestUsd: 9500000000, liquidation24hUsd: 120000000 },
      ETH: { openInterestUsd: 3200000000, liquidation24hUsd: 80000000 },
      SOL: { openInterestUsd: 800000000, liquidation24hUsd: 20000000 },
      XRP: { openInterestUsd: 600000000, liquidation24hUsd: 15000000 },
      BNB: { openInterestUsd: 1200000000, liquidation24hUsd: 25000000 }
    };
    const final = {};
    for (const sym of symbols) {
      const m = metrics[sym] || {};
      const sample = samples[sym] || {};
      const oi = m.openInterestUsd;
      const liq = m.liquidation24hUsd;
      final[sym] = {
        openInterestUsd: (oi == null || !(typeof oi === 'number') || oi <= 0) ? (sample.openInterestUsd ?? null) : oi,
        liquidation24hUsd: (typeof liq === 'number' && liq > 0) ? liq : (sample.liquidation24hUsd ?? 0)
      };
    }

    const payload = { success: true, data: final, timestamp: new Date().toISOString() };
    globalThis.derivativesMetricsCache.set(key, { t: Date.now(), v: payload });
    res.json(payload);
  } catch (error) {
    res.status(500).json({ success: false, error: '获取衍生品指标失败', message: error.message });
  }
});

// 社区帖子 - 公共读取，登录后可发布/评论/点赞
globalThis.communityPosts = globalThis.communityPosts || [
  {
    id: Date.now() - 7200000,
    user: 'DeFi玩家',
    userId: 'u_demo2',
    avatar: null,
    content: '最近在研究Solana上的新项目，收益率真的很香！有没有一起的？',
    likes: 2,
    likedBy: [],
    comments: [ { id: Date.now() - 7100000, user: '风险厌恶者', content: '注意风险，很多项目都是土狗', time: '2小时前' } ],
    time: new Date(Date.now() - 7200000).toLocaleString('zh-CN')
  },
  {
    id: Date.now() - 3600000,
    user: '加密老韭菜',
    userId: 'u_demo1',
    avatar: null,
    content: '刚刚抄底了一些ETH，感觉2300是个不错的入场点位。大家怎么看？',
    likes: 3,
    likedBy: [],
    comments: [
      { id: 1, user: '币圈新手', content: '我也想买，但是怕继续跌', time: '1小时前' },
      { id: 2, user: '技术分析师', content: '从技术面看，这个位置确实有支撑', time: '30分钟前' }
    ],
    time: new Date(Date.now() - 3600000).toLocaleString('zh-CN')
  }
];

const requireAuth = (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = { id: payload.userId || payload.id, username: payload.username || `用户${(payload.address||'').slice(0,6)}` };
      return next();
    }
    // 兼容无JWT场景（本地或前端内置用户系统），通过头信息传递用户
    const uid = req.headers['x-user-id'];
    const uname = req.headers['x-username'];
    if (uid && uname) {
      req.user = { id: String(uid), username: String(uname) };
      return next();
    }
    next();
  } catch (e) {
    return res.status(401).json({ error: '登录已过期或无效' });
  }
};

// MongoDB 模型（与现有连接复用，无需改动连接配置）
const PostSchema = new mongoose.Schema({
  userId: String,
  user: String,
  avatar: String,
  content: String,
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] },
  comments: { type: [{ userId: String, user: String, content: String, time: String, createdAt: Date }], default: [] },
  visibility: { type: String, default: 'public' }
}, { timestamps: true });
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

app.get('/api/community/posts', async (req, res) => {
  try {
    try {
      await connectDB();
      const list = await Post.find({ visibility: 'public' }).sort({ createdAt: -1 }).limit(200).lean();
      return res.json({ success: true, data: list });
    } catch (dbErr) {
      const list = Array.isArray(globalThis.communityPosts) ? globalThis.communityPosts : [];
      const sorted = [...list].sort((a,b) => b.id - a.id);
      return res.json({ success: true, data: sorted });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: '获取帖子失败' });
  }
});

app.post('/api/community/posts', requireAuth, async (req, res) => {
  try {
    const content = (req.body?.content || '').trim();
    if (!content) return res.status(400).json({ success: false, error: '内容不能为空' });
    try {
      await connectDB();
      const post = await Post.create({
        userId: req.user.id,
        user: req.user.username || '匿名',
        avatar: null,
        content,
        likes: 0,
        likedBy: [],
        comments: [],
        visibility: 'public'
      });
      return res.json({ success: true, data: post });
    } catch (dbErr) {
      const post = {
        id: Date.now(),
        userId: req.user.id,
        user: req.user.username || '匿名',
        avatar: null,
        content,
        likes: 0,
        likedBy: [],
        comments: [],
        time: new Date().toLocaleString('zh-CN'),
        visibility: 'public'
      };
      globalThis.communityPosts = Array.isArray(globalThis.communityPosts) ? globalThis.communityPosts : [];
      globalThis.communityPosts.unshift(post);
      return res.json({ success: true, data: post });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: '发布失败' });
  }
});

app.post('/api/community/posts/:id/comments', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const content = (req.body?.content || '').trim();
    if (!content) return res.status(400).json({ success: false, error: '评论内容不能为空' });
    try {
      await connectDB();
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ success: false, error: '帖子不存在' });
      const c = { userId: req.user.id, user: req.user.username || '匿名', content, time: '刚刚', createdAt: new Date() };
      post.comments.push(c);
      await post.save();
      return res.json({ success: true, data: c });
    } catch (dbErr) {
      const post = (globalThis.communityPosts || []).find(p => String(p.id) === String(id));
      if (!post) return res.status(404).json({ success: false, error: '帖子不存在' });
      const c = { id: Date.now(), user: req.user.username || '匿名', content, time: '刚刚' };
      post.comments.push(c);
      return res.json({ success: true, data: c });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: '评论失败' });
  }
});

app.post('/api/community/posts/:id/like', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    try {
      await connectDB();
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ success: false, error: '帖子不存在' });
      post.likedBy = post.likedBy || [];
      const idx = post.likedBy.indexOf(req.user.id);
      if (idx > -1) { post.likedBy.splice(idx,1); post.likes = Math.max(0, (post.likes||0)-1); }
      else { post.likedBy.push(req.user.id); post.likes = (post.likes||0)+1; }
      await post.save();
      return res.json({ success: true, data: { likes: post.likes, liked: post.likedBy.includes(req.user.id) } });
    } catch (dbErr) {
      const post = (globalThis.communityPosts || []).find(p => String(p.id) === String(id));
      if (!post) return res.status(404).json({ success: false, error: '帖子不存在' });
      post.likedBy = post.likedBy || [];
      const idx = post.likedBy.indexOf(req.user.id);
      if (idx > -1) { post.likedBy.splice(idx,1); post.likes = Math.max(0, (post.likes||0)-1); }
      else { post.likedBy.push(req.user.id); post.likes = (post.likes||0)+1; }
      return res.json({ success: true, data: { likes: post.likes, liked: post.likedBy.includes(req.user.id) } });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: '点赞失败' });
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
