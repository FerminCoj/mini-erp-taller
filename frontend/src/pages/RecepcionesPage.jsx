import { useEffect, useState } from "react";
import axios from "axios";
import "./RecepcionesPage.css";

function RecepcionesPage() {
  const [recepciones, setRecepciones] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [formData, setFormData] = useState({
    id_vehiculo: "",
    fecha_recepcion: "",
    hora_recepcion: "",
    kilometraje: "",
    nivel_combustible: "",
    motivo_ingreso: "",
    observaciones_iniciales: "",
    recibido_por: "1",
    estado_inicial: "Recibido",
    es_reproceso: false,
    motivo_reproceso: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const obtenerRecepciones = async () => {
    try {
      const response = await axios.get("http://localhost:4000/recepciones");
      setRecepciones(response.data);
    } catch (err) {
      console.error("Error al obtener recepciones:", err);
      setError("No se pudieron cargar las recepciones");
    }
  };

  const obtenerVehiculos = async () => {
    try {
      const response = await axios.get("http://localhost:4000/vehiculos");
      setVehiculos(response.data);
    } catch (err) {
      console.error("Error al obtener vehículos:", err);
      setError("No se pudieron cargar los vehículos");
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      await obtenerRecepciones();
      await obtenerVehiculos();
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
      const response = await axios.post("http://localhost:4000/recepciones", {
        ...formData,
        id_vehiculo: Number(formData.id_vehiculo),
        kilometraje: formData.kilometraje ? Number(formData.kilometraje) : null,
        recibido_por: Number(formData.recibido_por),
      });

      setMensaje(response.data.mensaje);

      setFormData({
        id_vehiculo: "",
        fecha_recepcion: "",
        hora_recepcion: "",
        kilometraje: "",
        nivel_combustible: "",
        motivo_ingreso: "",
        observaciones_iniciales: "",
        recibido_por: "1",
        estado_inicial: "Recibido",
        es_reproceso: false,
        motivo_reproceso: "",
      });

      await obtenerRecepciones();
    } catch (err) {
      console.error("Error al crear recepción:", err);
      setError(err.response?.data?.mensaje || "Error al registrar recepción");
    }
  };

  return (
    <div className="recepciones-container">
      <div className="recepciones-header">
        <h1>Mini ERP Taller</h1>
        <h2>Recepción de Vehículos</h2>
      </div>

      <div className="form-card">
        <h3>Nueva recepción</h3>

        <form onSubmit={handleSubmit} className="form-grid">
          <select
            name="id_vehiculo"
            value={formData.id_vehiculo}
            onChange={handleChange}
          >
            <option value="">Seleccione un vehículo</option>
            {vehiculos.map((vehiculo) => (
              <option key={vehiculo.id_vehiculo} value={vehiculo.id_vehiculo}>
                {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="fecha_recepcion"
            value={formData.fecha_recepcion}
            onChange={handleChange}
          />

          <input
            type="time"
            name="hora_recepcion"
            value={formData.hora_recepcion}
            onChange={handleChange}
          />

          <input
            type="number"
            name="kilometraje"
            placeholder="Kilometraje"
            value={formData.kilometraje}
            onChange={handleChange}
          />

          <input
            type="text"
            name="nivel_combustible"
            placeholder="Nivel de combustible"
            value={formData.nivel_combustible}
            onChange={handleChange}
          />

          <input
            type="text"
            name="motivo_ingreso"
            placeholder="Motivo de ingreso"
            value={formData.motivo_ingreso}
            onChange={handleChange}
          />

          <input
            type="text"
            name="observaciones_iniciales"
            placeholder="Observaciones iniciales"
            value={formData.observaciones_iniciales}
            onChange={handleChange}
            className="full-width"
          />

          <label className="checkbox-label full-width">
            <input
              type="checkbox"
              name="es_reproceso"
              checked={formData.es_reproceso}
              onChange={handleChange}
            />
            ¿Es reproceso?
          </label>

          {formData.es_reproceso && (
            <input
              type="text"
              name="motivo_reproceso"
              placeholder="Motivo de reproceso"
              value={formData.motivo_reproceso}
              onChange={handleChange}
              className="full-width"
            />
          )}

          <button type="submit" className="full-width">
            Registrar recepción
          </button>
        </form>

        {mensaje && <p className="success">{mensaje}</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="section">
        <h3 className="section-title">Listado de recepciones</h3>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehículo</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Kilometraje</th>
                <th>Motivo ingreso</th>
                <th>Reproceso</th>
              </tr>
            </thead>
            <tbody>
              {recepciones.length > 0 ? (
                recepciones.map((recepcion) => (
                  <tr key={recepcion.id_recepcion}>
                    <td>{recepcion.id_recepcion}</td>
                    <td>{recepcion.placa} - {recepcion.marca} {recepcion.modelo}</td>
                    <td>{recepcion.nombres} {recepcion.apellidos}</td>
                    <td>{recepcion.fecha_recepcion}</td>
                    <td>{recepcion.hora_recepcion}</td>
                    <td>{recepcion.kilometraje}</td>
                    <td>{recepcion.motivo_ingreso}</td>
                    <td>{recepcion.es_reproceso ? "Sí" : "No"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No hay recepciones registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RecepcionesPage;