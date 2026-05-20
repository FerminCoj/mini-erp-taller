const express = require("express");
const router = express.Router();
const {
  obtenerOrdenes,
  crearOrden,
} = require("../controllers/ordenesController");

router.get("/", obtenerOrdenes);
router.post("/", crearOrden);

module.exports = router;