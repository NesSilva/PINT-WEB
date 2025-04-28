const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const conteudoCursoController = require('../controllers/conteudoCursoController');

router.post('/adicionar', upload.single('ficheiro'), conteudoCursoController.adicionarConteudo);

module.exports = router;
