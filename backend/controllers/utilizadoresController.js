const Utilizador = require("../models/Utilizador");
const UtilizadorPerfil = require("../models/PerfilUtilizador"); // Importa o modelo UtilizadorPerfil
const Perfil = require("../models/Perfil"); // Importa o modelo Perfil

// Função para listar todos os utilizadores
const listarUtilizadores = async (req, res) => {
  try {
    // Buscar todos os utilizadores
    const utilizadores = await Utilizador.findAll({ raw: true });

    // Buscar os perfis associados a cada utilizador
    const perfisAssociados = await UtilizadorPerfil.findAll({
      attributes: ['id_utilizador', 'id_perfil'],  // Seleciona os ids de utilizador e perfil
      raw: true,
    });

    // Adicionar os nomes dos perfis aos utilizadores
    const utilizadoresComPerfis = await Promise.all(utilizadores.map(async (utilizador) => {
      // Filtra os perfis associados ao utilizador
      const perfisIds = perfisAssociados
        .filter(item => item.id_utilizador === utilizador.id_utilizador)
        .map(item => item.id_perfil); // Extrai os id_perfil

      // Busca os nomes dos perfis com base nos ids
      const perfisNomes = await Promise.all(perfisIds.map(async (id) => {
        const perfil = await Perfil.findOne({ 
          attributes: ['nome'], 
          where: { id_perfil: id }
        });
        return perfil ? perfil.nome : null; // Retorna o nome do perfil ou null se não encontrado
      }));

      return {
        ...utilizador,
        perfis: perfisNomes.filter(nome => nome !== null).join(', ') || 'Sem perfil', // Junta os nomes ou retorna 'Sem perfil'
      };
    }));

    // Retorna os utilizadores com os nomes dos perfis associados
    res.json(utilizadoresComPerfis);
  } catch (error) {
    console.error("Erro ao listar utilizadores:", error);
    res.status(500).json({ erro: "Erro ao buscar utilizadores." });
  }
};

// Função para eliminar um utilizador
const eliminarUtilizador = async (req, res) => {
  const { id_utilizador } = req.params; // O id do utilizador a ser eliminado

  try {
    // Remover as associações de perfil do utilizador
    await UtilizadorPerfil.destroy({
      where: { id_utilizador }
    });

    // Remover o utilizador
    await Utilizador.destroy({
      where: { id_utilizador }
    });

    res.status(200).json({ message: "Utilizador e perfis associados removidos com sucesso." });
  } catch (error) {
    console.error("Erro ao eliminar utilizador:", error);
    res.status(500).json({ erro: "Erro ao eliminar utilizador." });
  }
};

// Função para editar um utilizador
const editarUtilizador = async (req, res) => {
  const { id_utilizador } = req.params;
  const { nome, email, morada, perfis } = req.body;

  try {
    const utilizadorAtualizado = await Utilizador.update(
      { nome, email, morada },
      { where: { id_utilizador } }
    );

    if (utilizadorAtualizado[0] === 0) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }

    await UtilizadorPerfil.destroy({ where: { id_utilizador } });

    for (const nomePerfil of perfis) {
      const perfil = await Perfil.findOne({ where: { nome: nomePerfil } });
      if (perfil) {
        await UtilizadorPerfil.create({
          id_utilizador,
          id_perfil: perfil.id_perfil
        });
      }
    }

    res.status(200).json({ message: "Utilizador e perfis atualizados com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar utilizador:", error);
    res.status(500).json({ erro: "Erro ao atualizar utilizador." });
  }
};

const criarUtilizador = async (req, res) => {
    try {
      const { nome, email, morada, senha, perfis } = req.body;
  
      if (!nome || !email || !morada || !senha) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios, incluindo a senha." });
      }
  
      const bcrypt = require("bcrypt");
      const saltRounds = 10;
      const senhaEncriptada = await bcrypt.hash(senha, saltRounds);
  
      const novoUtilizador = await Utilizador.create({
        nome,
        email,
        morada,
        senha: senhaEncriptada
      });
  
      if (Array.isArray(perfis)) {
        for (const nomePerfil of perfis) {
          const perfil = await Perfil.findOne({ where: { nome: nomePerfil } });
          if (perfil) {
            await UtilizadorPerfil.create({
              id_utilizador: novoUtilizador.id_utilizador,
              id_perfil: perfil.id_perfil
            });
          }
        }
      }
  
      return res.status(200).json({ message: "Utilizador criado com sucesso!" });
    } catch (error) {
      console.error("Erro ao criar utilizador:", error);
      return res.status(500).json({ message: "Erro ao criar utilizador." });
    }
  };
  
module.exports = { listarUtilizadores, eliminarUtilizador, editarUtilizador , criarUtilizador};
