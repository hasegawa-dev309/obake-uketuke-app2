import "../index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import ReservationForm from "../components/ReservationForm";

ReactDOM.createRoot(document.getElementById("reservation-root")!).render(
  <React.StrictMode>
    <ReservationForm />
  </React.StrictMode>
);
