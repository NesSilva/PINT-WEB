import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { FaTrash, FaEdit, FaSync, FaPlus } from "react-icons/fa";
import "../css/ListarCursos.css";

const ListarCursos = () => {
  // Estados para dados
  const [cursos, setCursos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [formadores, setFormadores] = useState([]);

  // Estados para modais
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cursoParaEditar, setCursoParaEditar] = useState(null);
  const [showReativarModal, setShowReativarModal] = useState(false); 
  const [cursoParaReativar, setCursoParaReativar] = useState(null); 

  // Estados para reativação
  const [novaDataInicio, setNovaDataInicio] = useState("");
  const [novaDataFim, setNovaDataFim] = useState("")

  // Estados para formulários
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

  // Estados para feedback e filtros
  const [message, setMessage] = useState({ text: "", type: "" });
  const [filtros, setFiltros] = useState({
    nomeFormador: "",
    dataInicio: "",
    dataFim: ""
  });

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [cursosRes, categoriasRes, areasRes, formadoresRes] = await Promise.all([
          axios.get("http://localhost:3000/api/cursos/todos"),
          axios.get('http://localhost:3000/api/categorias'),
          axios.get('http://localhost:3000/api/areas-formacao'),
          axios.get('http://localhost:3000/api/utilizadores/formadores').catch(() => ({ data: { formadores: [] } }))
        ]);

        setCursos(cursosRes.data);
        setCategorias(categoriasRes.data.categorias || []);
        setAreas(areasRes.data.areas || []);
        setFormadores(formadoresRes.data.formadores || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        mostrarMensagem("Erro ao carregar dados", "error");
      }
    };

    carregarDados();
  }, []);

  // Funções auxiliares
  const mostrarMensagem = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
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
      descricao_formador: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCursoParaEditar(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, ficheiro: e.target.files[0] }));
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const limparFiltros = () => {
    setFiltros({
      nomeFormador: "",
      dataInicio: "",
      dataFim: ""
    });
  };

  const handleReativarCurso = async () => {
    try {
        const response = await axios.put(
            `http://localhost:3000/api/cursos/reativar/${cursoParaReativar.id_curso}`,
            {
                nova_data_inicio: novaDataInicio,
                nova_data_fim: novaDataFim
            }
        );

        mostrarMensagem("Curso reativado com sucesso!", "success");
        setCursos(prev => prev.map(c => 
            c.id_curso === cursoParaReativar.id_curso ? response.data.curso : c
        ));
        setShowReativarModal(false);
        setNovaDataInicio("");
        setNovaDataFim("");
    } catch (error) {
        console.error("Erro ao reativar curso:", error);
        mostrarMensagem(error.response?.data?.message || "Erro ao reativar curso", "error");
    }
  };

  // Operações CRUD
  const criarCurso = async (e) => {
    e.preventDefault();
    
    try {
      const dadosCurso = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        id_categoria: formData.id_categoria,
        id_area: formData.id_area,
        id_formador: formData.id_formador || null,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        vagas: formData.vagas,
        descricao_formador: formData.id_formador ? formData.descricao_formador : null
      };

      const response = await axios.post("http://localhost:3000/api/cursos/criar", dadosCurso);
      
      if (formData.ficheiro) {
        await enviarArquivo(response.data.curso.id_curso, formData.ficheiro);
      }

      mostrarMensagem("Curso criado com sucesso!", "success");
      setCursos(prev => [...prev, response.data.curso]);
      setShowModal(false);
      resetFormData();
    } catch (error) {
      console.error("Erro ao criar curso:", error);
      const errorMsg = error.response?.data?.message || "Erro ao criar curso";
      mostrarMensagem(errorMsg, "error");
    }
  };

  const atualizarCurso = async () => {
    try {
      const hoje = new Date();
      const dataInicio = new Date(cursoParaEditar.data_inicio);
      
      if (hoje > dataInicio) {
        mostrarMensagem("Não é possível editar após o início do curso", "error");
        return;
      }

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

      if (cursoParaEditar.ficheiro) {
        await enviarArquivo(cursoParaEditar.id_curso, cursoParaEditar.ficheiro);
      }

      mostrarMensagem("Curso atualizado com sucesso!", "success");
      setCursos(prev => prev.map(c => 
        c.id_curso === cursoParaEditar.id_curso ? { ...c, ...dadosAtualizados } : c
      ));
      setShowEditModal(false);
    } catch (error) {
      console.error("Erro ao atualizar curso:", error);
      mostrarMensagem(error.response?.data?.message || "Erro ao atualizar curso", "error");
    }
  };

  const deletarCurso = async (id) => {
    try {
      // Verificar o estado do curso antes de deletar
      const curso = cursos.find(c => c.id_curso === id);
      
      if (!curso) {
        mostrarMensagem("Curso não encontrado", "error");
        return;
      }

      if (curso.estado === 'em_curso' || curso.estado === 'terminado') {
        mostrarMensagem("Não é possível eliminar cursos em andamento ou terminados", "error");
        return;
      }

      await axios.delete(`http://localhost:3000/api/cursos/eliminar/${id}`);
      mostrarMensagem("Curso eliminado com sucesso!", "success");
      setCursos(prev => prev.filter(c => c.id_curso !== id));
    } catch (error) {
      console.error("Erro ao eliminar curso:", error);
      mostrarMensagem("Erro ao eliminar curso", "error");
    }
  };

  const enviarArquivo = async (idCurso, arquivo) => {
    const formDataArquivo = new FormData();
    formDataArquivo.append("file", arquivo);
    formDataArquivo.append("id_curso", idCurso);
    formDataArquivo.append("tipo_conteudo", "material");
    formDataArquivo.append("descricao", "Material do curso");

    await axios.post("http://localhost:3000/api/conteudo/adicionar", formDataArquivo, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  };

  // Filtragem de cursos
  const cursosFiltrados = cursos.filter(curso => {
    const nomeMatch = curso.nome_formador?.toLowerCase().includes(filtros.nomeFormador.toLowerCase());
    const dataInicioMatch = filtros.dataInicio ? curso.data_inicio?.startsWith(filtros.dataInicio) : true;
    const dataFimMatch = filtros.dataFim ? curso.data_fim?.startsWith(filtros.dataFim) : true;
    return nomeMatch && dataInicioMatch && dataFimMatch;
  });

  // Função para renderizar as ações da tabela
  const renderAcoesCell = (curso) => {
    const podeEditar = curso.estado === 'agendado';
    const podeExcluir = curso.estado === 'agendado';
    const podeReativar = curso.estado === 'terminado';

    return (
      <>
        {/* Botão Excluir - só aparece se podeExcluir */}
        {podeExcluir && (
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={() => deletarCurso(curso.id_curso)}
            className="acao-btn"
            title="Excluir"
          >
            <FaTrash />
          </Button>
        )}
        
        {/* Botão Editar */}
        <Button 
          variant="outline-warning" 
          size="sm" 
          onClick={() => {
            setCursoParaEditar({
              ...curso,
              data_inicio: formatarDataParaInput(curso.data_inicio),
              data_fim: formatarDataParaInput(curso.data_fim)
            });
            setShowEditModal(true);
          }}
          disabled={!podeEditar}
          className="acao-btn"
          title={!podeEditar ? "Edição bloqueada após início" : "Editar"}
        >
          <FaEdit />
        </Button>
        
        {/* Botão Reativar - só aparece se podeReativar */}
        {podeReativar && (
          <Button 
            variant="outline-success" 
            size="sm"
            onClick={() => {
              setCursoParaReativar(curso);
              setNovaDataInicio("");
              setNovaDataFim("");
              setShowReativarModal(true);
            }}
            className="acao-btn"
            title="Reativar"
          >
            <FaSync />
          </Button>
        )}
      </>
    );
  };

  // Renderização
  return (
    <div className="listar-cursos-container">
      <Sidebar />

      <main className="main-content">
        <header className="page-header">
          <h1>Lista de Cursos</h1>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Criar Curso
          </Button>
        </header>

        {/* Filtros */}
        <section className="filtros-section">
          <div className="filtros-grid">
            <Form.Group>
              <Form.Label>Filtrar por Formador:</Form.Label>
              <Form.Control
                type="text"
                name="nomeFormador"
                value={filtros.nomeFormador}
                onChange={handleFiltroChange}
                placeholder="Nome do formador"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Data de Início:</Form.Label>
              <Form.Control
                type="date"
                name="dataInicio"
                value={filtros.dataInicio}
                onChange={handleFiltroChange}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Data de Fim:</Form.Label>
              <Form.Control
                type="date"
                name="dataFim"
                value={filtros.dataFim}
                onChange={handleFiltroChange}
              />
            </Form.Group>

            <Button variant="outline-secondary" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
          </div>
        </section>

        {/* Tabela de Cursos */}
        <div className="table-responsive">
          <table className="cursos-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Formador</th>
                <th>Data Início</th>
                <th>Data Fim</th>
                <th>Estado</th>
                <th>Vagas</th>
                <th>Tipo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {cursosFiltrados.length > 0 ? (
                cursosFiltrados.map(curso => (
                  <tr key={curso.id_curso}>
                    <td>{curso.titulo}</td>
                    <td>{curso.nome_formador || "-"}</td>
                    <td>{formatarData(curso.data_inicio)}</td>
                    <td>{formatarData(curso.data_fim)}</td>
                    <td>
                      <span className={`badge estado-${curso.estado}`}>
                        {formatarEstado(curso.estado)}
                      </span>
                    </td>
                    <td>{curso.vagas ?? "Ilimitado"}</td>
                    <td>{curso.tipo === 'sincrono' ? 'Síncrono' : 'Assíncrono'}</td>
                    <td className="acoes-cell">
                      {renderAcoesCell(curso)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    Nenhum curso encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de Criação */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Criar Novo Curso</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {message.text && (
              <Alert variant={message.type} dismissible onClose={() => setMessage({ text: "", type: "" })}>
                {message.text}
              </Alert>
            )}
            <Form onSubmit={criarCurso}>
              <div className="form-row">
                <Form.Group className="col-md-6">
                  <Form.Label>Título *</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="titulo" 
                    value={formData.titulo} 
                    onChange={handleChange} 
                    required 
                  />
                </Form.Group>

                <Form.Group className="col-md-6">
                  <Form.Label>Categoria *</Form.Label>
                  <Form.Select
                    name="id_categoria"
                    value={formData.id_categoria}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione...</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id_categoria} value={categoria.id_categoria}>
                        {categoria.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <Form.Group>
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                />
              </Form.Group>

              <div className="form-row">
                <Form.Group className="col-md-6">
                  <Form.Label>Área *</Form.Label>
                  <Form.Select
                    name="id_area"
                    value={formData.id_area}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione...</option>
                    {areas.map(area => (
                      <option key={area.id_area} value={area.id_area}>
                        {area.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="col-md-6">
                  <Form.Label>Formador</Form.Label>
                  <Form.Select
                    name="id_formador"
                    value={formData.id_formador}
                    onChange={(e) => {
                      handleChange(e);
                      setFormData(prev => ({
                        ...prev,
                        vagas: e.target.value ? prev.vagas || 1 : null
                      }));
                    }}
                  >
                    <option value="">Nenhum (curso assíncrono)</option>
                    {formadores.map(formador => (
                      <option key={formador.id_utilizador} value={formador.id_utilizador}>
                        {formador.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              {formData.id_formador && (
                <>
                  <Form.Group>
                    <Form.Label>Descrição do Formador</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="descricao_formador"
                      value={formData.descricao_formador}
                      onChange={handleChange}
                      placeholder="Informações sobre o formador"
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Vagas *</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      name="vagas"
                      value={formData.vagas || ""}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </>
              )}

              <div className="form-row">
                <Form.Group className="col-md-6">
                  <Form.Label>Data de Início *</Form.Label>
                  <Form.Control
                    type="date"
                    name="data_inicio"
                    value={formData.data_inicio}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="col-md-6">
                  <Form.Label>Data de Fim *</Form.Label>
                  <Form.Control
                    type="date"
                    name="data_fim"
                    value={formData.data_fim}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </div>

              <Form.Group>
                <Form.Label>Material do Curso (opcional)</Form.Label>
                <Form.Control
                  type="file"
                  name="ficheiro"
                  onChange={handleFileChange}
                />
              </Form.Group>

              <div className="modal-footer-buttons">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Salvar Curso
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Modal de Reativação */}
        <Modal show={showReativarModal} onHide={() => setShowReativarModal(false)}>
          <Modal.Header closeButton>
              <Modal.Title>Reativar Curso</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <Form>
                  <Form.Group>
                      <Form.Label>Nova Data de Início *</Form.Label>
                      <Form.Control
                          type="date"
                          name="nova_data_inicio"
                          value={novaDataInicio}
                          onChange={(e) => setNovaDataInicio(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          required
                      />
                  </Form.Group>
                  <Form.Group>
                      <Form.Label>Nova Data de Fim *</Form.Label>
                      <Form.Control
                          type="date"
                          name="nova_data_fim"
                          value={novaDataFim}
                          onChange={(e) => setNovaDataFim(e.target.value)}
                          min={novaDataInicio || new Date().toISOString().split('T')[0]}
                          required
                      />
                  </Form.Group>
              </Form>
          </Modal.Body>
          <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowReativarModal(false)}>
                  Cancelar
              </Button>
              <Button 
                  variant="primary" 
                  onClick={handleReativarCurso}
                  disabled={!novaDataInicio || !novaDataFim}
              >
                  Reativar Curso
              </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de Edição */}
        {cursoParaEditar && (
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Editar Curso</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {message.text && (
                <Alert variant={message.type} dismissible onClose={() => setMessage({ text: "", type: "" })}>
                  {message.text}
                </Alert>
              )}
              <Form>
                <div className="form-row">
                  <Form.Group className="col-md-6">
                    <Form.Label>Título *</Form.Label>
                    <Form.Control
                      type="text"
                      name="titulo"
                      value={cursoParaEditar.titulo}
                      onChange={handleEditChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="col-md-6">
                    <Form.Label>Categoria *</Form.Label>
                    <Form.Select
                      name="id_categoria"
                      value={cursoParaEditar.id_categoria}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="">Selecione...</option>
                      {categorias.map(categoria => (
                        <option key={categoria.id_categoria} value={categoria.id_categoria}>
                          {categoria.nome}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                <Form.Group>
                  <Form.Label>Descrição</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descricao"
                    value={cursoParaEditar.descricao}
                    onChange={handleEditChange}
                  />
                </Form.Group>

                <div className="form-row">
                  <Form.Group className="col-md-6">
                    <Form.Label>Área *</Form.Label>
                    <Form.Select
                      name="id_area"
                      value={cursoParaEditar.id_area}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="">Selecione...</option>
                      {areas.map(area => (
                        <option key={area.id_area} value={area.id_area}>
                          {area.nome}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="col-md-6">
                    <Form.Label>Formador</Form.Label>
                    <Form.Select
                      name="id_formador"
                      value={cursoParaEditar.id_formador || ""}
                      onChange={(e) => {
                        handleEditChange(e);
                        setCursoParaEditar(prev => ({
                          ...prev,
                          vagas: e.target.value ? (prev.vagas || 1) : null,
                          tipo: e.target.value ? "sincrono" : "assincrono"
                        }));
                      }}
                    >
                      <option value="">Nenhum (curso assíncrono)</option>
                      {formadores.map(formador => (
                        <option key={formador.id_utilizador} value={formador.id_utilizador}>
                          {formador.nome}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                {cursoParaEditar.id_formador && (
                  <>
                    <Form.Group>
                      <Form.Label>Descrição do Formador</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="descricao_formador"
                        value={cursoParaEditar.descricao_formador || ""}
                        onChange={handleEditChange}
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Vagas *</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        name="vagas"
                        value={cursoParaEditar.vagas || ""}
                        onChange={handleEditChange}
                        required
                        disabled={new Date() > new Date(cursoParaEditar.data_inicio)}
                      />
                      {new Date() > new Date(cursoParaEditar.data_inicio) && (
                        <Form.Text className="text-warning">
                          Vagas não podem ser alteradas após o início do curso
                        </Form.Text>
                      )}
                    </Form.Group>
                  </>
                )}

                <div className="form-row">
                  <Form.Group className="col-md-6">
                    <Form.Label>Data de Início *</Form.Label>
                    <Form.Control
                      type="date"
                      name="data_inicio"
                      value={cursoParaEditar.data_inicio || ""}
                      onChange={handleEditChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="col-md-6">
                    <Form.Label>Data de Fim *</Form.Label>
                    <Form.Control
                      type="date"
                      name="data_fim"
                      value={cursoParaEditar.data_fim || ""}
                      onChange={handleEditChange}
                      required
                    />
                  </Form.Group>
                </div>

                <Form.Group>
                  <Form.Label>Material do Curso (opcional)</Form.Label>
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

                <div className="modal-footer-buttons">
                  <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={atualizarCurso}
                    disabled={new Date() > new Date(cursoParaEditar.data_inicio)}
                  >
                    Salvar Alterações
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
        )}
      </main>
    </div>
  );
};

// Funções auxiliares de formatação
const formatarData = (data) => {
  if (!data) return "-";
  return new Date(data).toLocaleDateString('pt-PT');
};

const formatarDataParaInput = (data) => {
  if (!data) return "";
  return data.split('T')[0];
};

const formatarEstado = (estado) => {
  const estados = {
    'agendado': 'Agendado',
    'em_curso': 'Em Curso',
    'terminado': 'Terminado'
  };
  return estados[estado] || estado;
};

export default ListarCursos;