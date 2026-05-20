import { useEffect, useState } from "react";
import axios from "axios";
import "./SeguimientosPage.css";

function SeguimientosPage() {
  const [seguimientos, setSeguimientos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [formData, setFormData] = useState({
    id_orden: "",
    estado_proceso: "Recibido",
    fecha_inicio: "",
    fecha_fin: "",
    observaciones: "",
    actualizado_por: "1",
    fecha_limite_etapa: "",
    motivo_atraso: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const formatearFechaHora = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);

    const anio = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    const horas = String(date.getHours()).padStart(2, "0");
    const minutos = String(date.getMinutes()).padStart(2, "0");

    return `${anio}-${mes}-${dia} ${horas}:${minutos}`;
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

      setFormData({
        id_orden: "",
        estado_proceso: "Recibido",
        fecha_inicio: "",
        fecha_fin: "",
        observaciones: "",
        actualizado_por: "1",
        fecha_limite_etapa: "",
        motivo_atraso: "",
      });

      await obtenerSeguimientos();
    } catch (err) {
      console.error("Error al crear seguimiento:", err);
      setError(err.response?.data?.mensaje || "Error al registrar seguimiento");
    }
  };

  return (
    <div className="seguimientos-container">
      <div className="seguimientos-header">
        <h1>Mini ERP Taller</h1>
        <h2>Seguimiento de Reparación</h2>
      </div>

      <div className="form-card">
        <h3>Nuevo seguimiento</h3>

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
              {ordenes.map((orden) => (
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
              <option value="Recibido">Recibido</option>
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

        {mensaje && <p className="success">{mensaje}</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="section">
        <h3 className="section-title">Listado de seguimientos</h3>

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
              {seguimientos.length > 0 ? (
                seguimientos.map((seguimiento) => (
                  <tr key={seguimiento.id_seguimiento}>
                    <td>{seguimiento.id_seguimiento}</td>
                    <td>{seguimiento.numero_orden}</td>
                    <td>{seguimiento.placa} - {seguimiento.marca} {seguimiento.modelo}</td>
                    <td>{seguimiento.nombres} {seguimiento.apellidos}</td>
                    <td>{seguimiento.estado_proceso}</td>
                    <td>{formatearFechaHora(seguimiento.fecha_inicio)}</td>
                    <td>{formatearFechaHora(seguimiento.fecha_limite_etapa)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No hay seguimientos registrados.</td>
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