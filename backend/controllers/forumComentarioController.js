const ForumComentario = require('../models/ForumComentario');
const Utilizador = require('../models/Utilizador');
const ForumDenuncia = require('../models/ForumDenuncia');
const ForumComentarioLike = require('../models/ForumComentarioLike');

// Criar comentário (com imagem)
const criarComentario = async (req, res) => {
  try {
    const { id_topico, conteudo } = req.body;
    const id_utilizador = req.user?.id_utilizador || req.body.id_utilizador;
    const imagem_url = req.file ? '/uploads/forum/' + req.file.filename : null;

    const comentario = await ForumComentario.create({
      id_topico,
      conteudo,
      imagem_url,
      id_utilizador
    });
    res.status(201).json({ success: true, comentario });
  } catch (error) {
    console.error("ERRO AO CRIAR COMENTÁRIO:", error);
    res.status(500).json({ success: false, message: "Erro ao criar comentário", error: error.message });
  }
};

// Listar comentários de um tópico
const listarComentariosPorTopico = async (req, res) => {
  try {
    const { id_topico } = req.params;
    const comentarios = await ForumComentario.findAll({
      where: { id_topico },
      include: [{ model: Utilizador, as: 'autor', attributes: ['nome'] }],
      order: [['data_criacao', 'ASC']]
    });
    // Adiciona contagem de likes para cada comentário
    for (let comentario of comentarios) {
      const count = await ForumComentarioLike.count({ where: { id_comentario: comentario.id_comentario } });
      comentario.dataValues.likes = count;
    }
    res.json({ success: true, comentarios });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao listar comentários" });
  }
};

// Denunciar comentário
const denunciarComentario = async (req, res) => {
  try {
    const { id_comentario, id_utilizador, motivo } = req.body;
    if (!id_comentario || !id_utilizador || !motivo) {
      return res.status(400).json({ message: "Campos obrigatórios faltando." });
    }
    await ForumDenuncia.create({
      id_comentario,
      id_utilizador,
      motivo,
      data_denuncia: new Date()
    });
    res.status(201).json({ success: true, message: "Denúncia de comentário registrada." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao denunciar comentário", error: error.message });
  }
};

// Editar comentário (apenas autor ou admin)
const editarComentario = async (req, res) => {
  try {
    const { id_comentario } = req.params;
    const { conteudo } = req.body;
    // Faça aqui a validação de permissão de autor/admin se desejar
    const comentario = await ForumComentario.findByPk(id_comentario);
    if (!comentario) {
      return res.status(404).json({ message: "Comentário não encontrado" });
    }
    await comentario.update({ conteudo });
    res.json({ success: true, comentario });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao editar comentário", error: error.message });
  }
};

// Remover comentário (apenas autor ou admin)
const removerComentario = async (req, res) => {
  try {
    const { id_comentario } = req.params;
    // Faça aqui a validação de permissão de autor/admin se desejar
    const comentario = await ForumComentario.findByPk(id_comentario);
    if (!comentario) {
      return res.status(404).json({ message: "Comentário não encontrado" });
    }
    await comentario.destroy();
    res.json({ success: true, message: "Comentário removido" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao remover comentário", error: error.message });
  }
};

// Curtir/Descurtir comentário (toggle)
const toggleLikeComentario = async (req, res) => {
  try {
    const { id_comentario } = req.params;
    const id_utilizador = req.body.id_utilizador;

    const likeExistente = await ForumComentarioLike.findOne({
      where: { id_comentario, id_utilizador }
    });

    if (likeExistente) {
      await likeExistente.destroy();
      return res.json({ success: true, message: 'Like removido' });
    } else {
      await ForumComentarioLike.create({ id_comentario, id_utilizador });
      return res.json({ success: true, message: 'Like adicionado' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao alternar like", error: error.message });
  }
};

// Contar likes de um comentário
const getLikesCount = async (req, res) => {
  try {
    const { id_comentario } = req.params;
    const count = await ForumComentarioLike.count({ where: { id_comentario } });
    res.json({ success: true, likes: count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao buscar likes" });
  }
};



module.exports = {
  criarComentario,
  listarComentariosPorTopico,
  denunciarComentario,
  editarComentario,
  removerComentario,
  toggleLikeComentario,
  getLikesCount
};
