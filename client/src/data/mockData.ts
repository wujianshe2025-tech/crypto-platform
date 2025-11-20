export const mockCryptoPrices = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', current_price: 43250.50, price_change_percentage_24h: 2.45, market_cap: 845000000000 },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', current_price: 2280.30, price_change_percentage_24h: -1.23, market_cap: 274000000000 },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', current_price: 315.80, price_change_percentage_24h: 3.67, market_cap: 48500000000 },
  { id: 'solana', symbol: 'SOL', name: 'Solana', current_price: 98.45, price_change_percentage_24h: 5.12, market_cap: 42000000000 },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', current_price: 0.62, price_change_percentage_24h: -0.85, market_cap: 33500000000 },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', current_price: 0.58, price_change_percentage_24h: 1.92, market_cap: 20400000000 },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', current_price: 0.095, price_change_percentage_24h: 4.23, market_cap: 13500000000 },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', current_price: 7.32, price_change_percentage_24h: -2.15, market_cap: 9800000000 },
];

export const mockNews = [
  {
    _id: '1',
    title: 'Bitcoin突破43000美元大关，创两个月新高',
    content: '比特币价格在今日凌晨突破43000美元，市场情绪高涨，分析师认为这是牛市信号的开始。',
    category: 'breaking',
    sentiment: 'bullish',
    source: '加密财经',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    views: 1523
  },
  {
    _id: '2',
    title: '以太坊2.0质押量突破3200万ETH',
    content: '以太坊网络质押量持续增长，显示出投资者对网络长期发展的信心。',
    category: 'important',
    sentiment: 'bullish',
    source: 'ETH News',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    views: 892
  },
  {
    _id: '3',
    title: '美国SEC推迟比特币ETF审批决定',
    content: 'SEC再次推迟对多个比特币现货ETF的审批决定，市场短期承压。',
    category: 'important',
    sentiment: 'bearish',
    source: '华尔街日报',
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    views: 2341
  },
  {
    _id: '4',
    title: 'Solana生态DeFi锁仓量创历史新高',
    content: 'Solana链上DeFi协议总锁仓量突破40亿美元，生态发展迅速。',
    category: 'realtime',
    sentiment: 'bullish',
    source: 'DeFi Pulse',
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    views: 654
  },
  {
    _id: '5',
    title: '某交易所遭黑客攻击，损失超1亿美元',
    content: '一家中型加密货币交易所今日遭遇黑客攻击，初步估计损失超过1亿美元，平台已暂停提现。',
    category: 'breaking',
    sentiment: 'bearish',
    source: '安全快讯',
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
    views: 3421
  }
];

export const mockPosts = [
  {
    _id: '1',
    userId: { username: '加密老韭菜', avatar: '' },
    content: '刚刚抄底了一些ETH，感觉2300是个不错的入场点位。大家怎么看？',
    images: [],
    likes: ['u1', 'u2', 'u3'],
    comments: [
      { userId: { username: '币圈新手' }, content: '我也想买，但是怕继续跌', createdAt: new Date(Date.now() - 1800000).toISOString() },
      { userId: { username: '技术分析师' }, content: '从技术面看，这个位置确实有支撑', createdAt: new Date(Date.now() - 900000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    _id: '2',
    userId: { username: 'DeFi玩家', avatar: '' },
    content: '最近在研究Solana上的新项目，收益率真的很香！有没有一起的？',
    images: [],
    likes: ['u4', 'u5'],
    comments: [
      { userId: { username: '风险厌恶者' }, content: '注意风险，很多项目都是土狗', createdAt: new Date(Date.now() - 1200000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    _id: '3',
    userId: { username: '比特币信仰者', avatar: '' },
    content: 'BTC才是真正的数字黄金，其他都是山寨币。长期持有才是王道！💎🙌',
    images: [],
    likes: ['u1', 'u6', 'u7', 'u8'],
    comments: [],
    createdAt: new Date(Date.now() - 10800000).toISOString()
  }
];

export const mockPredictions = [
  {
    _id: '1',
    creatorId: { username: '预测大师' },
    title: 'BTC在2024年1月底能否突破50000美元？',
    description: '根据当前市场走势和技术指标，预测比特币价格走向',
    type: 'price',
    options: [
      { text: '能突破50000美元', votes: ['u1', 'u2', 'u3', 'u4', 'u5'] },
      { text: '不能突破50000美元', votes: ['u6', 'u7'] }
    ],
    targetCoin: 'bitcoin',
    targetPrice: 50000,
    deadline: new Date(Date.now() + 2592000000).toISOString(),
    status: 'active',
    rewardPool: 500,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: '2',
    creatorId: { username: '市场观察者' },
    title: '美联储下次会议会降息吗？',
    description: '预测美联储货币政策对加密市场的影响',
    type: 'event',
    options: [
      { text: '会降息', votes: ['u1', 'u3', 'u5', 'u7', 'u9', 'u10'] },
      { text: '维持不变', votes: ['u2', 'u4', 'u6'] },
      { text: '会加息', votes: ['u8'] }
    ],
    deadline: new Date(Date.now() + 1296000000).toISOString(),
    status: 'active',
    rewardPool: 300,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    _id: '3',
    creatorId: { username: '以太坊爱好者' },
    title: 'ETH能在本周突破2500美元吗？',
    description: '以太坊最近表现强劲，大家觉得能否继续上涨？',
    type: 'price',
    options: [
      { text: '能突破2500', votes: ['u2', 'u4', 'u6', 'u8'] },
      { text: '不能突破2500', votes: ['u1', 'u3', 'u5', 'u7', 'u9'] }
    ],
    targetCoin: 'ethereum',
    targetPrice: 2500,
    deadline: new Date(Date.now() + 604800000).toISOString(),
    status: 'active',
    rewardPool: 200,
    createdAt: new Date(Date.now() - 259200000).toISOString()
  }
];
