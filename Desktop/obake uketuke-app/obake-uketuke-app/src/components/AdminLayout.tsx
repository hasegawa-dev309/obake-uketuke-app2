import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, Users, QrCode, Phone } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleTickets = () => {
    navigate('/admin/tickets');
  };

  const handleCall = () => {
    navigate('/admin/call');
  };

  const handleReservation = () => {
    navigate('/admin/reservation');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              戻る
            </button>
            
            <h1 className="text-xl font-semibold text-gray-900">
              管理画面
            </h1>
            
            <button
              onClick={handleHome}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              ホーム
            </button>
          </div>
        </div>
      </header>

      {/* ナビゲーション */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={handleTickets}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                location.pathname === '/admin/tickets'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <QrCode className="w-4 h-4 inline mr-2" />
              整理券管理
            </button>
            <button
              onClick={handleCall}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                location.pathname === '/admin/call'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Phone className="w-4 h-4 inline mr-2" />
              呼び出し管理
            </button>
            <button
              onClick={handleReservation}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                location.pathname === '/admin/reservation'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              整理券発行
            </button>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main>
        {children}
      </main>
    </div>
  );
}; 