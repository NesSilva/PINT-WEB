import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarFormador from "../components/SidebarFormador";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Modal, Button, Badge } from "react-bootstrap";

const AvaliarAlunos = () => {
  const { id_curso } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, curso } = location.state || {};

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
    const fetchInscritos = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/inscricoes/curso/${id_curso}`);
        setInscritos(res.data);
      } catch (err) {
        console.error(err);
        setError("Erro ao buscar alunos inscritos.");
      } finally {
        setLoading(false);
      }
    };

    fetchInscritos();
  }, [id_curso]);

  const buscarDocumentosAluno = async (id_utilizador) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/documentos-avaliacao/utilizador/${id_utilizador}/curso/${id_curso}`
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
      await axios.post("http://localhost:3000/api/progressos", {
        id_utilizador: alunoSelecionado.utilizador.id_utilizador,
        id_curso,
        nota_curso: parseFloat(avaliacao),
      });

      alert("Avaliação registrada com sucesso!");
      fecharModal();

      // Atualizar lista de inscritos
      setLoading(true);
      const res = await axios.get(`http://localhost:3000/api/inscricoes/curso/${id_curso}`);
      setInscritos(res.data);
      setLoading(false);
    } catch (err) {
      alert("Erro ao registrar avaliação.");
      console.error(err);
    }
  };

  if (!user) {
    return <p>Erro: usuário não identificado.</p>;
  }

  return (
    <div className="d-flex">
      <SidebarFormador user={user} />
      <div className="container mt-4">
        <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
          Voltar
        </button>
        <h2>Alunos inscritos no curso: {curso?.titulo || id_curso}</h2>

        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p>Carregando alunos...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : inscritos.length === 0 ? (
          <div className="alert alert-info">Nenhum aluno inscrito neste curso.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
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
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => abrirModalDocumentos({ utilizador })}
                      >
                        <i className="bi bi-folder"></i> Ver Documentos
                      </button>
                    </td>
                    <td>
                      {progresso?.nota_curso != null ? (
                        <Badge bg={progresso.nota_curso >= 50 ? "success" : "danger"}>
                          {progresso.nota_curso}%
                        </Badge>
                      ) : (
                        <Badge bg="secondary">Não avaliado</Badge>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => abrirModalAvaliacao({ utilizador })}
                      >
                        <i className="bi bi-pencil"></i> Avaliar
                      </button>
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
            <Modal.Title>Avaliar Aluno</Modal.Title>
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
              Documentos enviados por: {alunoSelecionado?.utilizador.nome}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            ) : documentosAluno.length === 0 ? (
              <div className="alert alert-info">Nenhum documento enviado.</div>
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
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary me-2"
                        >
                          <i className="bi bi-eye"></i> Visualizar
                        </a>
                        <a
                          href={doc.url}
                          download
                          className="btn btn-sm btn-outline-secondary"
                        >
                          <i className="bi bi-download"></i> Baixar
                        </a>
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
      </div>
    </div>
  );
};

export default AvaliarAlunos;