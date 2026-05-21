import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./DashboardPage.css";

function DashboardPage() {
  const [resumen, setResumen] = useState(null);
  const [estados, setEstados] = useState([]);
  const [detalleEstados, setDetalleEstados] = useState([]);
  const [atrasos, setAtrasos] = useState([]);
  const [repuestos, setRepuestos] = useState([]);
  const [reprocesos, setReprocesos] = useState([]);
  const [entregasSemanales, setEntregasSemanales] = useState([]);
  const [entregasMensuales, setEntregasMensuales] = useState([]);
  const [vistaActiva, setVistaActiva] = useState("detalle");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const detalleRef = useRef(null);
  const reprocesosRef = useRef(null);
  const resumenEntregasRef = useRef(null);
  const atrasosRef = useRef(null);
  const repuestosRef = useRef(null);

  const nombresMeses = {
    1: "Ene",
    2: "Feb",
    3: "Mar",
    4: "Abr",
    5: "May",
    6: "Jun",
    7: "Jul",
    8: "Ago",
    9: "Sep",
    10: "Oct",
    11: "Nov",
    12: "Dic",
  };

  const formatearFechaHora = (fecha) => {
    if (!fecha) return "Sin fecha";

    const date = new Date(fecha);
    const anio = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    const horas = String(date.getHours()).padStart(2, "0");
    const minutos = String(date.getMinutes()).padStart(2, "0");

    return `${anio}-${mes}-${dia} ${horas}:${minutos}`;
  };

  const obtenerClaseSituacion = (situacion) => {
    switch (situacion) {
      case "Atrasado":
        return "badge badge-danger";
      case "En tiempo":
        return "badge badge-success";
      case "Finalizado":
        return "badge badge-primary";
      case "Sin fecha límite":
        return "badge badge-warning";
      default:
        return "badge";
    }
  };

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const [
          resumenRes,
          estadosRes,
          detalleEstadosRes,
          atrasosRes,
          repuestosRes,
          reprocesosRes,
          semanalesRes,
          mensualesRes,
        ] = await Promise.all([
          axios.get("http://localhost:4000/dashboard/resumen"),
          axios.get("http://localhost:4000/dashboard/estados"),
          axios.get("http://localhost:4000/dashboard/detalle-estados"),
          axios.get("http://localhost:4000/dashboard/atrasos"),
          axios.get("http://localhost:4000/dashboard/repuestos"),
          axios.get("http://localhost:4000/dashboard/reprocesos"),
          axios.get("http://localhost:4000/dashboard/entregas-semanales"),
          axios.get("http://localhost:4000/dashboard/entregas-mensuales"),
        ]);

        setResumen(resumenRes.data);
        setEstados(estadosRes.data);
        setDetalleEstados(detalleEstadosRes.data);
        setAtrasos(atrasosRes.data);
        setRepuestos(repuestosRes.data);
        setReprocesos(reprocesosRes.data);
        setEntregasSemanales(semanalesRes.data);
        setEntregasMensuales(mensualesRes.data);
      } catch (err) {
        console.error("Error al cargar dashboard:", err);
        setError("No se pudo cargar la información del dashboard");
      } finally {
        setLoading(false);
      }
    };

    cargarDashboard();
  }, []);

  useEffect(() => {
    if (loading) return;

    let destino = detalleRef.current;

    if (vistaActiva === "reprocesos") destino = reprocesosRef.current;
    if (vistaActiva === "resumen-entregas") destino = resumenEntregasRef.current;
    if (vistaActiva === "atrasados") destino = atrasosRef.current;
    if (vistaActiva === "repuestos") destino = repuestosRef.current;

    if (destino) {
      setTimeout(() => {
        destino.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [vistaActiva, estadoSeleccionado, loading]);

  const cambiarVista = (vista) => {
    setVistaActiva(vista);
    setEstadoSeleccionado("");
  };

  const seleccionarEstado = (estado) => {
    setVistaActiva("estado-especifico");
    setEstadoSeleccionado(estado);
  };

  const vehiculosEnProceso = useMemo(() => {
    return detalleEstados.filter(
      (item) =>
        item.estado_actual !== "Entregado" &&
        item.situacion_tiempo !== "Finalizado"
    ).length;
  }, [detalleEstados]);

  const detalleFiltrado = useMemo(() => {
    switch (vistaActiva) {
      case "detalle":
        return detalleEstados;

      case "proceso":
        return detalleEstados.filter(
          (item) =>
            item.estado_actual !== "Entregado" &&
            item.situacion_tiempo !== "Finalizado"
        );

      case "listas":
        return detalleEstados.filter(
          (item) => item.estado_actual === "Listo para entrega"
        );

      case "entregados":
        return detalleEstados.filter(
          (item) =>
            item.estado_actual === "Entregado" ||
            item.situacion_tiempo === "Finalizado"
        );

      case "estado-especifico":
        return detalleEstados.filter(
          (item) => item.estado_actual === estadoSeleccionado
        );

      default:
        return detalleEstados;
    }
  }, [vistaActiva, detalleEstados, estadoSeleccionado]);

  const tituloTablaPrincipal = useMemo(() => {
    switch (vistaActiva) {
      case "detalle":
        return "Detalle operativo por vehículo";
      case "proceso":
        return "Vehículos en proceso";
      case "listas":
        return "Vehículos listos para entrega";
      case "entregados":
        return "Vehículos entregados";
      case "estado-especifico":
        return `Detalle de vehículos - ${estadoSeleccionado}`;
      default:
        return "Detalle operativo por vehículo";
    }
  }, [vistaActiva, estadoSeleccionado]);

  const datosMensualesGrafica = useMemo(() => {
    return entregasMensuales.map((item) => ({
      mes: nombresMeses[item.mes] || `Mes ${item.mes}`,
      entregas: Number(item.total_entregas),
    }));
  }, [entregasMensuales]);

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Taller Automotriz</h1>
        <h2>Calidad y precisión en cada reparación</h2>
      </div>

      <div className="cards">
        <button className="card card-button" onClick={() => cambiarVista("detalle")}>
          <h3>Total de órdenes</h3>
          <p>{resumen?.total_ordenes}</p>
        </button>

        <button className="card card-button" onClick={() => cambiarVista("proceso")}>
          <h3>Vehículos en proceso</h3>
          <p>{vehiculosEnProceso}</p>
        </button>

        <button className="card card-button" onClick={() => cambiarVista("listas")}>
          <h3>Listas para entrega</h3>
          <p>{resumen?.listas_para_entrega}</p>
        </button>

        <button className="card card-button" onClick={() => cambiarVista("entregados")}>
          <h3>Vehículos entregados</h3>
          <p>{resumen?.total_entregados}</p>
        </button>

        <button className="card card-button" onClick={() => cambiarVista("repuestos")}>
          <h3>Pendientes repuestos</h3>
          <p>{resumen?.pendientes_repuestos}</p>
        </button>

        <button className="card card-button" onClick={() => cambiarVista("atrasados")}>
          <h3>Órdenes atrasadas</h3>
          <p>{atrasos.length}</p>
        </button>

        <button className="card card-button" onClick={() => cambiarVista("reprocesos")}>
          <h3>Total reprocesos</h3>
          <p>{resumen?.total_reprocesos}</p>
        </button>

        <button
          className="card card-button"
          onClick={() => cambiarVista("resumen-entregas")}
        >
          <h3>Resumen de Entregas</h3>
          <p>{resumen?.total_entregados}</p>
        </button>
      </div>

      <div className="section">
        <h3 className="section-title">Estados del proceso</h3>
        <div className="states-grid">
          {estados.length > 0 ? (
            estados.map((item, index) => (
              <button
                key={index}
                className="state-card state-button"
                onClick={() => seleccionarEstado(item.estado_actual)}
                type="button"
              >
                <span className="state-label">{item.estado_actual}</span>
                <span className="state-value">{item.total_vehiculos}</span>
              </button>
            ))
          ) : (
            <div className="empty-box">No hay estados registrados.</div>
          )}
        </div>
      </div>

      {vistaActiva === "resumen-entregas" && (
        <div className="section" ref={resumenEntregasRef}>
          <h3 className="section-title">Resumen de entregas</h3>
          <div className="delivery-summary-grid">
            <div className="chart-card">
              <h4>Entregas mensuales</h4>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={datosMensualesGrafica}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="entregas" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="table-card">
              <h4>Entregas semanales</h4>
              <div className="table-container small-table">
                <table>
                  <thead>
                    <tr>
                      <th>Semana</th>
                      <th>Total entregas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entregasSemanales.length > 0 ? (
                      entregasSemanales.map((item, index) => (
                        <tr key={index}>
                          <td>Semana {item.semana}</td>
                          <td>{item.total_entregas}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2">No hay entregas registradas.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {["detalle", "proceso", "listas", "entregados", "estado-especifico"].includes(
        vistaActiva
      ) && (
        <div className="section" ref={detalleRef}>
          <h3 className="section-title">{tituloTablaPrincipal}</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>No. Orden</th>
                  <th>Estado actual</th>
                  <th>Vehículo</th>
                  <th>Cliente</th>
                  <th>Técnico</th>
                  <th>Fecha límite</th>
                  <th>Situación</th>
                </tr>
              </thead>
              <tbody>
                {detalleFiltrado.length > 0 ? (
                  detalleFiltrado.map((item) => (
                    <tr key={item.id_orden}>
                      <td>{item.numero_orden}</td>
                      <td>{item.estado_actual}</td>
                      <td>
                        {item.placa} - {item.marca} {item.modelo}
                      </td>
                      <td>
                        {item.nombres} {item.apellidos}
                      </td>
                      <td>{item.tecnico_asignado || "Sin asignar"}</td>
                      <td>{formatearFechaHora(item.fecha_limite_etapa)}</td>
                      <td>
                        <span className={obtenerClaseSituacion(item.situacion_tiempo)}>
                          {item.situacion_tiempo}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No hay registros para esta vista.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {vistaActiva === "reprocesos" && (
        <div className="section" ref={reprocesosRef}>
          <h3 className="section-title">Detalle de reprocesos</h3>
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
                      <td>
                        {item.nombres} {item.apellidos}
                      </td>
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
      )}

      {vistaActiva === "atrasados" && (
        <div className="section" ref={atrasosRef}>
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
                      <td>{formatearFechaHora(item.fecha_inicio)}</td>
                      <td>{formatearFechaHora(item.fecha_limite_etapa)}</td>
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
      )}

      {vistaActiva === "repuestos" && (
        <div className="section" ref={repuestosRef}>
          <h3 className="section-title">Repuestos pendientes</h3>
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
      )}
    </div>
  );
}

export default DashboardPage;