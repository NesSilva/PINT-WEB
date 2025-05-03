const express = require('express');
const router = express.Router();
const upload = require('../firebase/upload');
const conteudoCursoController = require('../controllers/conteudoCursoController');

// conteudoCursoRoutes.js
router.post('/adicionar', (req, res, next) => {
    console.log('Headers recebidos:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    next();
  }, upload.array('file',10), conteudoCursoController.adicionarConteudosMultiplos);
  

  module.exports = router;
