const express = require("express");
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const upload = require('../firebase/upload'); // Adicione esta linha
const Curso = require('../models/Curso');  // certifique-se que está importado


// Criar curso
router.post("/criar", cursoController.criarCurso);
// Listar cursos
router.get('/', cursoController.listarCursos);
router.get('/todos', cursoController.listarTodosCursos);

// Eliminar curso
router.delete("/eliminar/:id_curso", cursoController.eliminarCurso);

// Editar curso
router.put("/editar/:id_curso", cursoController.editarCurso);

router.get('/categorias', cursoController.listarCategoriasParaCurso); // Nova rota


router.get('/:id_curso', async (req, res) => {
  try {
    const curso = await Curso.findByPk(req.params.id_curso);
    if (!curso) return res.status(404).json({ message: 'Curso não encontrado' });
    res.json(curso);
  } catch (error) {
    console.error("Erro ao buscar curso:", error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
