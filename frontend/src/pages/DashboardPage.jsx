import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
  const [resumenEntregas, setResumenEntregas] = useState(null);
  const [entregasMensualesControl, setEntregasMensualesControl] = useState([]);
  const [indicadoresOperativos, setIndicadoresOperativos] = useState(null);
  const [promedioReparacion, setPromedioReparacion] = useState(null);
  const [cargaTecnicos, setCargaTecnicos] = useState([]);
  const [alertasOperativas, setAlertasOperativas] = useState([]);
  const [seguimientos, setSeguimientos] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [vistaActiva, setVistaActiva] = useState("inicio");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [ordenHistorialActiva, setOrdenHistorialActiva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const detalleRef = useRef(null);
  const historialRef = useRef(null);
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

  const calcularTiempoEstado = (fechaLimite) => {
    if (!fechaLimite) {
      return {
        situacion: "Sin fecha límite",
        detalleTiempo: "Sin fecha límite",
      };
    }

    const ahora = new Date();
    const limite = new Date(fechaLimite);
    const diferenciaMs = limite.getTime() - ahora.getTime();
    const esAtrasado = diferenciaMs < 0;
    const valorAbsoluto = Math.abs(diferenciaMs);

    const minutosTotales = Math.floor(valorAbsoluto / (1000 * 60));
    const horasTotales = Math.floor(valorAbsoluto / (1000 * 60 * 60));
    const diasTotales = Math.floor(valorAbsoluto / (1000 * 60 * 60 * 24));

    let detalleFinal;

    if (diasTotales >= 1) {
      detalleFinal = `${diasTotales} ${diasTotales === 1 ? "día" : "días"}`;
    } else if (horasTotales >= 1) {
      detalleFinal = `${horasTotales} ${horasTotales === 1 ? "hora" : "horas"}`;
    } else {
      const minutos = Math.max(minutosTotales, 1);
      detalleFinal = `${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;
    }

    return {
      situacion: esAtrasado ? "Atrasado" : "En tiempo",
      detalleTiempo: detalleFinal,
    };
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

  const obtenerClaseAlerta = (nivel) => {
    switch (nivel) {
      case "critica":
        return "alert-card alert-critical";
      case "advertencia":
        return "alert-card alert-warning";
      case "informativa":
        return "alert-card alert-info";
      default:
        return "alert-card";
    }
  };

  const obtenerEtiquetaAlerta = (nivel) => {
    switch (nivel) {
      case "critica":
        return "Crítica";
      case "advertencia":
        return "Advertencia";
      case "informativa":
        return "Informativa";
      default:
        return "Alerta";
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
          resumenEntregasRes,
          entregasMensualesControlRes,
          indicadoresOperativosRes,
          promedioReparacionRes,
          cargaTecnicosRes,
          alertasOperativasRes,
          seguimientosRes,
          entregasRes,
        ] = await Promise.all([
          axios.get("http://localhost:4000/dashboard/resumen"),
          axios.get("http://localhost:4000/dashboard/estados"),
          axios.get("http://localhost:4000/dashboard/detalle-estados"),
          axios.get("http://localhost:4000/dashboard/atrasos"),
          axios.get("http://localhost:4000/dashboard/repuestos"),
          axios.get("http://localhost:4000/dashboard/reprocesos"),
          axios.get("http://localhost:4000/dashboard/entregas-semanales"),
          axios.get("http://localhost:4000/dashboard/resumen-entregas"),
          axios.get("http://localhost:4000/dashboard/entregas-mensuales-control"),
          axios.get("http://localhost:4000/dashboard/indicadores-operativos"),
          axios.get("http://localhost:4000/dashboard/promedio-reparacion"),
          axios.get("http://localhost:4000/dashboard/carga-tecnicos"),
          axios.get("http://localhost:4000/dashboard/alertas-operativas"),
          axios.get("http://localhost:4000/seguimientos"),
          axios.get("http://localhost:4000/entregas"),
        ]);

        setResumen(resumenRes.data);
        setEstados(estadosRes.data);
        setDetalleEstados(detalleEstadosRes.data);
        setAtrasos(atrasosRes.data);
        setRepuestos(repuestosRes.data);
        setReprocesos(reprocesosRes.data);
        setEntregasSemanales(semanalesRes.data);
        setResumenEntregas(resumenEntregasRes.data);
        setEntregasMensualesControl(entregasMensualesControlRes.data);
        setIndicadoresOperativos(indicadoresOperativosRes.data);
        setPromedioReparacion(promedioReparacionRes.data);
        setCargaTecnicos(cargaTecnicosRes.data);
        setAlertasOperativas(alertasOperativasRes.data);
        setSeguimientos(seguimientosRes.data);
        setEntregas(entregasRes.data);
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
    if (loading || vistaActiva === "inicio") return;

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

  useEffect(() => {
    if (ordenHistorialActiva && historialRef.current) {
      setTimeout(() => {
        historialRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 120);
    }
  }, [ordenHistorialActiva]);

  const cambiarVista = (vista) => {
    setVistaActiva(vista);
    setEstadoSeleccionado("");
    setOrdenHistorialActiva(null);
  };

  const seleccionarEstado = (estado) => {
    setVistaActiva("estado-especifico");
    setEstadoSeleccionado(estado);
    setOrdenHistorialActiva(null);
  };

  const vehiculosEnProceso = useMemo(() => {
    return detalleEstados.filter(
      (item) =>
        item.estado_actual !== "Entregado" &&
        item.situacion_tiempo !== "Finalizado"
    ).length;
  }, [detalleEstados]);

  const tecnicoMayorCarga = useMemo(() => {
    if (!cargaTecnicos.length) return null;
    return cargaTecnicos[0];
  }, [cargaTecnicos]);

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

  const historialSeguimiento = useMemo(() => {
    if (!ordenHistorialActiva) return [];
    return seguimientos.filter(
      (item) => Number(item.id_orden) === Number(ordenHistorialActiva.id_orden)
    );
  }, [seguimientos, ordenHistorialActiva]);

  const historialEntrega = useMemo(() => {
    if (!ordenHistorialActiva) return null;
    return (
      entregas.find(
        (item) => Number(item.id_orden) === Number(ordenHistorialActiva.id_orden)
      ) || null
    );
  }, [entregas, ordenHistorialActiva]);

  const toggleHistorial = (orden) => {
    if (ordenHistorialActiva?.id_orden === orden.id_orden) {
      setOrdenHistorialActiva(null);
    } else {
      setOrdenHistorialActiva(orden);
    }
  };

  const datosMensualesGrafica = useMemo(() => {
    return entregasMensualesControl.map((item) => ({
      mes: nombresMeses[item.mes] || `Mes ${item.mes}`,
      aTiempo: Number(item.entregados_a_tiempo || 0),
      conAtraso: Number(item.entregados_con_atraso || 0),
      sinFecha: Number(item.entregados_sin_fecha_estimada || 0),
      total: Number(item.total_entregas || 0),
    }));
  }, [entregasMensualesControl]);

  const exportarResumenPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const fechaGeneracion = new Date();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Centro Automotriz Palín", 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Resumen gerencial del dashboard", 14, 25);
    doc.text(
      `Fecha de generación: ${fechaGeneracion.toLocaleDateString()} ${fechaGeneracion.toLocaleTimeString()}`,
      14,
      31
    );

    autoTable(doc, {
      startY: 38,
      head: [["Indicador", "Valor"]],
      body: [
        ["Total de órdenes", resumen?.total_ordenes ?? 0],
        ["Vehículos en proceso", vehiculosEnProceso],
        ["Listas para entrega", resumen?.listas_para_entrega ?? 0],
        ["Vehículos entregados", resumen?.total_entregados ?? 0],
        ["Pendientes repuestos", resumen?.pendientes_repuestos ?? 0],
        ["Órdenes atrasadas", atrasos.length],
        ["Total reprocesos", resumen?.total_reprocesos ?? 0],
      ],
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 10 },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Resumen de entregas", "Valor"]],
      body: [
        ["Total entregados", resumenEntregas?.total_entregados ?? 0],
        ["Entregados a tiempo", resumenEntregas?.entregados_a_tiempo ?? 0],
        ["Entregados con atraso", resumenEntregas?.entregados_con_atraso ?? 0],
        ["Cumplimiento", `${resumenEntregas?.porcentaje_cumplimiento ?? 0}%`],
      ],
      headStyles: { fillColor: [30, 58, 95] },
      styles: { fontSize: 10 },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Análisis operativo", "Valor"]],
      body: [
        [
          "Área con mayor carga",
          `${indicadoresOperativos?.area_mayor_carga || "Sin datos"} (${indicadoresOperativos?.total_area_mayor_carga || 0})`,
        ],
        [
          "Área con más atrasos",
          `${indicadoresOperativos?.area_mas_atrasada || "Sin atrasos"} (${indicadoresOperativos?.total_area_mas_atrasada || 0})`,
        ],
        [
          "Tiempo promedio de reparación",
          `${promedioReparacion?.promedio_general_dias ?? 0} días`,
        ],
        [
          "Técnico con mayor carga",
          `${tecnicoMayorCarga?.tecnico_asignado || "Sin datos"} (${tecnicoMayorCarga?.total_ordenes_activas || 0})`,
        ],
      ],
      headStyles: { fillColor: [51, 65, 85] },
      styles: { fontSize: 10 },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Técnico", "Órdenes activas", "Atrasadas", "Listas para entrega"]],
      body: cargaTecnicos.map((item) => [
        item.tecnico_asignado,
        item.total_ordenes_activas,
        item.total_atrasadas,
        item.total_listas_entrega,
      ]),
      headStyles: { fillColor: [15, 118, 110] },
      styles: { fontSize: 10 },
    });

    if (alertasOperativas.length > 0) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Nivel", "Tipo", "Referencia", "Mensaje"]],
        body: alertasOperativas.slice(0, 10).map((item) => [
          obtenerEtiquetaAlerta(item.nivel),
          item.tipo,
          item.referencia,
          item.mensaje,
        ]),
        headStyles: { fillColor: [220, 38, 38] },
        styles: { fontSize: 9 },
      });
    }

    doc.save("resumen-dashboard-centro-automotriz-palin.pdf");
  };

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Centro Automotriz Palín</h1>
        <h2>Calidad y precisión en cada reparación</h2>
      </div>

      <div className="cards">
        <button className="card card-button card-total" onClick={() => cambiarVista("detalle")}>
          <h3>Total de órdenes</h3>
          <p>{resumen?.total_ordenes}</p>
          <span className="card-subtext">Panorama general</span>
        </button>

        <button className="card card-button card-proceso" onClick={() => cambiarVista("proceso")}>
          <h3>Vehículos en proceso</h3>
          <p>{vehiculosEnProceso}</p>
          <span className="card-subtext">Trabajo activo actual</span>
        </button>

        <button className="card card-button card-listas" onClick={() => cambiarVista("listas")}>
          <h3>Listas para entrega</h3>
          <p>{resumen?.listas_para_entrega}</p>
          <span className="card-subtext">Pendientes de salida</span>
        </button>

        <button className="card card-button card-entregados" onClick={() => cambiarVista("entregados")}>
          <h3>Vehículos entregados</h3>
          <p>{resumen?.total_entregados}</p>
          <span className="card-subtext">Órdenes finalizadas</span>
        </button>

        <button className="card card-button card-repuestos" onClick={() => cambiarVista("repuestos")}>
          <h3>Pendientes repuestos</h3>
          <p>{resumen?.pendientes_repuestos}</p>
          <span className="card-subtext">Requieren atención</span>
        </button>

        <button className="card card-button card-atrasos" onClick={() => cambiarVista("atrasados")}>
          <h3>Órdenes atrasadas</h3>
          <p>{atrasos.length}</p>
          <span className="card-subtext">Fuera de tiempo</span>
        </button>

        <button className="card card-button card-reprocesos" onClick={() => cambiarVista("reprocesos")}>
          <h3>Total reprocesos</h3>
          <p>{resumen?.total_reprocesos}</p>
          <span className="card-subtext">Casos reincidentes</span>
        </button>

        <button
          className="card card-button card-resumen"
          onClick={() => cambiarVista("resumen-entregas")}
        >
          <h3>Resumen de entregas</h3>
          <p>{resumen?.total_entregados}</p>
          <span className="card-subtext">Cumplimiento y tendencia</span>
        </button>
      </div>

      <div className="section">
        <h3 className="section-title">Estados del proceso</h3>
        <div className="states-grid">
          {estados.length > 0 ? (
            estados.map((item, index) => (
              <button
                key={index}
                className={`state-card state-button ${
                  item.estado_actual === "En enderezado"
                    ? "state-enderezado"
                    : item.estado_actual === "En preparación"
                    ? "state-preparacion"
                    : item.estado_actual === "En pintura"
                    ? "state-pintura"
                    : item.estado_actual === "En armado"
                    ? "state-armado"
                    : item.estado_actual === "En lavado"
                    ? "state-lavado"
                    : "state-default"
                }`}
                onClick={() => seleccionarEstado(item.estado_actual)}
                type="button"
              >
                <div className="state-top">
                  <span className="state-label">{item.estado_actual}</span>
                </div>

                <div className="state-middle">
                  <span className="state-value">{item.total_vehiculos}</span>
                </div>

                <div className="state-bottom">
                  <span className="state-subtext">
                    {Number(item.total_vehiculos) === 1
                      ? "1 vehículo"
                      : `${item.total_vehiculos} vehículos`}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="empty-box">No hay estados registrados.</div>
          )}
        </div>
      </div>

      {vistaActiva === "resumen-entregas" && (
        <div className="section" ref={resumenEntregasRef}>
          <div className="section-header-actions">
            <h3 className="section-title no-margin">Resumen de entregas</h3>
            <button className="export-pdf-btn" onClick={exportarResumenPDF}>
              Exportar resumen PDF
            </button>
          </div>

          <div className="delivery-kpis-grid">
            <div className="mini-kpi-card">
              <span className="mini-kpi-label">Total entregados</span>
              <span className="mini-kpi-value">
                {resumenEntregas?.total_entregados ?? 0}
              </span>
            </div>

            <div className="mini-kpi-card success-card">
              <span className="mini-kpi-label">Entregados a tiempo</span>
              <span className="mini-kpi-value">
                {resumenEntregas?.entregados_a_tiempo ?? 0}
              </span>
            </div>

            <div className="mini-kpi-card danger-card">
              <span className="mini-kpi-label">Entregados con atraso</span>
              <span className="mini-kpi-value">
                {resumenEntregas?.entregados_con_atraso ?? 0}
              </span>
            </div>

            <div className="mini-kpi-card warning-card">
              <span className="mini-kpi-label">Cumplimiento</span>
              <span className="mini-kpi-value">
                {resumenEntregas?.porcentaje_cumplimiento ?? 0}%
              </span>
            </div>
          </div>

          <div className="delivery-summary-grid">
            <div className="chart-card">
              <h4>Entregas mensuales</h4>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={datosMensualesGrafica}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="aTiempo"
                      name="A tiempo"
                      stackId="a"
                      fill="#22c55e"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="conAtraso"
                      name="Con atraso"
                      stackId="a"
                      fill="#ef4444"
                    />
                    <Bar
                      dataKey="sinFecha"
                      name="Sin fecha estimada"
                      stackId="a"
                      fill="#f59e0b"
                    />
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

          <h4 className="subsection-title">Alertas operativas</h4>

          <div className="alerts-grid">
            {alertasOperativas.length > 0 ? (
              alertasOperativas.map((alerta, index) => (
                <div key={index} className={obtenerClaseAlerta(alerta.nivel)}>
                  <div className="alert-top">
                    <span className="alert-badge">
                      {obtenerEtiquetaAlerta(alerta.nivel)}
                    </span>
                    <span className="alert-type">{alerta.tipo}</span>
                  </div>
                  <div className="alert-reference">{alerta.referencia}</div>
                  <div className="alert-message">{alerta.mensaje}</div>
                </div>
              ))
            ) : (
              <div className="empty-box">No hay alertas operativas en este momento.</div>
            )}
          </div>

          <h4 className="subsection-title">Análisis operativo</h4>

          <div className="operational-kpis-grid">
            <div className="mini-kpi-card info-card">
              <span className="mini-kpi-label">Área con mayor carga</span>
              <span className="mini-kpi-value small-kpi-value">
                {indicadoresOperativos?.area_mayor_carga || "Sin datos"}
              </span>
              <span className="mini-kpi-subtext">
                {indicadoresOperativos?.total_area_mayor_carga || 0} vehículos
              </span>
            </div>

            <div className="mini-kpi-card danger-card">
              <span className="mini-kpi-label">Área con más atrasos</span>
              <span className="mini-kpi-value small-kpi-value">
                {indicadoresOperativos?.area_mas_atrasada || "Sin atrasos"}
              </span>
              <span className="mini-kpi-subtext">
                {indicadoresOperativos?.total_area_mas_atrasada || 0} casos
              </span>
            </div>

            <div className="mini-kpi-card info-card">
              <span className="mini-kpi-label">Tiempo promedio de reparación</span>
              <span className="mini-kpi-value small-kpi-value">
                {promedioReparacion?.promedio_general_dias ?? 0} días
              </span>
              <span className="mini-kpi-subtext">
                {promedioReparacion?.total_ordenes_analizadas ?? 0} órdenes analizadas
              </span>
            </div>
          </div>

          <div className="operational-kpis-grid">
            <div className="mini-kpi-card info-card">
              <span className="mini-kpi-label">Técnico con mayor carga</span>
              <span className="mini-kpi-value small-kpi-value">
                {tecnicoMayorCarga?.tecnico_asignado || "Sin datos"}
              </span>
              <span className="mini-kpi-subtext">
                {tecnicoMayorCarga?.total_ordenes_activas || 0} órdenes activas
              </span>
            </div>
          </div>

          <div className="section table-section-inside">
            <h4 className="subsection-title">Carga de trabajo por técnico</h4>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Técnico</th>
                    <th>Órdenes activas</th>
                    <th>Atrasadas</th>
                    <th>Listas para entrega</th>
                  </tr>
                </thead>
                <tbody>
                  {cargaTecnicos.length > 0 ? (
                    cargaTecnicos.map((item, index) => (
                      <tr key={index}>
                        <td>{item.tecnico_asignado}</td>
                        <td>{item.total_ordenes_activas}</td>
                        <td>{item.total_atrasadas}</td>
                        <td>{item.total_listas_entrega}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No hay carga de trabajo registrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {["detalle", "proceso", "listas", "entregados", "estado-especifico"].includes(
        vistaActiva
      ) && (
        <>
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
                    <th>Tiempo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleFiltrado.length > 0 ? (
                    detalleFiltrado.map((item) => {
                      const tiempo = calcularTiempoEstado(item.fecha_limite_etapa);

                      return (
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
                          <td className="time-cell">{tiempo.detalleTiempo}</td>
                          <td>
                            <button
                              type="button"
                              className="history-btn"
                              onClick={() => toggleHistorial(item)}
                            >
                              {ordenHistorialActiva?.id_orden === item.id_orden
                                ? "Ocultar"
                                : "Ver historial"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9">No hay registros para esta vista.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {ordenHistorialActiva && (
            <div className="section history-section" ref={historialRef}>
              <h3 className="section-title">
                Historial de la orden {ordenHistorialActiva.numero_orden}
              </h3>

              <div className="history-card">
                <p>
                  <strong>Cliente:</strong> {ordenHistorialActiva.nombres}{" "}
                  {ordenHistorialActiva.apellidos}
                </p>
                <p>
                  <strong>Vehículo:</strong> {ordenHistorialActiva.placa} -{" "}
                  {ordenHistorialActiva.marca} {ordenHistorialActiva.modelo}
                </p>
                <p>
                  <strong>Técnico:</strong> {ordenHistorialActiva.tecnico_asignado || "Sin asignar"}
                </p>
                <p>
                  <strong>Estado actual:</strong> {ordenHistorialActiva.estado_actual}
                </p>
                <p>
                  <strong>Descripción:</strong>{" "}
                  {ordenHistorialActiva.descripcion_trabajo || "Sin descripción registrada"}
                </p>
              </div>

              <div className="history-block">
                <h4>Seguimiento registrado</h4>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Estado</th>
                        <th>Fecha inicio</th>
                        <th>Fecha fin</th>
                        <th>Fecha límite</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historialSeguimiento.length > 0 ? (
                        historialSeguimiento.map((item) => (
                          <tr key={item.id_seguimiento}>
                            <td>{item.id_seguimiento}</td>
                            <td>{item.estado_proceso}</td>
                            <td>{formatearFechaHora(item.fecha_inicio)}</td>
                            <td>{formatearFechaHora(item.fecha_fin)}</td>
                            <td>{formatearFechaHora(item.fecha_limite_etapa)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5">No hay seguimiento registrado para esta orden.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="history-block">
                <h4>Entrega final</h4>
                {historialEntrega ? (
                  <div className="history-card">
                    <p>
                      <strong>Fecha entrega:</strong> {historialEntrega.fecha_entrega}
                    </p>
                    <p>
                      <strong>Hora entrega:</strong> {historialEntrega.hora_entrega}
                    </p>
                    <p>
                      <strong>Recibido por:</strong> {historialEntrega.recibido_por_cliente}
                    </p>
                    <p>
                      <strong>Observaciones:</strong>{" "}
                      {historialEntrega.observaciones_entrega || "Sin observaciones"}
                    </p>
                  </div>
                ) : (
                  <div className="history-card">
                    <p>No hay entrega registrada para esta orden.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
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
                  <th>Tiempo atraso</th>
                  <th>Motivo atraso</th>
                </tr>
              </thead>
              <tbody>
                {atrasos.length > 0 ? (
                  atrasos.map((item, index) => {
                    const tiempo = calcularTiempoEstado(item.fecha_limite_etapa);

                    return (
                      <tr key={index}>
                        <td>{item.numero_orden}</td>
                        <td>{item.estado_proceso}</td>
                        <td>{formatearFechaHora(item.fecha_inicio)}</td>
                        <td>{formatearFechaHora(item.fecha_limite_etapa)}</td>
                        <td className="time-cell">{tiempo.detalleTiempo}</td>
                        <td>{item.motivo_atraso || "Sin motivo registrado"}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6">No hay órdenes con atraso actualmente.</td>
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