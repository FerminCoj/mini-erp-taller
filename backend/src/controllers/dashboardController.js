const pool = require("../config/db");

const obtenerResumenDashboard = async (req, res) => {
  try {
    const result = await pool.query(`
      WITH ultimo_seguimiento AS (
        SELECT DISTINCT ON (sr.id_orden)
          sr.id_orden,
          sr.estado_proceso
        FROM seguimiento_reparacion sr
        ORDER BY sr.id_orden, sr.id_seguimiento DESC
      ),
      estado_actual_por_orden AS (
        SELECT
          ot.id_orden,
          COALESCE(us.estado_proceso, ot.estado_actual) AS estado_actual
        FROM ordenes_trabajo ot
        LEFT JOIN ultimo_seguimiento us ON ot.id_orden = us.id_orden
      )
      SELECT
        (SELECT COUNT(*) FROM ordenes_trabajo) AS total_ordenes,
        (
          SELECT COUNT(*)
          FROM estado_actual_por_orden
          WHERE estado_actual = 'Listo para entrega'
        ) AS listas_para_entrega,
        (
          SELECT COUNT(*)
          FROM recepcion_vehiculos
          WHERE es_reproceso = TRUE
        ) AS total_reprocesos,
        (
          SELECT COUNT(*)
          FROM ordenes_trabajo
          WHERE requiere_repuestos = TRUE
            AND repuestos_completos = FALSE
        ) AS pendientes_repuestos,
        (
          SELECT COUNT(*)
          FROM entregas
        ) AS total_entregados
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener resumen del dashboard:", error);
    res.status(500).json({
      mensaje: "Error al obtener resumen del dashboard",
      error: error.message,
    });
  }
};

const obtenerEstadosDashboard = async (req, res) => {
  try {
    const result = await pool.query(`
      WITH ultimo_seguimiento AS (
        SELECT DISTINCT ON (sr.id_orden)
          sr.id_orden,
          sr.estado_proceso
        FROM seguimiento_reparacion sr
        ORDER BY sr.id_orden, sr.id_seguimiento DESC
      ),
      estado_actual_por_orden AS (
        SELECT
          ot.id_orden,
          COALESCE(us.estado_proceso, ot.estado_actual) AS estado_actual
        FROM ordenes_trabajo ot
        LEFT JOIN ultimo_seguimiento us ON ot.id_orden = us.id_orden
      )
      SELECT
        estado_actual,
        COUNT(*) AS total_vehiculos
      FROM estado_actual_por_orden
      GROUP BY estado_actual
      ORDER BY total_vehiculos DESC, estado_actual ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener estados del dashboard:", error);
    res.status(500).json({
      mensaje: "Error al obtener estados del dashboard",
      error: error.message,
    });
  }
};

const obtenerDetalleEstadosDashboard = async (req, res) => {
  try {
    const result = await pool.query(`
      WITH ultimo_seguimiento AS (
        SELECT DISTINCT ON (sr.id_orden)
          sr.id_orden,
          sr.estado_proceso,
          sr.fecha_inicio,
          sr.fecha_fin,
          sr.fecha_limite_etapa,
          sr.motivo_atraso
        FROM seguimiento_reparacion sr
        ORDER BY sr.id_orden, sr.id_seguimiento DESC
      )
      SELECT
        ot.id_orden,
        ot.numero_orden,
        COALESCE(us.estado_proceso, ot.estado_actual) AS estado_actual,
        ot.tecnico_asignado,
        v.placa,
        v.marca,
        v.modelo,
        c.nombres,
        c.apellidos,
        us.fecha_inicio,
        us.fecha_limite_etapa,
        CASE
          WHEN COALESCE(us.estado_proceso, ot.estado_actual) = 'Entregado' THEN 'Finalizado'
          WHEN us.fecha_limite_etapa IS NULL THEN 'Sin fecha límite'
          WHEN CURRENT_TIMESTAMP > us.fecha_limite_etapa THEN 'Atrasado'
          ELSE 'En tiempo'
        END AS situacion_tiempo
      FROM ordenes_trabajo ot
      INNER JOIN recepcion_vehiculos rv ON ot.id_recepcion = rv.id_recepcion
      INNER JOIN vehiculos v ON rv.id_vehiculo = v.id_vehiculo
      INNER JOIN clientes c ON v.id_cliente = c.id_cliente
      LEFT JOIN ultimo_seguimiento us ON ot.id_orden = us.id_orden
      ORDER BY estado_actual ASC, ot.numero_orden ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener detalle de estados del dashboard:", error);
    res.status(500).json({
      mensaje: "Error al obtener detalle de estados del dashboard",
      error: error.message,
    });
  }
};

const obtenerAtrasosDashboard = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        sr.id_seguimiento,
        ot.numero_orden,
        sr.estado_proceso,
        sr.fecha_inicio,
        sr.fecha_limite_etapa,
        sr.motivo_atraso
      FROM seguimiento_reparacion sr
      INNER JOIN ordenes_trabajo ot ON sr.id_orden = ot.id_orden
      WHERE sr.fecha_fin IS NULL
        AND sr.fecha_limite_etapa IS NOT NULL
        AND CURRENT_TIMESTAMP > sr.fecha_limite_etapa
      ORDER BY sr.fecha_limite_etapa ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener atrasos del dashboard:", error);
    res.status(500).json({
      mensaje: "Error al obtener atrasos del dashboard",
      error: error.message,
    });
  }
};

const obtenerRepuestosDashboard = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ot.numero_orden,
        ot.tecnico_asignado,
        ot.estado_actual,
        ot.observacion_repuestos
      FROM ordenes_trabajo ot
      WHERE ot.requiere_repuestos = TRUE
        AND ot.repuestos_completos = FALSE
      ORDER BY ot.id_orden ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener repuestos pendientes del dashboard:", error);
    res.status(500).json({
      mensaje: "Error al obtener repuestos pendientes del dashboard",
      error: error.message,
    });
  }
};

const obtenerReprocesosDashboard = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        rv.id_recepcion,
        v.placa,
        v.marca,
        v.modelo,
        c.nombres,
        c.apellidos,
        rv.motivo_reproceso
      FROM recepcion_vehiculos rv
      INNER JOIN vehiculos v ON rv.id_vehiculo = v.id_vehiculo
      INNER JOIN clientes c ON v.id_cliente = c.id_cliente
      WHERE rv.es_reproceso = TRUE
      ORDER BY rv.id_recepcion ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener reprocesos del dashboard:", error);
    res.status(500).json({
      mensaje: "Error al obtener reprocesos del dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerResumenDashboard,
  obtenerEstadosDashboard,
  obtenerDetalleEstadosDashboard,
  obtenerAtrasosDashboard,
  obtenerRepuestosDashboard,
  obtenerReprocesosDashboard,
};