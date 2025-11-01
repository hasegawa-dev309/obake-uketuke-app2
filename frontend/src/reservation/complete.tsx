import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import "../index.css";
import { API_CONFIG } from "../config/api.config";

const API_BASE = API_CONFIG.baseURL.replace(/\/api$/, '');

function CompletePage() {
  const [ticketNo, setTicketNo] = useState<string>("");
  const [currentNumber, setCurrentNumber] = useState<number>(0);
  const [currentTicketNumber, setCurrentTicketNumber] = useState<number>(0);

  useEffect(() => {
    // URLパラメータから整理券番号を取得
    const urlParams = new URLSearchParams(window.location.search);
    const ticket = urlParams.get('ticket') || '';
    console.log('URL params:', window.location.search);
    console.log('Ticket from URL:', ticket);
    setTicketNo(ticket);

    // APIから現在の呼び出し番号と整理券番号を取得
    const fetchCurrentNumbers = async () => {
      try {
        console.log('API呼び出し開始...');
        
        const date = new Date().toISOString().split('T')[0];
        const cacheBust = Date.now();
        
        // 現在の呼び出し番号を取得（キャッシュ無効化）
        const statusResponse = await fetch(`${API_BASE}/api/reservations/status?date=${date}&v=${cacheBust}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-store'
        });
        
        console.log('Status response:', statusResponse.status);
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          console.log('Status data:', statusData);
          setCurrentNumber(statusData.data?.currentNumber || 1);
        } else {
          console.error('Status API error:', statusResponse.status, statusResponse.statusText);
        }

        // 現在の整理券番号（カウンター）を取得（キャッシュ無効化）
        const counterResponse = await fetch(`${API_BASE}/api/reservations/counter?date=${date}&v=${cacheBust}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-store'
        });
        
        console.log('Counter response:', counterResponse.status);
        if (counterResponse.ok) {
          const counterData = await counterResponse.json();
          console.log('Counter data:', counterData);
          setCurrentTicketNumber(counterData.data?.counter || 1);
        } else {
          console.error('Counter API error:', counterResponse.status, counterResponse.statusText);
        }
        
        console.log('API呼び出し完了');
      } catch (err) {
        console.error("現在の番号取得エラー:", err);
      }
    };
    
    fetchCurrentNumbers();
    // 定期的に更新（3秒ごと）
    const interval = setInterval(fetchCurrentNumbers, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#fff6ef] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mb-6">
          ✓
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          整理券発行完了
        </h1>
        
        <p className="text-gray-600 mb-6">
          整理券が正常に発行されました！
        </p>

        <div className="mb-6">
          {ticketNo && (
            <>
              <div className="text-sm text-gray-500 mb-2">あなたの整理券番号</div>
              <div className="text-5xl font-bold text-violet-600 mb-4">
                #{ticketNo}
              </div>
            </>
          )}
          
          {/* デバッグ情報 */}
          <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mb-4">
            <div className="text-sm text-yellow-800 font-bold">
              🔧 デバッグ情報
            </div>
            <div className="text-xs text-yellow-700">
              ticketNo: {ticketNo || 'なし'} | currentNumber: {currentNumber} | currentTicketNumber: {currentTicketNumber}
            </div>
          </div>
          
          {/* 現在の状況表示 - 常に表示 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">現在の整理券番号</div>
              <div className="text-2xl font-bold text-green-600">
                #{currentTicketNumber}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">現在の呼び出し番号</div>
              <div className="text-2xl font-bold text-blue-600">
                #{currentNumber}
              </div>
            </div>
          </div>
          
          {ticketNo && Number(ticketNo) - currentNumber > 0 && (
            <div className="mt-3 text-sm text-gray-500">
              あと約 <span className="font-bold text-violet-600">{Number(ticketNo) - currentNumber}</span> 組お待ちください
            </div>
          )}
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm font-medium">
            この画面は受付で使用するため、スクリーンショットをお願いいたします。
          </p>
        </div>

        <button
          onClick={() => window.location.href = '/reservation.html'}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-medium transition-colors"
        >
          新しく整理券を発行する
        </button>
      </div>
    </div>
  );
}

const container = document.getElementById("reservation-root");
if (container) {
  const root = createRoot(container);
  root.render(<CompletePage />);
}
