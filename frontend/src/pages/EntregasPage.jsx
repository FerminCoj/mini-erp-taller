import { useEffect, useState } from "react";
import axios from "axios";
import "./EntregasPage.css";

function EntregasPage() {
  const [entregas, setEntregas] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [formData, setFormData] = useState({
    id_orden: "",
    fecha_entrega: "",
    hora_entrega: "",
    entregado_por: "1",
    recibido_por_cliente: "",
    observaciones_entrega: "",
    conformidad_cliente: true,
  });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const obtenerEntregas = async () => {
    try {
      const response = await axios.get("http://localhost:4000/entregas");
      setEntregas(response.data);
    } catch (err) {
      console.error("Error al obtener entregas:", err);
      setError("No se pudieron cargar las entregas");
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
      await obtenerEntregas();
      await obtenerOrdenes();
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
      const response = await axios.post("http://localhost:4000/entregas", {
        ...formData,
        id_orden: Number(formData.id_orden),
        entregado_por: Number(formData.entregado_por),
      });

      setMensaje(response.data.mensaje);

      setFormData({
        id_orden: "",
        fecha_entrega: "",
        hora_entrega: "",
        entregado_por: "1",
        recibido_por_cliente: "",
        observaciones_entrega: "",
        conformidad_cliente: true,
      });

      await obtenerEntregas();
    } catch (err) {
      console.error("Error al crear entrega:", err);
      setError(err.response?.data?.mensaje || "Error al registrar entrega");
    }
  };

  return (
    <div className="entregas-container">
      <div className="entregas-header">
        <h1>Mini ERP Taller</h1>
        <h2>Entrega Final de Vehículos</h2>
      </div>

      <div className="form-card">
        <h3>Nueva entrega</h3>

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
            <label htmlFor="fecha_entrega">Fecha de entrega</label>
            <input
              id="fecha_entrega"
              type="date"
              name="fecha_entrega"
              value={formData.fecha_entrega}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="hora_entrega">Hora de entrega</label>
            <input
              id="hora_entrega"
              type="time"
              name="hora_entrega"
              value={formData.hora_entrega}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="recibido_por_cliente">Recibido por cliente</label>
            <input
              id="recibido_por_cliente"
              type="text"
              name="recibido_por_cliente"
              value={formData.recibido_por_cliente}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="observaciones_entrega">Observaciones de entrega</label>
            <input
              id="observaciones_entrega"
              type="text"
              name="observaciones_entrega"
              value={formData.observaciones_entrega}
              onChange={handleChange}
            />
          </div>

          <label className="checkbox-label full-width">
            <input
              type="checkbox"
              name="conformidad_cliente"
              checked={formData.conformidad_cliente}
              onChange={handleChange}
            />
            ¿Cliente conforme con la entrega?
          </label>

          <button type="submit" className="full-width">
            Registrar entrega
          </button>
        </form>

        {mensaje && <p className="success">{mensaje}</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="section">
        <h3 className="section-title">Listado de entregas</h3>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>No. Orden</th>
                <th>Cliente</th>
                <th>Vehículo</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Recibido por</th>
              </tr>
            </thead>
            <tbody>
              {entregas.length > 0 ? (
                entregas.map((entrega) => (
                  <tr key={entrega.id_entrega}>
                    <td>{entrega.id_entrega}</td>
                    <td>{entrega.numero_orden}</td>
                    <td>{entrega.nombres} {entrega.apellidos}</td>
                    <td>{entrega.placa} - {entrega.marca} {entrega.modelo}</td>
                    <td>{entrega.fecha_entrega}</td>
                    <td>{entrega.hora_entrega}</td>
                    <td>{entrega.recibido_por_cliente}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No hay entregas registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EntregasPage;