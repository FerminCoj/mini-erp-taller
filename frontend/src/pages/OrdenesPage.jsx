import { useEffect, useState } from "react";
import axios from "axios";
import "./OrdenesPage.css";

function OrdenesPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [recepciones, setRecepciones] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
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

  useEffect(() => {
    const cargarDatos = async () => {
      await obtenerOrdenes();
      await obtenerRecepciones();
      await obtenerTecnicos();
    };

    cargarDatos();
  }, []);

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
    } catch (err) {
      console.error("Error al crear orden:", err);
      setError(err.response?.data?.mensaje || "Error al crear orden");
    }
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
              {recepciones.map((recepcion) => (
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
            <select
              id="estado_actual"
              name="estado_actual"
              value={formData.estado_actual}
              onChange={handleChange}
            >
              <option value="Recibido">Recibido</option>
              <option value="En enderezado">En enderezado</option>
              <option value="En preparación">En preparación</option>
              <option value="En pintura">En pintura</option>
              <option value="En armado">En armado</option>
              <option value="En lavado">En lavado</option>
              <option value="Listo para entrega">Listo para entrega</option>
              <option value="Entregado">Entregado</option>
            </select>
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
      </div>

      <div className="section">
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No hay órdenes registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OrdenesPage;