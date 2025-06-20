const Notificacao = require("../models/Notificacoes");

// Listar notificações do utilizador
const listarNotificacoes = async (req, res) => {
  const { id_utilizador } = req.params;

  try {
    const notificacoes = await Notificacao.findAll({
      where: { id_utilizador, lida: false }, // só não lidas
      order: [['data_criacao', 'DESC']]
    });

    res.json({ success: true, notificacoes });
  } catch (error) {
    console.error("Erro ao listar notificações:", error);
    res.status(500).json({ success: false, mensagem: "Erro interno" });
  }
};

// Marcar notificação como lida
const marcarComoLida = async (req, res) => {
  const { id_notificacao } = req.params;

  try {
    const notificacao = await Notificacao.findByPk(id_notificacao);
    if (!notificacao) return res.status(404).json({ mensagem: "Notificação não encontrada" });

    notificacao.lida = true;
    await notificacao.save();

    res.json({ success: true, mensagem: "Notificação marcada como lida" });
  } catch (error) {
    console.error("Erro ao marcar notificação:", error);
    res.status(500).json({ success: false, mensagem: "Erro interno" });
  }
};

module.exports = { listarNotificacoes, marcarComoLida };
