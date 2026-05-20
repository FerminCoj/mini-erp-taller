const pool = require("../config/db");

const obtenerOrdenes = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ot.*,
        rv.fecha_recepcion,
        v.placa,
        v.marca,
        v.modelo,
        c.nombres,
        c.apellidos
      FROM ordenes_trabajo ot
      INNER JOIN recepcion_vehiculos rv ON ot.id_recepcion = rv.id_recepcion
      INNER JOIN vehiculos v ON rv.id_vehiculo = v.id_vehiculo
      INNER JOIN clientes c ON v.id_cliente = c.id_cliente
      ORDER BY ot.id_orden ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    res.status(500).json({
      mensaje: "Error al obtener órdenes",
      error: error.message,
    });
  }
};

const generarNumeroOrden = async (client) => {
  const result = await client.query(`
    SELECT numero_orden
    FROM ordenes_trabajo
    ORDER BY id_orden DESC
    LIMIT 1
  `);

  if (result.rows.length === 0 || !result.rows[0].numero_orden) {
    return "OT-0001";
  }

  const ultimoNumero = result.rows[0].numero_orden;
  const parteNumerica = parseInt(ultimoNumero.replace("OT-", ""), 10);
  const siguiente = Number.isNaN(parteNumerica) ? 1 : parteNumerica + 1;

  return `OT-${String(siguiente).padStart(4, "0")}`;
};

const crearOrden = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      id_recepcion,
      descripcion_trabajo,
      tecnico_asignado,
      prioridad,
      fecha_estimada_entrega,
      requiere_repuestos,
      repuestos_completos,
      observacion_repuestos,
      estado_actual,
      creado_por,
    } = req.body;

    if (!id_recepcion || !descripcion_trabajo || !tecnico_asignado) {
      return res.status(400).json({
        mensaje:
          "Los campos id_recepcion, descripcion_trabajo y tecnico_asignado son obligatorios",
      });
    }

    await client.query("BEGIN");

    const numeroOrden = await generarNumeroOrden(client);

    const result = await client.query(
      `
      INSERT INTO ordenes_trabajo (
        id_recepcion,
        numero_orden,
        descripcion_trabajo,
        tecnico_asignado,
        prioridad,
        fecha_estimada_entrega,
        requiere_repuestos,
        repuestos_completos,
        observacion_repuestos,
        estado_actual,
        creado_por
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
      `,
      [
        Number(id_recepcion),
        numeroOrden,
        descripcion_trabajo,
        tecnico_asignado,
        prioridad || "Media",
        fecha_estimada_entrega || null,
        requiere_repuestos || false,
        repuestos_completos || false,
        observacion_repuestos || null,
        estado_actual || "Recibido",
        Number(creado_por || 1),
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      mensaje: "Orden creada correctamente",
      orden: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al crear orden:", error);
    res.status(500).json({
      mensaje: "Error al crear orden",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

module.exports = {
  obtenerOrdenes,
  crearOrden,
};