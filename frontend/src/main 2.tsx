import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider, Navigate } from "react-router-dom";
import AdminTickets from "./admin/pages/AdminTickets";
import ReservationForm from "./pages/ReservationForm";
import "./index.css";

// HashRouter に切り替え（/index.html#/... 形式）: 再読込や静的ホスティングでも 404 を防ぐ
const router = createHashRouter([
  // ルートに来たら予約フォームへ
  { path: "/", element: <Navigate to="/reservation" replace /> },

  // 予約フォーム
  { path: "/reservation", element: <ReservationForm /> },

  // 管理系
  { path: "/admin/tickets", element: <AdminTickets /> },
  { path: "/admin/call", element: <div className="p-6">呼び出し管理（準備中）</div> },
  { path: "/admin/issue", element: <div className="p-6">整理券発行（準備中）</div> },
  { path: "/admin/settings", element: <div className="p-6">設定（準備中）</div> },

  // 古いURLや存在しないURLは管理トップへ退避
  { path: "*", element: <Navigate to="/admin/tickets" replace /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);