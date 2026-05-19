import { useEffect, useState } from "react";
import axios from "axios";
import "./DashboardPage.css";

function DashboardPage() {
  const [resumen, setResumen] = useState(null);
  const [estados, setEstados] = useState([]);
  const [atrasos, setAtrasos] = useState([]);
  const [repuestos, setRepuestos] = useState([]);
  const [reprocesos, setReprocesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const [
          resumenRes,
          estadosRes,
          atrasosRes,
          repuestosRes,
          reprocesosRes,
        ] = await Promise.all([
          axios.get("http://localhost:4000/dashboard/resumen"),
          axios.get("http://localhost:4000/dashboard/estados"),
          axios.get("http://localhost:4000/dashboard/atrasos"),
          axios.get("http://localhost:4000/dashboard/repuestos"),
          axios.get("http://localhost:4000/dashboard/reprocesos"),
        ]);

        setResumen(resumenRes.data);
        setEstados(estadosRes.data);
        setAtrasos(atrasosRes.data);
        setRepuestos(repuestosRes.data);
        setReprocesos(reprocesosRes.data);
      } catch (err) {
        console.error("Error al cargar dashboard:", err);
        setError("No se pudo cargar la información del dashboard");
      } finally {
        setLoading(false);
      }
    };

    cargarDashboard();
  }, []);

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Mini ERP Taller</h1>
        <h2>Dashboard Gerencial</h2>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Total de órdenes</h3>
          <p>{resumen?.total_ordenes}</p>
        </div>

        <div className="card">
          <h3>Listas para entrega</h3>
          <p>{resumen?.listas_para_entrega}</p>
        </div>

        <div className="card">
          <h3>Total reprocesos</h3>
          <p>{resumen?.total_reprocesos}</p>
        </div>

        <div className="card">
          <h3>Pendientes repuestos</h3>
          <p>{resumen?.pendientes_repuestos}</p>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Estados del proceso</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Estado actual</th>
                <th>Total de vehículos</th>
              </tr>
            </thead>
            <tbody>
              {estados.map((item, index) => (
                <tr key={index}>
                  <td><span className="badge">{item.estado_actual}</span></td>
                  <td>{item.total_vehiculos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Órdenes con atrasos</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>No. Orden</th>
                <th>Estado proceso</th>
                <th>Fecha inicio</th>
                <th>Fecha límite</th>
                <th>Motivo atraso</th>
              </tr>
            </thead>
            <tbody>
              {atrasos.length > 0 ? (
                atrasos.map((item, index) => (
                  <tr key={index}>
                    <td>{item.numero_orden}</td>
                    <td>{item.estado_proceso}</td>
                    <td>{new Date(item.fecha_inicio).toLocaleString()}</td>
                    <td>{new Date(item.fecha_limite_etapa).toLocaleString()}</td>
                    <td>{item.motivo_atraso || "Sin motivo registrado"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No hay órdenes con atraso actualmente.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Repuestos Pendientes</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>No. Orden</th>
                <th>Técnico asignado</th>
                <th>Estado actual</th>
                <th>Observación repuestos</th>
              </tr>
            </thead>
            <tbody>
              {repuestos.length > 0 ? (
                repuestos.map((item, index) => (
                  <tr key={index}>
                    <td>{item.numero_orden}</td>
                    <td>{item.tecnico_asignado}</td>
                    <td>{item.estado_actual}</td>
                    <td>{item.observacion_repuestos || "Sin observación"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No hay repuestos pendientes actualmente.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Reprocesos</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID recepción</th>
                <th>Placa</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Cliente</th>
                <th>Motivo reproceso</th>
              </tr>
            </thead>
            <tbody>
              {reprocesos.length > 0 ? (
                reprocesos.map((item, index) => (
                  <tr key={index}>
                    <td>{item.id_recepcion}</td>
                    <td>{item.placa}</td>
                    <td>{item.marca}</td>
                    <td>{item.modelo}</td>
                    <td>{item.nombres} {item.apellidos}</td>
                    <td>{item.motivo_reproceso || "Sin motivo registrado"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No hay reprocesos registrados actualmente.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;