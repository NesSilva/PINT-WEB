import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import SidebarFormando from '../components/SidebarFormando';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';

const DetalhesCurso = () => {
  const { id_curso } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, perfil } = location.state || {};

  // Estados principais
  const [curso, setCurso] = useState(null);
  const [conteudos, setConteudos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inscricaoStatus, setInscricaoStatus] = useState(null);
  const [modalContent, setModalContent] = useState(null);

  // Estados para documentos de avaliação
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [documentosAvaliacao, setDocumentosAvaliacao] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dataLimiteUpload, setDataLimiteUpload] = useState(null);

  // Calcula data limite de inscrição
  const calcularDataInscricao = (dataInicio) => {
    const dt = new Date(dataInicio);
    dt.setDate(dt.getDate() - 1);
    return dt;
  };

  const dataInscricao = curso ? calcularDataInscricao(curso.data_inicio) : null;

  // Carrega dados do curso
  useEffect(() => {
  const fetchData = async () => {
    try {
      const [cursoRes, conteudosRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/cursos/${id_curso}`),
        axios.get(`http://localhost:3000/api/conteudo/curso/${id_curso}`)
      ]);

      setCurso(cursoRes.data);
      setConteudos(conteudosRes.data);

      if (cursoRes.data.conteudo_upload) {
        try {
          // Busca documentos do curso
          const docsRes = await axios.get(
            `http://localhost:3000/api/documentos-avaliacao/curso/${id_curso}`
          );
          
          // Se quiser filtrar por usuário também:
          const userId = localStorage.getItem('usuarioId');
          const userDocsRes = await axios.get(
            `http://localhost:3000/api/documentos-avaliacao/utilizador/${userId}`
          );
          
          // Combina ou usa como necessário
          setDocumentosAvaliacao(docsRes.data);
        } catch (error) {
          console.error("Erro ao carregar documentos:", error);
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

  const uploadPermitido = () => {
    if (!dataLimiteUpload) return true;
    const hoje = new Date();
    return hoje <= dataLimiteUpload;
  };

 const handleFileUpload = async (e) => {
  e.preventDefault();
  setUploadError(null);
  setUploadSuccess(null);

  if (!uploadFile) {
    setUploadError('Por favor, selecione um arquivo');
    return;
  }

  setIsUploading(true);

  try {
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('id_curso', id_curso);
    formData.append('id_utilizador', user.id_utilizador);
    formData.append('descricao', uploadDescription);

    const res = await axios.post(
      'http://localhost:3000/api/documentos-avaliacao/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    // Atualiza a lista de documentos
    setDocumentosAvaliacao(prev => [res.data.documento, ...prev]);
    setUploadSuccess('Documento enviado com sucesso!');
    setUploadFile(null);
    setUploadDescription('');
    
    // Fecha o modal após 2 segundos
    setTimeout(() => setShowUploadModal(false), 2000);
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    setUploadError(error.response?.data?.message || 'Erro ao enviar documento');
  } finally {
    setIsUploading(false);
  }
};


  // Função para deletar documento
 const handleDeleteDocument = async (id) => {
  if (window.confirm('Tem certeza que deseja excluir este documento?')) {
    try {
      await axios.delete(`http://localhost:3000/api/documentos-avaliacao/${id}`);
      setDocumentosAvaliacao(documentosAvaliacao.filter(doc => doc.id_Doc_Avaliacao !== id));
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      alert('Erro ao excluir documento');
    }
  }
};
  const formatarData = (dataString) => {
  if (!dataString) return '';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dataString).toLocaleDateString('pt-PT', options);
};

  // Função para atualizar configurações de upload
  const toggleUploadPermissao = async () => {
  try {
    const novoEstado = !curso.conteudo_upload;
    await axios.put(`http://localhost:3000/api/cursos/${id_curso}/toggle-upload`, {
      conteudo_upload: novoEstado
    });
    setCurso({...curso, conteudo_upload: novoEstado});
  } catch (error) {
    console.error("Erro ao atualizar permissão de upload:", error);
    alert("Erro ao atualizar permissão de upload");
  }
};

  const abrirModal = (conteudo) => setModalContent(conteudo);
  const fecharModal = () => setModalContent(null);
  const viewDocument = (url) => window.open(url, '_blank');

  

  const conteudosPorTipo = {
    pdfs: [],
    videos: [],
    imagens: [],
    outros: []
  };

  conteudos.forEach((c) => {
    const url = c.url || c.link || '';
    const tipo = c.tipo_conteudo || '';

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

  if (loading) return <div className="text-center mt-4">Carregando detalhes do curso...</div>;
  if (!curso) return <div className="text-center mt-4">Curso não encontrado.</div>;

  return (
    <div style={{ display: 'flex' }}>
      <SidebarFormando user={user} perfil={perfil} />

      <div className="container mt-4" style={{ flex: 1, paddingLeft: '20px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary mb-3">
          Voltar
        </button>

        <h2>{curso.titulo}</h2>
        <p><strong>Descrição:</strong> {curso.descricao}</p>
        <p><strong>Categoria:</strong> {curso.categoria}</p>
        <p><strong>Data de Início:</strong> {new Date(curso.data_inicio).toLocaleDateString('pt-PT')}</p>
        <p><strong>Data de Fim:</strong> {new Date(curso.data_fim).toLocaleDateString('pt-PT')}</p>
        <p><strong>Data Limite Inscrição:</strong> {dataInscricao ? dataInscricao.toLocaleDateString('pt-PT') : '-'}</p>

        

        {inscricaoStatus && (
          <p className={inscricaoStatus.includes("Erro") ? "text-danger" : "text-success"}>
            {inscricaoStatus}
          </p>
        )}

        <hr />

        {/* Seção de Conteúdos do Curso */}
        <h4>PDFs</h4>
        {conteudosPorTipo.pdfs.length === 0 ? (
          <p>Não há PDFs neste curso.</p>
        ) : (
          <ul className="list-group mb-4">
            {conteudosPorTipo.pdfs.map((c) => (
              <li key={c.id_conteudo} className="list-group-item">
                <h5>{c.descricao || c.titulo || 'PDF do curso'}</h5>
                <button className="btn btn-link" onClick={() => abrirModal(c)}>
                  Abrir PDF
                </button>
              </li>
            ))}
          </ul>
        )}

        <h4>Vídeos</h4>
        {conteudosPorTipo.videos.length === 0 ? (
          <p>Não há vídeos neste curso.</p>
        ) : (
          <ul className="list-group mb-4">
            {conteudosPorTipo.videos.map((c) => (
              <li key={c.id_conteudo} className="list-group-item">
                <h5>{c.descricao || c.titulo || 'Vídeo do curso'}</h5>
                <button className="btn btn-link" onClick={() => abrirModal(c)}>
                  Assistir vídeo
                </button>
              </li>
            ))}
          </ul>
        )}

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

        {/* Seção de Documentos para Avaliação */}
        {curso.conteudo_upload && (
          <div className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Documentos para Avaliação</h4>
              
              {dataLimiteUpload && (
                <div className="alert alert-warning mb-0">
                  Prazo para envio até: {dataLimiteUpload.toLocaleDateString('pt-PT')}
                </div>
              )}
            </div>
            <div className="mt-3">
  <Button 
    variant="primary" 
    onClick={() => setShowUploadModal(true)}
  >
    <i className="bi bi-upload me-2"></i>Enviar Documento
  </Button>
</div>
            
            {(perfil === 'formador' || user?.tipo === 'formador') && (
              <div className="d-flex justify-content-between align-items-center mb-3">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowUploadModal(true)}
                  disabled={!uploadPermitido()}
                >
                  <i className="bi bi-upload me-2"></i>Adicionar Documento
                </button>
                
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="toggleUpload"
                    checked={curso.conteudo_upload}
                    onChange={toggleUploadPermissao}
                  />
                  <label className="form-check-label" htmlFor="toggleUpload">
                    Permitir uploads
                  </label>
                </div>
              </div>
            )}
            
            {!uploadPermitido() && (
              <div className="alert alert-warning">
                O prazo para envio de documentos já terminou.
              </div>
            )}
            
            {documentosAvaliacao.length === 0 ? (
              <div className="alert alert-info">
                Não há documentos enviados para avaliação.
              </div>
            ) : (
              <div className="list-group">
                {documentosAvaliacao.map((doc) => (
                  <div key={doc.id_Doc_Avaliacao} className="list-group-item documento-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5>{doc.descricao || 'Documento sem descrição'}</h5>
                        <small className="text-muted">
                          Enviado por: {doc.nome_utilizador || 'Utilizador desconhecido'} em {new Date(doc.createdAt).toLocaleDateString('pt-PT')}
                        </small>
                      </div>
                      <div>
                        <button 
                          className="btn btn-outline-primary btn-sm me-2"
                          onClick={() => viewDocument(doc.url)}
                        >
                          <i className="bi bi-eye me-1"></i>Visualizar
                        </button>
                        {(perfil === 'formador' || doc.id_utilizador === localStorage.getItem('usuarioId')) && (
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteDocument(doc.id_Doc_Avaliacao)}
                          >
                            <i className="bi bi-trash me-1">handleFileUpload </i>Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal de Upload */}
        <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Enviar Documento para Avaliação</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {uploadError && <Alert variant="danger">{uploadError}</Alert>}
    {uploadSuccess && <Alert variant="success">{uploadSuccess}</Alert>}
    
    <Form onSubmit={handleFileUpload}>
      <Form.Group className="mb-3">
        <Form.Label>Descrição do Documento *</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={uploadDescription}
          onChange={(e) => setUploadDescription(e.target.value)}
          placeholder="Descreva o conteúdo do documento"
          required
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Arquivo *</Form.Label>
        <Form.Control
          type="file"
          onChange={(e) => setUploadFile(e.target.files[0])}
          required
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
        />
        <Form.Text className="text-muted">
          Formatos aceitos: PDF, Word, PowerPoint, Excel. Tamanho máximo: 10MB
        </Form.Text>
      </Form.Group>
      
      <div className="d-flex justify-content-end">
        <Button 
          variant="secondary" 
          onClick={() => setShowUploadModal(false)}
          className="me-2"
        >
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          type="submit" 
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Enviando...</span>
            </>
          ) : (
            'Enviar Documento'
          )}
        </Button>
      </div>
    </Form>
  </Modal.Body>
</Modal>

        {/* Modal de Visualização */}
        {modalContent && (
          <div 
            className="modal-overlay"
            onClick={fecharModal}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {modalContent.tipo_conteudo === 'imagem' && (
                <img 
                  src={modalContent.url} 
                  alt={modalContent.descricao || 'Imagem ampliada'} 
                  className="img-fluid"
                />
              )}

              {modalContent.tipo_conteudo === 'video' && (
                <video controls autoPlay className="w-100">
                  <source src={modalContent.url} type="video/mp4" />
                  Seu navegador não suporta o vídeo.
                </video>
              )}

              {modalContent.tipo_conteudo === 'pdf' && (
                <iframe
                  src={modalContent.url}
                  title="PDF Viewer"
                  className="pdf-viewer"
                />
              )}

              <button className="btn btn-danger mt-3" onClick={fecharModal}>
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalhesCurso;