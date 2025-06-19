import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SidebarFormando from "../components/SidebarFormando";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardFormando = () => {
  const location = useLocation();
  const { user } = location.state || {};
  const [cursosAgendados, setCursosAgendados] = useState([]);
  const [conteudosPorCurso, setConteudosPorCurso] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar cursos agendados
        const responseCursos = await fetch("https://backend-8pyn.onrender.com/api/cursos");
        const cursos = await responseCursos.json();
        const agendados = cursos.filter(curso => curso.estado === "agendado");

        // Buscar conteúdos para cada curso
        const conteudosPromises = agendados.map(async (curso) => {
          try {
            const response = await fetch(`https://backend-8pyn.onrender.com/api/cursos/${curso.id_curso}/conteudos`);
            const conteudos = await response.json();
            return { cursoId: curso.id_curso, conteudos };
          } catch (error) {
            console.error(`Erro ao buscar conteúdos para curso ${curso.id_curso}:`, error);
            return { cursoId: curso.id_curso, conteudos: [] };
          }
        });

        const conteudosResults = await Promise.all(conteudosPromises);
        const conteudosMap = conteudosResults.reduce((acc, { cursoId, conteudos }) => {
          acc[cursoId] = conteudos;
          return acc;
        }, {});

        setCursosAgendados(agendados);
        setConteudosPorCurso(conteudosMap);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ALTERAÇÃO PRINCIPAL 1: Função para encontrar a primeira imagem nos conteúdos de um curso
  const getPrimeiraImagem = (cursoId) => {
    const conteudos = conteudosPorCurso[cursoId] || [];
    console.log('Conteúdos para curso', cursoId, conteudos); // Debug
    
    const conteudoComImagem = conteudos.find(conteudo => {
      if (!conteudo.url) return false;
      
      // Verifica se é uma URL do Firebase Storage (qualquer arquivo)
      if (conteudo.url.includes('storage.googleapis.com')) {
        return true;
      }
      
      // Para outros casos, verifica extensão de imagem
      return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(conteudo.url);
    });
    
    console.log('Imagem encontrada:', conteudoComImagem?.url); // Debug
    return conteudoComImagem ? conteudoComImagem.url : null;
  };

  // Função para transformar URL do Firebase em URL de download direto
  const transformFirebaseUrl = (url) => {
    if (!url) return null;
    
    // Se já é uma URL de download direto, retorna como está
    if (url.includes('firebasestorage.googleapis.com/v0/b/')) {
      return url;
    }
    
    // Transforma URL de visualização em URL de download
    const matches = url.match(/https:\/\/storage\.googleapis\.com\/([^\/]+)\/(.+)/);
    if (matches) {
      return `https://firebasestorage.googleapis.com/v0/b/${matches[1]}/o/${encodeURIComponent(matches[2])}?alt=media`;
    }
    
    return url;
  };

  if (!user) return <p>Utilizador não autenticado.</p>;

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <SidebarFormando />

      <div className="container-fluid mt-4" style={{ marginLeft: '200px' }}>
        <h2>Olá {user.nome} 👋</h2>
        <p className="text-muted">Bem-vindo ao seu painel de formando</p>
        <hr />
        
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Cursos Agendados</h5>
                {loading ? (
                  <p>Carregando cursos...</p>
                ) : cursosAgendados.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Imagem</th>
                          <th>Título</th>
                          <th>Descrição</th>
                          <th>Data de Início</th>
                          <th>Data de Fim</th>
                          <th>Tipo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cursosAgendados.map((curso) => {
                          const imagemUrl = getPrimeiraImagem(curso.id_curso);
                          const imagemCurso = transformFirebaseUrl(imagemUrl);
                          
                          return (
                            <tr key={curso.id_curso}>
                              {/* ALTERAÇÃO PRINCIPAL 2: Renderização da imagem com fallback */}
                              <td>
                                {imagemCurso ? (
                                  <img 
                                    src={imagemCurso} 
                                    alt={`Imagem do curso ${curso.titulo}`} 
                                    style={{ 
                                      width: '50px', 
                                      height: '50px', 
                                      objectFit: 'cover',
                                      backgroundColor: '#f5f5f5' 
                                    }}
                                    onError={(e) => {
                                      e.target.onerror = null; 
                                      e.target.src = 'https://via.placeholder.com/50?text=Sem+Imagem';
                                    }}
                                  />
                                ) : (
                                  <span className="text-muted">Sem imagem</span>
                                )}
                              </td>
                              <td>{curso.titulo}</td>
                              <td>{curso.descricao}</td>
                              <td>{new Date(curso.data_inicio).toLocaleDateString('pt-PT')}</td>
                              <td>{new Date(curso.data_fim).toLocaleDateString('pt-PT')}</td>
                              <td>
                                <span className={`badge ${curso.tipo === 'sincrono' ? 'bg-primary' : 'bg-success'}`}>
                                  {curso.tipo === 'sincrono' ? 'Síncrono' : 'Assíncrono'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>Não existem cursos agendados no momento.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Restante do código do gráfico permanece igual */}
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Próximos Cursos</h5>
                {loading ? (
                  <p>Carregando...</p>
                ) : (
                  <div style={{ height: '400px' }}>
                    {cursosAgendados.length > 0 ? (
                      <Bar 
                        data={{
                          labels: cursosAgendados.map(curso => curso.titulo),
                          datasets: [{
                            label: 'Dias até início',
                            data: cursosAgendados.map(curso => {
                              const hoje = new Date();
                              const dataInicio = new Date(curso.data_inicio);
                              const diffTime = dataInicio - hoje;
                              return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            }),
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                          }]
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: true,
                              text: 'Dias até o início dos cursos'
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return `${context.raw} dias`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: 'Dias'
                              }
                            }
                          }
                        }}
                      />
                    ) : (
                      <p className="text-center py-5">Nenhum curso agendado para exibir</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFormando;