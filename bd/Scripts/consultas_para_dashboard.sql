--Ingresando datos de clientes
INSERT INTO clientes (nombres, apellidos, telefono, correo, direccion)
VALUES
('María', 'López', '55556789', 'maria@gmail.com', 'Zona 10, Ciudad de Guatemala'),
('Carlos', 'Ramírez', '55559876', 'carlos@gmail.com', 'Mixco, Guatemala'),
('Ana', 'Gómez', '55553421', 'ana@gmail.com', 'Villa Nueva, Guatemala');

--Ingresando datos de vehiculos
INSERT INTO vehiculos (
    id_cliente, placa, marca, modelo, anio, color, vin, tipo_combustible
) VALUES
(2, 'P456DEF', 'Honda', 'Civic', 2020, 'Gris', 'VIN002', 'Gasolina'),
(3, 'P789GHI', 'Mazda', '3', 2019, 'Rojo', 'VIN003', 'Gasolina'),
(4, 'P321JKL', 'Nissan', 'Sentra', 2021, 'Negro', 'VIN004', 'Gasolina');

--Ingresando Recpciones
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
) VALUES
(
    2,
    CURRENT_DATE - INTERVAL '4 days',
    CURRENT_TIME,
    62000,
    '1/4 de tanque',
    'Rayón y golpe en puerta trasera',
    'Daño visible en puerta trasera derecha',
    1,
    'Recibido',
    FALSE,
    NULL
),
(
    3,
    CURRENT_DATE - INTERVAL '6 days',
    CURRENT_TIME,
    71000,
    'Medio tanque',
    'Daño en bumper trasero',
    'Se observa deformación en bumper y luces',
    1,
    'Recibido',
    FALSE,
    NULL
),
(
    4,
    CURRENT_DATE - INTERVAL '2 days',
    CURRENT_TIME,
    40000,
    'Tanque lleno',
    'Pulido y pintura parcial',
    'Cliente solicita corrección estética del lateral izquierdo',
    1,
    'Recibido',
    FALSE,
    NULL
);


--Insertando ordenes de trabajo
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
) VALUES
(
    2,
    'OT-0002',
    'Reparación y pintura de puerta trasera derecha',
    'Técnico Luis',
    'Media',
    CURRENT_DATE + INTERVAL '3 days',
    FALSE,
    TRUE,
    NULL,
    'En pintura',
    1
),
(
    3,
    'OT-0003',
    'Cambio y ajuste de bumper trasero',
    'Técnico Mario',
    'Alta',
    CURRENT_DATE - INTERVAL '1 day',
    TRUE,
    FALSE,
    'Pendiente ingreso de soporte trasero',
    'En lavado',
    1
),
(
    4,
    'OT-0004',
    'Pulido general y pintura lateral izquierda',
    'Técnico Pedro',
    'Baja',
    CURRENT_DATE + INTERVAL '1 day',
    FALSE,
    TRUE,
    NULL,
    'Listo para entrega',
    1
);

--Insertando Seguimientos
INSERT INTO seguimiento_reparacion (
    id_orden,
    estado_proceso,
    fecha_inicio,
    fecha_fin,
    observaciones,
    actualizado_por,
    fecha_limite_etapa,
    motivo_atraso
) VALUES
(
    2,
    'En pintura',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    NULL,
    'Vehículo ingresó al área de pintura',
    1,
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    NULL
),
(
    3,
    'En lavado',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    NULL,
    'Vehículo pendiente de cierre final',
    1,
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    'Falta de repuestos'
),
(
    4,
    'Listo para entrega',
    CURRENT_TIMESTAMP - INTERVAL '5 hours',
    NULL,
    'Vehículo finalizado, pendiente coordinación con cliente',
    1,
    CURRENT_TIMESTAMP + INTERVAL '2 days',
    NULL
);

--Consultas
--Vehiculo por estado actual
SELECT estado_actual, COUNT(*) AS total_vehiculos
FROM ordenes_trabajo
GROUP BY estado_actual
ORDER BY total_vehiculos DESC;

--Ordenes con atraso
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

--Ordenes en reproceso
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

--Ordenes con problemas de repuesto
SELECT 
    ot.numero_orden,
    ot.tecnico_asignado,
    ot.estado_actual,
    ot.observacion_repuestos
FROM ordenes_trabajo ot
WHERE ot.requiere_repuestos = TRUE
  AND ot.repuestos_completos = FALSE;

--Tiempo transcurrido por orden
SELECT 
    ot.numero_orden,
    ot.estado_actual,
    rv.fecha_recepcion,
    CURRENT_DATE - rv.fecha_recepcion AS dias_en_proceso
FROM ordenes_trabajo ot
INNER JOIN recepcion_vehiculos rv ON ot.id_recepcion = rv.id_recepcion
ORDER BY dias_en_proceso DESC;

--Ordenes listas para entrega
SELECT 
    ot.numero_orden,
    v.placa,
    v.marca,
    v.modelo,
    c.nombres,
    c.apellidos
FROM ordenes_trabajo ot
INNER JOIN recepcion_vehiculos rv ON ot.id_recepcion = rv.id_recepcion
INNER JOIN vehiculos v ON rv.id_vehiculo = v.id_vehiculo
INNER JOIN clientes c ON v.id_cliente = c.id_cliente
WHERE ot.estado_actual = 'Listo para entrega';

--Resumen general del dashboard
SELECT
    (SELECT COUNT(*) FROM ordenes_trabajo) AS total_ordenes,
    (SELECT COUNT(*) FROM ordenes_trabajo WHERE estado_actual = 'Listo para entrega') AS listas_para_entrega,
    (SELECT COUNT(*) FROM recepcion_vehiculos WHERE es_reproceso = TRUE) AS total_reprocesos,
    (SELECT COUNT(*) FROM ordenes_trabajo WHERE requiere_repuestos = TRUE AND repuestos_completos = FALSE) AS pendientes_repuestos;