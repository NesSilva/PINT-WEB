const express = require("express");
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const upload = require('../firebase/upload'); // Adicione esta linha
const Curso = require('../models/Curso');  // certifique-se que está importado
const cursoControllerFormador = require('../controllers/cursoControllerFormador');


// Criar curso
router.post("/criar", cursoController.criarCurso);

// Listar todos os cursos (admin)
router.get('/', cursoController.listarCursos);
router.get('/todos', cursoController.listarTodosCursos);

// Listar cursos do formador
router.get('/formador/:id', cursoControllerFormador.listarCursosPorFormador);

// Eliminar curso
router.delete("/eliminar/:id_curso", cursoController.eliminarCurso);

// Editar curso
router.put("/editar/:id_curso", cursoController.editarCurso);

// Categorias
router.get('/categorias', cursoController.listarCategoriasParaCurso);

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
