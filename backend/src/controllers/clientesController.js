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

const crearCliente = async (req, res) => {
  try {
    const { nombres, apellidos, telefono, correo, direccion } = req.body;

    if (!nombres || !apellidos) {
      return res.status(400).json({
        mensaje: "Los campos nombres y apellidos son obligatorios",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO clientes (nombres, apellidos, telefono, correo, direccion)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [nombres, apellidos, telefono, correo, direccion]
    );

    res.status(201).json({
      mensaje: "Cliente creado correctamente",
      cliente: result.rows[0],
    });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({
      mensaje: "Error al crear cliente",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerClientes,
  crearCliente,
};