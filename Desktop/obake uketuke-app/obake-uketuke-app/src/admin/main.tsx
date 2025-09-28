import "../index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { AdminApp } from "./AdminApp";

const root = document.getElementById("admin-root")!;
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);
