interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f8ff,#ffffff)] flex">
      {/* サイドバー */}
      <div className="w-[240px] bg-slate-800 text-white flex flex-col h-screen">
        {/* サイドバーコンテンツは別コンポーネントで実装 */}
      </div>
      
      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        {/* ヘッダー */}
        <div className="h-16 bg-white border-b border-slate-200">
          {/* ヘッダーコンテンツは別コンポーネントで実装 */}
        </div>
        
        {/* ページコンテンツ */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1200px] mx-auto px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
