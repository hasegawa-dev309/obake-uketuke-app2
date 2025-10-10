import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import "../index.css";

function CompletePage() {
  const [ticketNo, setTicketNo] = useState<string>("");

  useEffect(() => {
    // URLパラメータから整理券番号を取得
    const urlParams = new URLSearchParams(window.location.search);
    const ticket = urlParams.get('ticket') || '';
    setTicketNo(ticket);
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
            <div className="text-sm text-gray-500 mb-2">整理券番号</div>
            <div className="text-4xl font-bold text-violet-600">
              #{ticketNo}
            </div>
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
