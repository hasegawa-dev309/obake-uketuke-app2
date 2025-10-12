import React, { useState, useEffect } from 'react';
import { Volume2, Phone, User, Clock } from 'lucide-react';

interface CallTicket {
  id: string;
  name: string;
  phone: string;
  time: string;
  numberOfPeople: number;
  status: 'waiting' | 'calling' | 'completed';
}

export const AdminCall: React.FC = () => {
  const [callTickets, setCallTickets] = useState<CallTicket[]>([]);
  const [currentCall, setCurrentCall] = useState<CallTicket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // モックデータ
    const mockCallTickets: CallTicket[] = [
      {
        id: '1',
        name: '山田太郎',
        phone: '090-1234-5678',
        time: '14:00',
        numberOfPeople: 2,
        status: 'waiting'
      },
      {
        id: '2',
        name: '佐藤花子',
        phone: '090-8765-4321',
        time: '14:30',
        numberOfPeople: 3,
        status: 'calling'
      },
      {
        id: '3',
        name: '田中次郎',
        phone: '090-5555-1234',
        time: '15:00',
        numberOfPeople: 1,
        status: 'waiting'
      }
    ];

    setTimeout(() => {
      setCallTickets(mockCallTickets);
      setCurrentCall(mockCallTickets.find(ticket => ticket.status === 'calling') || null);
      setLoading(false);
    }, 1000);
  }, []);

  const handleStartCall = (ticket: CallTicket) => {
    setCallTickets(prev => prev.map(t => 
      t.id === ticket.id ? { ...t, status: 'calling' as CallTicket['status'] } : 
      t.status === 'calling' ? { ...t, status: 'waiting' as CallTicket['status'] } : t
    ));
    setCurrentCall(ticket);
  };

  const handleCompleteCall = (ticketId: string) => {
    setCallTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, status: 'completed' as CallTicket['status'] } : t
    ));
    setCurrentCall(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'text-yellow-600 bg-yellow-50';
      case 'calling':
        return 'text-blue-600 bg-blue-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return '待機中';
      case 'calling':
        return '呼び出し中';
      case 'completed':
        return '完了';
      default:
        return '不明';
    }
  };

  const waitingTickets = callTickets.filter(ticket => ticket.status === 'waiting');
  const completedTickets = callTickets.filter(ticket => ticket.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">呼び出し管理</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 現在の呼び出し */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Volume2 className="w-5 h-5 mr-2 text-orange-500" />
                現在の呼び出し
              </h2>
              
              {currentCall ? (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      #{currentCall.id}
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {currentCall.name} 様
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">電話番号:</span>
                      <span className="font-medium">{currentCall.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">時間:</span>
                      <span className="font-medium">{currentCall.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">人数:</span>
                      <span className="font-medium">{currentCall.numberOfPeople}名</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleCompleteCall(currentCall.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      完了
                    </button>
                    <button
                      onClick={() => handleStartCall(currentCall)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      再呼び出し
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>現在呼び出し中の整理券はありません</p>
                </div>
              )}
            </div>
          </div>

          {/* 待機中の整理券 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">待機中の整理券</h2>
              
              {waitingTickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>待機中の整理券はありません</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {waitingTickets.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-2xl font-bold text-orange-600">
                          #{ticket.id}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="font-medium text-gray-900">{ticket.name} 様</div>
                        <div className="text-sm text-gray-600">{ticket.phone}</div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{ticket.time}</span>
                          <User className="w-4 h-4" />
                          <span>{ticket.numberOfPeople}名</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleStartCall(ticket)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        呼び出し開始
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 完了した整理券 */}
            {completedTickets.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">完了した整理券</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {completedTickets.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="text-lg font-bold text-gray-600 mb-2">
                        #{ticket.id}
                      </div>
                      <div className="text-sm text-gray-600">{ticket.name} 様</div>
                      <div className="text-xs text-gray-500">{ticket.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 