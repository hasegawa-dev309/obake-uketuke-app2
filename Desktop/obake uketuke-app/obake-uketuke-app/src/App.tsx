import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './components/HomePage'
import { ReservationForm } from './components/ReservationForm'
import { ReservationComplete } from './components/ReservationComplete'
import { MyPage } from './components/MyPage'
import { AdminCall } from './components/admin/AdminCall'
import { AdminTickets } from './components/admin/AdminTickets'
import { AdminReservationForm } from './components/admin/AdminReservationForm'
import { UserLayout } from './components/UserLayout'
import { AdminLayout } from './components/AdminLayout'

function App() {
  return (
    <Router>
      <Routes>
        {/* ホームページ */}
        <Route path="/" element={<HomePage />} />
        
        {/* 一般ユーザー向けルート */}
        <Route path="/reservation" element={
          <UserLayout>
            <ReservationForm />
          </UserLayout>
        } />
        <Route path="/reservation/complete" element={
          <UserLayout>
            <ReservationComplete />
          </UserLayout>
        } />
        <Route path="/mypage" element={
          <UserLayout>
            <MyPage />
          </UserLayout>
        } />
        
        {/* 管理者向けルート - 認証なしでアクセス可能 */}
        <Route path="/admin" element={<Navigate to="/admin/tickets" replace />} />
        <Route path="/admin/call" element={
          <AdminLayout>
            <AdminCall />
          </AdminLayout>
        } />
        <Route path="/admin/tickets" element={
          <AdminLayout>
            <AdminTickets />
          </AdminLayout>
        } />
        <Route path="/admin/reservation" element={
          <AdminLayout>
            <AdminReservationForm />
          </AdminLayout>
        } />
        
        {/* デバッグ用ルート - 直接アクセス可能 */}
        <Route path="/debug" element={
          <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-2xl font-bold mb-4">デバッグページ</h1>
            <div className="space-y-4">
              <a href="/reservation" className="block p-4 bg-blue-500 text-white rounded hover:bg-blue-600">
                一般予約フォーム
              </a>
              <a href="/admin/tickets" className="block p-4 bg-green-500 text-white rounded hover:bg-green-600">
                管理者 - 整理券管理
              </a>
              <a href="/admin/call" className="block p-4 bg-purple-500 text-white rounded hover:bg-purple-600">
                管理者 - 呼び出し管理
              </a>
              <a href="/admin/reservation" className="block p-4 bg-orange-500 text-white rounded hover:bg-orange-600">
                管理者 - 整理券発行
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App 