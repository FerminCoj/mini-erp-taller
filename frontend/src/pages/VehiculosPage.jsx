import { useEffect, useState } from "react";
import axios from "axios";
import "./VehiculosPage.css";

function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    id_cliente: "",
    placa: "",
    marca: "",
    modelo: "",
    anio: "",
    color: "",
    vin: "",
    tipo_combustible: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const obtenerVehiculos = async () => {
    try {
      const response = await axios.get("http://localhost:4000/vehiculos");
      setVehiculos(response.data);
    } catch (err) {
      console.error("Error al obtener vehículos:", err);
      setError("No se pudieron cargar los vehículos");
    }
  };

  const obtenerClientes = async () => {
    try {
      const response = await axios.get("http://localhost:4000/clientes");
      setClientes(response.data);
    } catch (err) {
      console.error("Error al obtener clientes:", err);
      setError("No se pudieron cargar los clientes");
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      await obtenerVehiculos();
      await obtenerClientes();
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
      const response = await axios.post("http://localhost:4000/vehiculos", {
        ...formData,
        id_cliente: Number(formData.id_cliente),
        anio: formData.anio ? Number(formData.anio) : null,
      });

      setMensaje(response.data.mensaje);
      setFormData({
        id_cliente: "",
        placa: "",
        marca: "",
        modelo: "",
        anio: "",
        color: "",
        vin: "",
        tipo_combustible: "",
      });

      await obtenerVehiculos();
    } catch (err) {
      console.error("Error al crear vehículo:", err);
      setError(err.response?.data?.mensaje || "Error al crear vehículo");
    }
  };

  return (
    <div className="vehiculos-container">
      <div className="vehiculos-header">
        <h1>Centro Automotriz Palín</h1>
        <h2>Registro de Vehículos</h2>
      </div>

      <div className="form-card">
        <h3>Nuevo vehículo</h3>

        <form onSubmit={handleSubmit} className="form-grid">
          <select
            name="id_cliente"
            value={formData.id_cliente}
            onChange={handleChange}
          >
            <option value="">Seleccione un cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id_cliente} value={cliente.id_cliente}>
                {cliente.nombres} {cliente.apellidos}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="placa"
            placeholder="Placa"
            value={formData.placa}
            onChange={handleChange}
          />

          <input
            type="text"
            name="marca"
            placeholder="Marca"
            value={formData.marca}
            onChange={handleChange}
          />

          <input
            type="text"
            name="modelo"
            placeholder="Modelo"
            value={formData.modelo}
            onChange={handleChange}
          />

          <input
            type="number"
            name="anio"
            placeholder="Año"
            value={formData.anio}
            onChange={handleChange}
          />

          <input
            type="text"
            name="color"
            placeholder="Color"
            value={formData.color}
            onChange={handleChange}
          />

          <input
            type="text"
            name="vin"
            placeholder="VIN"
            value={formData.vin}
            onChange={handleChange}
          />

          <input
            type="text"
            name="tipo_combustible"
            placeholder="Tipo de combustible"
            value={formData.tipo_combustible}
            onChange={handleChange}
          />

          <button type="submit" className="full-width">
            Guardar vehículo
          </button>
        </form>

        {mensaje && <p className="success">{mensaje}</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="section">
        <h3 className="section-title">Listado de vehículos</h3>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Placa</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Año</th>
                <th>Color</th>
                <th>Combustible</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.length > 0 ? (
                vehiculos.map((vehiculo) => (
                  <tr key={vehiculo.id_vehiculo}>
                    <td>{vehiculo.id_vehiculo}</td>
                    <td>
                      {vehiculo.nombres} {vehiculo.apellidos}
                    </td>
                    <td>{vehiculo.placa}</td>
                    <td>{vehiculo.marca}</td>
                    <td>{vehiculo.modelo}</td>
                    <td>{vehiculo.anio}</td>
                    <td>{vehiculo.color}</td>
                    <td>{vehiculo.tipo_combustible}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No hay vehículos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default VehiculosPage;