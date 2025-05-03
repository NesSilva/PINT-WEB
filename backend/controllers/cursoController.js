const Curso = require("../models/Curso");
const Utilizador = require("../models/Utilizador");

// cursoController.js (criarCurso)
const criarCurso = async (req, res) => {
  console.log("Corpo da requisição:", req.body);
  
  try {
    // Converta explicitamente os tipos
    const dadosCurso = {
      titulo: String(req.body.titulo),
      descricao: String(req.body.descricao),
      id_categoria: Number(req.body.id_categoria),
      id_area: Number(req.body.id_area),
      id_formador: Number(req.body.id_formador),
      data_inicio: new Date(req.body.data_inicio),
      data_fim: new Date(req.body.data_fim),
      vagas: Number(req.body.vagas),
      tipo: String(req.body.tipo)
    };

    console.log("Dados convertidos:", dadosCurso);

    const novoCurso = await Curso.create(dadosCurso);
    res.status(201).json({ 
      success: true, 
      message: "Curso criado com sucesso!", 
      curso: novoCurso 
    });
  } catch (error) {
    console.error("Erro detalhado:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erro ao criar curso",
      error: error.message 
    });
  }
};

const listarCursos = async (req, res) => {
  try {
    const cursos = await Curso.findAll();

    const cursosComFormador = await Promise.all(
      cursos.map(async (curso) => {
        const formador = await Utilizador.findOne({ where: { id_utilizador: curso.id_formador } });
        return {
          ...curso.toJSON(),
          nome_formador: formador ? formador.nome : "Formador não encontrado",
        };
      })
    );

    res.status(200).json(cursosComFormador);
  } catch (error) {
    console.error("Erro ao listar cursos:", error);
    res.status(500).json({ error: "Erro ao listar cursos" });
  }
};

const eliminarCurso = async (req, res) => {
  const { id_curso } = req.params;

  try {
    const curso = await Curso.findByPk(id_curso);

    if (!curso) {
      return res.status(404).json({ message: "Curso não encontrado!" });
    }

    await curso.destroy();

    return res.status(200).json({ message: "Curso eliminado com sucesso!" });
  } catch (error) {
    console.error("Erro ao eliminar curso:", error);
    return res.status(500).json({ message: "Erro ao eliminar curso." });
  }
};

const editarCurso = async (req, res) => {
  const { id_curso } = req.params;
  const {
    titulo,
    descricao,
    id_categoria,
    id_area,
    id_formador,
    data_inicio,
    data_fim,
    vagas,
    tipo,
  } = req.body;

  try {
    const curso = await Curso.findByPk(id_curso);

    if (!curso) {
      return res.status(404).json({ message: "Curso não encontrado!" });
    }

    await curso.update({
      titulo,
      descricao,
      id_categoria,
      id_area,
      id_formador,
      data_inicio,
      data_fim,
      vagas,
      tipo,
    });

    return res.status(200).json({ message: "Curso atualizado com sucesso!", curso });
  } catch (error) {
    console.error("Erro ao atualizar curso:", error);
    return res.status(500).json({ message: "Erro ao atualizar curso." });
  }
};

module.exports = { criarCurso, listarCursos, eliminarCurso, editarCurso };
