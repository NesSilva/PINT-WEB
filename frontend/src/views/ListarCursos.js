import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { Modal, Button, Form } from "react-bootstrap";

const ListarCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cursoParaEditar, setCursoParaEditar] = useState(null);

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
    ficheiro: null, 
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [filtroNomeFormador, setFiltroNomeFormador] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  useEffect(() => {
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/cursos");
      setCursos(response.data);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    resetFormData();
  };

  const resetFormData = () => {
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
      ficheiro: null,  // Resetando o ficheiro
    });
    setMessage("");
    setMessageType("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, ficheiro: e.target.files[0] }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCursoParaEditar(prev => ({ ...prev, [name]: value }));
  };

  // No ListarCursos.js, substitua o handleSubmit por:
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // 1. Envia dados do curso (sem o arquivo)
    const response = await axios.post("http://localhost:3000/api/cursos/criar", {
      titulo: formData.titulo,
      descricao: formData.descricao,
      id_categoria: formData.id_categoria,
      id_area: formData.id_area,
      id_formador: formData.id_formador,
      data_inicio: formData.data_inicio,
      data_fim: formData.data_fim,
      vagas: formData.vagas,
      tipo: formData.tipo
    });

    const idCursoCriado = response.data.curso.id_curso;

    // 2. Se existir arquivo, envia separadamente
    if (formData.ficheiro) {
      const formDataArquivo = new FormData();
      formDataArquivo.append("file", formData.ficheiro);
      formDataArquivo.append("id_curso", idCursoCriado);
      formDataArquivo.append("tipo_conteudo", "material");
      formDataArquivo.append("descricao", "Material do curso");

      await axios.post("http://localhost:3000/api/conteudo/adicionar", formDataArquivo, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    }

    setMessage("Curso criado com sucesso!");
    setMessageType("success");
    fetchCursos();
    handleCloseModal();
  } catch (error) {
    console.error("Erro:", error);
    setMessage(error.response?.data?.message || "Erro ao criar curso");
    setMessageType("error");
  }
};
  
  const handleEditClick = (curso) => {
    setCursoParaEditar(curso);
    setShowEditModal(true);
  };

  const handleUpdateCurso = async () => {
    const formDataToSend = new FormData();
    Object.keys(cursoParaEditar).forEach(key => {
      formDataToSend.append(key, cursoParaEditar[key]);
    });

    try {
      await axios.put(`http://localhost:3000/api/cursos/editar/${cursoParaEditar.id_curso}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("Curso atualizado com sucesso!");
      setMessageType("success");
      fetchCursos();
      setShowEditModal(false);
    } catch (error) {
      console.error("Erro ao atualizar curso:", error);
      setMessage("Erro ao atualizar curso.");
      setMessageType("error");
    }
  };

  const handleDeleteCurso = async (id) => {
    if (!id) {
      console.error("ID inválido.");
      return;
    }
    try {
      await axios.delete(`http://localhost:3000/api/cursos/eliminar/${id}`);
      setMessage("Curso eliminado com sucesso!");
      setMessageType("success");
      fetchCursos();
    } catch (error) {
      console.error("Erro ao eliminar curso:", error);
      setMessage("Erro ao eliminar curso.");
      setMessageType("error");
    }
  };

  const cursosFiltrados = cursos.filter(curso => {
    const nomeMatch = curso.nome_formador?.toLowerCase().includes(filtroNomeFormador.toLowerCase());
    const dataInicioMatch = filtroDataInicio ? curso.data_inicio?.startsWith(filtroDataInicio) : true;
    const dataFimMatch = filtroDataFim ? curso.data_fim?.startsWith(filtroDataFim) : true;
    return nomeMatch && dataInicioMatch && dataFimMatch;
  });

  const limparFiltros = () => {
    setFiltroNomeFormador("");
    setFiltroDataInicio("");
    setFiltroDataFim("");
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Lista de Cursos</h2>
          <Button variant="primary" onClick={handleShowModal}>Criar Curso</Button>
        </div>

        {/* Filtros */}
        <div className="mb-4">
          <div className="d-flex gap-3">
            <div style={{ width: "250px" }}>
              <Form.Label>Filtrar por Nome do Formador:</Form.Label>
              <Form.Control
                type="text"
                value={filtroNomeFormador}
                onChange={(e) => setFiltroNomeFormador(e.target.value)}
              />
            </div>
            <div style={{ width: "200px" }}>
              <Form.Label>Data de Início:</Form.Label>
              <Form.Control
                type="date"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
              />
            </div>
            <div style={{ width: "200px" }}>
              <Form.Label>Data de Fim:</Form.Label>
              <Form.Control
                type="date"
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
              />
            </div>
          </div>
          <Button variant="secondary" className="mt-2" onClick={limparFiltros}>Limpar Filtros</Button>
        </div>

        {/* Tabela de Cursos */}
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Título</th>
              <th>Descrição</th>
              <th>Formador</th>
              <th>Data Início</th>
              <th>Data Fim</th>
              <th>Vagas</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cursosFiltrados.map(curso => (
              <tr key={curso.id_curso}>
                <td>{curso.titulo}</td>
                <td>{curso.descricao}</td>
                <td>{curso.nome_formador}</td>

                <td>{curso.data_inicio?.split("T")[0]}</td>
                <td>{curso.data_fim?.split("T")[0]}</td>
                <td>{curso.vagas}</td>
                <td>{curso.tipo}</td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteCurso(curso.id_curso)}>Excluir</Button>{" "}
                  <Button variant="warning" size="sm" onClick={() => handleEditClick(curso)}>Editar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal para Criar Curso */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Criar Novo Curso</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-2">
                <Form.Label>Título:</Form.Label>
                <Form.Control type="text" name="titulo" value={formData.titulo} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Descrição:</Form.Label>
                <Form.Control as="textarea" name="descricao" value={formData.descricao} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>ID Categoria:</Form.Label>
                <Form.Control type="number" name="id_categoria" value={formData.id_categoria} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>ID Área:</Form.Label>
                <Form.Control type="number" name="id_area" value={formData.id_area} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>ID Formador:</Form.Label>
                <Form.Control type="number" name="id_formador" value={formData.id_formador} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Data Início:</Form.Label>
                <Form.Control type="date" name="data_inicio" value={formData.data_inicio} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Data Fim:</Form.Label>
                <Form.Control type="date" name="data_fim" value={formData.data_fim} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Vagas:</Form.Label>
                <Form.Control type="number" name="vagas" value={formData.vagas} onChange={handleChange} min="0" />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Tipo:</Form.Label>
                <Form.Control as="select" name="tipo" value={formData.tipo} onChange={handleChange}>
                  <option value="sincrono">Síncrono</option>
                  <option value="assincrono">Assíncrono</option>
                </Form.Control>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Ficheiro (opcional):</Form.Label>
                <Form.Control type="file" name="ficheiro" onChange={handleFileChange} />
              </Form.Group>

              <Button variant="primary" type="submit" className="mt-3">Criar</Button>
            </Form>

            {message && (
              <div className={`alert mt-3 ${messageType === "success" ? "alert-success" : "alert-danger"}`} role="alert">
                {message}
              </div>
            )}
          </Modal.Body>
        </Modal>

        {/* Modal para Editar Curso */}
        {cursoParaEditar && (
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Curso</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {cursoParaEditar && (
              <Form>
                <Form.Group className="mb-2">
                  <Form.Label>Título:</Form.Label>
                  <Form.Control
                    type="text"
                    name="titulo"
                    value={cursoParaEditar.titulo}
                    onChange={handleEditChange}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Descrição:</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="descricao"
                    value={cursoParaEditar.descricao}
                    onChange={handleEditChange}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>ID Categoria:</Form.Label>
                  <Form.Control
                    type="number"
                    name="id_categoria"
                    value={cursoParaEditar.id_categoria}
                    onChange={handleEditChange}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>ID Área:</Form.Label>
                  <Form.Control
                    type="number"
                    name="id_area"
                    value={cursoParaEditar.id_area}
                    onChange={handleEditChange}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>ID Formador:</Form.Label>
                  <Form.Control
                    type="number"
                    name="id_formador"
                    value={cursoParaEditar.id_formador}
                    onChange={handleEditChange}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Data Início:</Form.Label>
                  <Form.Control
                    type="date"
                    name="data_inicio"
                    value={cursoParaEditar.data_inicio?.split("T")[0] || ""}
                    onChange={handleEditChange}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Data Fim:</Form.Label>
                  <Form.Control
                    type="date"
                    name="data_fim"
                    value={cursoParaEditar.data_fim?.split("T")[0] || ""}
                    onChange={handleEditChange}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Vagas:</Form.Label>
                  <Form.Control
                    type="number"
                    name="vagas"
                    value={cursoParaEditar.vagas}
                    onChange={handleEditChange}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Tipo:</Form.Label>
                  <Form.Select
                    name="tipo"
                    value={cursoParaEditar.tipo}
                    onChange={handleEditChange}
                  >
                    <option value="sincrono">Síncrono</option>
                    <option value="assincrono">Assíncrono</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleUpdateCurso}>Guardar Alterações</Button>
          </Modal.Footer>
        </Modal>
        
        )}

      </div>
    </div>
  );
};

export default ListarCursos;
