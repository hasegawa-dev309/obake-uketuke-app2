import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { MobileLayout } from './MobileLayout';

interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  numberOfPeople: number;
  status: 'active' | 'cancelled' | 'completed';
}

export const MobileMyPage: React.FC = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // モックデータ（実際のAPIから取得）
    const mockReservations: Reservation[] = [
      {
        id: '1',
        name: '山田太郎',
        phone: '090-1234-5678',
        date: '2024-01-15',
        time: '14:00',
        numberOfPeople: 2,
        status: 'active'
      },
      {
        id: '2',
        name: '山田太郎',
        phone: '090-1234-5678',
        date: '2024-01-20',
        time: '16:30',
        numberOfPeople: 3,
        status: 'active'
      }
    ];

    setTimeout(() => {
      setReservations(mockReservations);
      setLoading(false);
    }, 1000);
  }, []);

  const handleNewReservation = () => {
    navigate('/reservation');
  };

  const handleEditReservation = (id: string) => {
    // 編集機能（実装予定）
    console.log('Edit reservation:', id);
  };

  const handleCancelReservation = (id: string) => {
    // キャンセル機能（実装予定）
    console.log('Cancel reservation:', id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      case 'completed':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '有効';
      case 'cancelled':
        return 'キャンセル';
      case 'completed':
        return '完了';
      default:
        return '不明';
    }
  };

  if (loading) {
    return (
      <MobileLayout title="マイページ">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="マイページ">
      <div className="space-y-6">
        {/* ユーザー情報 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">山田太郎</h2>
              <p className="text-sm text-gray-600">090-1234-5678</p>
            </div>
          </div>
        </div>

        {/* 新規予約ボタン */}
        <button
          onClick={handleNewReservation}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          新しい整理券を取得する
        </button>

        {/* 予約一覧 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">予約一覧</h3>
          
          {reservations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">予約がありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{reservation.date}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{reservation.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{reservation.numberOfPeople}名</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleEditReservation(reservation.id)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      編集
                    </button>
                    <button
                      onClick={() => handleCancelReservation(reservation.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      キャンセル
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}; 