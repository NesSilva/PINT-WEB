const Curso = require("../models/Curso");
const Utilizador = require("../models/Utilizador");
const { atualizarEstadoCurso } = require("./cursoController");

const listarCursosPorFormador = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("ID do formador recebido na rota:", id);
    // Busca só os cursos do formador autenticado
    const cursos = await Curso.findAll({ where: { id_formador: id } });

    // Inclui o nome do formador e estado atualizado
    const cursosComFormador = await Promise.all(
      cursos.map(async (curso) => {
        await atualizarEstadoCurso(curso);
        const formador = await Utilizador.findOne({ where: { id_utilizador: curso.id_formador } });
        return {
          ...curso.toJSON(),
          nome_formador: formador ? formador.nome : "Formador não associado",
          estado: curso.estado
        };
      })
    );

    res.status(200).json(cursosComFormador);
  } catch (error) {
    console.error("Erro ao listar cursos do formador:", error);
    res.status(500).json({ error: "Erro ao listar cursos do formador" });
  }
};

module.exports = { listarCursosPorFormador };
