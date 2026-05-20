const express = require("express");
const router = express.Router();
const {
  obtenerEntregas,
  crearEntrega,
} = require("../controllers/entregasController");

router.get("/", obtenerEntregas);
router.post("/", crearEntrega);

module.exports = router;