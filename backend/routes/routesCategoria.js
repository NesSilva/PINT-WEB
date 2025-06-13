const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

router.post('/categorias', categoriaController.criarCategoria);
router.get('/categorias', categoriaController.listarCategorias);
router.get('/categorias/:id', categoriaController.obterCategoria);
router.put('/categorias/:id', categoriaController.atualizarCategoria);
router.delete('/categorias/:id', categoriaController.deletarCategoria);

module.exports = router;