const express = require("express");
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const cursoControllerFormador = require('../controllers/cursoControllerFormador');
const upload = require('../firebase/upload');

// Criar curso
router.post("/criar", cursoController.criarCurso);

// Listar todos os cursos (admin)
router.get('/', cursoController.listarCursos);

// Listar cursos do formador
router.get('/formador/:id', cursoControllerFormador.listarCursosPorFormador);

// Eliminar curso
router.delete("/eliminar/:id_curso", cursoController.eliminarCurso);

// Editar curso
router.put("/editar/:id_curso", cursoController.editarCurso);

// Categorias
router.get('/categorias', cursoController.listarCategoriasParaCurso);

module.exports = router;
