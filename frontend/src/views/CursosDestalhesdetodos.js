import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import SidebarFormando from '../components/SidebarFormando';

const DetalhesCurso = () => {
  const { id_curso } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, perfil } = location.state || {};

  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inscricaoStatus, setInscricaoStatus] = useState(null);
  const [categorias, setCategorias] = useState([]);
    const [areas, setAreas] = useState([]);

  const calcularDataInscricao = (dataInicio) => {
    const dt = new Date(dataInicio);
    dt.setDate(dt.getDate() - 1);
    return dt;
  };

  const dataInscricao = curso ? calcularDataInscricao(curso.data_inicio) : null;

  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cursoRes = await axios.get(`http://localhost:3000/api/cursos/${id_curso}`);
        setCurso(cursoRes.data);



        const userLocal = localStorage.getItem('usuarioId');
        if (userLocal) {
          const inscricaoRes = await axios.get(`http://localhost:3000/api/inscricoes/usuario/${userLocal}/curso/${id_curso}`);
          if (inscricaoRes.data && inscricaoRes.data.id_utilizador) {
            setInscricaoStatus("Já inscrito neste curso.");
          } else {
            setInscricaoStatus(null);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id_curso]);

   useEffect(() => {
      const fetchData = async () => {
        try {
          const [categoriasRes, areasRes, cursosRes] = await Promise.all([
            axios.get('http://localhost:3000/api/categorias'),
            axios.get('http://localhost:3000/api/areas-formacao'),
          ]);
  
          setCategorias(categoriasRes.data?.categorias || []);
          setAreas(areasRes.data?.areas || []);
  
        } catch (error) {
          console.error('Erro ao buscar dados:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

  if (loading) return <div className="text-center mt-5">Carregando detalhes do curso...</div>;
  if (!curso) return <div className="alert alert-warning mt-5 text-center">Curso não encontrado.</div>;

  const abrirModal = (conteudo) => setModalContent(conteudo);
  const fecharModal = () => setModalContent(null);

  const inscreverNoCurso = async () => {
    try {
      const userLocal = localStorage.getItem('usuarioId');
      if (!userLocal) {
        alert("Utilizador não autenticado.");
        return;
      }

      await axios.post("http://localhost:3000/api/inscricoes", {
        id_utilizador: userLocal,
        id_curso: curso.id_curso
      });

      setInscricaoStatus("Inscrição realizada com sucesso!");
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setInscricaoStatus(error.response.data.mensagem);
      } else {
        setInscricaoStatus("Erro ao realizar inscrição.");
      }
      console.error("Erro ao inscrever:", error);
    }
  };

const getTituloCategoria = (idCategoria) => {
  const categoria = categorias.find(cat => cat.id_categoria === idCategoria);
  return categoria ? categoria.nome : 'Categoria não encontrada';
};

const getTituloArea = (idArea) => {
  const area = areas.find(a => a.id_area === idArea);
  return area ? area.nome : 'Área não encontrada';
};



  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarFormando user={user} perfil={perfil} />

      <main className="container my-4" style={{ flex: 1, paddingLeft: '30px', paddingRight: '30px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary mb-4">
          &larr; Voltar
        </button>
        
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-3">{curso.titulo}</h2>
            <p className="card-text"><strong>Descrição:</strong> {curso.descricao}</p>
            <p><strong>Categoria:</strong> {getTituloCategoria(curso.id_categoria)}</p>
            <p><strong>Área de Formação:</strong> {getTituloArea(curso.id_area)}</p>

            <p className="card-text">
              <strong>Data de Inscrição:</strong>{' '}
              {dataInscricao ? dataInscricao.toLocaleDateString('pt-PT') : '-'}
            </p>

            <hr />

            {/* Botão para inscrever */}
            <div className="d-flex align-items-center mb-3">
              <button
                className="btn btn-primary me-3"
                onClick={inscreverNoCurso}
                disabled={inscricaoStatus === "Inscrição realizada com sucesso!"}
              >
                {inscricaoStatus === "Inscrição realizada com sucesso!" ? 'Inscrito' : 'Inscrever-se'}
              </button>

              {inscricaoStatus && (
                <p
                  className={`mb-0 ${
                    inscricaoStatus.toLowerCase().includes("erro") || inscricaoStatus.toLowerCase().includes("não")
                      ? "text-danger"
                      : "text-success"
                  }`}
                  style={{ fontWeight: '600' }}
                >
                  {inscricaoStatus}
                </p>
              )}
            </div>

            {/* Exemplo de conteúdo para abrir modal (adicione os itens que desejar) */}
            {curso.material && curso.material.length > 0 && (
              <>
                <h5>Materiais do curso:</h5>
                <div className="d-flex flex-wrap gap-3">
                  {curso.material.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => abrirModal(item)}
                      className="card p-2"
                      style={{ cursor: 'pointer', width: '150px', textAlign: 'center', boxShadow: '0 0 6px rgba(0,0,0,0.1)' }}
                    >
                      {item.tipo_conteudo === 'imagem' || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(item.url) ? (
                        <img
                          src={item.url}
                          alt={item.descricao || 'Material'}
                          style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain' }}
                        />
                      ) : item.tipo_conteudo === 'video' || /\.(mp4|webm|ogg)$/i.test(item.url) ? (
                        <video
                          style={{ maxWidth: '100%', maxHeight: '100px' }}
                          muted
                          loop
                          preload="metadata"
                        >
                          <source src={item.url} type="video/mp4" />
                        </video>
                      ) : item.tipo_conteudo === 'pdf' || /\.pdf$/i.test(item.url) ? (
                        <div className="text-muted" style={{ fontSize: '0.9rem' }}>PDF</div>
                      ) : (
                        <div>Arquivo</div>
                      )}
                      <small className="d-block mt-1 text-truncate" title={item.descricao}>{item.descricao || 'Sem descrição'}</small>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modal para visualização */}
      {modalContent && (
        <div
          onClick={fecharModal}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1050,
            cursor: 'pointer'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '10px',
              maxWidth: '90%',
              maxHeight: '90%',
              overflow: 'auto',
              boxShadow: '0 0 20px rgba(0,0,0,0.3)'
            }}
          >
            {(modalContent.tipo_conteudo === 'imagem' || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(modalContent.url)) && (
              <img
                src={modalContent.url}
                alt={modalContent.descricao || 'Imagem ampliada'}
                style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '5px' }}
              />
            )}

            {(modalContent.tipo_conteudo === 'video' || /\.(mp4|webm|ogg)$/i.test(modalContent.url)) && (
              <video
                controls
                autoPlay
                style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '5px' }}
              >
                <source src={modalContent.url} type="video/mp4" />
                Seu navegador não suporta o vídeo.
              </video>
            )}

            {(modalContent.tipo_conteudo === 'pdf' || /\.pdf$/i.test(modalContent.url)) && (
              <iframe
                src={modalContent.url}
                title="PDF Viewer"
                style={{ width: '80vw', height: '80vh', borderRadius: '5px', border: 'none' }}
              />
            )}

            <button className="btn btn-danger mt-3 w-100" onClick={fecharModal}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalhesCurso;
