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
            AND estado_actual <> 'Entregado'
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
      WHERE estado_actual IN (
        'En enderezado',
        'En preparación',
        'En pintura',
        'En armado',
        'En lavado'
      )
      GROUP BY estado_actual
      ORDER BY CASE estado_actual
        WHEN 'En enderezado' THEN 1
        WHEN 'En preparación' THEN 2
        WHEN 'En pintura' THEN 3
        WHEN 'En armado' THEN 4
        WHEN 'En lavado' THEN 5
        ELSE 99
      END
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
        ot.id_recepcion,
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
      ORDER BY ot.numero_orden ASC
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
      WITH ultimo_seguimiento AS (
        SELECT DISTINCT ON (sr.id_orden)
          sr.id_orden,
          sr.id_seguimiento,
          sr.estado_proceso,
          sr.fecha_inicio,
          sr.fecha_fin,
          sr.fecha_limite_etapa,
          sr.motivo_atraso
        FROM seguimiento_reparacion sr
        ORDER BY sr.id_orden, sr.id_seguimiento DESC
      )
      SELECT
        us.id_seguimiento,
        ot.id_orden,
        ot.numero_orden,
        us.estado_proceso,
        us.fecha_inicio,
        us.fecha_limite_etapa,
        us.motivo_atraso
      FROM ultimo_seguimiento us
      INNER JOIN ordenes_trabajo ot ON us.id_orden = ot.id_orden
      WHERE ot.estado_actual <> 'Entregado'
        AND us.estado_proceso <> 'Entregado'
        AND us.fecha_limite_etapa IS NOT NULL
        AND CURRENT_TIMESTAMP > us.fecha_limite_etapa
      ORDER BY us.fecha_limite_etapa ASC
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
        AND ot.estado_actual <> 'Entregado'
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

const obtenerEntregasSemanales = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        EXTRACT(WEEK FROM e.fecha_entrega) AS semana,
        COUNT(*) AS total_entregas
      FROM entregas e
      GROUP BY EXTRACT(WEEK FROM e.fecha_entrega)
      ORDER BY semana ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener entregas semanales:", error);
    res.status(500).json({
      mensaje: "Error al obtener entregas semanales",
      error: error.message,
    });
  }
};

const obtenerEntregasMensuales = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        EXTRACT(MONTH FROM e.fecha_entrega) AS mes,
        COUNT(*) AS total_entregas
      FROM entregas e
      GROUP BY EXTRACT(MONTH FROM e.fecha_entrega)
      ORDER BY mes ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener entregas mensuales:", error);
    res.status(500).json({
      mensaje: "Error al obtener entregas mensuales",
      error: error.message,
    });
  }
};

