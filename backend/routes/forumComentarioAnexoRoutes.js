const express = require('express');
const router = express.Router();
const upload = require('../firebase/upload');
const controller = require('../controllers/forumComentarioAnexoController');

router.post('/anexo', 
  upload.single('file'),
  controller.adicionarAnexoComentario
);

router.get('/:id_comentario/anexos', 
  controller.listarAnexosPorComentario
);

module.exports = router;