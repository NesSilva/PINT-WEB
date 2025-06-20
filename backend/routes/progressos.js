// routes/api/progressos.js
const express = require("express");
const router = express.Router();

const ProgressoCurso = require("../models/ProcessoCurso");


const Curso = require("../models/Curso");

// routes/progressos.js
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
module.exports = router;
