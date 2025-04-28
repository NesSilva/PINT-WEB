const ConteudoCurso = require("../models/ConteudoCurso");
const { bucket } = require("../firebase/firebaseConfig");
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const adicionarConteudo = async (req, res) => {
  try {
    const { id_curso, tipo_conteudo, descricao } = req.body;
    const file = req.file; // ficheiro enviado

    if (!file) {
      return res.status(400).json({ success: false, message: "Nenhum ficheiro enviado." });
    }

    const blob = bucket.file(`conteudos/${uuidv4()}_${file.originalname}`);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    blobStream.on("error", (err) => {
      console.error("Erro no upload:", err);
      res.status(500).json({ success: false, message: "Erro ao fazer upload." });
    });

    blobStream.on("finish", async () => {
      // URL público
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      // Guarda no banco de dados
      const conteudo = await ConteudoCurso.create({
        id_curso,
        tipo_conteudo,
        url: publicUrl,
        caminho_arquivo: blob.name,
        descricao
      });

      res.status(201).json({ success: true, message: "Conteúdo adicionado!", conteudo });
    });

    blobStream.end(file.buffer);

  } catch (error) {
    console.error("Erro ao adicionar conteúdo:", error);
    res.status(500).json({ success: false, message: "Erro no servidor." });
  }
};

module.exports = { adicionarConteudo };
