import { useState } from 'react';
import { resetCounter, deleteAllReservations } from '../../lib/api';

export function SettingsPage() {
  const [loading, setLoading] = useState(false);

  const handleClearData = async () => {
    if (!confirm('すべてのデータを削除します。よろしいですか？（取り消し不可）')) {
      return;
    }
    
    setLoading(true);
    try {
      // 直接fetchでテスト
      const token = localStorage.getItem('admin_token');
      console.log('🔍 [DEBUG] Token:', token ? 'Found' : 'Not found');
      console.log('🔍 [DEBUG] API URL:', import.meta.env.VITE_API_URL);
      
      const url = `${import.meta.env.VITE_API_URL}/reservations/clear-all`;
      console.log('🔍 [DEBUG] Request URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('🔍 [DEBUG] Response status:', response.status);
      console.log('🔍 [DEBUG] Response headers:', Object.fromEntries(response.headers.entries()));
      
      const result = await response.json();
      console.log('🔍 [DEBUG] Response data:', result);

      if (!response.ok || !result.ok) {
        const msg = result.error || result.detail || `HTTP ${response.status}`;
        alert(`エラー: ${msg}`);
        return;
      }
      
      alert('すべてのデータを削除しました。');
      // 画面状態のキャッシュもクリア
      localStorage.removeItem('admin_tickets');
      localStorage.removeItem('admin_stats');
      localStorage.removeItem('lastTicketNumber');
      localStorage.removeItem('currentNumber');
      localStorage.removeItem('obake_tickets_v1');
      localStorage.removeItem('current_number');
      localStorage.removeItem('ticket_counter');
      // 再読込み
      setTimeout(() => window.location.reload(), 300);
    } catch (e: any) {
      console.error('🔍 [DEBUG] Error:', e);
      alert(`エラー: ${e?.message ?? 'unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetCallNumber = async () => {
    if (!confirm("呼び出し番号と整理券番号を1にリセットしますか？")) {
      return;
    }
    
    setLoading(true);
    try {
      const result = await resetCounter();
      
      if (result.ok) {
        alert(result.message || "カウンターをリセットしました");
        // LocalStorageもクリーンアップ（互換性のため）
        localStorage.removeItem("current_number");
        localStorage.removeItem("ticket_counter");
        localStorage.removeItem("lastTicketNumber");
        window.location.reload();
      } else {
        alert(`エラー: ${result.error || "リセットに失敗しました"}`);
      }
    } catch (err) {
      console.error("カウンターリセットエラー:", err);
      alert("カウンターリセットに失敗しました。ネットワークを確認してください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">設定</h1>
      
      {/* システム操作 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">システム操作</h2>
        
        <div className="space-y-4">
          <div>
            <button 
              onClick={handleResetCallNumber}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? "処理中..." : "呼び出し番号・整理券番号をリセット"}
            </button>
            <p className="text-sm text-slate-600 mt-2">
              呼び出し番号と整理券番号を1に戻します
            </p>
          </div>

          <div className="pt-4 border-t">
            <button 
              onClick={handleClearData}
              disabled={loading}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? "処理中..." : "すべてのデータをクリア"}
            </button>
            <p className="text-sm text-slate-600 mt-2">
              ⚠️ すべての整理券データと呼び出し番号が削除されます（取り消し不可）
            </p>
          </div>
        </div>
      </div>

      {/* システム情報 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">システム情報</h2>
        <div className="text-sm text-gray-600 space-y-2">
          <div>環境: {import.meta.env.MODE}</div>
          <div>バージョン: 1.0.0</div>
        </div>
      </div>
    </div>
  );
}
