const Curso = require("../models/Curso");
const Utilizador = require("../models/Utilizador");
const ConteudoCurso = require("../models/ConteudoCurso");

// cursoController.js (criarCurso)
const listarCategoriasParaCurso = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      attributes: ['id_categoria', 'nome'],
      order: [['nome', 'ASC']]
    });
    
    res.json({ success: true, categorias });
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    res.status(500).json({ success: false, message: "Erro ao listar categorias" });
  }
};

const criarCurso = async (req, res) => {
  try {
    // Determina o tipo automaticamente
    const tipo = req.body.id_formador ? "sincrono" : "assincrono";
    
    if (tipo === "sincrono" && (!req.body.vagas || req.body.vagas < 1)) {
      return res.status(400).json({
        success: false,
        message: "Para cursos síncronos, é necessário especificar um número válido de vagas (mínimo 1)"
      });
    }

    const dadosCurso = {
      titulo: String(req.body.titulo),
      descricao: String(req.body.descricao),
      id_categoria: Number(req.body.id_categoria),
      id_area: Number(req.body.id_area),
      id_formador: req.body.id_formador ? Number(req.body.id_formador) : null,
      descricao_formador: req.body.id_formador ? req.body.descricao_formador : null,
      data_inicio: new Date(req.body.data_inicio),
      data_fim: new Date(req.body.data_fim),
      vagas: tipo === "sincrono" ? Number(req.body.vagas) : null, 
      tipo: tipo,
      estado: "agendado" // Estado inicial
    };

    const novoCurso = await Curso.create(dadosCurso);
    
    // Verifica se já precisa atualizar o estado
    await atualizarEstadoCurso(novoCurso);
    
    res.status(201).json({ 
      success: true, 
      message: "Curso criado com sucesso!", 
      curso: novoCurso 
    });
  } catch (error) {
    console.error("Erro ao criar curso:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erro ao criar curso",
      error: error.message 
    });
  }
};

const { Op } = require('sequelize');

const listarCursos = async (req, res) => {
  try {
    const cursos = await Curso.findAll();

    const cursosCompleto = await Promise.all(
      cursos.map(async (curso) => {
        await atualizarEstadoCurso(curso);
        
        const formador = curso.id_formador 
          ? await Utilizador.findOne({ where: { id_utilizador: curso.id_formador } })
          : null;

        const conteudoImagem = await ConteudoCurso.findOne({
          where: {
            id_curso: curso.id_curso,
            [Op.or]: [
              { 
                [Op.and]: [
                  { url: { [Op.not]: null } },
                  { url: { [Op.ne]: '' } }, 
                  { 
                    [Op.or]: [
                      { tipo_conteudo: 'imagem' },
                      { url: { [Op.iLike]: '%.jpg%' } },
                      { url: { [Op.iLike]: '%.jpeg%' } },
                      { url: { [Op.iLike]: '%.png%' } },
                      { url: { [Op.iLike]: '%.gif%' } },
                      { url: { [Op.iLike]: '%.webp%' } },
                      { url: { [Op.iLike]: '%.bmp%' } },
                      { url: { [Op.iLike]: '%.svg%' } },
                      { url: { [Op.iLike]: '%storage.googleapis.com%' } }
                    ]
                  }
                ]
              }
            ]
          },
          order: [['id_conteudo', 'ASC']],
          limit: 1
        });

        return {
          ...curso.toJSON(),
          nome_formador: formador ? formador.nome : "Formador não associado",
          estado: curso.estado,
          imagem_capa: conteudoImagem?.url || null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: cursosCompleto
    });
  } catch (error) {
    console.error("Erro ao listar cursos:", error);
    res.status(500).json({ 
      success: false,
      message: "Erro ao listar cursos",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const eliminarCurso = async (req, res) => {
  const { id_curso } = req.params;

  try {
    const curso = await Curso.findByPk(id_curso);

    if (!curso) {
      return res.status(404).json({ message: "Curso não encontrado!" });
    }

    await ConteudoCurso.destroy({
      where: {
        id_curso: id_curso
      }
    });

    await curso.destroy();

    return res.status(200).json({ message: "Curso e conteúdos associados eliminados com sucesso!" });
  } catch (error) {
    console.error("Erro ao eliminar curso:", error);
    return res.status(500).json({ message: "Erro ao eliminar curso." });
  }
};

const editarCurso = async (req, res) => {
  const { id_curso } = req.params;
  
  try {
    const curso = await Curso.findByPk(id_curso);
    if (!curso) {
      return res.status(404).json({ message: "Curso não encontrado!" });
    }

    // Verifica se já passou da data de início
    const hoje = new Date();
    const dataInicio = new Date(curso.data_inicio);
    if (hoje > dataInicio) {
      return res.status(400).json({ 
        success: false,
        message: "Não é possível editar as vagas após a data de início do curso" 
      });
    }

    const tipo = req.body.id_formador ? "sincrono" : "assincrono";

    if (tipo === "sincrono" && (!req.body.vagas || req.body.vagas < 1)) {
      return res.status(400).json({
        success: false,
        message: "Para cursos síncronos, é necessário especificar um número válido de vagas (mínimo 1)"
      });
    }

    await curso.update({
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      id_categoria: req.body.id_categoria,
      id_area: req.body.id_area,
      id_formador: req.body.id_formador || null,
      descricao_formador: req.body.id_formador ? req.body.descricao_formador : null,
      data_inicio: new Date(req.body.data_inicio),
      data_fim: new Date(req.body.data_fim),
      vagas: tipo === "sincrono" ? Number(req.body.vagas) : null,
      tipo: tipo
    });

    // Atualiza o estado após edição
    await atualizarEstadoCurso(curso);

    return res.status(200).json({ message: "Curso atualizado com sucesso!", curso });
  } catch (error) {
    console.error("Erro ao atualizar curso:", error);
    return res.status(500).json({ message: "Erro ao atualizar curso." });
  }
};

// Função auxiliar para atualizar o estado do curso baseado nas datas
const atualizarEstadoCurso = async (curso) => {
  const hoje = new Date();
  const dataInicio = new Date(curso.data_inicio);
  const dataFim = new Date(curso.data_fim);

  let novoEstado = curso.estado;

  if (hoje > dataFim) {
    novoEstado = 'terminado';
  } else if (hoje > dataInicio) {
    novoEstado = 'em_curso';
  } else {
    novoEstado = 'agendado';
  }

  // Só atualiza se o estado mudou
  if (novoEstado !== curso.estado) {
    await curso.update({ estado: novoEstado });
  }

  return novoEstado;
};


const listarTodosCursos = async (req, res) => {
  try {
    const cursos = await Curso.findAll();

    // Atualiza estados e obtém cursos com formador
    const cursosComFormador = await Promise.all(
      cursos.map(async (curso) => {
        // Atualiza o estado do curso
        await atualizarEstadoCurso(curso);
        
        const formador = await Utilizador.findOne({ where: { id_utilizador: curso.id_formador } });
        return {
          ...curso.toJSON(),
          nome_formador: formador ? formador.nome : "Formador não associado",
          estado: curso.estado // Inclui o estado atualizado
        };
      })
    );

    res.status(200).json(cursosComFormador);
  } catch (error) {
    console.error("Erro ao listar cursos:", error);
    res.status(500).json({ error: "Erro ao listar cursos" });
  }
};
module.exports = { criarCurso, listarCursos, eliminarCurso, editarCurso,listarCategoriasParaCurso, atualizarEstadoCurso, listarTodosCursos };
