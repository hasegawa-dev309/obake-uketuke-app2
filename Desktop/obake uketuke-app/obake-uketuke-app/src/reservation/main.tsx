import React from "react";
import ReactDOM from "react-dom/client";
import ReservationForm from "../components/ReservationForm";
import "../index.css"; // 既存のグローバルCSSをimport

ReactDOM.createRoot(document.getElementById("reservation-root")!).render(
  <React.StrictMode>
    <ReservationForm />
  </React.StrictMode>
);
