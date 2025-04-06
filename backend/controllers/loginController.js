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

    // Buscar o utilizador pelo email (incluindo a senha)
    const utilizador = await Utilizador.findOne({ where: { email } });

    if (!utilizador) {
      return res.status(404).json({ success: false, message: "Utilizador não encontrado." });
    }

    // Comparar a senha informada com o hash na BD (ajustando se necessário)
    const senhaCorreta = await bcrypt.compare(senha, utilizador.senha.replace("$2y$", "$2b$"));

    if (!senhaCorreta) {
      return res.status(401).json({ success: false, message: "Palavra-passe incorreta." });
    }

    // Agora, com o id_utilizador, buscar as associações na tabela UtilizadorPerfil
    const associacoes = await UtilizadorPerfil.findAll({
      where: { id_utilizador: utilizador.id_utilizador }
    });

    // Extrair os ids dos perfis associados
    const perfilIds = associacoes.map((assoc) => assoc.id_perfil);

    // Se houver perfis associados, busca os detalhes na tabela Perfil
    let perfis = [];
    if (perfilIds.length > 0) {
      perfis = await Perfil.findAll({
        where: { id_perfil: perfilIds }
      });
    }

    // Preparar a resposta com os perfis (apenas id e nome, por exemplo)
    const perfisFormatados = perfis.map((p) => ({
      id: p.id_perfil,
      nome: p.nome,
    }));

    // Resposta final
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
    console.error("Erro no login:", error);
    res.status(500).json({ success: false, message: "Erro no servidor." });
  }
};

module.exports = { login };
