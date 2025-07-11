const DocumentoAvaliacao = require("../models/documentos_avaliação");
const { bucket } = require("../firebase/firebaseConfig");
const { v4: uuidv4 } = require("uuid");
const Utilizador = require("../models/Utilizador");
const Curso = require("../models/Curso");

// Upload de documento para avaliação
const uploadDocumentoAvaliacao = async (req, res) => {
  try {
    const { id_curso, id_utilizador, descricao } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "Nenhum arquivo enviado." });
    }

    // Verificação do tipo de arquivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        message: "Tipo de arquivo não permitido. Formatos aceitos: PDF, Word, Excel, PowerPoint, TXT" 
      });
    }

    // Verificar tamanho do arquivo (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false, 
        message: "Arquivo muito grande. Tamanho máximo permitido: 10MB" 
      });
    }

    // Upload para Firebase
    const blob = bucket.file(`documentos-avaliacao/${uuidv4()}_${file.originalname}`);
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
    
      // Salvar no banco de dados
      const documento = await DocumentoAvaliacao.create({
        id_curso,
        id_utilizador,
        tipo_conteudo: "ficheiro",
        url: publicUrl,
        caminho_arquivo: blob.name,
        descricao: descricao || "Documento para avaliação",
      });
    
      res.status(201).json({ 
        success: true, 
        message: "Documento enviado com sucesso!", 
        documento 
      });
    });

    blobStream.end(file.buffer);
  } catch (error) {
    console.error("Erro ao enviar documento:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erro no servidor.",
      error: error.message 
    });
  }
};


const listarDocumentosCurso = async (req, res) => {
  const { id_curso } = req.params;

  try {
    // Primeiro busca os documentos
    const documentos = await DocumentoAvaliacao.findAll({ 
      where: { id_curso }
    });

    // Depois busca os usuários associados
    const documentosComUsuarios = await Promise.all(
      documentos.map(async (doc) => {
        const usuario = await Utilizador.findOne({
          where: { id_utilizador: doc.id_utilizador },
          attributes: ['nome']
        });
        
        return {
          ...doc.toJSON(),
          nome_utilizador: usuario?.nome || 'Utilizador desconhecido'
        };
      })
    );
    
    res.status(200).json(documentosComUsuarios);
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    res.status(500).json({ message: "Erro ao buscar documentos do curso." });
  }
};

const deletarDocumento = async (req, res) => {
  const { id } = req.params;

  try {
    const documento = await DocumentoAvaliacao.findByPk(id);
    if (!documento) {
      return res.status(404).json({ success: false, message: "Documento não encontrado." });
    }

    // Verificar permissões (opcional - você pode adicionar lógica para verificar se o usuário tem permissão)
    
    // Deletar do Firebase
    await bucket.file(documento.caminho_arquivo).delete();
    
    // Deletar do banco de dados
    await documento.destroy();
    
    res.status(200).json({ success: true, message: "Documento excluído com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir documento:", error);
    res.status(500).json({ success: false, message: "Erro ao excluir documento." });
  }
};

// Nova função no controller
const listarDocumentosUtilizador = async (req, res) => {
  const { id_utilizador } = req.params; // Você pode pegar do localStorage no frontend

  try {
    const documentos = await DocumentoAvaliacao.findAll({ 
      where: { id_utilizador }
    });

    res.status(200).json(documentos);
  } catch (error) {
    console.error("Erro ao buscar documentos do usuário:", error);
    res.status(500).json({ message: "Erro ao buscar documentos do usuário." });
  }
};

const listarDocumentosUtilizadorCurso = async (req, res) => {
  const { id_utilizador, id_curso } = req.params;

  try {
    const documentos = await DocumentoAvaliacao.findAll({ 
      where: { 
        id_utilizador,
        id_curso 
      },
    });

    console.log("Documentos encontrados:", documentos.map(d => ({
  id: d.id_Doc_Avaliacao,
  descricao: d.descricao,
  url: d.url
})));
    
    res.status(200).json(documentos);
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erro ao buscar documentos.",
      error: error.message 
    });
  }
};

module.exports = {
  uploadDocumentoAvaliacao,
  listarDocumentosCurso,
  deletarDocumento,
  listarDocumentosUtilizador,
  listarDocumentosUtilizadorCurso
};