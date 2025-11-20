import { useEffect, useState } from 'react';
import { fetchCryptoPrices, CryptoPrice } from '../services/api';

export default function Dashboard() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // 获取真实价格数据
  const loadPrices = async () => {
    try {
      setError(null);
      const data = await fetchCryptoPrices();
      setPrices(data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      setError('获取数据失败，请稍后重试');
      setLoading(false);
    }
  };

  useEffect(() => {
    // 首次加载
    loadPrices();

    // 每30秒自动刷新一次真实数据
    const interval = setInterval(() => {
      loadPrices();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">加载真实数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={loadPrices}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">实时行情</h1>
        <div className="flex items-center space-x-4">
          <button 
            onClick={loadPrices}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition"
          >
            🔄 刷新
          </button>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>最后更新: {lastUpdate.toLocaleTimeString('zh-CN')}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">排名</th>
              <th className="px-6 py-3 text-left">币种</th>
              <th className="px-6 py-3 text-right">价格 (USD)</th>
              <th className="px-6 py-3 text-right">24h 涨跌</th>
              <th className="px-6 py-3 text-right">市值</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((coin, index) => (
              <tr key={coin.id} className="border-t border-gray-700 hover:bg-gray-750 transition">
                <td className="px-6 py-4 text-gray-400">#{index + 1}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className="font-semibold">{coin.name}</span>
                    <span className="ml-2 text-gray-400 uppercase">{coin.symbol}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono">
                  ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className={`px-6 py-4 text-right font-semibold ${
                  coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </td>
                <td className="px-6 py-4 text-right text-gray-400">
                  ${(coin.market_cap / 1e9).toFixed(2)}B
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
        <p className="text-sm text-green-300">
          ✅ <strong>真实数据：</strong>价格数据来自 CoinGecko API，每30秒自动更新
        </p>
      </div>
    </div>
  );
}
