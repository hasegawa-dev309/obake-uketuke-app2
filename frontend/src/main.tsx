import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import ReservationApp from "./reservation/ReservationApp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReservationApp />} />
        <Route path="/reservation" element={<ReservationApp />} />
      </Routes>
    </BrowserRouter>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
