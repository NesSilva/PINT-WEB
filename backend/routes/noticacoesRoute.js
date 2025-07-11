const express = require('express');
const router = express.Router();
const { getNotificacoesPorUtilizador } = require('../controllers/notificaçõesController');
const Notificacao = require('../models/Notificacoes');

router.get('/:id_utilizador', getNotificacoesPorUtilizador);

router.patch('/:id_notificacao/lida', async (req, res) => {
  const { id_notificacao } = req.params;

  try {
    const notificacao = await Notificacao.findByPk(id_notificacao);
    if (!notificacao) {
      return res.status(404).json({ success: false, message: 'Notificação não encontrada.' });
    }
    notificacao.lida = true;
    await notificacao.save();

    res.status(200).json({ success: true, message: 'Notificação marcada como lida.' });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar notificação.' });
  }
});


module.exports = router;
