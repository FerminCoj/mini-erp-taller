CREATE DATABASE mini_erp_taller;

SELECT VERSION();

SELECT CURRENT_database();

--tabla de usuarios
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol VARCHAR(30) NOT NULL CHECK (
        rol IN ('Administrador', 'Asesor', 'Supervisor', 'Jefe de taller')
    ),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nombre, correo, password_hash, rol)
VALUES ('Carlos Admin', 'admin@taller.com', 'hash_prueba', 'Administrador');

SELECT * FROM usuarios;

--tabla de clientes

CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM clientes;

INSERT INTO clientes (nombres, apellidos, telefono, correo, direccion)
VALUES ('Juan', 'Pérez', '55551234', 'juan@gmail.com', 'Zona 1, Ciudad de Guatemala');

SELECT * FROM clientes;

--tabla vehiculos

CREATE TABLE vehiculos (
    id_vehiculo SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL,
    placa VARCHAR(20) UNIQUE NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    anio INT,
    color VARCHAR(30),
    vin VARCHAR(50),
    tipo_combustible VARCHAR(30),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehiculo_cliente
        FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
        ON DELETE CASCADE
);

SELECT * FROM vehiculos;

INSERT INTO vehiculos (
    id_cliente, placa, marca, modelo, anio, color, vin, tipo_combustible
) VALUES (
    1, 'P123ABC', 'Toyota', 'Corolla', 2018, 'Blanco', 'VIN001', 'Gasolina'
);

SELECT * FROM vehiculos;


-- tabla recpcion de vehiculos

CREATE TABLE recepcion_vehiculos (
    id_recepcion SERIAL PRIMARY KEY,
    id_vehiculo INT NOT NULL,
    fecha_recepcion DATE NOT NULL,
    hora_recepcion TIME NOT NULL,
    kilometraje INT,
    nivel_combustible VARCHAR(20),
    motivo_ingreso TEXT NOT NULL,
    observaciones_iniciales TEXT,
    recibido_por INT NOT NULL,
    estado_inicial VARCHAR(30) DEFAULT 'Recibido' CHECK (
        estado_inicial IN (
            'Recibido',
            'En enderezado',
            'En preparación',
            'En pintura',
            'En armado',
            'En lavado',
            'Listo para entrega',
            'Entregado'
        )
    ),
    CONSTRAINT fk_recepcion_vehiculo
        FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id_vehiculo)
        ON DELETE CASCADE,
    CONSTRAINT fk_recepcion_usuario
        FOREIGN KEY (recibido_por) REFERENCES usuarios(id_usuario)
);

SELECT * FROM recepcion_vehiculos;

INSERT INTO recepcion_vehiculos (
    id_vehiculo,
    fecha_recepcion,
    hora_recepcion,
    kilometraje,
    nivel_combustible,
    motivo_ingreso,
    observaciones_iniciales,
    recibido_por
) VALUES (
    1,
    CURRENT_DATE,
    CURRENT_TIME,
    85000,
    'Medio tanque',
    'Golpe frontal leve',
    'Vehículo con daño visible en bumper delantero',
    1
);

SELECT * FROM recepcion_vehiculos;


--tabla orden de trabajo

CREATE TABLE ordenes_trabajo (
    id_orden SERIAL PRIMARY KEY,
    id_recepcion INT NOT NULL,
    numero_orden VARCHAR(30) UNIQUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion_trabajo TEXT NOT NULL,
    tecnico_asignado VARCHAR(100),
    prioridad VARCHAR(20) DEFAULT 'Media' CHECK (
        prioridad IN ('Baja', 'Media', 'Alta')
    ),
    fecha_estimada_entrega DATE,
    requiere_repuestos BOOLEAN DEFAULT FALSE,
    repuestos_completos BOOLEAN DEFAULT FALSE,
    observacion_repuestos TEXT,
    estado_actual VARCHAR(30) DEFAULT 'Recibido' CHECK (
        estado_actual IN (
            'Recibido',
            'En enderezado',
            'En preparación',
            'En pintura',
            'En armado',
            'En lavado',
            'Listo para entrega',
            'Entregado'
        )
    ),
    creado_por INT NOT NULL,
    CONSTRAINT fk_orden_recepcion
        FOREIGN KEY (id_recepcion) REFERENCES recepcion_vehiculos(id_recepcion)
        ON DELETE CASCADE,
    CONSTRAINT fk_orden_usuario
        FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario)
);

SELECT * FROM ordenes_trabajo;

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
) VALUES (
    1,
    'OT-0001',
    'Reparación de bumper delantero y proceso de pintura',
    'Técnico José',
    'Alta',
    CURRENT_DATE + INTERVAL '7 days',
    TRUE,
    FALSE,
    'Pendiente ingreso de grapas y soporte lateral',
    'En enderezado',
    1
);

SELECT * FROM ordenes_trabajo;

--tabla seguimiento reparación

CREATE TABLE seguimiento_reparacion (
    id_seguimiento SERIAL PRIMARY KEY,
    id_orden INT NOT NULL,
    estado_proceso VARCHAR(30) NOT NULL CHECK (
        estado_proceso IN (
            'Recibido',
            'En enderezado',
            'En preparación',
            'En pintura',
            'En armado',
            'En lavado',
            'Listo para entrega',
            'Entregado'
        )
    ),
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP,
    observaciones TEXT,
    actualizado_por INT NOT NULL,
    CONSTRAINT fk_seguimiento_orden
        FOREIGN KEY (id_orden) REFERENCES ordenes_trabajo(id_orden)
        ON DELETE CASCADE,
    CONSTRAINT fk_seguimiento_usuario
        FOREIGN KEY (actualizado_por) REFERENCES usuarios(id_usuario)
);

SELECT * FROM seguimiento_reparacion;

INSERT INTO seguimiento_reparacion (
    id_orden,
    estado_proceso,
    fecha_inicio,
    fecha_fin,
    observaciones,
    actualizado_por
) VALUES (
    1,
    'En enderezado',
    CURRENT_TIMESTAMP,
    NULL,
    'Se inició el trabajo de corrección frontal',
    1
);

SELECT * FROM seguimiento_reparacion;

--tabla entregas

CREATE TABLE entregas (
    id_entrega SERIAL PRIMARY KEY,
    id_orden INT NOT NULL UNIQUE,
    fecha_entrega DATE NOT NULL,
    hora_entrega TIME NOT NULL,
    entregado_por INT NOT NULL,
    recibido_por_cliente VARCHAR(150) NOT NULL,
    observaciones_entrega TEXT,
    conformidad_cliente BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_entrega_orden
        FOREIGN KEY (id_orden) REFERENCES ordenes_trabajo(id_orden)
        ON DELETE CASCADE,
    CONSTRAINT fk_entrega_usuario
        FOREIGN KEY (entregado_por) REFERENCES usuarios(id_usuario)
);

SELECT * FROM entregas;

INSERT INTO entregas (
    id_orden,
    fecha_entrega,
    hora_entrega,
    entregado_por,
    recibido_por_cliente,
    observaciones_entrega,
    conformidad_cliente
) VALUES (
    1,
    CURRENT_DATE,
    CURRENT_TIME,
    1,
    'Juan Pérez',
    'Vehículo entregado en buen estado y con explicación del trabajo realizado',
    TRUE
);

SELECT * FROM entregas;