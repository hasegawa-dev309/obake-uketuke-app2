import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Search, Filter } from 'lucide-react';

interface Ticket {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  numberOfPeople: number;
  status: 'waiting' | 'called' | 'completed' | 'cancelled';
  createdAt: string;
}

export const AdminTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // モックデータ
    const mockTickets: Ticket[] = [
      {
        id: '1',
        name: '山田太郎',
        phone: '090-1234-5678',
        date: '2024-01-15',
        time: '14:00',
        numberOfPeople: 2,
        status: 'waiting',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: '佐藤花子',
        phone: '090-8765-4321',
        date: '2024-01-15',
        time: '14:30',
        numberOfPeople: 3,
        status: 'called',
        createdAt: '2024-01-15T10:45:00Z'
      },
      {
        id: '3',
        name: '田中次郎',
        phone: '090-5555-1234',
        date: '2024-01-15',
        time: '15:00',
        numberOfPeople: 1,
        status: 'completed',
        createdAt: '2024-01-15T11:00:00Z'
      }
    ];

    setTimeout(() => {
      setTickets(mockTickets);
      setLoading(false);
    }, 1000);
  }, []);

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status: newStatus as Ticket['status'] } : ticket
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'text-yellow-600 bg-yellow-50';
      case 'called':
        return 'text-blue-600 bg-blue-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return '待機中';
      case 'called':
        return '呼び出し済み';
      case 'completed':
        return '完了';
      case 'cancelled':
        return 'キャンセル';
      default:
        return '不明';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.name.includes(searchTerm) || ticket.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">整理券管理</h1>

          {/* フィルターと検索 */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="名前または電話番号で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">すべて</option>
                <option value="waiting">待機中</option>
                <option value="called">呼び出し済み</option>
                <option value="completed">完了</option>
                <option value="cancelled">キャンセル</option>
              </select>
            </div>
          </div>

          {/* 整理券一覧 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">番号</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">お客様</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">日時</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">人数</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">状態</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-mono text-lg font-bold text-orange-600">
                        #{ticket.id}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{ticket.name}</div>
                        <div className="text-sm text-gray-500">{ticket.phone}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{ticket.date}</span>
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{ticket.time}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{ticket.numberOfPeople}名</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {getStatusText(ticket.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        {ticket.status === 'waiting' && (
                          <button
                            onClick={() => handleStatusChange(ticket.id, 'called')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            呼び出し
                          </button>
                        )}
                        {ticket.status === 'called' && (
                          <button
                            onClick={() => handleStatusChange(ticket.id, 'completed')}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            完了
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusChange(ticket.id, 'cancelled')}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          キャンセル
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">整理券が見つかりません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 