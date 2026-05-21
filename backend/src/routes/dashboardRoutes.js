const express = require("express");
const router = express.Router();

const {
  obtenerResumenDashboard,
  obtenerEstadosDashboard,
  obtenerDetalleEstadosDashboard,
  obtenerAtrasosDashboard,
  obtenerRepuestosDashboard,
  obtenerReprocesosDashboard,
  obtenerEntregasSemanales,
  obtenerEntregasMensuales,
} = require("../controllers/dashboardController");

router.get("/resumen", obtenerResumenDashboard);
router.get("/estados", obtenerEstadosDashboard);
router.get("/detalle-estados", obtenerDetalleEstadosDashboard);
router.get("/atrasos", obtenerAtrasosDashboard);
router.get("/repuestos", obtenerRepuestosDashboard);
router.get("/reprocesos", obtenerReprocesosDashboard);
router.get("/entregas-semanales", obtenerEntregasSemanales);
router.get("/entregas-mensuales", obtenerEntregasMensuales);

module.exports = router;