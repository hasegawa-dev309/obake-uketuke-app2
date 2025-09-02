import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Share2 } from 'lucide-react';

export const ReservationComplete: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reservationData = location.state?.reservationData;

  const handleHome = () => {
    navigate('/');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'お化け屋敷整理券取得完了',
          text: 'お化け屋敷の整理券を取得しました！',
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // フォールバック: URLをクリップボードにコピー
      navigator.clipboard.writeText(window.location.href);
      alert('URLをクリップボードにコピーしました');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {/* 成功アイコン */}
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>

          {/* 完了メッセージ */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              整理券取得完了！
            </h1>
            <p className="text-xl text-gray-600">
              お化け屋敷の整理券を正常に取得しました
            </p>
          </div>

          {/* 予約詳細 */}
          {reservationData && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="font-semibold text-gray-900 mb-4">予約詳細</h2>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">お名前:</span>
                  <span className="font-medium">{reservationData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">電話番号:</span>
                  <span className="font-medium">{reservationData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">日付:</span>
                  <span className="font-medium">{reservationData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">時間:</span>
                  <span className="font-medium">{reservationData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">人数:</span>
                  <span className="font-medium">{reservationData.numberOfPeople}名</span>
                </div>
              </div>
            </div>
          )}

          {/* 注意事項 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">ご確認ください</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 当日は身分証明書をご持参ください</li>
              <li>• 開始時間の10分前にご来場ください</li>
              <li>• キャンセルは前日までにお願いします</li>
            </ul>
          </div>

          {/* アクションボタン */}
          <div className="space-y-4">
            <button
              onClick={handleHome}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <div className="flex items-center justify-center space-x-3">
                <Home className="w-5 h-5" />
                <span>ホームに戻る</span>
              </div>
            </button>

            <button
              onClick={handleShare}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-200 shadow-sm transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <div className="flex items-center justify-center space-x-3">
                <Share2 className="w-5 h-5" />
                <span>シェアする</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 