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
  obtenerResumenEntregasDashboard,
  obtenerEntregasMensualesControl,
  obtenerIndicadoresOperativosDashboard,
  obtenerPromedioReparacionDashboard,
  obtenerCargaTecnicosDashboard,
  obtenerAlertasOperativasDashboard,
} = require("../controllers/dashboardController");

router.get("/resumen", obtenerResumenDashboard);
router.get("/estados", obtenerEstadosDashboard);
router.get("/detalle-estados", obtenerDetalleEstadosDashboard);
router.get("/atrasos", obtenerAtrasosDashboard);
router.get("/repuestos", obtenerRepuestosDashboard);
router.get("/reprocesos", obtenerReprocesosDashboard);
router.get("/entregas-semanales", obtenerEntregasSemanales);
router.get("/entregas-mensuales", obtenerEntregasMensuales);
router.get("/resumen-entregas", obtenerResumenEntregasDashboard);
router.get("/entregas-mensuales-control", obtenerEntregasMensualesControl);
router.get("/indicadores-operativos", obtenerIndicadoresOperativosDashboard);
router.get("/promedio-reparacion", obtenerPromedioReparacionDashboard);
router.get("/carga-tecnicos", obtenerCargaTecnicosDashboard);
router.get("/alertas-operativas", obtenerAlertasOperativasDashboard);

module.exports = router;