import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarFormando from "../components/SidebarFormando";

const MeusCursos = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state || {};
  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursos, setCursos] = useState([]);
  const [progressoCursos, setProgressoCursos] = useState([]);
  const [MCursos, setMCursos] = useState([]);
  

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

  useEffect(() => {
      const fetchData = async () => {
        try {
          const [cursosRes] = await Promise.all([
            axios.get('http://localhost:3000/api/cursos'),
          ]);
  
  
          const agendados = (cursosRes.data?.data || []);
          setMCursos(agendados);
        } catch (error) {
          console.error('Erro ao buscar dados:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);
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

  const getDataInicioCurso = (id_curso) => {
    const curso = cursos.find((c) => c.id_curso === id_curso);
    return curso ? curso.data_inicio : "Desconhecido";
  };
    const getDataFimCurso = (id_curso) => {
    const curso = cursos.find((c) => c.id_curso === id_curso);
    return curso ? curso.data_fim : "Desconhecido";
  };
  
  

  const getNotaCurso = (id_curso) => {
    const progresso = progressoCursos.find(p => p.id_curso === id_curso);
    return progresso ? progresso.nota_curso : null;
  };

 const getTipoCurso = (id_curso) => {
  const curso = cursos.find((c) => c.id_curso === id_curso);
  return curso ? (curso.tipo || curso.tipo_curso || "Desconhecido") : "Desconhecido";
};

  const formatNota = (nota) => {
    const n = Number(nota);
    if (isNaN(n)) return "N/A";
    return n.toFixed(2);
  };

  const formatarData = (dataString) => {
  if (!dataString || dataString === "Desconhecido") return "Desconhecido";
  
  try {
    const date = new Date(dataString);
    if (isNaN(date.getTime())) return "Data inválida";
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch {
    return "Data inválida";
  }
};

  const gerarCertificado = async (id_curso) => {
  const userId = user?.id_utilizador || localStorage.getItem("usuarioId");

  try {
    const res = await axios.post("http://localhost:3000/api/certificados", {
      id_utilizador: userId,
      id_curso,
    });
    

    // Independente de ser novo ou existente, abre o PDF
    if (res.data.success) {
      const url = `http://localhost:3000/api/certificados/pdf?user=${userId}&curso=${id_curso}`;
      window.open(url, "_blank");
      
      // Mostra mensagem apropriada
      if (res.data.message && res.data.message.includes("já existe")) {
        alert("Certificado disponível para download!");
      } else {
        alert("Certificado gerado com sucesso!");
      }
    }
  } catch (error) {
    console.error("Erro ao gerar certificado:", error);
    alert("Erro ao acessar o certificado.");
  }
};

  const handleVerDetalhes = (idCurso) => {
    navigate(`/curso/${idCurso}`, { 
      state: { 
        user: user,
        cursoId: idCurso
      } 
    });
  };

  if (loading) return <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem'
  }}>Carregando cursos...</div>;

   return (
    <div style={{ 
      display: 'flex', 
      backgroundColor: "#f7f9fc",
      position: 'relative'
    }}>
      <SidebarFormando />
      <div style={{ 
        marginRight:'140px',
        flex: 1, 
        padding: "2rem", 
        margin: "5 auto",
        position: 'relative',
        zIndex: 1
      }}>
        <h2 style={{ 
          marginBottom: "1.5rem", 
          color: "#2c3e50",
          fontSize: '1.8rem',
          fontWeight: '600'
        }}>
          Minhas Inscrições
        </h2>
        
        {inscricoes.length === 0 ? (
          <p style={{ 
            fontSize: "1.1rem", 
            color: "#555",
            textAlign: 'center',
            marginTop: '2rem'
          }}>
            Você ainda não está inscrito em nenhum curso.
          </p>
        ) : (
          <div style={{ 
            display: "grid", 
            gap: "2rem",
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))'
          }}>
            {inscricoes.map((inscricao) => {
              const nota = getNotaCurso(inscricao.id_curso);
              return (
                <div
                  key={inscricao.id_inscricao}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "1.8rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                    position: 'relative',
                    overflow: 'visible',
                    border: '1px solid #eaeaea'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <h3 style={{ 
                    margin: "0 0 0.8rem 0", 
                    color: "#2c3e50",
                    fontSize: '1.3rem',
                    fontWeight: '600'
                  }}>
                    {getTituloCurso(inscricao.id_curso)}
                  </h3>

                  
                  <div style={{
                    display: 'grid',
                    gap: '0.6rem',
                    marginBottom: '1.2rem'
                  }}>
                    <p style={{ margin: 0, color: "#7f8c8d" }}>
                      <strong style={{color: '#5d6d7e'}}>ID Curso:</strong> {inscricao.id_curso}
                    </p>
                    <p style={{ margin: 0, color: "#7f8c8d" }}>
                      <strong style={{color: '#5d6d7e'}}>Data de Inscrição:</strong>{" "}
                      {new Date(inscricao.data_inscricao).toLocaleDateString('pt-PT')}
                    </p>

                    <p style={{ margin: 0, color: "#7f8c8d" }}>
                      <strong style={{color: '#5d6d7e'}}>Data de Início:</strong>{" "}
                      {formatarData(getDataInicioCurso(inscricao.id_curso))}
                    </p>
                    <p style={{ margin: 0, color: "#7f8c8d" }}>
                      <strong style={{color: '#5d6d7e'}}>Data de Fim:</strong>{" "}
                      {formatarData(getDataFimCurso(inscricao.id_curso))}
                    </p>

                    <p style={{ margin: 0, color: "#7f8c8d" }}>
  <strong style={{color: '#5d6d7e'}}>Tipo Curso:</strong>{" "}
  {getTipoCurso(inscricao.id_curso)}
</p>
                    
                    <p style={{ margin: 0, color: "#7f8c8d" }}>
                      <strong style={{color: '#5d6d7e'}}>Horas de trabalho:</strong> {inscricao.horas_curso}h
                    </p>
                  </div>

                  {/* Seção de Nota (apenas se existir) */}
                  {nota !== null && (
                    <div style={{
                      padding: '0.8rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      marginBottom: '1.5rem'
                    }}>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: "700",
                          color: Number(nota) >= 70 ? "#27ae60" : "#c0392b",
                          fontSize: '1.1rem',
                          textAlign: 'center'
                        }}
                      >
                        Nota do Curso: {formatNota(nota)}%
                      </p>
                    </div>
                  )}
                      
                {/* Botões */}
<div style={{ 
  display: "flex", 
  gap: "1rem",
  justifyContent: 'center'
}}>
  {/* Botão Ver Detalhes - SEMPRE VISÍVEL */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleVerDetalhes(inscricao.id_curso);
    }}
    style={{
      padding: "0.8rem 1.5rem",
      borderRadius: "8px",
      backgroundColor: "#3498db",
      color: "white",
      border: "none",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "600",
      transition: "all 0.2s ease",
      minWidth: "150px",
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      ':hover': {
        backgroundColor: "#2980b9",
        transform: "translateY(-2px)",
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
      },
      ':active': {
        transform: "translateY(0)",
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }
    }}
  >
    Ver Detalhes
  </button>
  
  {/* Botão Gerar Certificado - APENAS COM NOTA */}
  {nota !== null && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        gerarCertificado(inscricao.id_curso);
      }}
      style={{
        padding: "0.8rem 1.5rem",
        borderRadius: "8px",
        backgroundColor: "#2ecc71",
        color: "white",
        border: "none",
        cursor: "pointer",
        fontSize: "1rem",
        fontWeight: "600",
        transition: "all 0.2s ease",
        minWidth: "150px",
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        ':hover': {
          backgroundColor: "#27ae60",
          transform: "translateY(-2px)",
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
        },
        ':active': {
          transform: "translateY(0)",
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }
      }}
    >
      Gerar Certificado
    </button>
  )}
</div>
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