const express = require("express");
const router = express.Router();
const { obtenerResumenDashboard, 
        obtenerEstadosDashboard,
        obtenerAtrasosDashboard,
        obtenerRepuestosDashboard,
        obtenerReprocesosDashboard,
} = require("../controllers/dashboardController");

router.get("/resumen", obtenerResumenDashboard);
router.get("/estados", obtenerEstadosDashboard);
router.get("/atrasos", obtenerAtrasosDashboard);
router.get("/repuestos", obtenerRepuestosDashboard);
router.get("/reprocesos", obtenerReprocesosDashboard);


module.exports = router;