const pool = require("../config/db");

const obtenerRecepciones = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        rv.*,
        v.placa,
        v.marca,
        v.modelo,
        c.nombres,
        c.apellidos
      FROM recepcion_vehiculos rv
      INNER JOIN vehiculos v ON rv.id_vehiculo = v.id_vehiculo
      INNER JOIN clientes c ON v.id_cliente = c.id_cliente
      ORDER BY rv.id_recepcion ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener recepciones:", error);
    res.status(500).json({
      mensaje: "Error al obtener recepciones",
      error: error.message,
    });
  }
};

const crearRecepcion = async (req, res) => {
  try {
    const {
      id_vehiculo,
      fecha_recepcion,
      hora_recepcion,
      kilometraje,
      nivel_combustible,
      motivo_ingreso,
      observaciones_iniciales,
      recibido_por,
      estado_inicial,
      es_reproceso,
      motivo_reproceso,
    } = req.body;

    if (!id_vehiculo || !motivo_ingreso || !recibido_por) {
      return res.status(400).json({
        mensaje: "Los campos id_vehiculo, motivo_ingreso y recibido_por son obligatorios",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO recepcion_vehiculos (
        id_vehiculo,
        fecha_recepcion,
        hora_recepcion,
        kilometraje,
        nivel_combustible,
        motivo_ingreso,
        observaciones_iniciales,
        recibido_por,
        estado_inicial,
        es_reproceso,
        motivo_reproceso
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
      `,
      [
        Number(id_vehiculo),
        fecha_recepcion || new Date().toISOString().split("T")[0],
        hora_recepcion || new Date().toLocaleTimeString("en-GB"),
        kilometraje ? Number(kilometraje) : null,
        nivel_combustible || null,
        motivo_ingreso,
        observaciones_iniciales || null,
        Number(recibido_por),
        estado_inicial || "Recibido",
        es_reproceso || false,
        motivo_reproceso || null,
      ]
    );

    res.status(201).json({
      mensaje: "Recepción registrada correctamente",
      recepcion: result.rows[0],
    });
  } catch (error) {
    console.error("Error al crear recepción:", error);
    res.status(500).json({
      mensaje: "Error al crear recepción",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerRecepciones,
  crearRecepcion,
};