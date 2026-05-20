const express = require("express");
const router = express.Router();
const { obtenerTecnicos } = require("../controllers/tecnicosController");

router.get("/", obtenerTecnicos);

module.exports = router;