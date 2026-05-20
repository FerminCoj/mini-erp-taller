const pool = require("../config/db");

const obtenerSeguimientos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        sr.*,
        ot.numero_orden,
        v.placa,
        v.marca,
        v.modelo,
        c.nombres,
        c.apellidos
      FROM seguimiento_reparacion sr
      INNER JOIN ordenes_trabajo ot ON sr.id_orden = ot.id_orden
      INNER JOIN recepcion_vehiculos rv ON ot.id_recepcion = rv.id_recepcion
      INNER JOIN vehiculos v ON rv.id_vehiculo = v.id_vehiculo
      INNER JOIN clientes c ON v.id_cliente = c.id_cliente
      ORDER BY sr.id_seguimiento ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener seguimientos:", error);
    res.status(500).json({
      mensaje: "Error al obtener seguimientos",
      error: error.message,
    });
  }
};

const crearSeguimiento = async (req, res) => {
  try {
    const {
      id_orden,
      estado_proceso,
      fecha_inicio,
      fecha_fin,
      observaciones,
      actualizado_por,
      fecha_limite_etapa,
      motivo_atraso,
    } = req.body;

    if (!id_orden || !estado_proceso || !fecha_inicio || !actualizado_por) {
      return res.status(400).json({
        mensaje:
          "Los campos id_orden, estado_proceso, fecha_inicio y actualizado_por son obligatorios",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO seguimiento_reparacion (
        id_orden,
        estado_proceso,
        fecha_inicio,
        fecha_fin,
        observaciones,
        actualizado_por,
        fecha_limite_etapa,
        motivo_atraso
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        Number(id_orden),
        estado_proceso,
        fecha_inicio,
        fecha_fin || null,
        observaciones || null,
        Number(actualizado_por),
        fecha_limite_etapa || null,
        motivo_atraso || null,
      ]
    );

    res.status(201).json({
      mensaje: "Seguimiento registrado correctamente",
      seguimiento: result.rows[0],
    });
  } catch (error) {
    console.error("Error al crear seguimiento:", error);
    res.status(500).json({
      mensaje: "Error al crear seguimiento",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerSeguimientos,
  crearSeguimiento,
};