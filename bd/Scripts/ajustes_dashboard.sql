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