const obtenerResumenEntregasDashboard = async (req, res) => {
  try {
    const result = await pool.query(`
      WITH entregas_con_control AS (
        SELECT
          e.id_entrega,
          e.id_orden,
          e.fecha_entrega,
          ot.fecha_estimada_entrega,
          CASE
            WHEN ot.fecha_estimada_entrega IS NULL THEN 'Sin fecha estimada'
            WHEN e.fecha_entrega <= ot.fecha_estimada_entrega THEN 'A tiempo'
            ELSE 'Con atraso'
          END AS estado_entrega
        FROM entregas e
        INNER JOIN ordenes_trabajo ot ON e.id_orden = ot.id_orden
      )
      SELECT
        COUNT(*) AS total_entregados,
        COUNT(*) FILTER (WHERE estado_entrega = 'A tiempo') AS entregados_a_tiempo,
        COUNT(*) FILTER (WHERE estado_entrega = 'Con atraso') AS entregados_con_atraso,
        COUNT(*) FILTER (WHERE estado_entrega = 'Sin fecha estimada') AS entregados_sin_fecha_estimada,
        CASE
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND(
            (COUNT(*) FILTER (WHERE estado_entrega = 'A tiempo')::numeric * 100.0) / COUNT(*),
            2
          )
        END AS porcentaje_cumplimiento
      FROM entregas_con_control
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener resumen de entregas:", error);
    res.status(500).json({
      mensaje: "Error al obtener resumen de entregas",
      error: error.message,
    });
  }
};

const obtenerEntregasMensualesControl = async (req, res) => {
  try {
    const result = await pool.query(`
      WITH entregas_con_control AS (
        SELECT
          EXTRACT(MONTH FROM e.fecha_entrega) AS mes,
          CASE
            WHEN ot.fecha_estimada_entrega IS NULL THEN 'Sin fecha estimada'
            WHEN e.fecha_entrega <= ot.fecha_estimada_entrega THEN 'A tiempo'
            ELSE 'Con atraso'
          END AS estado_entrega
        FROM entregas e
        INNER JOIN ordenes_trabajo ot ON e.id_orden = ot.id_orden
      )
      SELECT
        mes,
        COUNT(*) FILTER (WHERE estado_entrega = 'A tiempo') AS entregados_a_tiempo,
        COUNT(*) FILTER (WHERE estado_entrega = 'Con atraso') AS entregados_con_atraso,
        COUNT(*) FILTER (WHERE estado_entrega = 'Sin fecha estimada') AS entregados_sin_fecha_estimada,
        COUNT(*) AS total_entregas
      FROM entregas_con_control
      GROUP BY mes
      ORDER BY mes ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener entregas mensuales con control:", error);
    res.status(500).json({
      mensaje: "Error al obtener entregas mensuales con control",
      error: error.message,
    });
  }
};

const obtenerIndicadoresOperativosDashboard = async (req, res) => {
  try {
    const result = await pool.query(`
      WITH ultimo_seguimiento AS (
        SELECT DISTINCT ON (sr.id_orden)
          sr.id_orden,
          sr.estado_proceso,
          sr.fecha_limite_etapa
        FROM seguimiento_reparacion sr
        ORDER BY sr.id_orden, sr.id_seguimiento DESC
      ),
      ordenes_activas AS (
        SELECT
          ot.id_orden,
          COALESCE(us.estado_proceso, ot.estado_actual) AS estado_actual,
          us.fecha_limite_etapa
        FROM ordenes_trabajo ot
        LEFT JOIN ultimo_seguimiento us ON ot.id_orden = us.id_orden
        WHERE COALESCE(us.estado_proceso, ot.estado_actual) <> 'Entregado'
      ),
      carga_por_estado AS (
        SELECT
          estado_actual,
          COUNT(*) AS total
        FROM ordenes_activas
        WHERE estado_actual IN (
          'En enderezado',
          'En preparación',
          'En pintura',
          'En armado',
          'En lavado',
          'Listo para entrega'
        )
        GROUP BY estado_actual
      ),
      atrasos_por_estado AS (
        SELECT
          estado_actual,
          COUNT(*) AS total
        FROM ordenes_activas
        WHERE fecha_limite_etapa IS NOT NULL
          AND CURRENT_TIMESTAMP > fecha_limite_etapa
          AND estado_actual IN (
            'En enderezado',
            'En preparación',
            'En pintura',
            'En armado',
            'En lavado',
            'Listo para entrega'
          )
        GROUP BY estado_actual
      ),
      mayor_carga AS (
        SELECT
          estado_actual,
          total
        FROM carga_por_estado
        ORDER BY total DESC, estado_actual ASC
        LIMIT 1
      ),
      mayor_atraso AS (
        SELECT
          estado_actual,
          total
        FROM atrasos_por_estado
        ORDER BY total DESC, estado_actual ASC
        LIMIT 1
      )
      SELECT
        COALESCE((SELECT estado_actual FROM mayor_carga), 'Sin datos') AS area_mayor_carga,
        COALESCE((SELECT total FROM mayor_carga), 0) AS total_area_mayor_carga,
        COALESCE((SELECT estado_actual FROM mayor_atraso), 'Sin atrasos') AS area_mas_atrasada,
        COALESCE((SELECT total FROM mayor_atraso), 0) AS total_area_mas_atrasada
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener indicadores operativos:", error);
    res.status(500).json({
      mensaje: "Error al obtener indicadores operativos",
      error: error.message,
    });
  }
};

const obtenerPromedioReparacionDashboard = async (req, res) => {
  try {
    const result = await pool.query(`
      WITH entregas_con_tiempo AS (
        SELECT
          ot.id_orden,
          ot.fecha_creacion,
          ot.fecha_estimada_entrega,
          e.fecha_entrega,
          e.hora_entrega,
          CASE
            WHEN ot.fecha_estimada_entrega IS NULL THEN 'Sin fecha estimada'
            WHEN e.fecha_entrega <= ot.fecha_estimada_entrega THEN 'A tiempo'
            ELSE 'Con atraso'
          END AS estado_entrega,
          EXTRACT(
            EPOCH FROM (
              (e.fecha_entrega::timestamp + COALESCE(e.hora_entrega::time, '00:00:00'::time))
              - ot.fecha_creacion
            )
          ) / 86400.0 AS dias_reparacion
        FROM ordenes_trabajo ot
        INNER JOIN entregas e ON ot.id_orden = e.id_orden
        WHERE ot.fecha_creacion IS NOT NULL
          AND e.fecha_entrega IS NOT NULL
      )
      SELECT
        ROUND(COALESCE(AVG(dias_reparacion), 0)::numeric, 2) AS promedio_general_dias,
        ROUND(COALESCE(AVG(dias_reparacion) FILTER (WHERE estado_entrega = 'A tiempo'), 0)::numeric, 2) AS promedio_a_tiempo_dias,
        ROUND(COALESCE(AVG(dias_reparacion) FILTER (WHERE estado_entrega = 'Con atraso'), 0)::numeric, 2) AS promedio_con_atraso_dias,
        COUNT(*) AS total_ordenes_analizadas
      FROM entregas_con_tiempo
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener promedio de reparación:", error);
    res.status(500).json({
      mensaje: "Error al obtener promedio de reparación",
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
  obtenerEntregasSemanales,
  obtenerEntregasMensuales,
  obtenerResumenEntregasDashboard,
  obtenerEntregasMensualesControl,
  obtenerIndicadoresOperativosDashboard,
  obtenerPromedioReparacionDashboard,
};