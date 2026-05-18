const pool = require("../config/db");

const obtenerClientes = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clientes ORDER BY id_cliente ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({
      mensaje: "Error al obtener clientes",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerClientes,
};