const Notificacao = require('../models/Notificacoes');

const getNotificacoesPorUtilizador = async (req, res) => {
  const { id_utilizador } = req.params;

  try {
    const notificacoes = await Notificacao.findAll({
      where: { id_utilizador,
            lida: false  

       },
      order: [['data_criacao', 'DESC']]
    });

    res.status(200).json({
      success: true,
      notificacoes
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar notificações.'
    });
  }
};

module.exports = {
  getNotificacoesPorUtilizador
};
