const express = require("express");
const router = express.Router();
const {
  obtenerVehiculos,
  crearVehiculo,
} = require("../controllers/vehiculosController");

router.get("/", obtenerVehiculos);
router.post("/", crearVehiculo);

module.exports = router;