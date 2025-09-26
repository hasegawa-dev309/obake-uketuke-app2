import React from "react";
import ReactDOM from "react-dom/client";
import "../index.css";
import ReservationForm from "../components/ReservationForm";
import { ReservationShell } from "./ReservationShell";
import ReservationComplete from "./ReservationComplete";

const isComplete = location.pathname.includes("/reservation/complete");

ReactDOM.createRoot(document.getElementById("reservation-root")!)
  .render(
    <React.StrictMode>
      <ReservationShell>
        {isComplete ? <ReservationComplete /> : <ReservationForm />}
      </ReservationShell>
    </React.StrictMode>
  );
