// controllers/forumComentarioController.js

const ForumComentario = require('../models/ForumComentario');
const Utilizador = require('../models/Utilizador');

// Criar comentário
const criarComentario = async (req, res) => {
  try {
    const { id_curso, conteudo } = req.body;
    const id_autor = req.user.id_utilizador; // ou pega do req.body, dependendo da auth

    const novoComentario = await ForumComentario.create({
      id_curso,
      id_autor,
      conteudo,
    });

    res.status(201).json({ success: true, comentario: novoComentario });
  } catch (error) {
    console.error("Erro ao criar comentário:", error);
    res.status(500).json({ success: false, message: "Erro ao criar comentário" });
  }
};

// Listar comentários de um curso
const listarComentariosPorCurso = async (req, res) => {
  try {
    const { id_curso } = req.params;
    const comentarios = await ForumComentario.findAll({
      where: { id_curso },
      include: [{ model: Utilizador, attributes: ['nome'] }],
      order: [['data_comentario', 'ASC']]
    });

    res.json({ success: true, comentarios });
  } catch (error) {
    console.error("Erro ao listar comentários:", error);
    res.status(500).json({ success: false, message: "Erro ao listar comentários" });
  }
};

module.exports = { criarComentario, listarComentariosPorCurso };
