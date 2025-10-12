import { useState } from "react";
import { resetCounter, clearAllData } from "../../lib/api";

export function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClearData = async () => {
    if (!confirm("すべての整理券データをクリアしますか？この操作は取り消せません。")) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await clearAllData();
      
      if (result.ok) {
        alert(result.message || "すべてのデータをクリアしました");
        window.location.reload();
      } else {
        alert(`エラー: ${result.error || "データのクリアに失敗しました"}`);
      }
    } catch (err) {
      console.error("データクリアエラー:", err);
      alert("データのクリアに失敗しました。ネットワーク接続を確認してください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCallNumber = async () => {
    if (!confirm("呼び出し番号と整理券番号を1にリセットしますか？")) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetCounter();
      
      if (result.ok) {
        alert(result.message || "呼び出し番号をリセットしました");
        window.location.reload();
      } else {
        alert(`エラー: ${result.error || "リセットに失敗しました"}`);
      }
    } catch (err) {
      console.error("リセットエラー:", err);
      alert("リセットに失敗しました。ネットワーク接続を確認してください。");
    } finally {
      setIsLoading(false);
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
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "処理中..." : "呼び出し番号・整理券番号をリセット"}
            </button>
            <p className="text-sm text-slate-600 mt-2">
              呼び出し番号と整理券番号を1に戻します
            </p>
          </div>

          <div className="pt-4 border-t">
            <button 
              onClick={handleClearData}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "処理中..." : "すべてのデータをクリア"}
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
