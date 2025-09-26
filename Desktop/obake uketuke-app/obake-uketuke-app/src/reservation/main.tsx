import React from "react";
import ReactDOM from "react-dom/client";
import "../index.css";
import ReservationForm from "../components/ReservationForm";
import { ReservationShell } from "./ReservationShell";

ReactDOM.createRoot(document.getElementById("reservation-root")!)
  .render(
    <React.StrictMode>
      <ReservationShell>
        <ReservationForm />
      </ReservationShell>
    </React.StrictMode>
  );
