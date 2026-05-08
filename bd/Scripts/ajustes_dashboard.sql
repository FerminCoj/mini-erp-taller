ALTER TABLE recepcion_vehiculos
ADD COLUMN es_reproceso BOOLEAN DEFAULT FALSE,
ADD COLUMN motivo_reproceso TEXT;

ALTER TABLE seguimiento_reparacion
ADD COLUMN fecha_limite_etapa TIMESTAMP,
ADD COLUMN motivo_atraso VARCHAR(100);

SELECT * FROM recepcion_vehiculos;

SELECT * FROM seguimiento_reparacion;

UPDATE recepcion_vehiculos
SET es_reproceso = TRUE,
    motivo_reproceso = 'El vehículo regresó por detalle pendiente en el área frontal'
WHERE id_recepcion = 1;

UPDATE seguimiento_reparacion
SET fecha_limite_etapa = CURRENT_TIMESTAMP + INTERVAL '2 days',
    motivo_atraso = 'Falta de repuestos'
WHERE id_seguimiento = 1;

-- Vehículo por estado actual
SELECT estado_actual, COUNT(*) AS total_vehiculos
FROM ordenes_trabajo
GROUP BY estado_actual
ORDER BY total_vehiculos DESC;

-- Ordenes con atraso
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
  AND CURRENT_TIMESTAMP > sr.fecha_limite_etapa;

-- Vehículos en proceso
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
WHERE rv.es_reproceso = TRUE;

--ordenes con problemas de repuesto
SELECT 
    ot.numero_orden,
    ot.tecnico_asignado,
    ot.estado_actual,
    ot.observacion_repuestos
FROM ordenes_trabajo ot
WHERE ot.requiere_repuestos = TRUE
  AND ot.repuestos_completos = FALSE;
