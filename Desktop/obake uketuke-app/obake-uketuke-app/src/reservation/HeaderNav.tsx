import React from 'react';

export const HeaderNav: React.FC = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 左側: ロゴ */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">👻</span>
            <h1 className="text-lg font-bold text-gray-800">
              お化け屋敷 整理券システム
            </h1>
          </div>
          
          {/* 右側: ナビゲーションリンク */}
          <nav className="flex items-center space-x-4">
            <a 
              href="/reservation" 
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              予約フォーム
            </a>
            <a 
              href="/mypage" 
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              現在状況
            </a>
            <a 
              href="/admin" 
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              管理者ページ
            </a>
            <a 
              href="/debug" 
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              デバッグ
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};
