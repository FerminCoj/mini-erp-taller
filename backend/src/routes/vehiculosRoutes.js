const express = require("express");
const router = express.Router();
const { obtenerVehiculos } = require("../controllers/vehiculosController");

router.get("/", obtenerVehiculos);

module.exports = router;