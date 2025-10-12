import { Search, Download, User, LogOut } from "lucide-react";

interface TopbarProps {
  title: string;
  onSearch?: (query: string) => void;
  onExport?: () => void;
}

export default function Topbar({ title, onSearch, onExport }: TopbarProps) {
  return (
    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      {/* 左側: ページタイトル */}
      <div>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      </div>

      {/* 右側: 検索・エクスポート・管理者・ログアウト */}
      <div className="flex items-center gap-4">
        {/* 検索バー */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="検索..."
            className="pl-10 pr-4 py-2 w-64 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>

        {/* エクスポートボタン */}
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span className="text-sm">エクスポート</span>
        </button>

        {/* 管理者 */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium text-slate-700">管理者</span>
        </div>

        {/* ログアウト */}
        <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
