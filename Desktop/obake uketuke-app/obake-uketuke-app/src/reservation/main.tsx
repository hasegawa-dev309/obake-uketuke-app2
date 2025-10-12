import "../index.css";
import { createRoot } from "react-dom/client";
import ReservationApp from "./ReservationApp";

const el = document.getElementById("reservation-root");
if (el) createRoot(el).render(<ReservationApp />);
