const Utilizador = require("../models/Utilizador");
const UtilizadorPerfil = require("../models/PerfilUtilizador");
const Perfil = require("../models/Perfil");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ success: false, message: "Email e palavra-passe são obrigatórios." });
    }

    const utilizador = await Utilizador.findOne({ where: { email } });

    if (!utilizador) {
      return res.status(404).json({ success: false, message: "Utilizador não encontrado." });
    }

    // Log da senha e hash
    console.log("🔑 Senha recebida:", senha);
    console.log("🔒 Hash armazenado no banco:", utilizador.senha);

    // Comparar senha enviada com hash armazenado
    const senhaCorreta = await bcrypt.compare(senha, utilizador.senha);

    console.log("✅ Senha confere?", senhaCorreta);

    if (!senhaCorreta) {
      return res.status(401).json({ success: false, message: "Palavra-passe incorreta." });
    }

    // Busca perfis associados
    const associacoes = await UtilizadorPerfil.findAll({
      where: { id_utilizador: utilizador.id_utilizador }
    });

    const perfilIds = associacoes.map((assoc) => assoc.id_perfil);

    let perfis = [];
    if (perfilIds.length > 0) {
      perfis = await Perfil.findAll({
        where: { id_perfil: perfilIds }
      });
    }

    const perfisFormatados = perfis.map((p) => ({
      id: p.id_perfil,
      nome: p.nome,
    }));

    res.status(200).json({
      success: true,
      message: "Login efetuado com sucesso.",
      user: {
        id: utilizador.id_utilizador,
        nome: utilizador.nome,
        email: utilizador.email,
        primeiroLogin: utilizador.primeiroLogin,
        perfis: perfisFormatados,
      },
    });
  } catch (error) {
    console.error(" Erro no login:", error);
    res.status(500).json({ success: false, message: "Erro no servidor." });
  }
};

module.exports = { login };
