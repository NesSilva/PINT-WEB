import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import SidebarFormando from "../components/SidebarFormando";

const MeusCursos = () => {
  const location = useLocation();
  const { user } = location.state || {};
  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursos, setCursos] = useState([]);
  const [progressoCursos, setProgressoCursos] = useState([]);

  useEffect(() => {
    const userId = user?.id_utilizador || localStorage.getItem("usuarioId");

    if (!userId) {
      console.error("ID do utilizador não encontrado.");
      return;
    }

    axios.get(`http://localhost:3000/api/inscricoes/${userId}`)
      .then(res => {
        if (res.data.success) {
          setInscricoes(res.data.inscricoes);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetchCursos();

    axios.get(`http://localhost:3000/api/progressos/utilizador/${userId}`)
      .then(res => setProgressoCursos(res.data))
      .catch(console.error);

  }, [user]);

  const fetchCursos = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/cursos/todos");
      setCursos(res.data);
    } catch (err) {
      console.error("Erro ao buscar cursos:", err);
    }
  };

  const getTituloCurso = (id_curso) => {
    const curso = cursos.find((c) => c.id_curso === id_curso);
    return curso ? curso.titulo : "Desconhecido";
  };

  const getNotaCurso = (id_curso) => {
    const progresso = progressoCursos.find(p => p.id_curso === id_curso);
    return progresso ? progresso.nota_curso : null;
  };

  // Função para formatar a nota com segurança
  const formatNota = (nota) => {
    const n = Number(nota);
    if (isNaN(n)) return "N/A";
    return n.toFixed(2);
  };

  // Função para gerar certificado e fazer download do PDF
  const gerarCertificado = async (id_curso) => {
    const userId = user?.id_utilizador || localStorage.getItem("usuarioId");

    try {
      // Inserir certificado na base de dados
      const res = await axios.post("http://localhost:3000/api/certificados", {
        id_utilizador: userId,
        id_curso,
      });

      if (res.data.success) {
        alert("Certificado gerado com sucesso!");
        // Fazer download do PDF do certificado
        const url = `http://localhost:3000/api/certificados/pdf?user=${userId}&curso=${id_curso}`;
        window.open(url, "_blank");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        alert("Você já tem um certificado para este curso.");
      } else {
        alert("Erro ao gerar certificado.");
      }
    }
  };

  if (loading) return <div>Carregando cursos...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: "#f7f9fc" }}>
      <SidebarFormando />
      <div style={{ flex: 1, padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>Minhas Inscrições</h2>
        {inscricoes.length === 0 ? (
          <p style={{ fontSize: "1.1rem", color: "#555" }}>Você ainda não está inscrito em nenhum curso.</p>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {inscricoes.map((inscricao) => {
              const nota = getNotaCurso(inscricao.id_curso);
              return (
                <div
                  key={inscricao.id_inscricao}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "1.5rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transition: "box-shadow 0.3s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"}
                >
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "#34495e" }}>{getTituloCurso(inscricao.id_curso)}</h3>
                  <p style={{ margin: "0.25rem 0", color: "#7f8c8d" }}>
                    <strong>ID Curso:</strong> {inscricao.id_curso}
                  </p>
                  <p style={{ margin: "0.25rem 0", color: "#7f8c8d" }}>
                    <strong>Data de Inscrição:</strong> {new Date(inscricao.data_inscricao).toLocaleDateString()}
                  </p>
                  <p style={{ margin: "0.25rem 0", color: "#7f8c8d" }}>
                    <strong>Horas de trabalho:</strong> {inscricao.horas_curso}
                  </p>
                  {nota !== null && (
                    <>
                      <p
                        style={{
                          margin: "0.5rem 0 0 0",
                          fontWeight: "600",
                          color: Number(nota) >= 70 ? "#27ae60" : "#c0392b",
                        }}
                      >
                        Nota do Curso: {formatNota(nota)}%
                      </p>
                      <button
                        style={{
                          marginTop: "1rem",
                          padding: "0.5rem 1rem",
                          borderRadius: "4px",
                          border: "none",
                          backgroundColor: "#2980b9",
                          color: "white",
                          cursor: "pointer",
                        }}
                        onClick={() => gerarCertificado(inscricao.id_curso)}
                      >
                        Gerar Certificado
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeusCursos;
