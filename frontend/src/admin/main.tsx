import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import "../index.css";
import AdminLayout from "./components/AdminLayout";
import TicketsPage from "./pages/TicketsPage";
import CallPage from "./pages/CallPage";
import { IssuePage } from "./pages/IssuePage";
import { SettingsPage } from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import { useEffect, useState } from "react";

// 認証チェックコンポーネント
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const expires = localStorage.getItem('admin_token_expires');
    
    if (!token || !expires) {
      setIsAuthenticated(false);
      return;
    }
    
    // トークンの有効期限チェック
    if (Date.now() > parseInt(expires)) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_token_expires');
      setIsAuthenticated(false);
      return;
    }
    
    setIsAuthenticated(true);
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout/>
            </ProtectedRoute>
          }
        >
          <Route index element={<TicketsPage/>} />
          <Route path="tickets" element={<TicketsPage/>} />
          <Route path="call" element={<CallPage/>} />
          <Route path="issue" element={<IssuePage/>} />
          <Route path="settings" element={<SettingsPage/>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

const container = document.getElementById("admin-root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

