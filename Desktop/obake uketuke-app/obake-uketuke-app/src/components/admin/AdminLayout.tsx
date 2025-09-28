interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f8ff,#ffffff)]">
      <div className="flex">
        {/* サイドバー */}
        <div className="fixed inset-y-0 left-0 w-[240px] bg-white border-r border-slate-200 z-30">
          {/* サイドバーコンテンツは別コンポーネントで実装 */}
        </div>
        
        {/* メインコンテンツ */}
        <div className="flex-1 pl-[240px]">
          {/* トップバー */}
          <div className="fixed top-0 right-0 left-[240px] h-16 bg-white border-b border-slate-200 z-20">
            {/* トップバーコンテンツは別コンポーネントで実装 */}
          </div>
          
          {/* ページコンテンツ */}
          <main className="pt-16">
            <div className="max-w-[1200px] mx-auto px-6 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
