import { useState, useEffect } from 'react';
import { fetchCryptoNews } from '../services/api';

interface NewsItem {
  id: string;
  title: string;
  body: string;
  source: string;
  published_on: number;
  imageurl?: string;
  url: string;
  categories?: string;
}

const categoryLabels: Record<string, string> = {
  realtime: '实时新闻',
  important: '重要事件',
  breaking: '突发事件'
};

const sentimentLabels: Record<string, { text: string; color: string }> = {
  bullish: { text: '利多 📈', color: 'bg-green-500' },
  bearish: { text: '利空 📉', color: 'bg-red-500' },
  neutral: { text: '中性', color: 'bg-gray-500' }
};

export default function News() {
  const [category, setCategory] = useState('');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNews = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchCryptoNews();
      setNews(data.slice(0, 20)); // 只显示前20条
      setLoading(false);
    } catch (err) {
      setError('获取新闻失败，请稍后重试');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);
  
  const filteredNews = category 
    ? news.filter(item => item.categories?.toLowerCase().includes(category.toLowerCase()))
    : news;

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp * 1000;
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    return `${Math.floor(hours / 24)}天前`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">加载新闻中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={loadNews}
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
        <h1 className="text-3xl font-bold">新闻资讯</h1>
        
        <div className="flex space-x-2">
          <button 
            onClick={loadNews}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition"
          >
            🔄 刷新
          </button>
          <button
            onClick={() => setCategory('')}
            className={`px-4 py-2 rounded transition ${!category ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            全部
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`px-4 py-2 rounded transition ${category === key ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredNews.map((item) => (
          <a 
            key={item.id} 
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition cursor-pointer"
          >
            <div className="flex gap-4">
              {item.imageurl && (
                <img 
                  src={item.imageurl} 
                  alt={item.title}
                  className="w-32 h-32 object-cover rounded"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {item.categories && (
                      <span className="px-3 py-1 bg-blue-600 rounded text-sm">
                        {item.categories.split('|')[0]}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">
                    {getTimeAgo(item.published_on)}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 hover:text-blue-400 transition">{item.title}</h3>
                <p className="text-gray-300 mb-3 line-clamp-2">{item.body}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>来源: {item.source}</span>
                  <span className="text-blue-400">阅读全文 →</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
        <p className="text-sm text-green-300">
          ✅ <strong>真实数据：</strong>新闻数据来自 CryptoCompare API，实时更新
        </p>
      </div>
    </div>
  );
}
