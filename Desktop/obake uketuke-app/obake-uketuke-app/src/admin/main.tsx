import React from "react";
import ReactDOM from "react-dom/client";
import { AdminApp } from "./AdminApp";
import "../index.css"; // 既存のグローバルCSSを流用（ファイル自体は変更禁止）

ReactDOM.createRoot(document.getElementById("admin-root")!).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);
