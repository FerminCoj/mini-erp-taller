const express = require("express");
const router = express.Router();
const {
  obtenerRecepciones,
  crearRecepcion,
} = require("../controllers/recepcionesController");

router.get("/", obtenerRecepciones);
router.post("/", crearRecepcion);

module.exports = router;