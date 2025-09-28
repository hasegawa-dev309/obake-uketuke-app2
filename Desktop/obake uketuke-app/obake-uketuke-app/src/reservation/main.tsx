import React from "react";
import { createRoot } from "react-dom/client";
import MobileReservationApp from "./MobileReservationApp";

const el = document.getElementById("reservation-root");
if (el) createRoot(el).render(<MobileReservationApp />);
