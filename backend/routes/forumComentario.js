const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const forumComentarioController = require('../controllers/forumComentarioController');

// Criar comentário (qualquer autenticado)
router.post('/criar', upload.single('imagem'), forumComentarioController.criarComentario);

// Listar comentários por tópico
router.get('/:id_topico', forumComentarioController.listarComentariosPorTopico);

// Denunciar comentário
router.post('/denunciar', forumComentarioController.denunciarComentario);

// Editar comentário (apenas autor ou admin)
router.put('/editar/:id_comentario', forumComentarioController.editarComentario);

// Remover comentário (apenas autor ou admin)
router.delete('/remover/:id_comentario', forumComentarioController.removerComentario);

// Curtir comentário
router.post('/:id_comentario/like', forumComentarioController.likeComentario);

// Descurtir comentário
router.post('/:id_comentario/unlike', forumComentarioController.unlikeComentario);

// Obter número de likes de um comentário
router.get('/:id_comentario/likes', forumComentarioController.getLikesCount);

module.exports = router;
