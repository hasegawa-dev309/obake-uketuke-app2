interface FiltersProps {
  ageGroup: string;
  status: string;
  searchQuery: string;
  onAgeGroupChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onExport: () => void;
}

export default function Filters({
  ageGroup,
  status,
  searchQuery,
  onAgeGroupChange,
  onStatusChange,
  onSearchChange,
  onExport,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center justify-between bg-white rounded-2xl p-3 shadow-sm">
      <div className="flex flex-wrap gap-3">
        {/* 年齢層フィルタ */}
        <select
          value={ageGroup}
          onChange={(e) => onAgeGroupChange(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">年齢層: すべて</option>
          <option value="高校生以下">高校生以下</option>
          <option value="大学生">大学生</option>
          <option value="一般">一般</option>
        </select>

        {/* 状態フィルタ */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">状態: すべて</option>
          <option value="queued">未呼出</option>
          <option value="arrived">来場済</option>
          <option value="no-show">未確認</option>
        </select>

        {/* 検索 */}
        <input
          type="text"
          placeholder="整理券番号・メール・人数で検索"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 w-64"
        />
      </div>

      {/* エクスポートボタン */}
      <button
        onClick={onExport}
        className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
      >
        エクスポート (CSV)
      </button>
    </div>
  );
}
