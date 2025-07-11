import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SidebarFormador from '../components/SidebarFormador';
import { Modal, Button, Form, Alert, Badge, Card } from 'react-bootstrap';
import { FiUpload, FiLink, FiFile, FiVideo, FiImage, FiExternalLink, FiArrowLeft } from 'react-icons/fi';
import '../css/ConteudoCursoFormador.css';

const ConteudoCursoFormador = () => {
  const { id_curso } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, curso } = location.state || {};
  
  const [conteudos, setConteudos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoFicheiro, setNovoFicheiro] = useState(null);
  const [descricaoFicheiro, setDescricaoFicheiro] = useState("");
  const [tipoFicheiro, setTipoFicheiro] = useState("material");
  const [uploadStatus, setUploadStatus] = useState({ text: '', variant: '' });
  const [uploadPermitido, setUploadPermitido] = useState(curso?.conteudo_upload || false);
  const [tipoUpload, setTipoUpload] = useState("arquivo");
  const [urlLink, setUrlLink] = useState("");

  // Modal control
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => {
    setShowModal(false);
    setUploadStatus({ text: '', variant: '' });
  };
  const handleShow = () => setShowModal(true);

  const fetchConteudos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://frontend-z8p8.onrender.com/api/conteudo/curso/${id_curso}`);
      setConteudos(res.data);
    } catch (error) {
      console.error("Erro ao buscar conteúdos:", error);
      setUploadStatus({ text: "Erro ao carregar conteúdos", variant: "danger" });
    } finally {
      setLoading(false);
    }
  }, [id_curso]);

  useEffect(() => {
    fetchConteudos();
  }, [fetchConteudos]);

  const abrirEmNovaAba = (url) => {
    window.open(url, "_blank");
  };

  const toggleUploadDocumentos = async () => {
    try {
      const res = await axios.put(
        `https://frontend-z8p8.onrender.com/api/cursos/${id_curso}/toggle-upload-documentos`
      );
      setUploadPermitido(res.data.conteudo_upload);
      setUploadStatus({ 
        text: res.data.message, 
        variant: "success" 
      });
    } catch (error) {
      console.error("Erro ao alternar permissão:", error);
      setUploadStatus({ 
        text: "Erro ao atualizar permissão de upload", 
        variant: "danger" 
      });
    }
  };

  const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);
  const isImage = (url) => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
  const isPDF = (url) => /\.pdf$/i.test(url);

  const getFileNameFromUrl = (url) => {
    try {
      const decoded = decodeURIComponent(url);
      const parts = decoded.split("_");
      return parts.slice(1).join("_");
    } catch {
      return "Ficheiro";
    }
  };

  const handleUploadFicheiro = async (e) => {
    e.preventDefault();

    if (!novoFicheiro || !descricaoFicheiro) {
      setUploadStatus({ 
        text: "Por favor, selecione um ficheiro e insira a descrição.", 
        variant: "warning" 
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", novoFicheiro);
    formData.append("id_curso", id_curso);
    formData.append("descricao", descricaoFicheiro);
    formData.append("tipo_conteudo", tipoFicheiro);

    try {
      await axios.post("https://frontend-z8p8.onrender.com/api/conteudo/adicionar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadStatus({ 
        text: "Ficheiro enviado com sucesso!", 
        variant: "success" 
      });
      setNovoFicheiro(null);
      setDescricaoFicheiro("");
      setTipoFicheiro("material");
      await fetchConteudos();
      setTimeout(handleClose, 1500);
    } catch (error) {
      console.error("Erro ao enviar ficheiro:", error);
      setUploadStatus({ 
        text: "Erro ao enviar ficheiro.", 
        variant: "danger" 
      });
    }
  };

  const handleAdicionarLink = async (e) => {
    e.preventDefault();

    if (!urlLink || !descricaoFicheiro) {
      setUploadStatus({ 
        text: "Por favor, preencha a URL e a descrição.", 
        variant: "warning" 
      });
      return;
    }

    try {
      await axios.post("https://frontend-z8p8.onrender.com/api/conteudo/adicionar-link", {
        id_curso,
        descricao: descricaoFicheiro,
        url: urlLink,
        tipo_conteudo: "link"
      });

      setUploadStatus({ 
        text: "Link adicionado com sucesso!", 
        variant: "success" 
      });
      setUrlLink("");
      setDescricaoFicheiro("");
      await fetchConteudos();
      setTimeout(handleClose, 1500);
    } catch (error) {
      console.error("Erro ao adicionar link:", error);
      setUploadStatus({ 
        text: "Erro ao adicionar link.", 
        variant: "danger" 
      });
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const SectionHeader = ({ title, icon: Icon, count }) => (
    <div className="section-header mb-4">
      <h4 className="section-title">
        {Icon && <Icon className="section-icon" />}
        {title}
        {count > 0 && <Badge bg="secondary" className="ms-2">{count}</Badge>}
      </h4>
      <div className="section-divider"></div>
    </div>
  );

  const ContentCard = ({ conteudo, children }) => (
    <Card className="content-card h-100">
      <Card.Body className="d-flex flex-column">
        <Card.Title className="content-title">
          {conteudo.descricao || getFileNameFromUrl(conteudo.url)}
        </Card.Title>
        <div className="content-preview mb-3">
          {children}
        </div>
        
        <div className="mt-auto">
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={() => abrirEmNovaAba(conteudo.url)}
            className="w-100"
          >
            <FiExternalLink className="me-1" /> Abrir
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="conteudo-curso-container">
      <SidebarFormador user={user} />
      
      <main className="main-content">
       <div className="page-header">
  <div className="header-top-row">
    <Button 
      variant="link" 
      onClick={() => navigate(-1)}
      className="back-button"
    >
      <FiArrowLeft className="me-1" /> Voltar
    </Button>
    
    <h2 className="page-title">
      Conteúdos do Curso: <span className="course-title">{curso?.titulo}</span>
    </h2>
  </div>
  
  <div className="header-actions">
    <Button 
      variant={uploadPermitido ? "success" : "secondary"} 
      onClick={toggleUploadDocumentos}
      className="upload-toggle"
    >
      <FiUpload className="me-1" />
      {uploadPermitido ? 'Upload Ativo' : 'Upload Inativo'}
    </Button>
    
    <Button 
      variant="primary" 
      onClick={handleShow}
      className="add-content-button"
    >
      <FiUpload className="me-1" /> Adicionar Conteúdo
    </Button>
  </div>
</div>

        {uploadStatus.text && (
          <Alert variant={uploadStatus.variant} className="status-alert">
            {uploadStatus.text}
          </Alert>
        )}

        <Modal show={showModal} onHide={handleClose} centered className="content-modal">
          <Modal.Header closeButton>
            <Modal.Title>
              {tipoUpload === 'arquivo' ? (
                <><FiUpload className="me-2" /> Adicionar Arquivo</>
              ) : (
                <><FiLink className="me-2" /> Adicionar Link</>
              )}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={tipoUpload === 'arquivo' ? handleUploadFicheiro : handleAdicionarLink}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Upload</Form.Label>
                <Form.Select
                  value={tipoUpload}
                  onChange={(e) => setTipoUpload(e.target.value)}
                  className="form-select-custom"
                >
                  <option value="arquivo">
                    <FiFile className="me-2" /> Upload de Arquivo
                  </option>
                  <option value="link">
                    <FiLink className="me-2" /> Adicionar Link
                  </option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="descricaoFicheiro">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  type="text"
                  value={descricaoFicheiro}
                  onChange={(e) => setDescricaoFicheiro(e.target.value)}
                  placeholder="Insira uma descrição para o conteúdo"
                  required
                  className="form-control-custom"
                />
              </Form.Group>

              {tipoUpload === 'arquivo' ? (
                <>
                  <Form.Group className="mb-3" controlId="tipoFicheiro">
                    <Form.Label>Tipo de conteúdo</Form.Label>
                    <Form.Select
                      value={tipoFicheiro}
                      onChange={(e) => setTipoFicheiro(e.target.value)}
                      className="form-select-custom"
                    >
                      <option value="material">
                        <FiFile className="me-2" /> Material
                      </option>
                      <option value="video">
                        <FiVideo className="me-2" /> Vídeo
                      </option>
                      <option value="imagem">
                        <FiImage className="me-2" /> Imagem
                      </option>
                      <option value="outro">
                        <FiFile className="me-2" /> Outro
                      </option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="novoFicheiro">
                    <Form.Label>Selecionar ficheiro</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e) => setNovoFicheiro(e.target.files[0])}
                      required={tipoUpload === 'arquivo'}
                      className="form-control-file"
                    />
                  </Form.Group>
                </>
              ) : (
                <Form.Group className="mb-3" controlId="urlLink">
                  <Form.Label>URL do Link</Form.Label>
                  <Form.Control
                    type="url"
                    value={urlLink}
                    onChange={(e) => setUrlLink(e.target.value)}
                    placeholder="https://exemplo.com"
                    required={tipoUpload === 'link'}
                    className="form-control-custom"
                  />
                </Form.Group>
              )}

              <div className="modal-footer-buttons">
                <Button variant="secondary" onClick={handleClose} className="me-2">
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  {tipoUpload === 'arquivo' ? 'Enviar Arquivo' : 'Adicionar Link'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {loading ? (
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="loading-text">Carregando conteúdos...</p>
          </div>
        ) : conteudos.length === 0 ? (
          <div className="empty-state">
            <img 
              src="/images/empty-folder.svg" 
              alt="Pasta vazia" 
              className="empty-image"
            />
            <h5>Nenhum conteúdo encontrado</h5>
            <p>Adicione novos conteúdos usando o botão acima</p>
          </div>
        ) : (
          <div className="content-sections">
            {/* PDFs Section */}
            {conteudos.filter(c => isPDF(c.url)).length > 0 && (
              <div className="content-section">
                <SectionHeader 
                  title="Documentos PDF" 
                  icon={FiFile} 
                  count={conteudos.filter(c => isPDF(c.url)).length} 
                />
                <div className="row g-4">
                  {conteudos.filter(c => isPDF(c.url)).map((c) => (
                    <div className="col-md-4 col-lg-3" key={c.id_conteudo}>
                      <ContentCard conteudo={c}>
                        <div className="pdf-preview">
                          <FiFile className="pdf-icon" />
                          <span className="pdf-filename">{getFileNameFromUrl(c.url)}</span>
                        </div>
                      </ContentCard>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos Section */}
            {conteudos.filter(c => isVideo(c.url)).length > 0 && (
              <div className="content-section">
                <SectionHeader 
                  title="Vídeos" 
                  icon={FiVideo} 
                  count={conteudos.filter(c => isVideo(c.url)).length} 
                />
                <div className="row g-4">
                  {conteudos.filter(c => isVideo(c.url)).map((c) => (
                    <div className="col-md-6 col-lg-4" key={c.id_conteudo}>
                      <ContentCard conteudo={c}>
                        <video controls className="video-preview">
                          <source src={c.url} type={`video/${c.url.split('.').pop()}`} />
                        </video>
                      </ContentCard>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images Section */}
            {conteudos.filter(c => isImage(c.url)).length > 0 && (
              <div className="content-section">
                <SectionHeader 
                  title="Imagens" 
                  icon={FiImage} 
                  count={conteudos.filter(c => isImage(c.url)).length} 
                />
                <div className="row g-4">
                  {conteudos.filter(c => isImage(c.url)).map((c) => (
                    <div className="col-md-4 col-lg-3" key={c.id_conteudo}>
                      <ContentCard conteudo={c}>
                        <img
                          src={c.url}
                          alt={c.descricao}
                          className="img-preview"
                        />
                      </ContentCard>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links Section */}
            {conteudos.filter(c => c.tipo_conteudo === "link").length > 0 && (
              <div className="content-section">
                <SectionHeader 
                  title="Links Externos" 
                  icon={FiLink} 
                  count={conteudos.filter(c => c.tipo_conteudo === "link").length} 
                />
                <div className="row g-4">
                  {conteudos.filter(c => c.tipo_conteudo === "link").map((c) => (
                    <div className="col-md-6" key={c.id_conteudo}>
                      <ContentCard conteudo={c}>
                        <div className="link-preview">
                          <FiLink className="link-icon" />
                          <span className="link-url">{c.url}</span>
                        </div>
                      </ContentCard>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Files Section */}
            {conteudos.filter(c =>
              !isPDF(c.url) && !isVideo(c.url) && !isImage(c.url) && c.tipo_conteudo !== "link"
            ).length > 0 && (
              <div className="content-section">
                <SectionHeader 
                  title="Outros Arquivos" 
                  icon={FiFile} 
                  count={conteudos.filter(c =>
                    !isPDF(c.url) && !isVideo(c.url) && !isImage(c.url) && c.tipo_conteudo !== "link"
                  ).length} 
                />
                <div className="row g-4">
                  {conteudos.filter(c =>
                    !isPDF(c.url) && !isVideo(c.url) && !isImage(c.url) && c.tipo_conteudo !== "link"
                  ).map((c) => (
                    <div className="col-md-4 col-lg-3" key={c.id_conteudo}>
                      <ContentCard conteudo={c}>
                        <div className="file-preview">
                          <FiFile className="file-icon" />
                          <span className="file-filename">{getFileNameFromUrl(c.url)}</span>
                        </div>
                      </ContentCard>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ConteudoCursoFormador;