import React, { useState } from 'react';
import { User, Phone, Calendar, Clock, Plus } from 'lucide-react';

interface AdminReservationData {
  name: string;
  phone: string;
  date: string;
  time: string;
  numberOfPeople: string;
}

export const AdminReservationForm: React.FC = () => {
  const [formData, setFormData] = useState<AdminReservationData>({
    name: '',
    phone: '',
    date: '',
    time: '',
    numberOfPeople: '1'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // モックAPI呼び出し
    setTimeout(() => {
      console.log('Admin reservation created:', formData);
      setSubmitSuccess(true);
      setIsSubmitting(false);
      
      // フォームをリセット
      setTimeout(() => {
        setFormData({
          name: '',
          phone: '',
          date: '',
          time: '',
          numberOfPeople: '1'
        });
        setSubmitSuccess(false);
      }, 2000);
    }, 1000);
  };

  const timeSlots = [
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            管理者用整理券発行
          </h1>

          {submitSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-green-800 font-medium">
                整理券を正常に発行しました！
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 名前入力 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                お客様のお名前
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num.toString()}>{num}名</option>
                ))}
              </select>
            </div>

            {/* 管理者用注意事項 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">管理者用注意事項</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• お客様の情報を正確に入力してください</li>
                <li>• 発行後は整理券番号をお客様にお伝えください</li>
                <li>• キャンセルや変更は管理画面から行えます</li>
              </ul>
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none"
            >
              <div className="flex items-center justify-center space-x-3">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="text-lg">発行中...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span className="text-lg">整理券を発行する</span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* 発行履歴 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">最近の発行履歴</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <span>#123 - 山田太郎様</span>
                  <span className="text-green-600">発行済み</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>#122 - 佐藤花子様</span>
                  <span className="text-green-600">発行済み</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>#121 - 田中次郎様</span>
                  <span className="text-green-600">発行済み</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 