import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./OrdenesPage.css";

function OrdenesPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [recepciones, setRecepciones] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [seguimientos, setSeguimientos] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [ordenHistorialActiva, setOrdenHistorialActiva] = useState(null);

  const listadoOrdenesRef = useRef(null);
  const historialRef = useRef(null);

  const [formData, setFormData] = useState({
    id_recepcion: "",
    descripcion_trabajo: "",
    tecnico_asignado: "",
    prioridad: "Media",
    fecha_estimada_entrega: "",
    requiere_repuestos: false,
    repuestos_completos: false,
    observacion_repuestos: "",
    estado_actual: "Recibido",
    creado_por: "1",
  });

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const obtenerOrdenes = async () => {
    try {
      const response = await axios.get("http://localhost:4000/ordenes");
      setOrdenes(response.data);
    } catch (err) {
      console.error("Error al obtener órdenes:", err);
      setError("No se pudieron cargar las órdenes");
    }
  };

  const obtenerRecepciones = async () => {
    try {
      const response = await axios.get("http://localhost:4000/recepciones");
      setRecepciones(response.data);
    } catch (err) {
      console.error("Error al obtener recepciones:", err);
      setError("No se pudieron cargar las recepciones");
    }
  };

  const obtenerTecnicos = async () => {
    try {
      const response = await axios.get("http://localhost:4000/tecnicos");
      setTecnicos(response.data);
    } catch (err) {
      console.error("Error al obtener técnicos:", err);
      setError("No se pudieron cargar los técnicos");
    }
  };

  const obtenerSeguimientos = async () => {
    try {
      const response = await axios.get("http://localhost:4000/seguimientos");
      setSeguimientos(response.data);
    } catch (err) {
      console.error("Error al obtener seguimientos:", err);
    }
  };

  const obtenerEntregas = async () => {
    try {
      const response = await axios.get("http://localhost:4000/entregas");
      setEntregas(response.data);
    } catch (err) {
      console.error("Error al obtener entregas:", err);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      await obtenerOrdenes();
      await obtenerRecepciones();
      await obtenerTecnicos();
      await obtenerSeguimientos();
      await obtenerEntregas();
    };

    cargarDatos();
  }, []);

  useEffect(() => {
    if (ordenHistorialActiva && historialRef.current) {
      setTimeout(() => {
        historialRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [ordenHistorialActiva]);

  const recepcionesDisponibles = useMemo(() => {
    const recepcionesConOrden = new Set(
      ordenes.map((orden) => Number(orden.id_recepcion))
    );

    return recepciones.filter(
      (recepcion) => !recepcionesConOrden.has(Number(recepcion.id_recepcion))
    );
  }, [recepciones, ordenes]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      const response = await axios.post("http://localhost:4000/ordenes", {
        ...formData,
        estado_actual: "Recibido",
        id_recepcion: Number(formData.id_recepcion),
        creado_por: Number(formData.creado_por),
      });

      setMensaje(
        `${response.data.mensaje}. Número generado: ${response.data.orden.numero_orden}`
      );

      setFormData({
        id_recepcion: "",
        descripcion_trabajo: "",
        tecnico_asignado: "",
        prioridad: "Media",
        fecha_estimada_entrega: "",
        requiere_repuestos: false,
        repuestos_completos: false,
        observacion_repuestos: "",
        estado_actual: "Recibido",
        creado_por: "1",
      });

      await obtenerOrdenes();
      await obtenerRecepciones();
    } catch (err) {
      console.error("Error al crear orden:", err);
      setError(err.response?.data?.mensaje || "Error al crear orden");
    }
  };

  const irAListadoOrdenes = () => {
    if (listadoOrdenesRef.current) {
      listadoOrdenesRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const toggleHistorial = (orden) => {
    if (ordenHistorialActiva?.id_orden === orden.id_orden) {
      setOrdenHistorialActiva(null);
    } else {
      setOrdenHistorialActiva(orden);
    }
  };

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

  return (
    <div className="ordenes-container">
      <div className="ordenes-header">
        <h1>Mini ERP Taller</h1>
        <h2>Órdenes de Trabajo</h2>
      </div>

      <div className="form-card">
        <h3>Nueva orden</h3>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label htmlFor="id_recepcion">Recepción</label>
            <select
              id="id_recepcion"
              name="id_recepcion"
              value={formData.id_recepcion}
              onChange={handleChange}
            >
              <option value="">Seleccione una recepción</option>
              {recepcionesDisponibles.map((recepcion) => (
                <option key={recepcion.id_recepcion} value={recepcion.id_recepcion}>
                  {recepcion.id_recepcion} - {recepcion.placa} - {recepcion.marca}{" "}
                  {recepcion.modelo}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tecnico_asignado">Técnico asignado</label>
            <select
              id="tecnico_asignado"
              name="tecnico_asignado"
              value={formData.tecnico_asignado}
              onChange={handleChange}
            >
              <option value="">Seleccione un técnico</option>
              {tecnicos.map((tecnico) => (
                <option key={tecnico.id_tecnico} value={tecnico.nombre}>
                  {tecnico.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group full-width">
            <label htmlFor="descripcion_trabajo">Descripción del trabajo</label>
            <input
              id="descripcion_trabajo"
              type="text"
              name="descripcion_trabajo"
              value={formData.descripcion_trabajo}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="prioridad">Prioridad</label>
            <select
              id="prioridad"
              name="prioridad"
              value={formData.prioridad}
              onChange={handleChange}
            >
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fecha_estimada_entrega">Fecha estimada de entrega</label>
            <input
              id="fecha_estimada_entrega"
              type="date"
              name="fecha_estimada_entrega"
              value={formData.fecha_estimada_entrega}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="estado_actual">Estado actual</label>
            <input
              id="estado_actual"
              type="text"
              value="Recibido"
              readOnly
              className="readonly-input"
            />
          </div>

          <div className="form-group">
            <label>Historial</label>
            <button
              type="button"
              className="history-btn inline-history-btn"
              onClick={irAListadoOrdenes}
            >
              Ver historial en listado
            </button>
          </div>

          <div className="form-group full-width">
            <label htmlFor="observacion_repuestos">Observación de repuestos</label>
            <input
              id="observacion_repuestos"
              type="text"
              name="observacion_repuestos"
              value={formData.observacion_repuestos}
              onChange={handleChange}
            />
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="requiere_repuestos"
              checked={formData.requiere_repuestos}
              onChange={handleChange}
            />
            ¿Requiere repuestos?
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="repuestos_completos"
              checked={formData.repuestos_completos}
              onChange={handleChange}
            />
            ¿Repuestos completos?
          </label>

          <button type="submit" className="full-width">
            Registrar orden
          </button>
        </form>

        {mensaje && <p className="success">{mensaje}</p>}
        {error && <p className="error">{error}</p>}

        {recepcionesDisponibles.length === 0 && (
          <p className="info-text">
            No hay recepciones disponibles para crear nuevas órdenes.
          </p>
        )}
      </div>

      <div className="section" ref={listadoOrdenesRef}>
        <h3 className="section-title">Listado de órdenes</h3>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>No. Orden</th>
                <th>Cliente</th>
                <th>Vehículo</th>
                <th>Técnico</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.length > 0 ? (
                ordenes.map((orden) => (
                  <tr key={orden.id_orden}>
                    <td>{orden.id_orden}</td>
                    <td>{orden.numero_orden}</td>
                    <td>
                      {orden.nombres} {orden.apellidos}
                    </td>
                    <td>
                      {orden.placa} - {orden.marca} {orden.modelo}
                    </td>
                    <td>{orden.tecnico_asignado}</td>
                    <td>{orden.prioridad}</td>
                    <td>{orden.estado_actual}</td>
                    <td>
                      <button
                        type="button"
                        className="history-btn"
                        onClick={() => toggleHistorial(orden)}
                      >
                        {ordenHistorialActiva?.id_orden === orden.id_orden
                          ? "Ocultar"
                          : "Ver historial"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No hay órdenes registradas.</td>
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
              <strong>Técnico:</strong> {ordenHistorialActiva.tecnico_asignado}
            </p>
            <p>
              <strong>Estado actual:</strong> {ordenHistorialActiva.estado_actual}
            </p>
            <p>
              <strong>Prioridad:</strong> {ordenHistorialActiva.prioridad}
            </p>
            <p>
              <strong>Descripción:</strong> {ordenHistorialActiva.descripcion_trabajo}
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
    </div>
  );
}

export default OrdenesPage;