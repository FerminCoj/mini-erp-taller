const pool = require("../config/db");

const obtenerTecnicos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_tecnico, nombre, activo
      FROM tecnicos
      WHERE activo = TRUE
      ORDER BY id_tecnico ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener técnicos:", error);
    res.status(500).json({
      mensaje: "Error al obtener técnicos",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerTecnicos,
};