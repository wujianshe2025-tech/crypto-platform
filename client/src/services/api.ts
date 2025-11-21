// CoinGecko API 服务
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image?: string;
}

// 获取加密货币实时价格
export async function fetchCryptoPrices(): Promise<CryptoPrice[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch crypto prices');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    throw error;
  }
}

// 获取单个币种详细信息
export async function fetchCoinDetails(coinId: string) {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch coin details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching coin details:', error);
    throw error;
  }
}

// 获取加密货币新闻（优先后端聚合）
export async function fetchCryptoNews() {
  try {
    const apiBase = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
      ? 'http://localhost:3000'
      : 'https://crypto-platform-api.vercel.app';
    const response = await fetch(`${apiBase}/api/news`);
    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}

// 获取全球加密市场数据
export async function fetchGlobalMarketData() {
  try {
    const response = await fetch(`${COINGECKO_API}/global`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch global market data');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching global market data:', error);
    throw error;
  }
}
