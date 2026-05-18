const pool = require("../config/db");

const obtenerOrdenes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ordenes_trabajo ORDER BY id_orden ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    res.status(500).json({
      mensaje: "Error al obtener órdenes",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerOrdenes,
};