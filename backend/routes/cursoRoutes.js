const express = require("express");
const router = express.Router();
const cursoController = require('../controllers/cursoController'); // ajusta o caminho se for diferente

router.post("/criar", cursoController.criarCurso);
router.get('/', cursoController.listarCursos);

module.exports = router;
