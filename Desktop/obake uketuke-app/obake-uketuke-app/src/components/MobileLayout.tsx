import React from 'react';
import { ArrowLeft, Home, User, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showBottomNav?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  showBackButton = true,
  showBottomNav = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleMyPage = () => {
    navigate('/mypage');
  };

  const handleSettings = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="戻る"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          
          <h1 className="text-lg font-semibold text-gray-900 flex-1 text-center">
            {title || 'お化け屋敷整理券システム'}
          </h1>
          
          <div className="w-10"></div> {/* 右側のスペーサー */}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4">
          {children}
        </div>
      </main>

      {/* ボトムナビゲーション */}
      {showBottomNav && (
        <nav className="bg-white border-t border-gray-200 sticky bottom-0 z-50">
          <div className="flex justify-around py-2">
            <button
              onClick={handleHome}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                location.pathname === '/' 
                  ? 'text-orange-500 bg-orange-50' 
                  : 'text-gray-600 hover:text-orange-500'
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs mt-1">ホーム</span>
            </button>
            
            <button
              onClick={handleMyPage}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                location.pathname === '/mypage' 
                  ? 'text-orange-500 bg-orange-50' 
                  : 'text-gray-600 hover:text-orange-500'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-xs mt-1">マイページ</span>
            </button>
            
            <button
              onClick={handleSettings}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                location.pathname.startsWith('/admin') 
                  ? 'text-orange-500 bg-orange-50' 
                  : 'text-gray-600 hover:text-orange-500'
              }`}
            >
              <Settings className="w-6 h-6" />
              <span className="text-xs mt-1">管理</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}; 