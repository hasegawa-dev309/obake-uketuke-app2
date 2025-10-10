import { Link, useLocation } from 'react-router-dom'
import { TicketIcon, MegaphoneIcon, SparklesIcon, HomeIcon, Cog6ToothIcon, UserGroupIcon } from '@heroicons/react/24/outline'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* サイドバー */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl border-r border-gray-200">
        {/* ロゴエリア */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">👻</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">お化け屋敷</h1>
              <p className="text-xs text-gray-500">管理システム</p>
            </div>
          </div>
        </div>

        {/* ナビゲーション */}
        <nav className="p-4 space-y-2">
          <Link
            to="/admin/tickets"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              isActive('/admin/tickets')
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <TicketIcon className={`w-5 h-5 ${isActive('/admin/tickets') ? 'text-white' : 'text-blue-500'}`} />
            <span>整理券管理</span>
          </Link>
          
          <Link
            to="/admin/call"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              isActive('/admin/call')
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <MegaphoneIcon className={`w-5 h-5 ${isActive('/admin/call') ? 'text-white' : 'text-blue-500'}`} />
            <span>呼び出し管理</span>
          </Link>
          
          <Link
            to="/admin/reservation"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              isActive('/admin/reservation')
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <SparklesIcon className={`w-5 h-5 ${isActive('/admin/reservation') ? 'text-white' : 'text-orange-500'}`} />
            <span>整理券発行</span>
          </Link>
        </nav>

        {/* 下部メニュー */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="space-y-2">
            <Link
              to="/reservation"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200"
            >
              <HomeIcon className="w-5 h-5" />
              <span>一般予約フォーム</span>
            </Link>
            <Link
              to="/debug"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200"
            >
              <Cog6ToothIcon className="w-5 h-5" />
              <span>デバッグページ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="ml-64 min-h-screen">
        {/* ヘッダー */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isActive('/admin/tickets') && '整理券管理'}
                {isActive('/admin/call') && '呼び出し管理'}
                {isActive('/admin/reservation') && '整理券発行'}
              </h2>
              <p className="text-gray-600 mt-1">
                {isActive('/admin/tickets') && '来場者の整理券状況を管理できます'}
                {isActive('/admin/call') && '呼び出し番号とシステム状況を管理できます'}
                {isActive('/admin/reservation') && '新しい整理券を発行できます'}
              </p>
            </div>
            
            {/* ヘッダー右側の情報 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <UserGroupIcon className="w-4 h-4" />
                <span className="text-sm">管理者</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* ページコンテンツ */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 