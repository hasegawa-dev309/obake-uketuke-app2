import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGlobalReservations } from '../hooks/useGlobalReservations'
import { CheckCircleIcon, ClockIcon, HomeIcon, PlusIcon } from '@heroicons/react/24/outline'

const API_BASE_URL = 'https://obake-uketuke-app-ae91e2b5463a.herokuapp.com/api';

export function ReservationComplete() {
  const navigate = useNavigate()
  const { reservations } = useGlobalReservations()
  const [countdown, setCountdown] = useState(10)
  const [currentCallNumber, setCurrentCallNumber] = useState<number>(1)
  const [currentTicketNumber, setCurrentTicketNumber] = useState<number>(1)
  
  // 最新の予約情報を取得
  const latestReservation = reservations[0] // 最新の予約
  const reservationNumber = latestReservation?.reservation_number || 'T001'
  const message = '整理券が正常に発行されました！'

  // 現在の呼び出し番号と整理券番号を取得
  useEffect(() => {
    const fetchCurrentNumbers = async () => {
      try {
        // 現在の呼び出し番号を取得
        const statusResponse = await fetch(`${API_BASE_URL}/reservations/status`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors'
        });
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setCurrentCallNumber(statusData.data?.currentNumber || 1);
        }

        // 現在の整理券番号（カウンター）を取得
        const counterResponse = await fetch(`${API_BASE_URL}/reservations/counter`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors'
        });
        
        if (counterResponse.ok) {
          const counterData = await counterResponse.json();
          setCurrentTicketNumber(counterData.data?.counter || 1);
        }
      } catch (err) {
        console.error("現在の番号取得エラー:", err);
      }
    };
    
    fetchCurrentNumbers();
    // 定期的に更新（3秒ごと）
    const interval = setInterval(fetchCurrentNumbers, 3000);
    return () => clearInterval(interval);
  }, []);

  // カウントダウンと自動遷移
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/mypage')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  const handleGoToMyPage = () => {
    navigate('/mypage')
  }

  const handleMakeAnotherReservation = () => {
    navigate('/reservation')
  }

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* メインコンテンツ */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-200">
          {/* 成功アイコン */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              整理券発行完了
            </h1>
          </div>
          
          {/* 予約確定メッセージ */}
          <p className="text-center text-gray-700 mb-6">
            {message}
          </p>
          
          {/* 予約番号説明 */}
          <p className="text-center text-gray-600 mb-8">
            以下の整理券番号でお呼び出しします
          </p>
          
          {/* 整理券番号表示 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 border-4 border-orange-300 rounded-full bg-gradient-to-br from-orange-50 to-red-50 shadow-lg">
              <span className="text-3xl font-bold text-gray-900">
                {reservationNumber}
              </span>
            </div>
          </div>
          
          {/* 注意事項 */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-orange-800 mb-2">ご案内</h3>
            <p className="text-sm text-orange-700 leading-relaxed">
              5組前になりましたら、受付にお越しください。<br />
              早く呼ばれる場合がございますのでお早めにお越しください。
            </p>
          </div>
          
          {/* 現在の状況表示 */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* 現在の整理券番号 */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">現在の整理券番号</p>
              <div className="inline-flex items-center justify-center w-20 h-20 border-4 border-green-300 rounded-full bg-green-50 shadow-md">
                <span className="text-xl font-bold text-green-600">
                  {currentTicketNumber}
                </span>
              </div>
            </div>
            
            {/* 現在の呼び出し番号 */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">現在の呼び出し番号</p>
              <div className="inline-flex items-center justify-center w-20 h-20 border-4 border-blue-300 rounded-full bg-blue-50 shadow-md">
                <span className="text-xl font-bold text-blue-600">
                  {currentCallNumber}
                </span>
              </div>
            </div>
          </div>
          
          {/* 待ち状況 */}
          {parseInt(reservationNumber.replace('T', '')) - currentCallNumber > 0 && (
            <div className="text-center mb-8">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-sm text-orange-700">
                  あと約 <span className="font-bold text-orange-600">{parseInt(reservationNumber.replace('T', '')) - currentCallNumber}</span> 組お待ちください
                </p>
              </div>
            </div>
          )}
          
          {/* 自動遷移の説明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-700 text-center flex items-center justify-center">
              <ClockIcon className="w-4 h-4 mr-2" />
              {countdown}秒後にマイページに自動遷移します
            </p>
          </div>
          
          {/* アクションボタン */}
          <div className="space-y-4">
            <button
              onClick={handleGoToMyPage}
              className="w-full bg-blue-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md"
            >
              マイページへ進む
            </button>
            
            <button
              onClick={handleMakeAnotherReservation}
              className="w-full bg-orange-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all shadow-md"
            >
              <div className="flex items-center justify-center space-x-2">
                <PlusIcon className="w-4 h-4" />
                <span>追加で予約する</span>
              </div>
            </button>

            <button
              onClick={handleGoHome}
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