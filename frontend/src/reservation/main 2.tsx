import React from "react";
import { createRoot } from "react-dom/client";
import ReservationApp from "./ReservationApp";
import "../index.css";
createRoot(document.getElementById("reservation-root")!).render(<ReservationApp />);