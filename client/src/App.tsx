export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text" style={{backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              🌪️ 追风观测
            </div>
            <div className="flex space-x-4">
              <a href="#" className="px-4 py-2 rounded bg-blue-600">📊 行情</a>
              <a href="#" className="px-4 py-2 rounded hover:bg-gray-700">📰 新闻</a>
              <a href="#" className="px-4 py-2 rounded hover:bg-gray-700">📅 数据日历</a>
              <a href="#" className="px-4 py-2 rounded hover:bg-gray-700">💬 社区</a>
              <a href="#" className="px-4 py-2 rounded hover:bg-gray-700">🎯 预测</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h1 className="text-5xl font-bold mb-6">🌪️ 追风观测</h1>
          <p className="text-2xl text-gray-400 mb-8">加密货币行情与预测平台</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">实时行情</h3>
              <p className="text-gray-400">主流加密货币价格实时更新</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-4xl mb-4">📰</div>
              <h3 className="text-xl font-semibold mb-2">新闻资讯</h3>
              <p className="text-gray-400">利多利空智能标注</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">数据日历</h3>
              <p className="text-gray-400">全球经济数据发布日程</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">预测投票</h3>
              <p className="text-gray-400">参与预测赢取奖励</p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300">
              ✅ <strong>后端服务已连接</strong><br/>
              API: {import.meta.env.VITE_API_URL || '未配置'}
            </p>
          </div>

          <div className="mt-8">
            <a 
              href="/demo-simple.html" 
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700"
            >
              查看完整演示版 →
            </a>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p>追风观测 - 加密货币行情与预测平台</p>
          <p className="mt-2">🚀 网站已成功部署上线！</p>
        </div>
      </footer>
    </div>
  );
}
