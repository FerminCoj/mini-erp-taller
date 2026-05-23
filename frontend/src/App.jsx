import { useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import ClientesPage from "./pages/ClientesPage";
import VehiculosPage from "./pages/VehiculosPage";
import RecepcionesPage from "./pages/RecepcionesPage";
import OrdenesPage from "./pages/OrdenesPage";
import SeguimientosPage from "./pages/SeguimientosPage";
import EntregasPage from "./pages/EntregasPage";
import logoCAP from "./assets/CAP.png";
import "./App.css";

function App() {
  const [vistaActiva, setVistaActiva] = useState("dashboard");

  return (
    <div className="app-container">
      <nav className="main-nav">
        <div className="nav-brand">
          <img
            src={logoCAP}
            alt="Logo Enderezado y Pintura"
            className="nav-logo"
          />

          <div className="nav-brand-text">
            <span className="nav-brand-title">Enderezado y Pintura</span>
          </div>
        </div>

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

          <button
            className={vistaActiva === "recepciones" ? "active" : ""}
            onClick={() => setVistaActiva("recepciones")}
          >
            Recepción
          </button>

          <button
            className={vistaActiva === "ordenes" ? "active" : ""}
            onClick={() => setVistaActiva("ordenes")}
          >
            Órdenes
          </button>

          <button
            className={vistaActiva === "seguimientos" ? "active" : ""}
            onClick={() => setVistaActiva("seguimientos")}
          >
            Seguimiento
          </button>

          <button
            className={vistaActiva === "entregas" ? "active" : ""}
            onClick={() => setVistaActiva("entregas")}
          >
            Entrega
          </button>
        </div>
      </nav>

      <main className="main-content">
        {vistaActiva === "dashboard" && <DashboardPage />}
        {vistaActiva === "clientes" && <ClientesPage />}
        {vistaActiva === "vehiculos" && <VehiculosPage />}
        {vistaActiva === "recepciones" && <RecepcionesPage />}
        {vistaActiva === "ordenes" && <OrdenesPage />}
        {vistaActiva === "seguimientos" && <SeguimientosPage />}
        {vistaActiva === "entregas" && <EntregasPage />}
      </main>
    </div>
  );
}

export default App;