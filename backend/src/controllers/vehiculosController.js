const pool = require("../config/db");

const obtenerVehiculos = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        v.*,
        c.nombres,
        c.apellidos
      FROM vehiculos v
      INNER JOIN clientes c ON v.id_cliente = c.id_cliente
      ORDER BY v.id_vehiculo ASC
      `
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

const crearVehiculo = async (req, res) => {
  try {
    const {
      id_cliente,
      placa,
      marca,
      modelo,
      anio,
      color,
      vin,
      tipo_combustible,
    } = req.body;

    if (!id_cliente || !placa || !marca || !modelo) {
      return res.status(400).json({
        mensaje: "Los campos id_cliente, placa, marca y modelo son obligatorios",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO vehiculos (
        id_cliente, placa, marca, modelo, anio, color, vin, tipo_combustible
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        id_cliente,
        placa,
        marca,
        modelo,
        anio || null,
        color || null,
        vin || null,
        tipo_combustible || null,
      ]
    );

    res.status(201).json({
      mensaje: "Vehículo creado correctamente",
      vehiculo: result.rows[0],
    });
  } catch (error) {
    console.error("Error al crear vehículo:", error);
    res.status(500).json({
      mensaje: "Error al crear vehículo",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerVehiculos,
  crearVehiculo,
};