const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const clientesRoutes = require("./routes/clientesRoutes");
const vehiculosRoutes = require("./routes/vehiculosRoutes");
const recepcionesRoutes = require("./routes/recepcionesRoutes");
const ordenesRoutes = require("./routes/ordenesRoutes");
const seguimientosRoutes = require("./routes/seguimientosRoutes");
const entregasRoutes = require("./routes/entregasRoutes");
const tecnicosRoutes = require("./routes/tecnicosRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    mensaje: "Backend del Mini ERP Taller funcionando correctamente",
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      mensaje: "Conexión a PostgreSQL exitosa",
      fecha_servidor: result.rows[0],
    });
  } catch (error) {
    console.error("Error al conectar con PostgreSQL:", error);
    res.status(500).json({
      mensaje: "Error al conectar con PostgreSQL",
      error: error.message,
    });
  }
});

app.use("/clientes", clientesRoutes);
app.use("/vehiculos", vehiculosRoutes);
app.use("/recepciones", recepcionesRoutes);
app.use("/ordenes", ordenesRoutes);
app.use("/seguimientos", seguimientosRoutes);
app.use("/entregas", entregasRoutes);
app.use("/tecnicos", tecnicosRoutes);
app.use("/dashboard", dashboardRoutes);

module.exports = app;