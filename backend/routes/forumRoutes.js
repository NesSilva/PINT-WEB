const express = require("express");
const router = express.Router();
const forumController = require('../controllers/forumController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Rotas do fórum
router.post("/publicacao/criar", 
    upload.fields([{ name: 'anexos', maxCount: 10 }]), 
    forumController.criarPublicacao
);router.get("/publicacoes", forumController.listarPublicacoes);
router.get("/publicacao/:id_publicacao", forumController.obterPublicacao);
router.post("/comentario/adicionar", forumController.adicionarComentario);
router.get("/comentarios/:id_publicacao", forumController.listarComentarios);
router.post("/anexo/adicionar", upload.single('arquivo'), forumController.adicionarAnexo);
router.post("/avaliacao/adicionar", forumController.avaliarPublicacao);
router.post("/denuncia/registrar", forumController.denunciarConteudo);

module.exports = router;