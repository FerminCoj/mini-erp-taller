const pool = require("../config/db");

const obtenerVehiculos = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM vehiculos ORDER BY id_vehiculo ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    res.status(500).json({
      mensaje: "Error al obtener vehículos",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerVehiculos,
};