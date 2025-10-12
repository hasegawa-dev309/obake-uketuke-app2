import { useState } from 'react';
import { resetCallNumber, clearAllData } from '../../lib/api';

export function SettingsPage() {
  const [loading, setLoading] = useState(false);

  const handleClearData = async () => {
    if (!confirm("すべての整理券データをクリアしますか？この操作は取り消せません。")) {
      return;
    }
    
    try {
      setLoading(true);
      const result = await clearAllData();
      
      if (result.ok) {
        alert(result.message || "データをクリアしました");
        window.location.reload();
      } else {
        alert(`エラー: ${result.error || '不明なエラー'}`);
      }
    } catch (error) {
      console.error('データクリアエラー:', error);
      alert('データのクリアに失敗しました。管理者としてログインしていることを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  const handleResetCallNumber = async () => {
    if (!confirm("呼び出し番号と整理券番号を1にリセットしますか？")) {
      return;
    }
    
    try {
      setLoading(true);
      const result = await resetCallNumber();
      
      if (result.ok) {
        alert(result.message || "呼び出し番号をリセットしました");
        window.location.reload();
      } else {
        alert(`エラー: ${result.error || '不明なエラー'}`);
      }
    } catch (error) {
      console.error('番号リセットエラー:', error);
      alert('番号のリセットに失敗しました。管理者としてログインしていることを確認してください。');
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
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '処理中...' : '呼び出し番号・整理券番号をリセット'}
            </button>
            <p className="text-sm text-slate-600 mt-2">
              呼び出し番号と整理券番号を1に戻します
            </p>
          </div>

          <div className="pt-4 border-t">
            <button 
              onClick={handleClearData}
              disabled={loading}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '処理中...' : 'すべてのデータをクリア'}
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
