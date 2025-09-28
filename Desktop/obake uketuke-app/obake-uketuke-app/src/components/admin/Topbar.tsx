import { Search, Download, User } from "lucide-react";

interface TopbarProps {
  title: string;
  onSearch?: (query: string) => void;
  onExport?: () => void;
}

export default function Topbar({ title, onSearch, onExport }: TopbarProps) {
  return (
    <div className="fixed top-0 right-0 left-[240px] h-16 bg-white border-b border-slate-200 z-20 flex items-center justify-between px-6">
      {/* 左側: タイトル */}
      <div>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      </div>

      {/* 右側: 検索・エクスポート・プロフィール */}
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

        {/* プロフィール */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium text-slate-700">管理者</span>
        </div>
      </div>
    </div>
  );
}
