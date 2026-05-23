import { useEffect, useState } from "react";
import axios from "axios";
import "./ClientesPage.css";

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    correo: "",
    direccion: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const response = await axios.get("http://localhost:4000/clientes");
        setClientes(response.data);
      } catch (err) {
        console.error("Error al obtener clientes:", err);
        setError("No se pudieron cargar los clientes");
      }
    };

    cargarClientes();
  }, []);

  const obtenerClientes = async () => {
    try {
      const response = await axios.get("http://localhost:4000/clientes");
      setClientes(response.data);
    } catch (err) {
      console.error("Error al obtener clientes:", err);
      setError("No se pudieron cargar los clientes");
    }
  };

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
      const response = await axios.post("http://localhost:4000/clientes", formData);

      setMensaje(response.data.mensaje);
      setFormData({
        nombres: "",
        apellidos: "",
        telefono: "",
        correo: "",
        direccion: "",
      });

      await obtenerClientes();
    } catch (err) {
      console.error("Error al crear cliente:", err);
      setError(err.response?.data?.mensaje || "Error al crear cliente");
    }
  };

  return (
    <div className="clientes-container">
      <div className="clientes-header">
        <h1>Centro Automotriz Palín</h1>
        <h2>Registro de Clientes</h2>
      </div>

      <div className="form-card">
        <h3>Nuevo cliente</h3>

        <form onSubmit={handleSubmit} className="form-grid">
          <input
            type="text"
            name="nombres"
            placeholder="Nombres"
            value={formData.nombres}
            onChange={handleChange}
          />

          <input
            type="text"
            name="apellidos"
            placeholder="Apellidos"
            value={formData.apellidos}
            onChange={handleChange}
          />

          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
          />

          <input
            type="email"
            name="correo"
            placeholder="Correo"
            value={formData.correo}
            onChange={handleChange}
          />

          <input
            type="text"
            name="direccion"
            placeholder="Dirección"
            value={formData.direccion}
            onChange={handleChange}
            className="full-width"
          />

          <button type="submit" className="full-width">
            Guardar cliente
          </button>
        </form>

        {mensaje && <p className="success">{mensaje}</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="section">
        <h3 className="section-title">Listado de clientes</h3>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Dirección</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length > 0 ? (
                clientes.map((cliente) => (
                  <tr key={cliente.id_cliente}>
                    <td>{cliente.id_cliente}</td>
                    <td>{cliente.nombres}</td>
                    <td>{cliente.apellidos}</td>
                    <td>{cliente.telefono}</td>
                    <td>{cliente.correo}</td>
                    <td>{cliente.direccion}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No hay clientes registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ClientesPage;