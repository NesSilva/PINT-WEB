// controllers/forumController.js
const ForumPublicacao = require("../models/forumPublicação");
const ForumComentario = require("../models/ForumComentario");
const ForumAnexo = require("../models/ForumAnexo");
const ForumAvaliacao = require("../models/ForumAvaliacao");
const ForumDenuncia = require("../models/ForumDenuncia");
const Utilizador = require("../models/Utilizador");
const Categoria = require("../models/Categoria");
const upload = require("../firebase/upload");
const { bucket } = require("../firebase/firebaseConfig");
const { v4: uuidv4 } = require("uuid");

// Criar uma nova publicação no fórum
const criarPublicacao = async (req, res) => {
    try {
        console.log('Corpo da requisição:', req.body); // Log para depuração
        console.log('Arquivos recebidos:', req.files); // Log para depuração

        const { id_autor, id_categoria, titulo, conteudo } = req.body;
        const files = req.files?.anexos || []; // Acessa os arquivos corretamente

        if (!files || files.length === 0) {
            console.log('Nenhum arquivo recebido');
        } else {
            console.log(`Recebidos ${files.length} arquivo(s)`);
        }

        // Criar a publicação
        const novaPublicacao = await ForumPublicacao.create({
            id_autor,
            id_categoria,
            titulo,
            conteudo
        });

        // Processar anexos se existirem
        if (files.length > 0) {
            console.log('Processando anexos...');
            
            const anexosPromises = files.map(async (file) => {
                try {
                    console.log(`Processando arquivo: ${file.originalname}`);
                    
                    const blobName = `forum-anexos/${uuidv4()}_${file.originalname}`;
                    const blob = bucket.file(blobName);
                    
                    const blobStream = blob.createWriteStream({
                        metadata: {
                            contentType: file.mimetype,
                        },
                    });

                    await new Promise((resolve, reject) => {
                        blobStream.on('error', (error) => {
                            console.error('Erro no upload:', error);
                            reject(error);
                        });
                        
                        blobStream.on('finish', async () => {
                            console.log(`Upload concluído para ${file.originalname}`);
                            try {
                                await blob.makePublic();
                                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                                
                                console.log(`Criando registro no banco para ${file.originalname}`);
                                return ForumAnexo.create({
                                    id_publicacao: novaPublicacao.id_publicacao,
                                    nome_arquivo: file.originalname,
                                    caminho_arquivo: blob.name,
                                    tipo_arquivo: file.mimetype,
                                    tamanho: file.size,
                                    url: publicUrl
                                });
                            } catch (error) {
                                console.error('Erro ao criar registro:', error);
                                reject(error);
                            }
                        });
                        
                        blobStream.end(file.buffer);
                    });
                    
                    console.log(`Arquivo ${file.originalname} processado com sucesso`);
                } catch (error) {
                    console.error(`Erro ao processar arquivo ${file.originalname}:`, error);
                    throw error;
                }
            });

            await Promise.all(anexosPromises);
            console.log('Todos os anexos foram processados');
        }

        res.status(201).json({
            success: true,
            message: "Publicação criada com sucesso!",
            publicacao: novaPublicacao
        });
    } catch (error) {
        console.error("Erro completo ao criar publicação:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao criar publicação",
            error: error.message,
            stack: error.stack // Adiciona a stack trace para depuração
        });
    }
};

// Listar todas as publicações do fórum
const listarPublicacoes = async (req, res) => {
    try {
        const publicacoes = await ForumPublicacao.findAll({
            include: [
                {
                    model: Utilizador,
                    as: 'autor',
                    attributes: ['id_utilizador', 'nome', 'foto_perfil']
                },
                {
                    model: Categoria,
                    attributes: ['id_categoria', 'nome']
                },
                {
                    model: ForumAnexo,
                    attributes: ['id_anexo', 'nome_arquivo', 'tipo_arquivo']
                }
            ],
            order: [['data_publicacao', 'DESC']]
        });

        // Calcular média de avaliações para cada publicação
        const publicacoesComAvaliacao = await Promise.all(
            publicacoes.map(async (publicacao) => {
                const avaliacoes = await ForumAvaliacao.findAll({
                    where: { id_publicacao: publicacao.id_publicacao }
                });
                
                const somaAvaliacoes = avaliacoes.reduce((sum, av) => sum + av.avaliacao, 0);
                const mediaAvaliacoes = avaliacoes.length > 0 ? (somaAvaliacoes / avaliacoes.length).toFixed(1) : 0;
                
                return {
                    ...publicacao.toJSON(),
                    media_avaliacoes: mediaAvaliacoes,
                    total_avaliacoes: avaliacoes.length
                };
            })
        );

        res.status(200).json({
            success: true,
            publicacoes: publicacoesComAvaliacao
        });
    } catch (error) {
        console.error("Erro ao listar publicações:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao listar publicações",
            error: error.message
        });
    }
};

// Adicionar comentário a uma publicação
const adicionarComentario = async (req, res) => {
    try {
        const { id_publicacao, id_autor, conteudo } = req.body;
        
        const publicacao = await ForumPublicacao.findByPk(id_publicacao);
        if (!publicacao) {
            return res.status(404).json({
                success: false,
                message: "Publicação não encontrada!"
            });
        }

        const novoComentario = await ForumComentario.create({
            id_publicacao,
            id_autor,
            conteudo
        });

        res.status(201).json({
            success: true,
            message: "Comentário adicionado com sucesso!",
            comentario: novoComentario
        });
    } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao adicionar comentário",
            error: error.message
        });
    }
};

