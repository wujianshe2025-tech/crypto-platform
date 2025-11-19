import { Link, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                🌪️ 追风观测
              </Link>
              <div className="flex space-x-1">
                <Link 
                  to="/" 
                  className={`px-4 py-2 rounded transition ${
                    isActive('/') ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`}
                >
                  📊 行情
                </Link>
                <Link 
                  to="/news" 
                  className={`px-4 py-2 rounded transition ${
                    isActive('/news') ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`}
                >
                  📰 新闻
                </Link>
                <Link 
                  to="/community" 
                  className={`px-4 py-2 rounded transition ${
                    isActive('/community') ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`}
                >
                  💬 社区
                </Link>
                <Link 
                  to="/predictions" 
                  className={`px-4 py-2 rounded transition ${
                    isActive('/predictions') ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`}
                >
                  🎯 预测
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                演示模式
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p>追风观测 - 加密货币行情与预测平台</p>
        </div>
      </footer>
    </div>
  );
}
