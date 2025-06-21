import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { Modal, Button, Form } from "react-bootstrap";

const ListarCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cursoParaEditar, setCursoParaEditar] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [formadores, setFormadores] = useState([]);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    id_categoria: "",
    id_area: "",
    id_formador: "",
    data_inicio: "",
    data_fim: "",
    vagas: null,
    ficheiro: null, 
    descricao_formador: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [filtroNomeFormador, setFiltroNomeFormador] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

 useEffect(() => {
  fetchCursos();
}, []);

useEffect(() => {
  const fetchDados = async () => {
    try {
      const cursosRes = await axios.get("http://localhost:3000/api/cursos/todos");
      setCursos(cursosRes.data);
      
      const categoriasRes = await axios.get('http://localhost:3000/api/categorias');
      setCategorias(categoriasRes.data.categorias || []);
      
      const areasRes = await axios.get('http://localhost:3000/api/areas-formacao');
      setAreas(areasRes.data.areas || []);
      
      try {
        const formadoresRes = await axios.get('http://localhost:3000/api/utilizadores/formadores');
        setFormadores(formadoresRes.data.formadores || []);
      } catch (error) {
        console.error("Erro ao buscar formadores:", error);
        setFormadores([]); 
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };
  
  fetchDados();
}, []);

  const fetchCursos = async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/api/cursos/todos");
      setCursos(data);
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
      vagas: null,
      ficheiro: null,  
      descricao_formador: "", // Novo campo

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

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // 1. Preparar os dados do curso
    const dadosCurso = {
      titulo: formData.titulo,
      descricao: formData.descricao,
      id_categoria: formData.id_categoria,
      id_area: formData.id_area,
      id_formador: formData.id_formador || null, // Pode ser null
      data_inicio: formData.data_inicio,
      data_fim: formData.data_fim,
      vagas: formData.vagas,
      descricao_formador: formData.id_formador ? formData.descricao_formador : null
    };

    // 2. Enviar dados do curso
    const response = await axios.post("http://localhost:3000/api/cursos/criar", dadosCurso);
    const idCursoCriado = response.data.curso.id_curso;

    // 3. Se houver arquivo, enviar separadamente
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

    // 4. Feedback e limpeza
    setMessage("Curso criado com sucesso!");
    setMessageType("success");
    fetchCursos(); // Atualiza a lista de cursos
    handleCloseModal(); // Fecha o modal
    
  } catch (error) {
    console.error("Erro ao criar curso:", error);
    
    // Tratamento de erros mais detalhado
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        "Erro ao criar curso. Por favor, tente novamente.";
    
    setMessage(errorMessage);
    setMessageType("error");
  }
};
  
  const handleEditClick = (curso) => {
    setCursoParaEditar(curso);
    setShowEditModal(true);
  };

  const handleUpdateCurso = async () => {
  try {
    // Verifica se o curso já começou
    const hoje = new Date();
    const dataInicio = new Date(cursoParaEditar.data_inicio);
    
    if (hoje > dataInicio) {
      setMessage("Não é possível editar as vagas após a data de início do curso");
      setMessageType("error");
      return;
    }

    // Prepara os dados para envio
    const dadosAtualizados = {
      titulo: cursoParaEditar.titulo,
      descricao: cursoParaEditar.descricao,
      id_categoria: cursoParaEditar.id_categoria,
      id_area: cursoParaEditar.id_area,
      id_formador: cursoParaEditar.id_formador || null,
      descricao_formador: cursoParaEditar.id_formador ? cursoParaEditar.descricao_formador : null,
      data_inicio: cursoParaEditar.data_inicio,
      data_fim: cursoParaEditar.data_fim,
      vagas: cursoParaEditar.id_formador ? Number(cursoParaEditar.vagas) : null
    };

    await axios.put(
      `http://localhost:3000/api/cursos/editar/${cursoParaEditar.id_curso}`,
      dadosAtualizados
    );

    // Se houver arquivo para enviar, faz separadamente
    if (cursoParaEditar.ficheiro) {
      const formDataArquivo = new FormData();
      formDataArquivo.append("file", cursoParaEditar.ficheiro);
      formDataArquivo.append("id_curso", cursoParaEditar.id_curso);
      formDataArquivo.append("tipo_conteudo", "material");
      formDataArquivo.append("descricao", "Material do curso");

      await axios.post("http://localhost:3000/api/conteudo/adicionar", formDataArquivo, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    }

    setMessage("Curso atualizado com sucesso!");
    setMessageType("success");
    fetchCursos();
    setShowEditModal(false);
  } catch (error) {
    console.error("Erro ao atualizar curso:", error);
    setMessage(error.response?.data?.message || "Erro ao atualizar curso.");
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
              <th>Estado</th> {/* Nova coluna */}
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
                <td>
        {curso.estado === 'agendado' && 'Agendado'}
        {curso.estado === 'em_curso' && 'Em curso'}
        {curso.estado === 'terminado' && 'Terminado'}
      </td>
                <td>{curso.vagas ?? "Ilimitado"}</td> {/* Alterado aqui */}
                <td>{curso.tipo}</td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteCurso(curso.id_curso)}>Excluir</Button>{" "}
<Button 
  variant="warning" 
  size="sm" 
  onClick={() => handleEditClick(curso)}
  disabled={new Date() > new Date(curso.data_inicio)}
  title={new Date() > new Date(curso.data_inicio) ? "O curso já começou e não pode ser editado" : ""}
>
  Editar
</Button>              </td>
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
  <Form.Label>Categoria:</Form.Label>
  <Form.Select 
    name="id_categoria" 
    value={formData.id_categoria} 
    onChange={handleChange} 
    required
  >
    <option value="">Selecione uma categoria</option>
    {categorias.map((categoria) => (
      <option key={categoria.id_categoria} value={categoria.id_categoria}>
        {categoria.nome}
      </option>
    ))}
  </Form.Select>
</Form.Group>
              <Form.Group className="mb-2">
  <Form.Label>Área:</Form.Label>
  <Form.Select 
    name="id_area" 
    value={formData.id_area} 
    onChange={handleChange} 
    required
  >
    <option value="">Selecione uma área</option>
    {areas.map((area) => (
      <option key={area.id_area} value={area.id_area}>
        {area.nome}
      </option>
    ))}
  </Form.Select>
</Form.Group>
<Form.Group className="mb-2">
  <Form.Label>Formador (opcional):</Form.Label>
  <Form.Select 
    name="id_formador" 
    value={formData.id_formador || ""} 
    onChange={(e) => {
      handleChange(e);
      // Mostra/oculta o campo de descrição do formador baseado na seleção
      setFormData(prev => ({
        ...prev,
        descricao_formador: e.target.value ? prev.descricao_formador : ""
      }));
    }}
  >
    <option value="">Nenhum formador (curso assíncrono)</option>
    {formadores.map((formador) => (
      <option key={formador.id_utilizador} value={formador.id_utilizador}>
        {formador.nome}
      </option>
    ))}
  </Form.Select>
</Form.Group>

{formData.id_formador && (
  <Form.Group className="mb-2">
    <Form.Label>Descrição do Formador:</Form.Label>
    <Form.Control 
      as="textarea" 
      name="descricao_formador" 
      value={formData.descricao_formador} 
      onChange={handleChange} 
      placeholder="Informações sobre o formador para os alunos"
    />
  </Form.Group>
)}
              <Form.Group className="mb-2">
                <Form.Label>Data Início:</Form.Label>
                <Form.Control type="date" name="data_inicio" value={formData.data_inicio} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Data Fim:</Form.Label>
                <Form.Control type="date" name="data_fim" value={formData.data_fim} onChange={handleChange} required />
              </Form.Group>
             <Form.Group className="mb-2">
  <Form.Label>Vagas {formData.id_formador && "(obrigatório)"}:</Form.Label>
  <Form.Control 
    type="number" 
    name="vagas" 
    value={formData.vagas || ""} 
    onChange={handleChange} 
    min="1"
    required={!!formData.id_formador} // Obrigatório apenas para síncrono
    disabled={!formData.id_formador} // Desabilitado para assíncrono
    placeholder={formData.id_formador ? "" : "Ilimitadas (curso assíncrono)"}
  />
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
            <Form.Label>Categoria:</Form.Label>
            <Form.Select
              name="id_categoria"
              value={cursoParaEditar.id_categoria}
              onChange={handleEditChange}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((categoria) => (
                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                  {categoria.nome}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-2">
            <Form.Label>Área:</Form.Label>
            <Form.Select
              name="id_area"
              value={cursoParaEditar.id_area}
              onChange={handleEditChange}
            >
              <option value="">Selecione uma área</option>
              {areas.map((area) => (
                <option key={area.id_area} value={area.id_area}>
                  {area.nome}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Formador (opcional):</Form.Label>
            <Form.Select
              name="id_formador"
              value={cursoParaEditar.id_formador || ""}
              onChange={(e) => {
                handleEditChange(e);
                setCursoParaEditar(prev => ({
                  ...prev,
                  descricao_formador: e.target.value ? prev.descricao_formador : "",
                  // Atualiza automaticamente o tipo e vagas quando muda o formador
                  tipo: e.target.value ? "sincrono" : "assincrono",
                  vagas: e.target.value ? (prev.vagas || 1) : null
                }));
              }}
            >
              <option value="">Nenhum formador (curso assíncrono)</option>
              {formadores.map((formador) => (
                <option key={formador.id_utilizador} value={formador.id_utilizador}>
                  {formador.nome}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {cursoParaEditar.id_formador && (
            <Form.Group className="mb-2">
              <Form.Label>Descrição do Formador:</Form.Label>
              <Form.Control
                as="textarea"
                name="descricao_formador"
                value={cursoParaEditar.descricao_formador || ""}
                onChange={handleEditChange}
                placeholder="Informações sobre o formador para os alunos"
              />
            </Form.Group>
          )}

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
            <Form.Label>Vagas {cursoParaEditar.id_formador && "(obrigatório)"}:</Form.Label>
            <Form.Control
              type="number"
              name="vagas"
              value={cursoParaEditar.vagas || ""}
              onChange={handleEditChange}
              min="1"
              required={!!cursoParaEditar.id_formador}
              disabled={
                !cursoParaEditar.id_formador || 
                new Date() > new Date(cursoParaEditar.data_inicio)
              }
              placeholder={
                cursoParaEditar.id_formador 
                  ? new Date() > new Date(cursoParaEditar.data_inicio)
                    ? "Edição bloqueada (curso iniciado)"
                    : ""
                  : "Ilimitado (curso assíncrono)"
              }
            />
            {new Date() > new Date(cursoParaEditar.data_inicio) && (
              <Form.Text className="text-danger">
                As vagas não podem ser alteradas após a data de início do curso
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Ficheiro (opcional):</Form.Label>
            <Form.Control 
              type="file" 
              name="ficheiro" 
              onChange={(e) => {
                setCursoParaEditar(prev => ({
                  ...prev,
                  ficheiro: e.target.files[0]
                }));
              }} 
            />
          </Form.Group>
        </Form>
      )}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowEditModal(false)}>
        Cancelar
      </Button>
      <Button 
        variant="primary" 
        onClick={handleUpdateCurso}
        disabled={new Date() > new Date(cursoParaEditar.data_inicio)}
        title={new Date() > new Date(cursoParaEditar.data_inicio) ? "O curso já começou e não pode ser editado" : ""}
      >
        Guardar Alterações
      </Button>
    </Modal.Footer>
  </Modal>
)}
         
      </div>
    </div>
  );
};

export default ListarCursos;