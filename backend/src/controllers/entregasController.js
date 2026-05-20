const pool = require("../config/db");

const obtenerEntregas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        e.*,
        ot.numero_orden,
        v.placa,
        v.marca,
        v.modelo,
        c.nombres,
        c.apellidos
      FROM entregas e
      INNER JOIN ordenes_trabajo ot ON e.id_orden = ot.id_orden
      INNER JOIN recepcion_vehiculos rv ON ot.id_recepcion = rv.id_recepcion
      INNER JOIN vehiculos v ON rv.id_vehiculo = v.id_vehiculo
      INNER JOIN clientes c ON v.id_cliente = c.id_cliente
      ORDER BY e.id_entrega ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener entregas:", error);
    res.status(500).json({
      mensaje: "Error al obtener entregas",
      error: error.message,
    });
  }
};

const crearEntrega = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      id_orden,
      fecha_entrega,
      hora_entrega,
      entregado_por,
      recibido_por_cliente,
      observaciones_entrega,
      conformidad_cliente,
    } = req.body;

    if (!id_orden || !recibido_por_cliente || !entregado_por) {
      return res.status(400).json({
        mensaje:
          "Los campos id_orden, recibido_por_cliente y entregado_por son obligatorios",
      });
    }

    await client.query("BEGIN");

    const entregaResult = await client.query(
      `
      INSERT INTO entregas (
        id_orden,
        fecha_entrega,
        hora_entrega,
        entregado_por,
        recibido_por_cliente,
        observaciones_entrega,
        conformidad_cliente
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        Number(id_orden),
        fecha_entrega || new Date().toISOString().split("T")[0],
        hora_entrega || new Date().toLocaleTimeString("en-GB"),
        Number(entregado_por),
        recibido_por_cliente,
        observaciones_entrega || null,
        conformidad_cliente ?? true,
      ]
    );

    await client.query(
      `
      UPDATE ordenes_trabajo
      SET estado_actual = 'Entregado'
      WHERE id_orden = $1
      `,
      [Number(id_orden)]
    );

    const fechaHoraEntrega = `${fecha_entrega || new Date().toISOString().split("T")[0]}T${hora_entrega || new Date().toLocaleTimeString("en-GB")}`;

    await client.query(
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
      `,
      [
        Number(id_orden),
        "Entregado",
        fechaHoraEntrega,
        fechaHoraEntrega,
        observaciones_entrega || "Entrega final del vehículo",
        Number(entregado_por),
        null,
        null,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      mensaje: "Entrega registrada correctamente y orden cerrada",
      entrega: entregaResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(400).json({
        mensaje: "La orden seleccionada ya tiene una entrega registrada",
      });
    }

    console.error("Error al crear entrega:", error);
    res.status(500).json({
      mensaje: "Error al crear entrega",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

module.exports = {
  obtenerEntregas,
  crearEntrega,
};