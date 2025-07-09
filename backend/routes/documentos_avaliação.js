const express = require('express');
const router = express.Router();
const upload = require('../firebase/upload');
const documentoAvaliacaoController = require('../controllers/documentoAvaliacaoController');

router.post('/upload', upload.single('file'), documentoAvaliacaoController.uploadDocumentoAvaliacao);

router.get('/curso/:id_curso', documentoAvaliacaoController.listarDocumentosCurso);

router.delete('/:id', documentoAvaliacaoController.deletarDocumento);

router.get('/utilizador/:id_utilizador', documentoAvaliacaoController.listarDocumentosUtilizador);

router.get('/utilizador/:id_utilizador/curso/:id_curso', documentoAvaliacaoController.listarDocumentosUtilizadorCurso);

module.exports = router;