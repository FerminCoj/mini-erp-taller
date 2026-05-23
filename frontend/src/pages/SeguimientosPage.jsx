import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./SeguimientosPage.css";

function SeguimientosPage() {
  const [seguimientos, setSeguimientos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [ordenHistorial, setOrdenHistorial] = useState("");

  const [formData, setFormData] = useState({
    id_orden: "",
    estado_proceso: "En enderezado",
    fecha_inicio: "",
    fecha_fin: "",
    observaciones: "",
    actualizado_por: "1",
    fecha_limite_etapa: "",
    motivo_atraso: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const ultimoSeguimientoRef = useRef(null);

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

  const obtenerSeguimientos = async () => {
    try {
      const response = await axios.get("http://localhost:4000/seguimientos");
      setSeguimientos(response.data);
    } catch (err) {
      console.error("Error al obtener seguimientos:", err);
      setError("No se pudieron cargar los seguimientos");
    }
  };

  const obtenerOrdenes = async () => {
    try {
      const response = await axios.get("http://localhost:4000/ordenes");
      setOrdenes(response.data);
    } catch (err) {
      console.error("Error al obtener órdenes:", err);
      setError("No se pudieron cargar las órdenes");
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      await obtenerSeguimientos();
      await obtenerOrdenes();
    };

    cargarDatos();
  }, []);

  const ordenesActivas = useMemo(() => {
    return ordenes.filter((orden) => orden.estado_actual !== "Entregado");
  }, [ordenes]);

  const estadoActualOrdenesActivas = useMemo(() => {
    return ordenesActivas.map((orden) => {
      const registros = seguimientos
        .filter(
          (seguimiento) => Number(seguimiento.id_orden) === Number(orden.id_orden)
        )
        .sort((a, b) => Number(b.id_seguimiento) - Number(a.id_seguimiento));

      const ultimo = registros[0] || null;
      const fechaLimite = ultimo?.fecha_limite_etapa || null;
      const resultadoTiempo = calcularTiempoEstado(fechaLimite);

      return {
        id_orden: orden.id_orden,
        numero_orden: orden.numero_orden,
        placa: orden.placa,
        marca: orden.marca,
        modelo: orden.modelo,
        nombres: orden.nombres,
        apellidos: orden.apellidos,
        estado_actual: ultimo?.estado_proceso || orden.estado_actual || "Recibido",
        fecha_actualizacion: ultimo?.fecha_inicio || null,
        fecha_limite: fechaLimite,
        situacion: resultadoTiempo.situacion,
        detalle_tiempo: resultadoTiempo.detalleTiempo,
      };
    });
  }, [ordenesActivas, seguimientos]);

  const datosOrdenSeleccionada = useMemo(() => {
    if (!formData.id_orden) return null;

    return (
      ordenesActivas.find(
        (orden) => Number(orden.id_orden) === Number(formData.id_orden)
      ) || null
    );
  }, [ordenesActivas, formData.id_orden]);

  const ultimoSeguimientoOrdenActiva = useMemo(() => {
    if (!formData.id_orden) return null;

    const registros = seguimientos
      .filter(
        (seguimiento) => Number(seguimiento.id_orden) === Number(formData.id_orden)
      )
      .sort((a, b) => Number(a.id_seguimiento) - Number(b.id_seguimiento));

    if (registros.length === 0) return null;
    return registros[registros.length - 1];
  }, [seguimientos, formData.id_orden]);

  const historialFiltrado = useMemo(() => {
    if (!ordenHistorial) return seguimientos;

    return seguimientos.filter(
      (seguimiento) => Number(seguimiento.id_orden) === Number(ordenHistorial)
    );
  }, [seguimientos, ordenHistorial]);

  const datosOrdenHistorial = useMemo(() => {
    if (!ordenHistorial) return null;

    return (
      ordenes.find((orden) => Number(orden.id_orden) === Number(ordenHistorial)) ||
      null
    );
  }, [ordenes, ordenHistorial]);

  const ultimoSeguimientoHistorial = useMemo(() => {
    if (!ordenHistorial) return null;

    const registros = seguimientos
      .filter(
        (seguimiento) => Number(seguimiento.id_orden) === Number(ordenHistorial)
      )
      .sort((a, b) => Number(a.id_seguimiento) - Number(b.id_seguimiento));

    if (registros.length === 0) return null;
    return registros[registros.length - 1];
  }, [seguimientos, ordenHistorial]);

  useEffect(() => {
    if (ordenHistorial && ultimoSeguimientoHistorial && ultimoSeguimientoRef.current) {
      setTimeout(() => {
        ultimoSeguimientoRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [ordenHistorial, ultimoSeguimientoHistorial, historialFiltrado]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setMensaje("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      const response = await axios.post("http://localhost:4000/seguimientos", {
        ...formData,
        id_orden: Number(formData.id_orden),
        actualizado_por: Number(formData.actualizado_por),
      });

      setMensaje(response.data.mensaje);

      const idOrdenActual = formData.id_orden;

      setFormData({
        id_orden: idOrdenActual,
        estado_proceso: "En enderezado",
        fecha_inicio: "",
        fecha_fin: "",
        observaciones: "",
        actualizado_por: "1",
        fecha_limite_etapa: "",
        motivo_atraso: "",
      });

      await obtenerSeguimientos();
      await obtenerOrdenes();
    } catch (err) {
      console.error("Error al crear seguimiento:", err);
      setError(err.response?.data?.mensaje || "Error al registrar seguimiento");
    }
  };

  const estadoActualMostrado =
    ultimoSeguimientoOrdenActiva?.estado_proceso ||
    datosOrdenSeleccionada?.estado_actual ||
    "Recibido";

  const fechaActualizadaMostrada = ultimoSeguimientoOrdenActiva?.fecha_inicio
    ? formatearFechaHora(ultimoSeguimientoOrdenActiva.fecha_inicio)
    : "Sin seguimientos registrados";

  return (
    <div className="seguimientos-container">
      <div className="seguimientos-header">
        <h1>Centro Automotriz Palín</h1>
        <h2>Seguimiento de Reparación</h2>
      </div>

      <div className="form-card">
        <h3>Registro de seguimiento</h3>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label htmlFor="id_orden">Orden de trabajo</label>
            <select
              id="id_orden"
              name="id_orden"
              value={formData.id_orden}
              onChange={handleChange}
            >
              <option value="">Seleccione una orden</option>
              {ordenesActivas.map((orden) => (
                <option key={orden.id_orden} value={orden.id_orden}>
                  {orden.numero_orden} - {orden.placa} - {orden.marca} {orden.modelo}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="estado_proceso">Estado del proceso</label>
            <select
              id="estado_proceso"
              name="estado_proceso"
              value={formData.estado_proceso}
              onChange={handleChange}
            >
              <option value="En enderezado">En enderezado</option>
              <option value="En preparación">En preparación</option>
              <option value="En pintura">En pintura</option>
              <option value="En armado">En armado</option>
              <option value="En lavado">En lavado</option>
              <option value="Listo para entrega">Listo para entrega</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fecha_inicio">Fecha de inicio</label>
            <input
              id="fecha_inicio"
              type="datetime-local"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fecha_fin">Fecha de fin</label>
            <input
              id="fecha_fin"
              type="datetime-local"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fecha_limite_etapa">Fecha límite</label>
            <input
              id="fecha_limite_etapa"
              type="datetime-local"
              name="fecha_limite_etapa"
              value={formData.fecha_limite_etapa}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="motivo_atraso">Motivo de atraso</label>
            <input
              id="motivo_atraso"
              type="text"
              name="motivo_atraso"
              value={formData.motivo_atraso}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="observaciones">Observaciones</label>
            <input
              id="observaciones"
              type="text"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="full-width">
            Registrar seguimiento
          </button>
        </form>

        {formData.id_orden && datosOrdenSeleccionada && (
          <div className="current-status-card current-status-card-form">
            <p>
              <strong>Orden:</strong> {datosOrdenSeleccionada.numero_orden}
            </p>
            <p>
              <strong>Vehículo:</strong> {datosOrdenSeleccionada.placa} -{" "}
              {datosOrdenSeleccionada.marca} {datosOrdenSeleccionada.modelo}
            </p>
            <p>
              <strong>Estado actual:</strong> {estadoActualMostrado}
            </p>
            <p>
              <strong>Última actualización:</strong> {fechaActualizadaMostrada}
            </p>
          </div>
        )}

        {mensaje && <p className="success">{mensaje}</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="section">
        <h3 className="section-title">Estado actual de órdenes activas</h3>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>No. Orden</th>
                <th>Vehículo</th>
                <th>Cliente</th>
                <th>Estado actual</th>
                <th>Última actualización</th>
                <th>Fecha límite</th>
                <th>Situación</th>
                <th>Tiempo</th>
              </tr>
            </thead>
            <tbody>
              {estadoActualOrdenesActivas.length > 0 ? (
                estadoActualOrdenesActivas.map((orden) => (
                  <tr key={orden.id_orden}>
                    <td>{orden.numero_orden}</td>
                    <td>
                      {orden.placa} - {orden.marca} {orden.modelo}
                    </td>
                    <td>
                      {orden.nombres} {orden.apellidos}
                    </td>
                    <td>{orden.estado_actual}</td>
                    <td>{formatearFechaHora(orden.fecha_actualizacion)}</td>
                    <td>{formatearFechaHora(orden.fecha_limite)}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          orden.situacion === "Atrasado"
                            ? "status-danger"
                            : orden.situacion === "En tiempo"
                            ? "status-success"
                            : "status-warning"
                        }`}
                      >
                        {orden.situacion}
                      </span>
                    </td>
                    <td className="time-cell">{orden.detalle_tiempo}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No hay órdenes activas disponibles.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <div className="filter-header">
          <h3 className="section-title">Historial de seguimiento</h3>

          <div className="filter-box">
            <label htmlFor="ordenHistorial">Seleccione una orden</label>
            <select
              id="ordenHistorial"
              value={ordenHistorial}
              onChange={(e) => setOrdenHistorial(e.target.value)}
            >
              <option value="">Mostrar todas</option>
              {ordenes.map((orden) => (
                <option key={orden.id_orden} value={orden.id_orden}>
                  {orden.numero_orden} - {orden.placa} - {orden.marca} {orden.modelo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {ordenHistorial && datosOrdenHistorial && (
          <div className="current-status-card">
            <p>
              <strong>Orden:</strong> {datosOrdenHistorial.numero_orden}
            </p>
            <p>
              <strong>Vehículo:</strong> {datosOrdenHistorial.placa} -{" "}
              {datosOrdenHistorial.marca} {datosOrdenHistorial.modelo}
            </p>
            <p>
              <strong>Estado actual:</strong>{" "}
              {ultimoSeguimientoHistorial?.estado_proceso ||
                datosOrdenHistorial.estado_actual ||
                "Recibido"}
            </p>
            <p>
              <strong>Última actualización:</strong>{" "}
              {ultimoSeguimientoHistorial?.fecha_inicio
                ? formatearFechaHora(ultimoSeguimientoHistorial.fecha_inicio)
                : "Sin seguimientos registrados"}
            </p>
          </div>
        )}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Orden</th>
                <th>Vehículo</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Fecha inicio</th>
                <th>Fecha límite</th>
              </tr>
            </thead>
            <tbody>
              {historialFiltrado.length > 0 ? (
                historialFiltrado.map((seguimiento) => {
                  const esUltimo =
                    ordenHistorial &&
                    ultimoSeguimientoHistorial &&
                    Number(seguimiento.id_seguimiento) ===
                      Number(ultimoSeguimientoHistorial.id_seguimiento);

                  return (
                    <tr
                      key={seguimiento.id_seguimiento}
                      ref={esUltimo ? ultimoSeguimientoRef : null}
                      className={esUltimo ? "highlight-row" : ""}
                    >
                      <td>{seguimiento.id_seguimiento}</td>
                      <td>{seguimiento.numero_orden}</td>
                      <td>
                        {seguimiento.placa} - {seguimiento.marca} {seguimiento.modelo}
                      </td>
                      <td>
                        {seguimiento.nombres} {seguimiento.apellidos}
                      </td>
                      <td>{seguimiento.estado_proceso}</td>
                      <td>{formatearFechaHora(seguimiento.fecha_inicio)}</td>
                      <td>{formatearFechaHora(seguimiento.fecha_limite_etapa)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7">
                    {ordenHistorial
                      ? "Esta orden aún no tiene seguimientos registrados."
                      : "No hay seguimientos registrados."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SeguimientosPage;