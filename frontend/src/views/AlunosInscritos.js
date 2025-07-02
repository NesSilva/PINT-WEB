import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarFormador from "../components/SidebarFormador";
import { useLocation, useParams, useNavigate } from "react-router-dom";

const AvaliarAlunos = () => {
  const { id_curso } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, curso } = location.state || {};

  const [inscritos, setInscritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Estado do modal
  const [modalAberto, setModalAberto] = useState(false);
  const [avaliacao, setAvaliacao] = useState(""); // nota_curso
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

 useEffect(() => {
  const fetchInscritos = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/inscricoes/curso/${id_curso}`);

      console.log("Dados recebidos:", res.data);
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


  if (!user) {
    return <p>Erro: usuário não identificado.</p>;
  }

  const abrirModal = (aluno) => {
    setAlunoSelecionado(aluno);
    setAvaliacao(""); // resetar campo ao abrir modal
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
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

    setLoading(true);
    const res = await axios.get(`http://localhost:3000/api/progressos/curso/${id_curso}`);
    setInscritos(res.data);
    setLoading(false);
  } catch (err) {
    alert("Erro ao registrar avaliação.");
    console.error(err);
  }
};


 return (
  <div className="d-flex">
    <SidebarFormador user={user} />
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>Voltar</button>
      <h2>Alunos inscritos no curso: {curso?.titulo || id_curso}</h2>

      {loading ? (
        <p>Carregando alunos...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : inscritos.length === 0 ? (
        <p>Nenhum aluno inscrito neste curso.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Morada</th>
              <th>Nota</th>
              <th>Ação</th> 
            </tr>
          </thead>
          <tbody>
            {inscritos.map(({ id_inscricao, status, utilizador, progresso }) => (
              <tr key={id_inscricao}>
                <td>{utilizador?.id_utilizador}</td>
                <td>{utilizador?.nome}</td>
                <td>{utilizador?.email}</td>
                <td>{utilizador?.morada}</td>
                <td>
                {progresso ? (
                    <div>
                    <span className="badge bg-success">{progresso.nota_curso}%</span>
                    <small className="text-muted">(Curso: {progresso.id_curso})</small>
                    </div>
                ) : (
                    <span className="badge bg-secondary">Sem nota</span>
                )}
                </td>
                                <td>
                  {progresso == null || progresso.nota_curso == null ? (
  <button
    className="btn btn-sm btn-primary"
    onClick={() => abrirModal({ utilizador })}
  >
    Avaliar
  </button>
) : null}

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

        {/* Modal simples */}
        {modalAberto && (
          <div
            className="modal-backdrop"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1050,
            }}
          >
            <div
              className="modal-content"
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                minWidth: "300px",
              }}
            >
              <h5>Avaliar aluno: {alunoSelecionado?.utilizador.nome}</h5>
              <label>Nota (0 a 100): </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={avaliacao}
                onChange={(e) => setAvaliacao(e.target.value)}
                className="form-control mb-3"
              />
              <button className="btn btn-success me-2" onClick={enviarAvaliacao}>
                Salvar
              </button>
              <button className="btn btn-secondary" onClick={fecharModal}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvaliarAlunos;
