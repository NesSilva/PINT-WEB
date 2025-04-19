const Perfil = require("../models/Perfil");

// Função para listar todos os perfis
const listarPerfis = async (req, res) => {
  try {
    const perfis = await Perfil.findAll({ attributes: ["id_perfil", "nome"], raw: true });
    res.json(perfis);
  } catch (error) {
    console.error("Erro ao listar perfis:", error);
    res.status(500).json({ erro: "Erro ao buscar perfis." });
  }
};

module.exports = { listarPerfis };
