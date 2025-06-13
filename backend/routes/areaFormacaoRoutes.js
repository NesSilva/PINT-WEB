const express = require('express');
const router = express.Router();
const areaFormacaoController = require('../controllers/areaFormacaoController');

router.post('/areas-formacao', areaFormacaoController.criarAreaFormacao);
router.get('/areas-formacao', areaFormacaoController.listarAreasFormacao);
router.get('/areas-formacao/:id', areaFormacaoController.obterAreaFormacao);
router.put('/areas-formacao/:id', areaFormacaoController.atualizarAreaFormacao);
router.delete('/areas-formacao/:id', areaFormacaoController.deletarAreaFormacao);

module.exports = router;