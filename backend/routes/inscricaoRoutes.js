const express = require("express");
const router = express.Router();
const { criarInscricao } = require("../controllers/inscricaoController");

router.post("/", criarInscricao);

// Removida a rota GET
// router.get("/usuario/:id_utilizador/curso/:id_curso", verificarInscricao);

module.exports = router;
