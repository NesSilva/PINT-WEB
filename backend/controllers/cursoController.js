  const Curso = require("../models/Curso");
  const Utilizador = require("../models/Utilizador");
  const ConteudoCurso = require("../models/ConteudoCurso");

  const Inscricao = require("../models/Inscricoes");
  const Notificacao = require("../models/Notificacoes");
  const Categoria = require("../models/Categoria");
  const { Op } = require('sequelize');

  //Listagem dos id_categorias para um dado curso 
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

  //Controller para a criação de um curso 
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
        estado: "agendado" 
      };

      const novoCurso = await Curso.create(dadosCurso);
      
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


  //Listagem do curso incluindo o conteudo associado a ele 
  const listarCursos = async (req, res) => {
    try {
      const cursos = await Curso.findAll({
        where: {
          ativo: true,
          estado: 'agendado' // Adiciona filtro por estado
        }
      });

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

  //Controller para a eleminação de um dado curso e os seus cursos associados
 const eliminarCurso = async (req, res) => {
  const { id_curso } = req.params;

  try {
    const curso = await Curso.findByPk(id_curso);

    if (!curso) {
      return res.status(404).json({ message: "Curso não encontrado!" });
    }

    // 1. Obter todos os inscritos no curso
    const inscricoes = await Inscricao.findAll({
      where: {
        id_curso: id_curso
      }
    });

    // 2. Criar notificações para os inscritos
    if (inscricoes.length > 0) {
      const notificacoes = inscricoes.map(inscricao => ({
        id_utilizador: inscricao.id_utilizador,
        mensagem: `O curso "${curso.titulo}" no qual você estava inscrito foi cancelado.`,
        data_criacao: new Date(),
        tipo: "interna",
        lida: false
      }));

      await Notificacao.bulkCreate(notificacoes);
    }

    // 3. Eliminar todas as inscrições associadas ao curso
    await Inscricao.destroy({
      where: {
        id_curso: id_curso
      }
    });

    // 4. Eliminar os conteúdos do curso
    await ConteudoCurso.destroy({
      where: {
        id_curso: id_curso
      }
    });

    // 5. Finalmente, eliminar o curso
    await curso.destroy();

    return res.status(200).json({ 
      success: true,
      message: "Curso eliminado com sucesso! Todas as inscrições e conteúdos associados foram removidos e os participantes foram notificados." 
    });
  } catch (error) {
    console.error("Erro ao eliminar curso:", error);
    return res.status(500).json({ 
      success: false,
      message: "Erro ao eliminar curso.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

  //Controller para a edição de um dado curso
  const editarCurso = async (req, res) => {
    const { id_curso } = req.params;
    
    try {
      const curso = await Curso.findByPk(id_curso);
      if (!curso) {
        return res.status(404).json({ message: "Curso não encontrado!" });
      }

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

      if (!req.body.data_inicio || isNaN(new Date(req.body.data_inicio).getTime())) {
        return res.status(400).json({ message: "Data de início inválida" });
      }

      if (!req.body.data_fim || isNaN(new Date(req.body.data_fim).getTime())) {
        return res.status(400).json({ message: "Data de fim inválida" });
      }

      const dataInicioFormatada = new Date(req.body.data_inicio).toISOString();
      const dataFimFormatada = new Date(req.body.data_fim).toISOString();

      await curso.update({
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        id_categoria: req.body.id_categoria,
        id_area: req.body.id_area,
        id_formador: req.body.id_formador || null,
        descricao_formador: req.body.id_formador ? req.body.descricao_formador : null,
        data_inicio: dataInicioFormatada,
        data_fim: dataFimFormatada,
        vagas: tipo === "sincrono" ? Number(req.body.vagas) : null,
        tipo: tipo
      });

      await atualizarEstadoCurso(curso);

      const inscritos = await Inscricao.findAll({
        where: { id_curso }
      });

      const mensagem = `O curso "${curso.titulo}" que estás inscrito foi atualizado. Por favor verifica as alterações.`;

      const notificacoes = inscritos.map(inscrito => ({
        id_utilizador: inscrito.id_utilizador,
        mensagem: mensagem,
        data_criacao: new Date(),
        tipo: "interna",
        lida: false
      }));

      await Notificacao.bulkCreate(notificacoes);

      return res.status(200).json({ message: "Curso atualizado com sucesso e notificações enviadas!", curso });
    } catch (error) {
      console.error("Erro ao atualizar curso:", error);
      return res.status(500).json({ message: "Erro ao atualizar curso." });
    }
  };

  // Função auxiliar para atualizar o estado do curso baseado nas datas
  // Função auxiliar para atualizar o estado do curso baseado nas datas
  const atualizarEstadoCurso = async (curso) => {
    const hoje = new Date();
    const dataInicio = new Date(curso.data_inicio);
    const dataFim = new Date(curso.data_fim);

    let novoEstado = curso.estado;
    let ativo = curso.ativo;

    if (hoje > dataFim) {
      novoEstado = 'terminado';
      ativo = false; // Automaticamente desativa quando a data de fim passa
    } else if (hoje > dataInicio) {
      novoEstado = 'em_curso';
      ativo = true; // Garante que está ativo se estiver em curso
    } else {
      novoEstado = 'agendado';
      ativo = true; // Garante que está ativo se estiver agendado
    }

    // Só atualiza se algo mudou
    if (novoEstado !== curso.estado || ativo !== curso.ativo) {
      await curso.update({ estado: novoEstado, ativo });
    }

    return { novoEstado, ativo };
  };

    //Listagem dos cursos com base no formador
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


  const toggleUploadPermissao = async (req, res) => {
    try {
      const { id_curso } = req.params;
      const { conteudo_upload } = req.body;
      
      const curso = await Curso.findByPk(id_curso);
      if (!curso) {
        return res.status(404).json({ success: false, message: "Curso não encontrado." });
      }

      curso.conteudo_upload = conteudo_upload;
      await curso.save();
      
      res.status(200).json({ 
        success: true, 
        message: "Permissão de upload atualizada!",
        conteudo_upload: curso.conteudo_upload
      });
    } catch (error) {
      console.error("Erro ao alternar permissão:", error);
      res.status(500).json({ success: false, message: "Erro no servidor." });
    }
  };

  const toggleUploadDocumentos = async (req, res) => {
    try {
      const { id_curso } = req.params;
      
      const curso = await Curso.findByPk(id_curso);
      if (!curso) {
        return res.status(404).json({ 
          success: false, 
          message: "Curso não encontrado." 
        });
      }

      // Alterna o estado atual (true -> false, false -> true)
      const novoEstado = !curso.conteudo_upload;
      
      await curso.update({ conteudo_upload: novoEstado });
      
      res.status(200).json({ 
        success: true, 
        message: "Status de upload de documentos atualizado!",
        conteudo_upload: novoEstado
      });
    } catch (error) {
      console.error("Erro ao alternar permissão de upload:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erro ao atualizar permissão de upload.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  const atualizarEstadoCursoAtivo = async (curso) => {
      const hoje = new Date();
      const dataInicio = new Date(curso.data_inicio);
      const dataFim = new Date(curso.data_fim);

      let novoEstado = curso.estado;
      let ativo = curso.ativo;

      if (hoje > dataFim) {
          novoEstado = 'terminado';
          // Automaticamente desativa quando a data de fim passa
          ativo = false; 
      } else if (hoje > dataInicio) {
          novoEstado = 'em_curso';
      } else {
          novoEstado = 'agendado';
      }

      // Só atualiza se algo mudou
      if (novoEstado !== curso.estado || ativo !== curso.ativo) {
          await curso.update({ estado: novoEstado, ativo });
      }

      return { novoEstado, ativo };
  };

  const reativarCurso = async (req, res) => {
    const { id_curso } = req.params;
    const { nova_data_inicio, nova_data_fim } = req.body;

    try {
      const curso = await Curso.findByPk(id_curso);
      if (!curso) {
        return res.status(404).json({ success: false, message: "Curso não encontrado" });
      }

      // Validação das novas datas
      if (!nova_data_inicio || !nova_data_fim) {
        return res.status(400).json({ 
          success: false, 
          message: "Novas datas de início e fim são necessárias" 
        });
      }

      const dataInicio = new Date(nova_data_inicio);
      const dataFim = new Date(nova_data_fim);

      if (dataInicio >= dataFim) {
        return res.status(400).json({ 
          success: false, 
          message: "A data de início deve ser anterior à data de fim" 
        });
      }

      await curso.update({
        data_inicio: dataInicio,
        data_fim: dataFim,
        ativo: true,
        estado: 'agendado' 
      });

      return res.status(200).json({ 
        success: true, 
        message: "Curso reativado com sucesso",
        curso 
      });
    } catch (error) {
      console.error("Erro ao reativar curso:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Erro ao reativar curso",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };



  module.exports = { criarCurso, listarCursos, eliminarCurso, editarCurso,listarCategoriasParaCurso, atualizarEstadoCurso, listarTodosCursos ,toggleUploadPermissao , toggleUploadDocumentos ,atualizarEstadoCursoAtivo , reativarCurso};
