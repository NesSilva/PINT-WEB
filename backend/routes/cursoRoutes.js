const express = require("express");
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const upload = require('../firebase/upload'); // Adicione esta linha

// Criar curso
router.post("/criar", cursoController.criarCurso);
// Listar cursos
router.get('/', cursoController.listarCursos);

// Eliminar curso
router.delete("/eliminar/:id_curso", cursoController.eliminarCurso);

// Editar curso
router.put("/editar/:id_curso", cursoController.editarCurso);

module.exports = router;
