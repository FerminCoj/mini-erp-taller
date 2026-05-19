import { useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import ClientesPage from "./pages/ClientesPage";
import VehiculosPage from "./pages/VehiculosPage";
import "./App.css";

function App() {
  const [vistaActiva, setVistaActiva] = useState("dashboard");

  return (
    <div>
      <nav className="main-nav">
        <div className="nav-brand">Mini ERP Taller</div>

        <div className="nav-buttons">
          <button
            className={vistaActiva === "dashboard" ? "active" : ""}
            onClick={() => setVistaActiva("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={vistaActiva === "clientes" ? "active" : ""}
            onClick={() => setVistaActiva("clientes")}
          >
            Clientes
          </button>

          <button
            className={vistaActiva === "vehiculos" ? "active" : ""}
            onClick={() => setVistaActiva("vehiculos")}
          >
            Vehículos
          </button>
        </div>
      </nav>

      {vistaActiva === "dashboard" && <DashboardPage />}
      {vistaActiva === "clientes" && <ClientesPage />}
      {vistaActiva === "vehiculos" && <VehiculosPage />}
    </div>
  );
}

export default App;