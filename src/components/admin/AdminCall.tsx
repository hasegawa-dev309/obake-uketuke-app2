import { useState, useEffect, useRef } from 'react'
import type { CallStatus } from '../../types'
import { useGlobalReservations } from '../../hooks/useGlobalReservations'
import { MegaphoneIcon, EnvelopeIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon, ArrowPathIcon, PaperAirplaneIcon, XMarkIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline'
import { API_CONFIG } from '../../config/api.config'

export function AdminCall() {
  const [callStatus, setCallStatus] = useState<CallStatus>({
    current_call_number: 1,
    is_paused: false,
    notice: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailForm, setEmailForm] = useState({
    email: '',
    message: ''
  })
  // ポーリング間隔を動的に管理
  const [pollInterval, setPollInterval] = useState<number>(5000); // 通常は5秒
  // 操作直後の高速ポーリングタイマー
  const fastPollTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 楽観的更新のロールバック用
  const previousNumberRef = useRef<number>(1);

  const { reservations } = useGlobalReservations()

  useEffect(() => {
    // 初期データを設定
    setCallStatus({
      current_call_number: 1,
      is_paused: false,
      notice: '通常営業中'
    })
  }, [])

  // /api/public/status をポーリングして呼び出し番号を取得
  useEffect(() => {
    let alive = true;

    const fetchStatus = async () => {
      try {
        // キャッシュ無効化のためtimestampを付与
        const eventDate = new Date().toISOString().split('T')[0];
        const url = `${API_CONFIG.baseURL}/public/status?date=${eventDate}&v=${Date.now()}`;
        
        const res = await fetch(url, {
          method: 'GET',
          headers: API_CONFIG.headers,
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data: CallStatus = await res.json();
        
        if (alive) {
          // サーバーの値と同期（楽観的更新中でない場合のみ）
          setCallStatus(prev => {
            const diff = Math.abs(data.current_call_number - prev.current_call_number);
            // 2以上差がある場合はサーバー優先で更新
            if (diff >= 2) {
              return { ...data, notice: data.notice || prev.notice };
            }
            return { ...prev, current_call_number: data.current_call_number, is_paused: data.is_paused };
          });
          setIsPaused(data.is_paused);
        }
      } catch (err) {
        console.error("呼び出し番号の取得エラー:", err);
        // エラー時はログのみ（UIは維持）
      }
    };

    // 初回取得
    fetchStatus();

    // ポーリング開始
    const intervalId = setInterval(fetchStatus, pollInterval);

    return () => {
      alive = false;
      clearInterval(intervalId);
    };
  }, [pollInterval]);

  const fetchCallStatus = async () => {
    setIsLoading(true)
    try {
      // モックデータを使用（実際のAPIがないため）
      await new Promise(resolve => setTimeout(resolve, 500)) // ローディング効果
      setError(null) // エラーをクリア
    } catch (err) {
      setError('呼び出し状況の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const updateCallNumber = async (direction: 'prev' | 'next') => {
    // 楽観的更新：即座にUIを更新
    const previousValue = callStatus.current_call_number;
    const newNumber = direction === 'next' 
      ? callStatus.current_call_number + 1 
      : Math.max(1, callStatus.current_call_number - 1)
    
    // UIを即座に更新（APIレスポンスを待たない）
    setCallStatus(prev => ({ ...prev, current_call_number: newNumber }))
    previousNumberRef.current = previousValue;
    setError(null); // エラーをクリア

    // 高速ポーリングを開始（操作直後の3秒間）
    if (fastPollTimerRef.current) {
      clearTimeout(fastPollTimerRef.current);
    }
    setPollInterval(400); // 400ms間隔に短縮
    fastPollTimerRef.current = setTimeout(() => {
      setPollInterval(5000); // 3秒後に通常間隔に戻す
      fastPollTimerRef.current = null;
    }, 3000);

    // API呼び出し
    try {
      const url = `${API_CONFIG.baseURL}/call/next`;
      const body = direction === 'next' 
        ? JSON.stringify({ action: 'next' })
        : JSON.stringify({ action: 'prev' });

      const res = await fetch(url, {
        method: 'POST',
        headers: API_CONFIG.headers,
        body,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      // サーバーから返された値を確認（必要に応じて同期）
      if (data.current_call_number !== undefined && data.current_call_number !== newNumber) {
        setCallStatus(prev => ({ ...prev, current_call_number: data.current_call_number }));
      }
    } catch (err) {
      // API呼び出し失敗時はロールバック
      console.error("呼び出し番号の更新に失敗:", err);
      setCallStatus(prev => ({ ...prev, current_call_number: previousValue }));
      previousNumberRef.current = previousValue;
      setError('呼び出し番号の更新に失敗しました')
      alert("呼び出し番号の更新に失敗しました。ネットワークを確認してください。");
    }
  }

  const togglePause = async () => {
    setIsLoading(true)
    try {
      // ローカル状態を更新
      const newPausedState = !isPaused
      setIsPaused(newPausedState)
      setCallStatus(prev => ({ ...prev, is_paused: newPausedState }))
      setError(null) // エラーをクリア
      
      await new Promise(resolve => setTimeout(resolve, 300)) // ローディング効果
    } catch (err) {
      setError('一時停止の切り替えに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const sendEmail = async () => {
    setIsLoading(true)
    try {
      // 実際のメール送信APIを呼び出す
      console.log('メール送信:', emailForm)
      setShowEmailModal(false)
      setEmailForm({ email: '', message: '' })
      
      // 成功メッセージを表示
      alert('メールが送信されました！')
    } catch (err) {
      setError('メール送信に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const openEmailModal = () => {
    // 現在の呼び出し番号に対応する予約を探す
    const currentReservation = reservations.find(
      r => r.reservation_number === callStatus.current_call_number.toString()
    )

    console.log('現在の呼び出し番号:', callStatus.current_call_number)
    console.log('予約データ:', reservations)
    console.log('見つかった予約:', currentReservation)

    // メールアドレスを自動入力（予約が見つかった場合）
    const email = currentReservation?.email || ''

    // 指定されたメッセージを設定
    const message = 'ご案内まであと少しです。スタッフが順次呼び出しを行っていますので、今のうちに会場入口までお越しください。遅れると入場が難しくなる場合がありますので、必ず時間に余裕を持って集合をお願いします。'

    console.log('設定するメールアドレス:', email)
    console.log('設定するメッセージ:', message)

    setShowEmailModal(true)
    setEmailForm({
      email,
      message
    })
  }

  if (isLoading && callStatus.current_call_number === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-8 border border-red-500/40 shadow-2xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <MegaphoneIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">呼び出し管理</h1>
          </div>
          <p className="text-red-300 font-medium">Call Management System</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* 現在の呼び出し番号 */}
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/40 rounded-2xl p-8 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 text-center flex items-center justify-center space-x-2">
            <PhoneIcon className="w-5 h-5 text-blue-400" />
            <span>現在の呼び出し番号</span>
          </h3>
          <div className="text-center">
            <p className="text-6xl font-bold text-blue-400 mb-4">{callStatus.current_call_number}</p>
            <p className="text-blue-300 mb-6">この番号を呼び出しています</p>
            <button
              onClick={openEmailModal}
              disabled={isLoading}
              className="group relative px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl border border-green-400 hover:scale-105"
            >
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="w-5 h-5" />
                <span>メール送信</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {/* 番号制御ボタン */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <button
            onClick={() => updateCallNumber('prev')}
            disabled={isLoading || callStatus.current_call_number <= 1}
            className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => updateCallNumber('next')}
            disabled={isLoading}
            className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 一時停止ボタン */}
        <div className="text-center mb-8">
          <button
            onClick={togglePause}
            disabled={isLoading}
            className={`px-6 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl ${
              isPaused
                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                : 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
            }`}
          >
            <div className="flex items-center space-x-2">
              {isPaused ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />}
              <span>{isPaused ? '再開' : '一時停止'}</span>
            </div>
          </button>
        </div>

        {/* 操作状況 */}
        <div className="bg-white/5 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-blue-400" />
            <span>操作状況</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-white/60 text-sm">現在の状態</p>
              <p className={`text-lg font-semibold ${isPaused ? 'text-yellow-400' : 'text-green-400'}`}>
                {isPaused ? '一時停止中' : '稼働中'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm">最終更新</p>
              <p className="text-white font-medium">{new Date().toLocaleTimeString('ja-JP')}</p>
            </div>
          </div>
        </div>

        {/* 操作説明 */}
        <div className="bg-white/5 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">操作説明</h3>
          <ul className="text-white/80 space-y-2">
            <li>• 左右の矢印ボタンで呼び出し番号を変更できます</li>
            <li>• 一時停止ボタンで呼び出しを一時停止できます</li>
            <li>• メール送信ボタンで来場者に案内メールを送信できます</li>
            <li>• 更新ボタンで最新の状況を取得できます</li>
          </ul>
        </div>

        {/* 更新ボタン */}
        <div className="text-center">
          <button
            onClick={fetchCallStatus}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl border border-blue-400"
          >
            <div className="flex items-center space-x-2">
              <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>更新</span>
            </div>
          </button>
        </div>

        {/* メール送信モーダル */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md mx-4 border border-red-500/40 shadow-2xl">
              <div className="flex items-center space-x-2 mb-4">
                <EnvelopeIcon className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">メール送信</h3>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/80 mb-2">メールアドレス</label>
                <input
                  type="email"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/80 mb-2">メッセージ</label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="メッセージを入力してください"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <XMarkIcon className="w-4 h-4" />
                    <span>キャンセル</span>
                  </div>
                </button>
                <button
                  onClick={sendEmail}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <PaperAirplaneIcon className="w-4 h-4" />
                    <span>{isLoading ? '送信中...' : '送信'}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 