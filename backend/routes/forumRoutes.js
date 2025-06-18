const express = require("express");
const router = express.Router();
const forumController = require('../controllers/forumController');
const multer = require('multer');

// Configuração do Multer com limites ajustados
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB (ajuste conforme necessário)
    files: 5 // Número máximo de arquivos
  }
});

// Rotas do Fórum
router.post("/publicacao/criar", 
  upload.fields([{ 
    name: 'anexos', 
    maxCount: 5 
  }]), 
  forumController.criarPublicacao
);

router.get("/publicacoes", forumController.listarPublicacoes);

router.get("/publicacao/:id_publicacao", forumController.obterPublicacao);

router.post("/comentario/adicionar", forumController.adicionarComentario);

router.get("/comentarios/:id_publicacao", forumController.listarComentarios);

// Rota alternativa para adicionar anexos separadamente (opcional)
router.post("/anexo/adicionar", 
  upload.single('arquivo'), 
  forumController.adicionarAnexo
);

router.post("/avaliacao/adicionar", forumController.avaliarPublicacao);

router.post("/denuncia/registrar", forumController.denunciarConteudo);

module.exports = router;