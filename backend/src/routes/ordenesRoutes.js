const express = require("express");
const router = express.Router();
const { obtenerOrdenes } = require("../controllers/ordenesController");

router.get("/", obtenerOrdenes);

module.exports = router;