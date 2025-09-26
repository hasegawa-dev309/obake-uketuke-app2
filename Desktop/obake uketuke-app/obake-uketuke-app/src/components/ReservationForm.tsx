import React, { useState } from 'react';

export const ReservationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    numberOfPeople: '1',
    ageGroup: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reservation Form Data:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            整理券取得
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* メールアドレス入力 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full h-10 px-3 border border-surface-muted rounded-base focus:ring-2 focus:ring-brand"
                placeholder="example@email.com"
                required
              />
            </div>

            {/* 人数選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                人数
              </label>
              <select
                value={formData.numberOfPeople}
                onChange={(e) => handleInputChange('numberOfPeople', e.target.value)}
                className="w-full h-10 px-3 border border-surface-muted rounded-base focus:ring-2 focus:ring-brand"
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num.toString()}>{num}人</option>
                ))}
              </select>
            </div>

            {/* 年齢層選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                年齢層
              </label>
              <select
                value={formData.ageGroup}
                onChange={(e) => handleInputChange('ageGroup', e.target.value)}
                className="w-full h-10 px-3 border border-surface-muted rounded-base focus:ring-2 focus:ring-brand"
                required
              >
                <option value="">年齢層を選択してください</option>
                <option value="高校生以下">高校生以下</option>
                <option value="大学生">大学生</option>
                <option value="一般">一般</option>
              </select>
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              className="w-full bg-brand text-white font-medium py-2 px-4 rounded-base hover:opacity-90 disabled:opacity-60"
            >
              整理券を取得する
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
