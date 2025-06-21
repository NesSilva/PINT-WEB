const express = require("express");
const router = express.Router();
const { criarInscricao, listarInscricoes } = require("../controllers/inscricaoController");
const Inscricao = require("../models/Inscricoes");
const Curso = require("../models/Curso"); // necessário para o include

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

module.exports = router;
