import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import "../index.css";

const API_BASE_URL = 'https://obake-uketuke-app-ae91e2b5463a.herokuapp.com/api';

function CompletePage() {
  const [ticketNo, setTicketNo] = useState<string>("");
  const [currentNumber, setCurrentNumber] = useState<number>(1);

  useEffect(() => {
    // URLパラメータから整理券番号を取得
    const urlParams = new URLSearchParams(window.location.search);
    const ticket = urlParams.get('ticket') || '';
    setTicketNo(ticket);

    // APIから現在の呼び出し番号を取得
    const fetchCurrentNumber = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/reservations/current-number`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors'
        });
        
        if (response.ok) {
          const data = await response.json();
          setCurrentNumber(data.currentNumber || 1);
        }
      } catch (err) {
        console.error("現在の番号取得エラー:", err);
      }
    };
    
    fetchCurrentNumber();
    // 定期的に更新（3秒ごと）
    const interval = setInterval(fetchCurrentNumber, 3000);
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

        {ticketNo && (
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">あなたの整理券番号</div>
            <div className="text-5xl font-bold text-violet-600 mb-4">
              #{ticketNo}
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <div>
                <span className="text-gray-500">現在の呼び出し番号: </span>
                <span className="font-bold text-violet-700 text-lg">#{currentNumber}</span>
              </div>
            </div>
            {Number(ticketNo) - currentNumber > 0 && (
              <div className="mt-3 text-sm text-gray-500">
                あと約 <span className="font-bold text-violet-600">{Number(ticketNo) - currentNumber}</span> 組お待ちください
              </div>
            )}
          </div>
        )}

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
