const express = require('express');
const router = express.Router();
const upload = require('../firebase/upload');
const conteudoCursoController = require('../controllers/conteudoCursoController');
const ConteudoCurso = require('../models/ConteudoCurso');

// conteudoCursoRoutes.js
router.post('/adicionar', (req, res, next) => {
    console.log('Headers recebidos:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    next();
  }, upload.array('file',10), conteudoCursoController.adicionarConteudosMultiplos);

  router.get("/:id_curso/conteudos", async (req, res) => {
  try {
    const conteudos = await ConteudoCurso.findAll({
      where: { id_curso: req.params.id_curso }
    });
    res.json(conteudos);
  } catch (error) {
    console.error("Erro ao buscar conteúdos:", error);
    res.status(500).json({ error: "Erro ao buscar conteúdos" });
  }
});

router.get('/curso/:id_curso', async (req, res) => {
  try {
    const conteudos = await ConteudoCurso.findAll({ where: { id_curso: req.params.id_curso } });
    res.json(conteudos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
  module.exports = router;
