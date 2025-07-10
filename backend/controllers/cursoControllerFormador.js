const { Op } = require("sequelize");
const Curso = require("../models/Curso");
const ProgressoCurso = require("../models/ProcessoCurso");
const { atualizarEstadoCurso } = require("./cursoController");

const listarCursosPorFormador = async (req, res) => {
  console.log("Rota para listar cursos do formador chamada----------------------");
  try {
    const { id } = req.params;
    console.log("ID do formador recebido na rota:", id);
    
    // Busca os cursos do formador
    const cursos = await Curso.findAll({ 
      where: { id_formador: id },
      attributes: ['id_curso', 'titulo', 'estado', 'descricao', 'data_inicio', 'data_fim']
    });

    if (!cursos || cursos.length === 0) {
      return res.status(200).json([]);
    }

    // Para cada curso, busca a média das notas
    const cursosComEstatisticas = await Promise.all(
      cursos.map(async (curso) => {
        await atualizarEstadoCurso(curso);
        
        // Calcula a média das notas para este curso
        const progressos = await ProgressoCurso.findAll({ 
          where: { 
            id_curso: curso.id_curso,
            nota_curso: { [Op.gt]: 0 } // Notas maiores que 0
          }
        });
        
        console.log(`Progressos encontrados para o curso ${curso.titulo}:-----------`, progressos.length);
        
        // Filtra e converte as notas válidas
        const notasValidas = progressos
          .map(p => parseFloat(p.nota_curso))
          .filter(nota => !isNaN(nota) && nota > 0);
        
        console.log(`Notas válidas para o curso ${curso.titulo}:`, notasValidas);
        
        const mediaNotas = notasValidas.length > 0 
          ? notasValidas.reduce((sum, nota) => sum + nota, 0) / notasValidas.length
          : null;
        
        console.log(`Média de notas para o curso ${curso.titulo}:------------------`, mediaNotas);
        
        return {
          ...curso.get({ plain: true }),
          mediaNotas: mediaNotas !== null ? Number(mediaNotas.toFixed(2)) : null
        };
      })
    );

    res.status(200).json(cursosComEstatisticas);
  } catch (error) {
    console.error("Erro ao listar cursos do formador:", error);
    res.status(500).json({ 
      error: "Erro ao listar cursos do formador",
      details: error.message 
    });
  }
};

module.exports = { listarCursosPorFormador };