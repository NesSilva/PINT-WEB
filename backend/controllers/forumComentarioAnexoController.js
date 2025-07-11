// controllers/forumComentarioAnexoController.js
const ForumComentarioAnexo = require('../models/ForumComentarioAnexo');
const { bucket } = require('../firebase/firebaseConfig');
const { v4: uuidv4 } = require('uuid');

const adicionarAnexoComentario = async (req, res) => {
  try {
    const { id_comentario } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ 
        success: false, 
        message: "Nenhum arquivo enviado" 
      });
    }

    // Upload para Firebase Storage
    const blob = bucket.file(`forum/comentarios/${uuidv4()}_${file.originalname}`);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    const uploadPromise = new Promise((resolve, reject) => {
      blobStream.on('error', reject);
      blobStream.on('finish', async () => {
        try {
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

          const anexo = await ForumComentarioAnexo.create({
            id_comentario,
            nome_arquivo: file.originalname,
            caminho_arquivo: blob.name,
            url: publicUrl,
            tipo_arquivo: file.mimetype,
            tamanho: file.size
          });

          resolve({
            success: true,
            anexo,
            url: publicUrl
          });
        } catch (error) {
          reject(error);
        }
      });

      blobStream.end(file.buffer);
    });

    const result = await uploadPromise;
    res.status(201).json(result);

  } catch (error) {
    console.error('Erro ao adicionar anexo:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Erro ao processar anexo"
    });
  }
};

const listarAnexosPorComentario = async (req, res) => {
  try {
    const { id_comentario } = req.params;
    const anexos = await ForumComentarioAnexo.findAll({ 
      where: { id_comentario },
      order: [['data_upload', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      anexos
    });
  } catch (error) {
    console.error('Erro ao listar anexos:', error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar anexos"
    });
  }
};

module.exports = { 
  adicionarAnexoComentario,
  listarAnexosPorComentario
};