const express = require("express");
const router = express.Router();
const { criarInscricao, listarInscricoes } = require("../controllers/inscricaoController");

router.post("/", criarInscricao);

// Removida a rota GET
// router.get("/usuario/:id_utilizador/curso/:id_curso", verificarInscricao);

router.get("/", listarInscricoes);


module.exports = router;
