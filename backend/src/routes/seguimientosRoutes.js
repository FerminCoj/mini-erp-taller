const express = require("express");
const router = express.Router();
const {
  obtenerSeguimientos,
  crearSeguimiento,
} = require("../controllers/seguimientosController");

router.get("/", obtenerSeguimientos);
router.post("/", crearSeguimiento);

module.exports = router;