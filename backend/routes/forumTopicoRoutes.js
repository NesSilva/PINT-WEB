const express = require('express');
const router = express.Router();
const upload = require('../firebase/upload');
const forumAnexoController = require('../controllers/forumAnexoController');

// Nova rota para anexos
router.post('/topico/anexo', 
  upload.single('file'),
  forumAnexoController.adicionarAnexo
);
router.get('/:id_topico/anexos', forumAnexoController.listarAnexosPorTopico);



module.exports = router;