import React, { useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const CriarCurso = () => {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    id_categoria: "",
    id_area: "",
    id_formador: "",
    data_inicio: "",
    data_fim: "",
    vagas: 0,
    tipo: "sincrono",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]); // agora é array

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form data being sent:", formData);
    console.log("Ficheiros selecionados:", selectedFiles.map(f => f.name));

    try {
      // Envia os dados do curso (JSON)
      const response = await axios.post(
        "http://localhost:3000/api/cursos/criar",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const idCursoCriado = response.data.curso.id_curso;
      console.log("Curso criado com sucesso, ID:", idCursoCriado);

      // Envia os ficheiros (se existirem)
      if (selectedFiles.length > 0) {
        for (let file of selectedFiles) {
          const formDataConteudo = new FormData();
          formDataConteudo.append("file", file);
          formDataConteudo.append("id_curso", idCursoCriado);
          formDataConteudo.append("tipo_conteudo", "link");
          formDataConteudo.append("descricao", "Material do curso");

          console.log("A enviar ficheiro:", file.name);

          try {
            const uploadResponse = await axios.post(
              "http://localhost:3000/api/conteudo/adicionar",
              formDataConteudo,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            console.log("Upload bem-sucedido:", uploadResponse.data);
          } catch (uploadError) {
            console.error("Erro ao enviar ficheiro:", file.name, uploadError);
          }
        }
      }

      setMessage("Curso criado com sucesso!");
      setMessageType("success");

      // Limpa os dados
      setFormData({
        titulo: "",
        descricao: "",
        id_categoria: "",
        id_area: "",
        id_formador: "",
        data_inicio: "",
        data_fim: "",
        vagas: 0,
        tipo: "sincrono",
      });
      setSelectedFiles([]);
    } catch (error) {
      console.error("Erro ao criar curso:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Erro ao criar curso";
      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="container mt-5">
        <h2>Criar Novo Curso</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título:</label>
            <input
              type="text"
              name="titulo"
              className="form-control"
              value={formData.titulo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição:</label>
            <textarea
              name="descricao"
              className="form-control"
              value={formData.descricao}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="form-group">
            <label>ID Categoria:</label>
            <input
              type="number"
              name="id_categoria"
              className="form-control"
              value={formData.id_categoria}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>ID Área de Formação:</label>
            <input
              type="number"
              name="id_area"
              className="form-control"
              value={formData.id_area}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>ID Formador:</label>
            <input
              type="number"
              name="id_formador"
              className="form-control"
              value={formData.id_formador}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Data Início:</label>
            <input
              type="date"
              name="data_inicio"
              className="form-control"
              value={formData.data_inicio}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Data Fim:</label>
            <input
              type="date"
              name="data_fim"
              className="form-control"
              value={formData.data_fim}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Vagas:</label>
            <input
              type="number"
              name="vagas"
              className="form-control"
              value={formData.vagas}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Tipo:</label>
            <select
              name="tipo"
              className="form-control"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="sincrono">Síncrono</option>
              <option value="assincrono">Assíncrono</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ficheiros (opcional):</label>
            <input
              type="file"
              name="files"
              className="form-control"
              multiple
              accept="*/*"
              onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
            />

            {selectedFiles && selectedFiles.map((file, idx) => (
              <p key={idx}>{file.name}</p>
            ))}
              
          </div>

          <button type="submit" className="btn btn-primary mt-3">
            Criar Curso
          </button>
        </form>

        {message && (
          <div
            className={`alert mt-3 ${
              messageType === "success" ? "alert-success" : "alert-danger"
            }`}
            role="alert"
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default CriarCurso;
