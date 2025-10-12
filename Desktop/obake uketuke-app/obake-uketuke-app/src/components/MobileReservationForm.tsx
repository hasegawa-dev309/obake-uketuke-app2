import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Calendar, Clock, ArrowRight } from 'lucide-react';
import { MobileLayout } from './MobileLayout';

export const MobileReservationForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    numberOfPeople: '1'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ここでAPIに送信
    navigate('/reservation/complete', { 
      state: { reservationData: formData } 
    });
  };

  const timeSlots = [
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  return (
    <MobileLayout title="整理券取得">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 名前入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            お名前
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="山田太郎"
            required
          />
        </div>

        {/* 電話番号入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            電話番号
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="090-1234-5678"
            required
          />
        </div>

        {/* 日付選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            希望日
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>

        {/* 時間選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            希望時間
          </label>
          <select
            value={formData.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          >
            <option value="">時間を選択してください</option>
            {timeSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        {/* 人数選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            人数
          </label>
          <select
            value={formData.numberOfPeople}
            onChange={(e) => handleInputChange('numberOfPeople', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num.toString()}>{num}名</option>
            ))}
          </select>
        </div>

        {/* 注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">ご注意</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 整理券は先着順で発行されます</li>
            <li>• キャンセルは前日までにお願いします</li>
            <li>• 当日は身分証明書をご持参ください</li>
          </ul>
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          <div className="flex items-center justify-center space-x-3">
            <span className="text-lg">整理券を取得する</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </button>
      </form>
    </MobileLayout>
  );
}; 