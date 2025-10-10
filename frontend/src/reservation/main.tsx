import { createRoot } from "react-dom/client";
import ReservationApp from "./ReservationApp";
import "../index.css";

const container = document.getElementById("reservation-root");
if (container) {
  const root = createRoot(container);
  root.render(<ReservationApp />);
}