// Listar comentários de uma publicação
const listarComentarios = async (req, res) => {
    try {
        const { id_publicacao } = req.params;
        
        const comentarios = await ForumComentario.findAll({
            where: { id_publicacao },
            include: [
                {
                    model: Utilizador,
                    as: 'autor',
                    attributes: ['id_utilizador', 'nome', 'foto_perfil']
                }
            ],
            order: [['data_comentario', 'ASC']]
        });

        res.status(200).json({
            success: true,
            comentarios
        });
    } catch (error) {
        console.error("Erro ao listar comentários:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao listar comentários",
            error: error.message
        });
    }
};

const avaliarPublicacao = async (req, res) => {
    try {
        const { id_publicacao, id_utilizador, avaliacao } = req.body;
        
        // Verificar se o usuário já avaliou esta publicação
        const avaliacaoExistente = await ForumAvaliacao.findOne({
            where: { id_publicacao, id_utilizador }
        });

        if (avaliacaoExistente) {
            return res.status(400).json({
                success: false,
                message: "Você já avaliou esta publicação!"
            });
        }

        const novaAvaliacao = await ForumAvaliacao.create({
            id_publicacao,
            id_utilizador,
            avaliacao
        });

        res.status(201).json({
            success: true,
            message: "Publicação avaliada com sucesso!",
            avaliacao: novaAvaliacao
        });
    } catch (error) {
        console.error("Erro ao avaliar publicação:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao avaliar publicação",
            error: error.message
        });
    }
};

// Denunciar publicação ou comentário
const denunciarConteudo = async (req, res) => {
    try {
        const { id_publicacao, id_comentario, id_denunciante, motivo } = req.body;
        
        if (!id_publicacao && !id_comentario) {
            return res.status(400).json({
                success: false,
                message: "É necessário especificar uma publicação ou comentário para denunciar!"
            });
        }

        const novaDenuncia = await ForumDenuncia.create({
            id_publicacao,
            id_comentario,
            id_denunciante,
            motivo
        });

        res.status(201).json({
            success: true,
            message: "Denúncia registrada com sucesso!",
            denuncia: novaDenuncia
        });
    } catch (error) {
        console.error("Erro ao registrar denúncia:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao registrar denúncia",
            error: error.message
        });
    }
};

// Obter detalhes de uma publicação específica
const obterPublicacao = async (req, res) => {
    try {
        const { id_publicacao } = req.params;
        
        const publicacao = await ForumPublicacao.findByPk(id_publicacao, {
            include: [
                {
                    model: Utilizador,
                    as: 'autor',
                    attributes: ['id_utilizador', 'nome', 'foto_perfil']
                },
                {
                    model: Categoria,
                    attributes: ['id_categoria', 'nome']
                },
                {
                    model: ForumAnexo,
                    attributes: ['id_anexo', 'nome_arquivo', 'tipo_arquivo']
                },
                {
                    model: ForumComentario,
                    include: [{
                        model: Utilizador,
                        as: 'autor',
                        attributes: ['id_utilizador', 'nome', 'foto_perfil']
                    }],
                    order: [['data_comentario', 'ASC']]
                }
            ]
        });

        if (!publicacao) {
            return res.status(404).json({
                success: false,
                message: "Publicação não encontrada!"
            });
        }

        // Calcular média de avaliações
        const avaliacoes = await ForumAvaliacao.findAll({
            where: { id_publicacao }
        });
        
        const somaAvaliacoes = avaliacoes.reduce((sum, av) => sum + av.avaliacao, 0);
        const mediaAvaliacoes = avaliacoes.length > 0 ? (somaAvaliacoes / avaliacoes.length).toFixed(1) : 0;

        res.status(200).json({
            success: true,
            publicacao: {
                ...publicacao.toJSON(),
                media_avaliacoes: mediaAvaliacoes,
                total_avaliacoes: avaliacoes.length
            }
        });
    } catch (error) {
        console.error("Erro ao obter publicação:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao obter publicação",
            error: error.message
        });
    }
};



const adicionarAnexo = async (req, res) => {
  try {
    const { id_publicacao } = req.body; // Certifique-se que está recebendo isso
    const file = req.file;

    console.log('Arquivo recebido:', file); // Adicione este log para depuração
    console.log('ID Publicação:', id_publicacao);

    if (!file) {
      return res.status(400).json({ 
        success: false, 
        message: "Nenhum arquivo enviado!" 
      });
    }

    if (!id_publicacao) {
      return res.status(400).json({ 
        success: false, 
        message: "ID da publicação não fornecido!" 
      });
    }

    const blob = bucket.file(`forum-anexos/${uuidv4()}_${file.originalname}`);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on("error", (err) => {
      console.error("Erro no upload:", err);
      res.status(500).json({ success: false, message: "Erro ao fazer upload." });
    });

    blobStream.on("finish", async () => {
      await blob.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      const anexo = await ForumAnexo.create({
        id_publicacao,
        nome_arquivo: file.originalname,
        caminho_arquivo: blob.name,
        tipo_arquivo: file.mimetype,
        tamanho: file.size,
        url: publicUrl
      });

      res.status(201).json({ 
        success: true, 
        message: "Anexo adicionado com sucesso!",
        anexo 
      });
    });

    blobStream.end(file.buffer);
  } catch (error) {
    console.error("Erro ao adicionar anexo:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erro ao adicionar anexo",
      error: error.message 
    });
  }
};

module.exports = {
    criarPublicacao,
    listarPublicacoes,
    adicionarComentario,
    listarComentarios,
    avaliarPublicacao,
    denunciarConteudo,
    obterPublicacao,
    adicionarAnexo
};