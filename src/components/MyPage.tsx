import { useState, useEffect } from 'react'
import { useGlobalReservations } from '../hooks/useGlobalReservations'
import { PhoneIcon, ClockIcon, ArrowPathIcon, HomeIcon, TicketIcon } from '@heroicons/react/24/outline'

export function MyPage() {
  const { reservations } = useGlobalReservations()
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDate, setCurrentDate] = useState<string>('')

  // 最新の予約情報を取得
  const latestReservation = reservations[0]
  const reservationNumber = latestReservation?.reservation_number || 'T001'
  const email = latestReservation?.email || 'example@email.com'
  const peopleCount = latestReservation?.people_count || 1

  // 現在時刻を更新
  useEffect(() => {
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

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // 現在の呼び出し番号（モック）
  const currentCallNumber = Math.max(1, parseInt(reservationNumber.replace('T', '')) - 3)
  const isMyTurn = parseInt(reservationNumber.replace('T', '')) <= currentCallNumber + 5

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* メインコンテンツ */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-200">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">現在状況</h1>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4" />
                <span>{currentDate}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{currentTime}</span>
              </div>
            </div>
          </div>

          {/* あなたの整理券番号 */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 mb-8 border border-orange-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">あなたの整理券番号</h2>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 border-4 border-orange-300 rounded-full bg-white shadow-lg mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {reservationNumber}
                </span>
              </div>
              <p className="text-sm text-gray-600">メール: {email}</p>
              <p className="text-sm text-gray-600">人数: {peopleCount}名</p>
            </div>
          </div>

          {/* 現在の呼び出し番号 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center flex items-center justify-center">
              <PhoneIcon className="w-5 h-5 mr-2 text-blue-600" />
              現在の呼び出し番号
            </h2>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 border-4 border-blue-300 rounded-full bg-white shadow-md mb-4">
                <span className="text-2xl font-bold text-blue-600">
                  {currentCallNumber}
                </span>
              </div>
              {isMyTurn ? (
                <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 font-medium text-center">
                    🎉 もうすぐお呼び出しです！
                  </p>
                </div>
              ) : (
                <p className="text-gray-600 text-sm">
                  あと {parseInt(reservationNumber.replace('T', '')) - currentCallNumber} 番待ちです
                </p>
              )}
            </div>
          </div>

          {/* 注意事項 */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-orange-800 mb-2">ご案内</h3>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• 5組前になりましたら受付にお越しください</li>
              <li>• 早く呼ばれる場合があります</li>
              <li>• 整理券番号をお忘れなく</li>
            </ul>
          </div>

          {/* アクションボタン */}
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md"
            >
              <div className="flex items-center justify-center space-x-2">
                <ArrowPathIcon className="w-4 h-4" />
                <span>更新</span>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/reservation'}
              className="w-full bg-orange-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all shadow-md"
            >
              <div className="flex items-center justify-center space-x-2">
                <TicketIcon className="w-4 h-4" />
                <span>追加で予約</span>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all shadow-md"
            >
              <div className="flex items-center justify-center space-x-2">
                <HomeIcon className="w-4 h-4" />
                <span>ホームに戻る</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 