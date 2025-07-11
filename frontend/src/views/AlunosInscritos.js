import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarFormador from "../components/SidebarFormador";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Modal, Button, Badge, Alert, Spinner } from "react-bootstrap";
import { FaArrowLeft, FaFileAlt, FaEye, FaDownload, FaPencilAlt, FaFolder, FaChalkboardTeacher } from "react-icons/fa";
import "../css/AvaliarAlunos.css";

const AvaliarAlunos = () => {
  const { id_curso } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Obter user do localStorage em vez de location.state
  const [user, setUser] = useState(null);
  const [curso, setCurso] = useState(null);
  const [inscritos, setInscritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Estados para modais
  const [modalAvaliacaoAberto, setModalAvaliacaoAberto] = useState(false);
  const [modalDocumentosAberto, setModalDocumentosAberto] = useState(false);
  const [avaliacao, setAvaliacao] = useState("");
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [documentosAluno, setDocumentosAluno] = useState([]);

  useEffect(() => {
    // Carregar user do localStorage
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('usuarioId');
        if (storedUser) {
          // Tenta parsear como JSON (caso seja um objeto)
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (e) {
        console.error("Erro ao carregar usuário:", e);
      }
    };

    loadUser();

    // Se veio de location.state, usar esses dados também
    if (location.state?.user) {
      setUser(location.state.user);
    }
    if (location.state?.curso) {
      setCurso(location.state.curso);
    } else {
      // Se não veio com state, buscar curso da API
      fetchCurso();
    }

    fetchInscritos();
  }, [id_curso, location.state]);

  const fetchCurso = async () => {
    try {
      const res = await axios.get(`https://frontend-z8p8.onrender.com/api/cursos/${id_curso}`);
      setCurso(res.data);
    } catch (err) {
      console.error("Erro ao buscar curso:", err);
      setError("Erro ao carregar informações do curso");
    }
  };

  const fetchInscritos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://frontend-z8p8.onrender.com/api/inscricoes/curso/${id_curso}`);
      setInscritos(res.data);
    } catch (err) {
      console.error(err);
      setError("Erro ao buscar alunos inscritos.");
    } finally {
      setLoading(false);
    }
  };

  const buscarDocumentosAluno = async (id_utilizador) => {
    try {
      const res = await axios.get(
        `https://frontend-z8p8.onrender.com/api/documentos-avaliacao/utilizador/${id_utilizador}/curso/${id_curso}`
      );
      return res.data;
    } catch (err) {
      console.error("Erro ao buscar documentos:", err);
      return [];
    }
  };

  const abrirModalAvaliacao = (aluno) => {
    setAlunoSelecionado(aluno);
    setAvaliacao("");
    setModalAvaliacaoAberto(true);
  };

  const abrirModalDocumentos = async (aluno) => {
    setAlunoSelecionado(aluno);
    setLoading(true);
    try {
      const documentos = await buscarDocumentosAluno(aluno.utilizador.id_utilizador);
      setDocumentosAluno(documentos);
      setModalDocumentosAberto(true);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar documentos");
    } finally {
      setLoading(false);
    }
  };

  const fecharModal = () => {
    setModalAvaliacaoAberto(false);
    setModalDocumentosAberto(false);
    setAlunoSelecionado(null);
  };

  const enviarAvaliacao = async () => {
    if (!avaliacao || isNaN(avaliacao) || avaliacao < 0 || avaliacao > 100) {
      alert("Por favor, insira uma nota válida entre 0 e 100.");
      return;
    }

    try {
      await axios.post("https://frontend-z8p8.onrender.com/api/progressos", {
        id_utilizador: alunoSelecionado.utilizador.id_utilizador,
        id_curso,
        nota_curso: parseFloat(avaliacao),
      });

      alert("Avaliação registrada com sucesso!");
      fecharModal();

      // Atualizar lista de inscritos
      setLoading(true);
      const res = await axios.get(`https://frontend-z8p8.onrender.com/api/inscricoes/curso/${id_curso}`);
      setInscritos(res.data);
      setLoading(false);
    } catch (err) {
      alert("Erro ao registrar avaliação.");
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="avaliar-alunos-container">
        <SidebarFormador />
        <main className="main-content">
          <Alert variant="danger" className="status-message">
            Erro: usuário não identificado. Por favor, faça login novamente.
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="avaliar-alunos-container">
      <SidebarFormador user={user} />
      
      <main className="main-content">
        <div className="page-header">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate(-1)}
            className="back-button"
          >
            <FaArrowLeft className="button-icon" /> Voltar
          </Button>
          
          <div className="header-title">
            <FaChalkboardTeacher className="header-icon" />
            <h2>Alunos inscritos no curso: {curso?.titulo || id_curso}</h2>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="status-message">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="loading-container">
            <Spinner animation="border" role="status" />
            <p>Carregando alunos...</p>
          </div>
        ) : inscritos.length === 0 ? (
          <div className="alert alert-info no-results-message">
            <FaFolder className="no-results-icon" />
            Nenhum aluno inscrito neste curso.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="alunos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Documentos</th>
                  <th>Nota</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {inscritos.map(({ id_inscricao, utilizador, progresso }) => (
                  <tr key={id_inscricao}>
                    <td>{utilizador?.id_utilizador}</td>
                    <td>{utilizador?.nome}</td>
                    <td>{utilizador?.email}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => abrirModalDocumentos({ utilizador })}
                        className="action-btn"
                      >
                        <FaFileAlt className="button-icon" /> Documentos
                      </Button>
                    </td>
                    <td>
                      {progresso?.nota_curso != null ? (
                        <Badge 
                          pill 
                          bg={progresso.nota_curso >= 50 ? "success" : "danger"}
                          className="nota-badge"
                        >
                          {progresso.nota_curso}%
                        </Badge>
                      ) : (
                        <Badge pill bg="secondary" className="nota-badge">
                          Não avaliado
                        </Badge>
                      )}
                    </td>
                    <td>
                      <Button
                        variant={progresso?.nota_curso != null ? "outline-success" : "primary"}
                        size="sm"
                        onClick={() => abrirModalAvaliacao({ utilizador })}
                        className="action-btn"
                        disabled={progresso?.nota_curso != null}
                        title={progresso?.nota_curso != null ? "Aluno já avaliado" : "Avaliar aluno"}
                      >
                        <FaPencilAlt className="button-icon" /> 
                        {progresso?.nota_curso != null ? "Editar" : "Avaliar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de Avaliação */}
        <Modal show={modalAvaliacaoAberto} onHide={fecharModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              <FaPencilAlt className="modal-icon" /> 
              Avaliar Aluno
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5>Aluno: {alunoSelecionado?.utilizador.nome}</h5>
            <div className="mb-3">
              <label className="form-label">Nota (0 a 100):</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={avaliacao}
                onChange={(e) => setAvaliacao(e.target.value)}
                className="form-control"
                placeholder="Digite a nota do aluno"
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={fecharModal}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={enviarAvaliacao}>
              Salvar Avaliação
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de Documentos */}
        <Modal show={modalDocumentosAberto} onHide={fecharModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              <FaFolder className="modal-icon" /> 
              Documentos enviados por: {alunoSelecionado?.utilizador.nome}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {loading ? (
              <div className="loading-container">
                <Spinner animation="border" role="status" />
              </div>
            ) : documentosAluno.length === 0 ? (
              <div className="alert alert-info">
                Nenhum documento enviado.
              </div>
            ) : (
              <div className="list-group">
                {documentosAluno.map((doc) => (
                  <div key={doc.id_Doc_Avaliacao} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6>{doc.descricao || "Documento sem descrição"}</h6>
                        <small className="text-muted">
                          Enviado em: {new Date(doc.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <div>
                        <Button
                          variant="outline-primary"
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="me-2"
                        >
                          <FaEye className="button-icon" /> Visualizar
                        </Button>
                        <Button
                          variant="outline-secondary"
                          href={doc.url}
                          download
                        >
                          <FaDownload className="button-icon" /> Baixar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={fecharModal}>
              Fechar
            </Button>
          </Modal.Footer>
        </Modal>
      </main>
    </div>
  );
};

export default AvaliarAlunos;