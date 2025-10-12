import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Users, QrCode } from 'lucide-react';

export const HomePage: React.FC = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            お化け屋敷整理券システム
          </h1>
          <p className="text-xl text-gray-600">
            整理券の取得・管理を簡単に行えます
          </p>
        </div>

        {/* メインアクション */}
        <div className="max-w-2xl mx-auto space-y-6">
          <button
            onClick={handleReservation}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-6 px-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <div className="flex items-center justify-center space-x-4">
              <Ticket className="w-8 h-8" />
              <span className="text-2xl">整理券を取得する</span>
            </div>
          </button>

          <button
            onClick={handleMyPage}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-6 px-8 rounded-xl border-2 border-gray-200 shadow-sm transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <div className="flex items-center justify-center space-x-4">
              <Users className="w-8 h-8" />
              <span className="text-2xl">マイページ</span>
            </div>
          </button>
        </div>

        {/* 管理者セクション */}
        <div className="max-w-2xl mx-auto mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">管理者用</h2>
          <button
            onClick={handleAdmin}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <div className="flex items-center justify-center space-x-4">
              <QrCode className="w-6 h-6" />
              <span className="text-xl">管理画面</span>
            </div>
          </button>
        </div>

        {/* 情報セクション */}
        <div className="max-w-2xl mx-auto mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4 text-center">ご利用方法</h3>
          <ul className="text-blue-800 space-y-2">
            <li>• 「整理券を取得する」から予約を開始</li>
            <li>• マイページで予約状況を確認</li>
            <li>• 管理者は管理画面で整理券を管理</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 