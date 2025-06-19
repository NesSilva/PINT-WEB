const Inscricao = require("../models/Inscricoes");

const criarInscricao = async (req, res) => {
  try {
    const { id_utilizador, id_curso } = req.body;

    if (!id_utilizador || !id_curso) {
      return res.status(400).json({ mensagem: "Dados incompletos." });
    }

    // Verifica se já existe inscrição para o usuário e curso
    const inscricaoExistente = await Inscricao.findOne({
      where: { id_utilizador, id_curso }
    });

    if (inscricaoExistente) {
      // Se já existe, retorna erro 409 (conflito)
      return res.status(409).json({ mensagem: "Usuário já está inscrito neste curso." });
    }

    // Se não existe, cria nova inscrição
    const novaInscricao = await Inscricao.create({
      id_utilizador,
      id_curso,
      data_inscricao: new Date(),
      status: "pendente"
    });

    return res.status(201).json(novaInscricao);
  } catch (error) {
    console.error("Erro ao criar inscrição:", error);
    return res.status(500).json({ mensagem: "Erro interno." });
  }
};

module.exports = { criarInscricao };
