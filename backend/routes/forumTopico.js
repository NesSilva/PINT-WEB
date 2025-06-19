const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const forumTopicoController = require('../controllers/forumTopicoController');
const { isGestor } = require('../middleware/auth');

// Criar tópico (só gestor)
router.post('/criar', isGestor, upload.single('imagem'), forumTopicoController.criarTopico);

// Editar tópico (só autor ou admin)
router.put('/editar/:id_topico', forumTopicoController.editarTopico);

// Remover tópico (só autor ou admin)
router.delete('/remover/:id_topico', forumTopicoController.removerTopico);

// Listar todos os tópicos do fórum
router.get('/todos', forumTopicoController.listarTodosTopicos);

// Listar tópicos por categoria
router.get('/categoria/:id_categoria', forumTopicoController.listarTopicosPorCategoria);

// Buscar tópico por ID
router.get('/:id_topico', forumTopicoController.getTopicoById);

// Denunciar tópico
router.post('/denunciar', forumTopicoController.denunciarTopico);

// Avaliar tópico
router.post('/avaliar', forumTopicoController.avaliarTopico);

module.exports = router;
