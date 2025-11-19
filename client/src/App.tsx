import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // 自动跳转到完整演示版
    window.location.href = '/demo.html';
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🌪️</div>
        <h1 className="text-3xl font-bold mb-4">追风观测</h1>
        <p className="text-gray-400 mb-6">正在跳转到完整版...</p>
        <a 
          href="/demo.html" 
          className="inline-block px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          点击这里手动跳转 →
        </a>
      </div>
    </div>
  );
}
