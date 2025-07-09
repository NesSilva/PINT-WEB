// routes/api/progressos.js
const express = require("express");
const router = express.Router();

const ProgressoCurso = require("../models/ProcessoCurso"); // Corrija o nome do arquivo/model aqui
const Curso = require("../models/Curso");

// GET progresso por utilizador
router.get("/utilizador/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const progresso = await ProgressoCurso.findAll({
      where: { id_utilizador: id },
    });

    res.json(progresso);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar progresso." });
  }
});

router.get("/curso/:id_curso", async (req, res) => {
  const { id_curso } = req.params;

  try {
    const inscritos = await Inscricao.findAll({
      where: { id_curso },
      include: [{
        model: Utilizador,
        attributes: ["id_utilizador", "nome", "email", "telefone", "morada"]
      }]
    });

    const progressos = await ProgressoCurso.findAll({
      where: {
        id_curso,
        nota_curso: { [Op.not]: null }
      }
    });

    const progressoMap = progressos.reduce((map, progresso) => {
      map[progresso.id_utilizador] = progresso;
      return map;
    }, {});

    const resultado = inscritos.map(inscricao => {
      const plainInscricao = inscricao.get({ plain: true });
      const progresso = progressoMap[plainInscricao.utilizador.id_utilizador] || null;
      return {
        ...plainInscricao,
        progresso
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error("Erro ao buscar inscritos do curso:", error);
    res.status(500).json({ mensagem: "Erro ao buscar inscritos do curso." });
  }
});

router.post("/", async (req, res) => {
  const { id_utilizador, id_curso, nota_curso } = req.body;

  if (!id_utilizador || !id_curso || nota_curso == null) {
    return res.status(400).json({ error: "Faltam dados obrigatórios." });
  }

  try {
    // Verifica se já existe registro para este utilizador e curso
    let progresso = await ProgressoCurso.findOne({
      where: { id_utilizador, id_curso }
    });

    if (progresso) {
      // Atualiza nota
      progresso.nota_curso = nota_curso;
      await progresso.save();
    } else {
      // Cria novo registro
      progresso = await ProgressoCurso.create({
        id_utilizador,
        id_curso,
        nota_curso
      });
    }

    return res.status(200).json(progresso);
  } catch (err) {
    console.error("Erro ao salvar avaliação:", err);
    return res.status(500).json({ error: "Erro ao salvar avaliação." });
  }
});

module.exports = router;
