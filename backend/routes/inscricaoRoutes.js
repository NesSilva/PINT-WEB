const express = require("express");
const router = express.Router();
const { criarInscricao, listarInscricoes } = require("../controllers/inscricaoController");
const Inscricao = require("../models/Inscricoes");
const Curso = require("../models/Curso"); // necessário para o include
const Utilizador = require("../models/Utilizador");
const ProgressoCurso = require("../models/ProcessoCurso"); // Corrija o nome do arquivo/model aqui
router.post("/", criarInscricao);

// Rota para listar todas as inscrições (admin, talvez?)
router.get("/", listarInscricoes);

// ✅ ROTA IMPORTANTE: buscar cursos por utilizador
router.get("/:id_utilizador", async (req, res) => {
  const { id_utilizador } = req.params;

  try {
    const inscricoes = await Inscricao.findAll({
      where: { id_utilizador },
    });

    res.json({ success: true, inscricoes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao buscar inscrições." });
  }
});


router.get("/curso/:id_curso", async (req, res) => {
  const { id_curso } = req.params;

  try {
    const inscricoes = await Inscricao.findAll({
      where: { id_curso },
      attributes: ["id_inscricao", "id_utilizador", "status"]
    });

    const idsUtilizadores = inscricoes.map(i => i.id_utilizador);
    
    const utilizadores = await Utilizador.findAll({
      where: { id_utilizador: idsUtilizadores },
      attributes: ["id_utilizador", "nome", "email", "telefone", "morada"]
    });
   const progressos = await ProgressoCurso.findAll({
      where: { id_curso: id_curso },
      attributes: ["id_progresso", "percentual_completo", "nota_curso", "id_utilizador"]
    });


    const inscritosComDados = inscricoes.map(inscricao => {
      const utilizador = utilizadores.find(u => u.id_utilizador === inscricao.id_utilizador);
      const progresso =progressos.find(p => p.id_utilizador === inscricao.id_utilizador);
      
      return {
        id_inscricao: inscricao.id_inscricao,
        status: inscricao.status,
        utilizador: utilizador || null,
        progresso: progresso || null
      };
    });

    res.json(inscritosComDados);
  } catch (error) {
    console.error("Erro ao buscar inscritos do curso:", error);
    res.status(500).json({ mensagem: "Erro ao buscar inscritos do curso." });
  }
});


module.exports = router;
