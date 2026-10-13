import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import ReservationApp from "./reservation/ReservationApp";
import TicketPage from "./ticket/TicketPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReservationApp />} />
        <Route path="/reservation" element={<ReservationApp />} />
        <Route path="/ticket/:token" element={<TicketPage />} />
      </Routes>
    </BrowserRouter>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
