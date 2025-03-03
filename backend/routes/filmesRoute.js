const express = require('express');
const router = express.Router();

const filmeController = require('../controllers/filmeController');
//const uploads = require('../middlewares/upload');


router.post('/criar', filmeController.criarFilme);
router.get('/listar', filmeController.listarFilmes);
router.put('/atualizar/:id', filmeController.atualizarFilme);
router.get('/get/:id', filmeController.getFilme);
router.put('/delete/:id', filmeController.deleteFilme);

module.exports = router;