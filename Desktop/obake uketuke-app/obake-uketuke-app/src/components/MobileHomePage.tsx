import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Users, QrCode } from 'lucide-react';
import { MobileLayout } from './MobileLayout';

export const MobileHomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleReservation = () => {
    navigate('/reservation');
  };

  const handleMyPage = () => {
    navigate('/mypage');
  };

  const handleAdmin = () => {
    navigate('/admin/tickets');
  };

  return (
    <MobileLayout title="お化け屋敷整理券システム" showBackButton={false}>
      <div className="space-y-6">
        {/* ヘッダーセクション */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            お化け屋敷整理券システム
          </h1>
          <p className="text-gray-600">
            整理券の取得・管理を簡単に行えます
          </p>
        </div>

        {/* メインアクション */}
        <div className="space-y-4">
          <button
            onClick={handleReservation}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <div className="flex items-center justify-center space-x-3">
              <Ticket className="w-6 h-6" />
              <span className="text-lg">整理券を取得する</span>
            </div>
          </button>

          <button
            onClick={handleMyPage}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl border-2 border-gray-200 shadow-sm transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <div className="flex items-center justify-center space-x-3">
              <Users className="w-6 h-6" />
              <span className="text-lg">マイページ</span>
            </div>
          </button>
        </div>

        {/* 管理者セクション */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">管理者用</h2>
          <button
            onClick={handleAdmin}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <div className="flex items-center justify-center space-x-3">
              <QrCode className="w-5 h-5" />
              <span>管理画面</span>
            </div>
          </button>
        </div>

        {/* 情報セクション */}
        <div className="mt-8 bg-blue-50 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">ご利用方法</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 「整理券を取得する」から予約を開始</li>
            <li>• マイページで予約状況を確認</li>
            <li>• 管理者は管理画面で整理券を管理</li>
          </ul>
        </div>
      </div>
    </MobileLayout>
  );
}; 