import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SidebarFormador from '../components/SidebarFormador';
import { Modal, Button, Form } from 'react-bootstrap';  

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
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadPermitido, setUploadPermitido] = useState(curso?.conteudo_upload || false);
  const [tipoUpload, setTipoUpload] = useState("arquivo"); // 'arquivo' ou 'link'
  const [urlLink, setUrlLink] = useState("");

  // Modal control
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const fetchConteudos = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/conteudo/curso/${id_curso}`);
      setConteudos(res.data);
    } catch (error) {
      console.error("Erro ao buscar conteúdos:", error);
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
        `http://localhost:3000/api/cursos/${id_curso}/toggle-upload-documentos`
      );
      setUploadPermitido(res.data.conteudo_upload);
      alert(res.data.message);
    } catch (error) {
      console.error("Erro ao alternar permissão:", error);
      alert("Erro ao atualizar permissão de upload");
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
      setUploadStatus("Por favor, selecione um ficheiro e insira a descrição.");
      return;
    }

    const formData = new FormData();
    formData.append("file", novoFicheiro);
    formData.append("id_curso", id_curso);
    formData.append("descricao", descricaoFicheiro);
    formData.append("tipo_conteudo", tipoFicheiro);

    try {
      await axios.post("http://localhost:3000/api/conteudo/adicionar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadStatus("Ficheiro enviado com sucesso!");
      setNovoFicheiro(null);
      setDescricaoFicheiro("");
      setTipoFicheiro("material");
      await fetchConteudos();
      handleClose();
    } catch (error) {
      console.error("Erro ao enviar ficheiro:", error);
      setUploadStatus("Erro ao enviar ficheiro.");
    }
  };

  const handleAdicionarLink = async (e) => {
    e.preventDefault();

    if (!urlLink || !descricaoFicheiro) {
      setUploadStatus("Por favor, preencha a URL e a descrição.");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/conteudo/adicionar-link", {
        id_curso,
        descricao: descricaoFicheiro,
        url: urlLink,
        tipo_conteudo: "link"
      });

      setUploadStatus("Link adicionado com sucesso!");
      setUrlLink("");
      setDescricaoFicheiro("");
      await fetchConteudos();
      handleClose();
    } catch (error) {
      console.error("Erro ao adicionar link:", error);
      setUploadStatus("Erro ao adicionar link.");
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

  const Section = ({ title, children }) => (
    <>
      <h4 className="mt-5 mb-3 border-bottom pb-1">{title}</h4>
      <div className="row">{children}</div>
    </>
  );

  const CardWrapper = ({ children }) => (
    <div className="col-md-4 mb-4">
      <div className="card shadow-sm rounded h-100">{children}</div>
    </div>
  );

  return (
    <div className="d-flex">
      <SidebarFormador user={user} />
      <div className="container mt-4">
        <button 
          className={`btn btn-${uploadPermitido ? 'success' : 'secondary'} mb-3 ms-2`}
          onClick={toggleUploadDocumentos}
        >
          <i className={`bi bi-${uploadPermitido ? 'check-circle' : 'x-circle'}`}></i>
          {uploadPermitido ? ' Upload Ativo' : ' Upload Inativo'}
        </button>
        <button className="btn btn-secondary mb-3 me-2" onClick={() => navigate(-1)}>Voltar</button>
        <button className="btn btn-primary mb-3" onClick={handleShow}>Adicionar Conteúdo</button>

        <h2 className="mb-4">Conteúdos do Curso: {curso?.titulo}</h2>
        
        <Modal show={showModal} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Adicionar Novo Conteúdo</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={tipoUpload === 'arquivo' ? handleUploadFicheiro : handleAdicionarLink}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Upload</Form.Label>
                <Form.Select
                  value={tipoUpload}
                  onChange={(e) => setTipoUpload(e.target.value)}
                >
                  <option value="arquivo">Upload de Arquivo</option>
                  <option value="link">Adicionar Link</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="descricaoFicheiro">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  type="text"
                  value={descricaoFicheiro}
                  onChange={(e) => setDescricaoFicheiro(e.target.value)}
                  placeholder="Descrição"
                  required
                />
              </Form.Group>

              {tipoUpload === 'arquivo' ? (
                <>
                  <Form.Group className="mb-3" controlId="tipoFicheiro">
                    <Form.Label>Tipo de conteúdo</Form.Label>
                    <Form.Select
                      value={tipoFicheiro}
                      onChange={(e) => setTipoFicheiro(e.target.value)}
                    >
                      <option value="material">Material</option>
                      <option value="video">Vídeo</option>
                      <option value="imagem">Imagem</option>
                      <option value="outro">Outro</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="novoFicheiro">
                    <Form.Label>Selecionar ficheiro</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e) => setNovoFicheiro(e.target.files[0])}
                      required={tipoUpload === 'arquivo'}
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
                  />
                </Form.Group>
              )}

              {uploadStatus && <p className="text-danger">{uploadStatus}</p>}

              <Button variant="primary" type="submit">
                Enviar
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {loading ? (
          <p>Carregando conteúdos...</p>
        ) : conteudos.length === 0 ? (
          <p>Nenhum conteúdo encontrado.</p>
        ) : (
          <>
            <Section title="PDFs">
              {conteudos.filter(c => isPDF(c.url)).map((c) => (
                <CardWrapper key={c.id_conteudo}>
                  <div className="card-body d-flex align-items-center justify-content-between">
                    <span>{getFileNameFromUrl(c.url)}</span>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => abrirEmNovaAba(c.url)}>
                      Abrir
                    </button>
                  </div>
                </CardWrapper>
              ))}
            </Section>

            <Section title="Vídeos">
              {conteudos.filter(c => isVideo(c.url)).map((c) => (
                <CardWrapper key={c.id_conteudo}>
                  <div className="card-body">
                    <video controls src={c.url} style={{ width: '100%' }} />
                  </div>
                </CardWrapper>
              ))}
            </Section>

            <Section title="Imagens">
              {conteudos.filter(c => isImage(c.url)).map((c) => (
                <CardWrapper key={c.id_conteudo}>
                  <div className="card-body p-2">
                    <img
                      src={c.url}
                      alt={c.descricao}
                      style={{ width: '100%', cursor: 'pointer', borderRadius: '0.5rem' }}
                      onClick={() => abrirEmNovaAba(c.url)}
                    />
                  </div>
                </CardWrapper>
              ))}
            </Section>

            <Section title="Links">
              {conteudos.filter(c => c.tipo_conteudo === "link").map((c) => (
                <CardWrapper key={c.id_conteudo}>
                  <div className="card-body">
                    <h6>{c.descricao}</h6>
                    <a 
                      href={c.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm"
                    >
                      Acessar Link
                    </a>
                  </div>
                </CardWrapper>
              ))}
            </Section>

            <Section title="Outros Ficheiros">
              {conteudos.filter(c =>
                !isPDF(c.url) && !isVideo(c.url) && !isImage(c.url) && c.tipo_conteudo !== "link"
              ).map((c) => (
                <CardWrapper key={c.id_conteudo}>
                  <div className="card-body d-flex align-items-center justify-content-between">
                    <span>{getFileNameFromUrl(c.url)}</span>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-secondary btn-sm"
                    >
                      Aceder
                    </a>
                  </div>
                </CardWrapper>
              ))}
            </Section>
          </>
        )}
      </div>
    </div>
  );
};

export default ConteudoCursoFormador;