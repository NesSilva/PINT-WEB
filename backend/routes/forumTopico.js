const express = require('express');
const router = express.Router();
const upload = require('../firebase/upload');
const forumTopicoController = require('../controllers/forumTopicoController');
const { isGestor } = require('../middleware/auth');


const uploadFields = upload.fields([
  { name: 'imagem', maxCount: 1 },
  { name: 'anexos', maxCount: 5 } 
]);

router.post('/criar', upload.single('file'), forumTopicoController.criarTopico);
router.put('/editar/:id_topico', forumTopicoController.editarTopico);


router.delete('/remover/:id_topico', forumTopicoController.removerTopico);

router.get('/todos', forumTopicoController.listarTodosTopicos);
router.get('/todos/validos', forumTopicoController.listarTopicosValidos);

router.get('/categoria/:id_categoria', forumTopicoController.listarTopicosPorCategoria);

router.get('/:id_topico', forumTopicoController.getTopicoById);

router.post('/denunciar', forumTopicoController.denunciarTopico);

router.post('/avaliar', forumTopicoController.avaliarTopico);

// routes/forumTopico.js
router.patch('/:id_topico/validar', forumTopicoController.validarTopico);

module.exports = router;