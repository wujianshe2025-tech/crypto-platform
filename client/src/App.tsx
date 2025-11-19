import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // 跳转到真实数据版本
    window.location.href = '/index.html';
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🌪️</div>
        <h1 className="text-3xl font-bold mb-4">追风观测</h1>
        <p className="text-gray-400 mb-6">正在加载真实数据...</p>
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
