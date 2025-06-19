const ForumTopico = require('../models/ForumTopico');
const Categoria = require('../models/Categoria');
const Utilizador = require('../models/Utilizador');
const ForumDenuncia = require('../models/ForumDenuncia');
const ForumAvaliacao = require('../models/ForumAvaliacao');

// Criar tópico (com imagem)
const criarTopico = async (req, res) => {
  try {
    const { titulo, conteudo, id_categoria } = req.body;
    const id_utilizador = req.user?.id_utilizador || req.body.id_autor;
    const imagem_url = req.file ? '/uploads/forum/' + req.file.filename : null;

    const topico = await ForumTopico.create({
      titulo,
      conteudo,
      imagem_url,
      id_categoria,
      id_utilizador
    });
    res.status(201).json({ success: true, topico });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao criar tópico", error: error.message });
  }
};

// Editar tópico (apenas autor ou admin)
const editarTopico = async (req, res) => {
  try {
    const { id_topico } = req.params;
    const { titulo, conteudo, id_categoria } = req.body;
    // Aqui pode validar se o req.user.id_utilizador === topico.id_utilizador (autor) ou admin
    const topico = await ForumTopico.findByPk(id_topico);
    if (!topico) {
      return res.status(404).json({ message: 'Tópico não encontrado' });
    }
    await topico.update({ titulo, conteudo, id_categoria });
    res.json({ success: true, topico });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao editar tópico", error: error.message });
  }
};

// Remover tópico (apenas autor ou admin)
const removerTopico = async (req, res) => {
  try {
    const { id_topico } = req.params;
    // Aqui pode validar se o req.user.id_utilizador === topico.id_utilizador (autor) ou admin
    const topico = await ForumTopico.findByPk(id_topico);
    if (!topico) {
      return res.status(404).json({ message: 'Tópico não encontrado' });
    }
    await topico.destroy();
    res.json({ success: true, message: "Tópico removido" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao remover tópico", error: error.message });
  }
};

// Listar todos os tópicos
const listarTodosTopicos = async (req, res) => {
  try {
    const topicos = await ForumTopico.findAll({
      include: [
        { model: Utilizador, as: 'autor', attributes: ['nome'] },
        { model: Categoria, as: 'categoria', attributes: ['nome'] }
      ],
      order: [['data_criacao', 'DESC']]
    });
    res.json({ success: true, topicos });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao listar tópicos" });
  }
};

// Listar tópicos por categoria
const listarTopicosPorCategoria = async (req, res) => {
  try {
    const { id_categoria } = req.params;
    const topicos = await ForumTopico.findAll({
      where: { id_categoria },
      include: [{ model: Utilizador, as: 'autor', attributes: ['nome'] }],
      order: [['data_criacao', 'DESC']]
    });
    res.json({ success: true, topicos });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao listar tópicos" });
  }
};

// Buscar tópico por ID (detalhes)
const getTopicoById = async (req, res) => {
  try {
    const { id_topico } = req.params;
    const topico = await ForumTopico.findOne({
      where: { id_topico },
      include: [
        { model: Utilizador, as: 'autor', attributes: ['nome'] },
        { model: Categoria, as: 'categoria', attributes: ['nome'] }
      ]
    });
    if (!topico) {
      return res.status(404).json({ message: 'Publicação não encontrada' });
    }
    res.json({ topico });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar publicação', error: error.message });
  }
};

// Denunciar tópico
const denunciarTopico = async (req, res) => {
  try {
    const { id_topico, id_utilizador, motivo } = req.body;
    if (!id_topico || !id_utilizador || !motivo) {
      return res.status(400).json({ message: "Campos obrigatórios faltando." });
    }
    await ForumDenuncia.create({
      id_topico,
      id_utilizador,
      motivo,
      data_denuncia: new Date()
    });
    res.status(201).json({ success: true, message: "Denúncia registrada." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao denunciar tópico", error: error.message });
  }
};

// Avaliar tópico (1 a 5 estrelas)
const avaliarTopico = async (req, res) => {
  try {
    const { id_topico, id_utilizador, nota } = req.body;
    if (!id_topico || !id_utilizador || !nota) {
      return res.status(400).json({ message: "Campos obrigatórios faltando." });
    }
    // Permitir atualizar avaliação do mesmo utilizador
    const [avaliacao, created] = await ForumAvaliacao.upsert({
      id_topico,
      id_utilizador,
      nota
    }, { returning: true });

    res.status(201).json({ success: true, avaliacao });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao avaliar tópico", error: error.message });
  }
};

module.exports = {
  criarTopico,
  editarTopico,
  removerTopico,
  listarTodosTopicos,
  listarTopicosPorCategoria,
  getTopicoById,
  denunciarTopico,
  avaliarTopico
};
