const pool = require("../config/db");

const obtenerResumenDashboard = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM ordenes_trabajo) AS total_ordenes,
        (SELECT COUNT(*) FROM ordenes_trabajo WHERE estado_actual = 'Listo para entrega') AS listas_para_entrega,
        (SELECT COUNT(*) FROM recepcion_vehiculos WHERE es_reproceso = TRUE) AS total_reprocesos,
        (SELECT COUNT(*) FROM ordenes_trabajo WHERE requiere_repuestos = TRUE AND repuestos_completos = FALSE) AS pendientes_repuestos
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

/*Estados del Dashboard */
const obtenerEstadosDashboard = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT estado_actual, COUNT(*) AS total_vehiculos
      FROM ordenes_trabajo
      GROUP BY estado_actual
      ORDER BY total_vehiculos DESC
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

/*Atrasos Dashboard */
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

/*Funcion para obtener Repuestos de Dashboard */
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
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener repuestos del dashboard:", error);
    res.status(500).json({
      mensaje: "Error al obtener repuestos del dashboard",
      error: error.message,
    });
  }
};

/*Función para obtener Reprocesos del Dashboard */

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
  obtenerAtrasosDashboard,
  obtenerRepuestosDashboard,
  obtenerReprocesosDashboard,
};