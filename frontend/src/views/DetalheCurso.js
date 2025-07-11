import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import SidebarFormando from '../components/SidebarFormando';
import { Modal, Button, Form, Alert, Spinner, Card, Row, Col, Badge } from 'react-bootstrap';

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

  // Funções auxiliares
  const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);
  const isImage = (url) => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
  const isPDF = (url) => /\.pdf$/i.test(url);
  const isZip = (url) => /\.(zip|rar|7z)$/i.test(url);

  const getFileIcon = (url) => {
    if (isPDF(url)) return 'bi-file-earmark-pdf text-danger';
    if (isVideo(url)) return 'bi-file-earmark-play text-primary';
    if (isImage(url)) return 'bi-file-earmark-image text-success';
    if (isZip(url)) return 'bi-file-earmark-zip text-warning';
    return 'bi-file-earmark text-secondary';
  };

  const getFileType = (url) => {
    if (isPDF(url)) return 'PDF';
    if (isVideo(url)) return 'Vídeo';
    if (isImage(url)) return 'Imagem';
    if (isZip(url)) return 'Arquivo Compactado';
    return 'Documento';
  };

  const abrirEmNovaAba = (url) => {
    window.open(url, '_blank');
  };

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
          axios.get(`https://frontend-z8p8.onrender.com/api/cursos/${id_curso}`),
          axios.get(`https://frontend-z8p8.onrender.com/api/conteudo/curso/${id_curso}`)
        ]);

        setCurso(cursoRes.data);
        setConteudos(conteudosRes.data);

        if (cursoRes.data.conteudo_upload) {
          try {
            const docsRes = await axios.get(
              `https://frontend-z8p8.onrender.com/api/documentos-avaliacao/curso/${id_curso}`
            );
            
            const userId = localStorage.getItem('usuarioId');
            const userDocsRes = await axios.get(
              `https://frontend-z8p8.onrender.com/api/documentos-avaliacao/utilizador/${userId}`
            );
            
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
      formData.append('id_utilizador', user.id);
      formData.append('descricao', uploadDescription);

      const res = await axios.post(
        'https://frontend-z8p8.onrender.com/api/documentos-avaliacao/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setDocumentosAvaliacao(prev => [res.data.documento, ...prev]);
      setUploadSuccess('Documento enviado com sucesso!');
      setUploadFile(null);
      setUploadDescription('');
      
      setTimeout(() => setShowUploadModal(false), 2000);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setUploadError(error.response?.data?.message || 'Erro ao enviar documento');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        await axios.delete(`https://frontend-z8p8.onrender.com/api/documentos-avaliacao/${id}`);
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

  const toggleUploadPermissao = async () => {
    try {
      const novoEstado = !curso.conteudo_upload;
      await axios.put(`https://frontend-z8p8.onrender.com/api/cursos/${id_curso}/toggle-upload`, {
        conteudo_upload: novoEstado
      });
      setCurso({...curso, conteudo_upload: novoEstado});
    } catch (error) {
      console.error("Erro ao atualizar permissão de upload:", error);
      alert("Erro ao atualizar permissão de upload");
    }
  };

  const abrirModal = (conteudo) => {
    if (!conteudo.url) {
      alert('Este conteúdo não possui um link válido');
      return;
    }
    
    // Se for PDF, abre diretamente em nova aba
    if (conteudo.tipo_conteudo === 'pdf' || conteudo.url.toLowerCase().endsWith('.pdf')) {
      window.open(conteudo.url, '_blank');
    } else {
      // Para outros tipos, mostra o modal
      setModalContent(conteudo);
    }
  };

  const fecharModal = () => setModalContent(null);

  if (loading) return <div className="text-center mt-4">Carregando detalhes do curso...</div>;
  if (!curso) return <div className="text-center mt-4">Curso não encontrado.</div>;

  return (
    <div style={{ display: 'flex' }}>
      <SidebarFormando user={user} perfil={perfil} />

      <div className="container mt-4" style={{ flex: 1, paddingLeft: '20px' }}>
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-outline-secondary mb-4"
        >
          <i className="bi bi-arrow-left me-2"></i>Voltar
        </button>

        {/* Cabeçalho do Curso */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="mb-3">{curso.titulo}</h2>
                <p className="text-muted">{curso.descricao}</p>
              </div>
              <Badge bg="primary" className="align-self-start">
                {curso.categoria}
              </Badge>
            </div>
            
            <div className="d-flex flex-wrap gap-3 mt-3">
              <div>
                <small className="text-muted">Data de Início</small>
                <p className="mb-0">
                  <i className="bi bi-calendar-event me-2"></i>
                  {new Date(curso.data_inicio).toLocaleDateString('pt-PT')}
                </p>
              </div>
              <div>
                <small className="text-muted">Data de Fim</small>
                <p className="mb-0">
                  <i className="bi bi-calendar-check me-2"></i>
                  {new Date(curso.data_fim).toLocaleDateString('pt-PT')}
                </p>
              </div>
              <div>
                <small className="text-muted">Data Limite Inscrição</small>
                <p className="mb-0">
                  <i className="bi bi-clock me-2"></i>
                  {dataInscricao ? dataInscricao.toLocaleDateString('pt-PT') : '-'}
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>

        {inscricaoStatus && (
          <Alert variant={inscricaoStatus.includes("Erro") ? "danger" : "success"}>
            {inscricaoStatus}
          </Alert>
        )}

        {/* Seção de Conteúdos do Curso */}
        <Card className="shadow-sm mb-5">
          <Card.Body>
            <h4 className="mb-4">
              <i className="bi bi-collection me-2"></i>
              Conteúdos do Curso
            </h4>

            <Row className="g-4">
              {conteudos.map((conteudo) => (
                <Col key={conteudo.id_conteudo} xs={12} md={6} lg={4}>
                  <Card className="h-100 shadow-sm">
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex align-items-center mb-3">
                        <i className={`bi ${getFileIcon(conteudo.url)} fs-3 me-3`}></i>
                        <div>
                          <Card.Title className="mb-0">
                            {conteudo.descricao || getFileType(conteudo.url)}
                          </Card.Title>
                          <small className="text-muted">{getFileType(conteudo.url)}</small>
                        </div>
                      </div>
                      <Button 
                        variant="outline-primary" 
                        className="mt-auto align-self-start"
                        onClick={() => abrirModal(conteudo)}
                      >
                        <i className="bi bi-box-arrow-up-right me-1"></i>Abrir
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>

        {/* Seção de Documentos para Avaliação */}
        {curso.conteudo_upload && (
          <Card className="shadow-sm mb-5">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>
                  <i className="bi bi-cloud-arrow-up me-2"></i>
                  Documentos para Avaliação
                </h4>
                
                <div>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowUploadModal(true)}
                    className="me-2"
                  >
                    <i className="bi bi-upload me-2"></i>Enviar Documento
                  </Button>
                  
                  {(perfil === 'formador' || user?.tipo === 'formador') && (
                    <div className="form-check form-switch d-inline-block align-middle">
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
                  )}
                </div>
              </div>

              {dataLimiteUpload && (
                <Alert variant="warning" className="mb-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Prazo para envio até: {dataLimiteUpload.toLocaleDateString('pt-PT')}
                </Alert>
              )}

              {!uploadPermitido() && (
                <Alert variant="warning" className="mb-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  O prazo para envio de documentos já terminou.
                </Alert>
              )}

              {documentosAvaliacao.length === 0 ? (
                <Alert variant="info">
                  <i className="bi bi-info-circle me-2"></i>
                  Não há documentos enviados para avaliação.
                </Alert>
              ) : (
                <Row className="g-4">
                  {documentosAvaliacao.map((doc) => (
                    <Col key={doc.id_Doc_Avaliacao} xs={12}>
                      <Card className="shadow-sm">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <Card.Title>{doc.descricao || 'Documento sem descrição'}</Card.Title>
                              
                            </div>
                            <div className="d-flex gap-2">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => abrirEmNovaAba(doc.url)}
                              >
                                <i className="bi bi-eye me-1"></i>Visualizar
                              </Button>
                              {(perfil === 'formador' || doc.id_utilizador === localStorage.getItem('usuarioId')) && (
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => handleDeleteDocument(doc.id_Doc_Avaliacao)}
                                >
                                  <i className="bi bi-trash me-1"></i>Excluir
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Modal de Upload */}
        <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="bi bi-cloud-arrow-up me-2"></i>
              Enviar Documento para Avaliação
            </Modal.Title>
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
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.7z"
                />
                <Form.Text className="text-muted">
                  Formatos aceitos: PDF, Word, PowerPoint, Excel, Arquivos Compactados. Tamanho máximo: 10MB
                </Form.Text>
              </Form.Group>
              
              <div className="d-flex justify-content-end gap-2">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setShowUploadModal(false)}
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
                    <>
                      <i className="bi bi-send me-2"></i>Enviar Documento
                    </>
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
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1050
            }}
          >
            <div 
              className="modal-content" 
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                maxWidth: '90%',
                maxHeight: '90%',
                overflow: 'auto',
                width: '800px'
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>
                  <i className={`bi ${getFileIcon(modalContent.url)} me-2`}></i>
                  {modalContent.descricao || modalContent.titulo || 'Visualização'}
                </h4>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={fecharModal}
                >
                  <i className="bi bi-x-lg"></i> Fechar
                </button>
              </div>

              {modalContent.tipo_conteudo === 'imagem' && (
                <div className="text-center">
                  <img 
                    src={modalContent.url} 
                    alt={modalContent.descricao || 'Imagem ampliada'} 
                    className="img-fluid"
                    style={{ maxHeight: '70vh' }}
                  />
                  <div className="mt-3">
                    <Button 
                      variant="primary" 
                      onClick={() => abrirEmNovaAba(modalContent.url)}
                    >
                      <i className="bi bi-box-arrow-up-right me-1"></i>Abrir em nova janela
                    </Button>
                  </div>
                </div>
              )}

              {modalContent.tipo_conteudo === 'video' && (
                <div className="video-container">
                  <video controls autoPlay className="w-100">
                    <source src={modalContent.url} type={`video/${modalContent.url.split('.').pop()}`} />
                    Seu navegador não suporta o vídeo.
                  </video>
                  <div className="mt-3 text-center">
                    <Button 
                      variant="primary" 
                      onClick={() => abrirEmNovaAba(modalContent.url)}
                    >
                      <i className="bi bi-box-arrow-up-right me-1"></i>Abrir em nova janela
                    </Button>
                  </div>
                </div>
              )}

              {!['imagem', 'video'].includes(modalContent.tipo_conteudo) && (
                <div className="text-center py-4">
                  <i className={`bi ${getFileIcon(modalContent.url)} display-4 mb-3`}></i>
                  <p className="mb-4">Este conteúdo não pode ser visualizado diretamente.</p>
                  <Button 
                    variant="primary" 
                    onClick={() => abrirEmNovaAba(modalContent.url)}
                  >
                    <i className="bi bi-box-arrow-up-right me-1"></i>Abrir em nova janela
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalhesCurso;