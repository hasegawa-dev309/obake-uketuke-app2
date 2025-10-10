import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import "../index.css";
import AdminLayout from "./components/AdminLayout";
import TicketsPage from "./pages/TicketsPage";
import CallPage from "./pages/CallPage";
import { IssuePage } from "./pages/IssuePage";
import { SettingsPage } from "./pages/SettingsPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AdminLayout/>}>
          <Route index element={<TicketsPage/>} />
          <Route path="tickets" element={<TicketsPage/>} />
          <Route path="call" element={<CallPage/>} />
          <Route path="issue" element={<IssuePage/>} />
          <Route path="settings" element={<SettingsPage/>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

const container = document.getElementById("admin-root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
