const express = require("express");
const router = express.Router();
const perfilController = require("../controllers/perfilController");

// Rota para obter todos os perfis
router.get("/", perfilController.listarPerfis);

module.exports = router;
