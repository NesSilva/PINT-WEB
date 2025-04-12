// controllers/dashboardController.js
const Curso = require("../models/Curso");
const Utilizador = require("../models/Utilizador"); 
const Perfil = require("../models/Perfil"); 
const UtilizadorPerfil = require("../models/PerfilUtilizador"); 
const sequelize = require('../models/basededados'); 




const getAdminDashboard = async (req, res) => {
  try {
    const count = await Curso.count();
    return res.status(200).json({
      success: true,
      totalCursos: count
    });
  } catch (err) {
    console.error("Erro ao buscar cursos:", err);
    return res.status(500).json({
      success: false,
      message: "Erro ao carregar dashboard"
    });
  }
};



const getNumFormandos = async (req, res) => {
  try {
    const formandos = await UtilizadorPerfil.findAndCountAll({
      where: { id_perfil: 1 },
    });

    return res.status(200).json({
      success: true,
      totalFormandos: formandos.count, 
    });
  } catch (err) {
    console.error("Erro ao buscar formandos:", err);
    return res.status(500).json({
      success: false,
      message: "Erro ao carregar número de formandos",
    });
  }
};

const getCursosPorMes = async (req, res) => {
    try {
      const cursosPorMes = await Curso.findAll({
        attributes: [
          [sequelize.fn('date_trunc', 'month', sequelize.col('data_inicio')), 'mes'],
          [sequelize.fn('count', sequelize.col('id_curso')), 'numero_cursos']
        ],
        group: ['mes'],
        order: [['mes', 'ASC']],
        raw: true
      });
  
      console.log('Verificação manual:');
      const cursos = await Curso.findAll({ raw: true });
      cursos.forEach(curso => {
        console.log(`Curso ${curso.id_curso} - Início: ${curso.data_inicio}`);
      });
  
      return res.status(200).json({
        success: true,
        data: cursosPorMes.map(item => ({
          mes: item.mes,
          numero_cursos: parseInt(item.numero_cursos)
        }))
      });
    } catch (err) {
      console.error("Erro detalhado:", err);
      return res.status(500).json({
        success: false,
        message: "Erro ao carregar cursos por mês"
      });
    }
  };
module.exports = { getAdminDashboard , getNumFormandos, getCursosPorMes};


