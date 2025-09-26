import "../index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import ReservationForm from "../components/ReservationForm";
import { HeaderNav } from "./HeaderNav";
import { ReservationShell } from "./ReservationShell";

ReactDOM.createRoot(document.getElementById("reservation-root")!).render(
  <React.StrictMode>
    <HeaderNav />
    <ReservationShell>
      <ReservationForm />
    </ReservationShell>
  </React.StrictMode>
);
