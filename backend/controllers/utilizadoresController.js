const Utilizador = require("../models/Utilizador");
const UtilizadorPerfil = require("../models/PerfilUtilizador"); // Importa o modelo UtilizadorPerfil
const Perfil = require("../models/Perfil"); // Importa o modelo Perfil

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

  module.exports = { listarUtilizadores , eliminarUtilizador };
