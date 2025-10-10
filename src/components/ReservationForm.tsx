import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CreateReservationRequest } from '../types'
import { AGE_GROUPS } from '../types'
import { useGlobalReservations } from '../hooks/useGlobalReservations'
import { CalendarIcon, ClockIcon, UserGroupIcon, EnvelopeIcon, TicketIcon } from '@heroicons/react/24/outline'

export default function ReservationForm() {
  const navigate = useNavigate()
  const { addReservation } = useGlobalReservations()
  const [formData, setFormData] = useState<CreateReservationRequest>({
    email: '',
    people_count: 1,
    age_group_id: 4
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDate, setCurrentDate] = useState<string>('')

  const updateTime = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    setCurrentTime(`${hours}:${minutes}`)
    
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    setCurrentDate(`${year}/${month}/${day}`)
  }

  useEffect(() => {
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.email) {
      errors.email = 'メールアドレスを入力してください'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = '有効なメールアドレスを入力してください'
    }

    if (formData.people_count < 1 || formData.people_count > 10) {
      errors.people_count = '人数は1〜10名で入力してください'
    }

    if (!formData.age_group_id) {
      errors.age_group_id = '年齢層を選択してください'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // ローカルで予約を作成
      const reservationData = {
        ...formData,
        reservation_number: `T${Date.now()}`, // 一時的な番号
        created_at: new Date().toISOString()
      }
      
      // グローバル状態に追加
      addReservation(reservationData)
      
      // 成功メッセージを表示
      alert('整理券が正常に発行されました！')
      
      // 完了ページに遷移
      navigate('/reservation/complete')
    } catch (err) {
      setError('予約の作成中にエラーが発生しました')
      console.error('Reservation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateReservationRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // エラーをクリア
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-beige-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">👻</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">お化け屋敷整理券フォーム</h1>
          </div>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <CalendarIcon className="w-4 h-4" />
              <span>{currentDate}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>{currentTime}</span>
            </div>
          </div>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <EnvelopeIcon className="w-4 h-4" />
                <span>メールアドレス</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="example@email.com"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* 人数 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <UserGroupIcon className="w-4 h-4" />
                <span>人数</span>
              </label>
              <select
                value={formData.people_count}
                onChange={(e) => handleInputChange('people_count', parseInt(e.target.value))}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                  validationErrors.people_count ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num}名</option>
                ))}
              </select>
              {validationErrors.people_count && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.people_count}</p>
              )}
            </div>

            {/* 年齢層 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">年齢層</label>
              <select
                value={formData.age_group_id}
                onChange={(e) => handleInputChange('age_group_id', parseInt(e.target.value))}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                  validationErrors.age_group_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {AGE_GROUPS.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              {validationErrors.age_group_id && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.age_group_id}</p>
              )}
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center space-x-2">
                <TicketIcon className="w-5 h-5" />
                <span>{isLoading ? '発行中...' : '整理券を発行する'}</span>
              </div>
            </button>
          </form>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ※ 整理券は先着順で発行されます
          </p>
        </div>
      </div>
    </div>
  )
} 