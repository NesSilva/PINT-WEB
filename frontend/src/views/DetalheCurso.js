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
  const [conteudos, setConteudos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inscricaoStatus, setInscricaoStatus] = useState(null);
const calcularDataInscricao = (dataInicio) => {
  const dt = new Date(dataInicio);
  dt.setDate(dt.getDate() - 1);
  return dt;
};

const dataInscricao = curso ? calcularDataInscricao(curso.data_inicio) : null;



  // Estado para modal de visualização (imagem, vídeo ou PDF)
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const cursoRes = await axios.get(`https://backend-8pyn.onrender.com/api/cursos/${id_curso}`);
      setCurso(cursoRes.data);

      const conteudosRes = await axios.get(`https://backend-8pyn.onrender.com/api/conteudo/curso/${id_curso}`);
      setConteudos(conteudosRes.data);

      // Verifica inscrição do usuário
      const userLocal = localStorage.getItem('usuarioId');
      if (userLocal) {
        const inscricaoRes = await axios.get(`https://backend-8pyn.onrender.com/api/inscricoes/usuario/${userLocal}/curso/${id_curso}`);
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


  if (loading) return <div>Carregando detalhes do curso...</div>;
  if (!curso) return <div>Curso não encontrado.</div>;

  // Função para abrir modal com conteúdo para visualização
  const abrirModal = (conteudo) => {
    setModalContent(conteudo);
  };

  // Função para fechar modal
  const fecharModal = () => {
    setModalContent(null);
  };
 const inscreverNoCurso = async () => {
  try {
    const userLocal = localStorage.getItem('usuarioId');
    if (!userLocal) {
      alert("Utilizador não autenticado.");
      return;
    }

    await axios.post("https://backend-8pyn.onrender.com/api/inscricoes", {
      id_utilizador: userLocal,
      id_curso: curso.id_curso
    });

    setInscricaoStatus("Inscrição realizada com sucesso!");
  } catch (error) {
    if (error.response && error.response.status === 409) {
      setInscricaoStatus(error.response.data.mensagem); // exibe: "Usuário já está inscrito neste curso."
    } else {
      setInscricaoStatus("Erro ao realizar inscrição.");
    }
    console.error("Erro ao inscrever:", error);
  }
};




  // Categorizar conteúdos
  const conteudosPorTipo = {
    pdfs: [],
    videos: [],
    imagens: [],
    outros: []
  };

  conteudos.forEach((c) => {
    const url = c.url || c.link || '';
    const tipo = c.tipo_conteudo || '';

    // Verifica pela extensão do arquivo ou tipo_conteudo
    if (tipo === 'imagem' || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url)) {
      conteudosPorTipo.imagens.push(c);
    } else if (tipo === 'video' || /\.(mp4|webm|ogg)$/i.test(url)) {
      conteudosPorTipo.videos.push(c);
    } else if (tipo === 'pdf' || /\.pdf$/i.test(url)) {
      conteudosPorTipo.pdfs.push(c);
    } else {
      conteudosPorTipo.outros.push(c);
    }
  });

  return (
    <div style={{ display: 'flex' }}>
      <SidebarFormando user={user} perfil={perfil} />

      <div className="container mt-4" style={{ flex: 1, paddingLeft: '20px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary mb-3">Voltar</button>

        <h2>{curso.titulo}</h2>
        <p><strong>Descrição:</strong> {curso.descricao}</p>
        <p><strong>Categoria:</strong> {curso.categoria}</p>
        <p><strong>Data de Inscrição:</strong> {dataInscricao ? dataInscricao.toLocaleDateString('pt-PT') : '-'}</p>


        <hr />

        {/* Seção PDFs */}
        <h4>PDFs</h4>
        {conteudosPorTipo.pdfs.length === 0 ? (
          <p>Não há PDFs neste curso.</p>
        ) : (
          <ul className="list-group mb-4">
            {conteudosPorTipo.pdfs.map((c) => (
              <li key={c.id_conteudo} className="list-group-item">
                <h5>{c.descricao || c.titulo || 'PDF do curso'}</h5>
                <button
                  className="btn btn-link"
                  onClick={() => abrirModal(c)}
                >
                  Abrir PDF
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Seção Vídeos */}
        <h4>Vídeos</h4>
        {conteudosPorTipo.videos.length === 0 ? (
          <p>Não há vídeos neste curso.</p>
        ) : (
          <ul className="list-group mb-4">
            {conteudosPorTipo.videos.map((c) => (
              <li key={c.id_conteudo} className="list-group-item">
                <h5>{c.descricao || c.titulo || 'Vídeo do curso'}</h5>
                <button
                  className="btn btn-link"
                  onClick={() => abrirModal(c)}
                >
                  Assistir vídeo
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Seção Imagens */}
        <h4>Imagens</h4>
        {conteudosPorTipo.imagens.length === 0 ? (
          <p>Não há imagens neste curso.</p>
        ) : (
          <ul className="list-group mb-4">
            {conteudosPorTipo.imagens.map((c) => (
              <li key={c.id_conteudo} className="list-group-item">
                <h5>{c.descricao || c.titulo || 'Imagem do curso'}</h5>
                <img
                  src={c.url}
                  alt={c.descricao || 'Imagem do curso'}
                  style={{ maxWidth: '150px', cursor: 'pointer' }}
                  onClick={() => abrirModal(c)}
                />
              </li>
            ))}
          </ul>
        )}

        {/* Outros tipos */}
        {conteudosPorTipo.outros.length > 0 && (
          <>
            <h4>Outros Conteúdos</h4>
            <ul className="list-group mb-4">
              {conteudosPorTipo.outros.map((c) => (
                <li key={c.id_conteudo} className="list-group-item">
                  <h5>{c.descricao || c.titulo || 'Conteúdo do curso'}</h5>
                  <a href={c.url || c.link} target="_blank" rel="noopener noreferrer">
                    Abrir conteúdo
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Modal para visualização */}
        {modalContent && (
          <div 
            onClick={fecharModal} 
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              cursor: 'pointer'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()} // evitar fechar ao clicar dentro do modal
              style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', maxWidth: '90%', maxHeight: '90%', overflow: 'auto' }}
            >
              {/* Visualizar imagem */}
              {(modalContent.tipo_conteudo === 'imagem' || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(modalContent.url)) && (
                <img 
                  src={modalContent.url} 
                  alt={modalContent.descricao || 'Imagem ampliada'} 
                  style={{ maxWidth: '100%', maxHeight: '80vh' }}
                />
              )}

              {/* Visualizar vídeo */}
              {(modalContent.tipo_conteudo === 'video' || /\.(mp4|webm|ogg)$/i.test(modalContent.url)) && (
                <video 
                  controls 
                  autoPlay 
                  style={{ maxWidth: '100%', maxHeight: '80vh' }}
                >
                  <source src={modalContent.url} type="video/mp4" />
                  Seu navegador não suporta o vídeo.
                </video>
              )}

              {/* Visualizar PDF */}
              {(modalContent.tipo_conteudo === 'pdf' || /\.pdf$/i.test(modalContent.url)) && (
                <iframe
                  src={modalContent.url}
                  title="PDF Viewer"
                  style={{ width: '80vw', height: '80vh' }}
                />
              )}

              <button className="btn btn-danger mt-3" onClick={fecharModal}>Fechar</button>
            </div>
          </div>
        )}
      </div>
<button 
  className="btn btn-primary mb-3" 
  onClick={inscreverNoCurso} 
  disabled={inscricaoStatus === "Inscrição realizada com sucesso!"}
>
  Inscrever-se
</button>


{inscricaoStatus && <p className={inscricaoStatus.includes("Erro") ? "text-danger" : "text-success"}>{inscricaoStatus}</p>}


    </div>
  );
};

export default DetalhesCurso;
