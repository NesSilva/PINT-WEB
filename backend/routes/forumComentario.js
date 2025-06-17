// routes/forumComentario.js

const express = require("express");
const router = express.Router();
const forumComentarioController = require('../controllers/forumComentarioController');

// Criar comentário
router.post("/criar", forumComentarioController.criarComentario);

// Listar comentários por curso
router.get("/:id_curso", forumComentarioController.listarComentariosPorCurso);

module.exports = router;
