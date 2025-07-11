import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Badge, Spinner, Container } from 'react-bootstrap';
import { FaBookOpen, FaClock, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import SidebarFormando from '../components/SidebarFormando';
import { Link } from "react-router-dom";


const transformFirebaseUrl = (url) => {
  if (!url) return null;
  if (url.includes('firebasestorage.googleapis.com/v0/b/') || !url.includes('storage.googleapis.com')) {
    return url;
  }

  const matches = url.match(/https:\/\/storage\.googleapis\.com\/([^\/]+)\/(.+)/);
  if (matches) {
    const bucketName = matches[1];
    const filePath = matches[2];
    return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(filePath)}?alt=media`;
  }

  return url;
};

const CourseCard = ({ curso, areaNome }) => {
  const imagemCurso = transformFirebaseUrl(curso.imagem_capa);
  const dataInicio = new Date(curso.data_inicio).toLocaleDateString('pt-PT');
  const isSincrono = curso.tipo === 'sincrono';

  return (
    <Card className="h-100 shadow-sm">
      <div className="position-relative">
        {imagemCurso ? (
          <img
            src={imagemCurso}
            alt={`Capa do curso ${curso.titulo}`}
            style={{ height: '150px', width: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none'; 
            }}
          />
        ) : (
          <div style={{ height: '150px', backgroundColor: '#f0f0f0' }}></div>
        )}

        <div className="position-absolute top-0 end-0 m-2">
          <span className={`badge ${isSincrono ? 'bg-primary' : 'bg-success'}`}>
            {isSincrono ? 'Síncrono' : 'Assíncrono'}
          </span>
        </div>
      </div>
      <Card.Body className="d-flex flex-column">
        {areaNome && (
          <div className="mb-2">
            <span className="badge bg-light text-dark">{areaNome}</span>
          </div>
        )}
        <Card.Title className="h5 mb-3">
          <Link to={`/curso/${curso.id_curso}`} className="text-decoration-none text-dark">
            {curso.titulo}
          </Link>
        </Card.Title>
        <Card.Text className="text-muted small mb-3 flex-grow-1">
          {curso.descricao?.substring(0, 100)}{curso.descricao?.length > 100 ? '...' : ''}
        </Card.Text>
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <div className="d-flex align-items-center text-muted small">
            <FaClock className="me-1" />
            <span>{curso.duracao || 'N/A'}</span>
          </div>
          <Badge bg="light" text="dark" className="border">
            {curso.nivel || 'Todos os níveis'}
          </Badge>
        </div>
      </Card.Body>
      <Card.Footer className="bg-white border-top-0">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <small className="text-muted">Início: {dataInicio}</small>
          </div>
          <Link to={`/cursod/${curso.id_curso}`} className="btn btn-sm btn-primary">
            Ver detalhes
          </Link>
        </div>
      </Card.Footer>
    </Card>
  );
};

const CursosPorArea = () => {
  const { id_area } = useParams();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [area, setArea] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar dados da área
        const areaRes = await axios.get(`https://backend-8pyn.onrender.com/api/areas-formacao/${id_area}`);
        setArea(areaRes.data?.area || null);

        // Buscar cursos da área
        const cursosRes = await axios.get('https://backend-8pyn.onrender.com/api/cursos');
        const cursosDaArea = (cursosRes.data?.data || []).filter(
          curso => curso.id_area.toString() === id_area && curso.estado === 'agendado'
        );
        
        setCursos(cursosDaArea);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_area]);

  const cursosFiltrados = cursos.filter(curso =>
    curso.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid">
      <div className="row">
        <SidebarFormando />
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">
              {area ? `Cursos de ${area.nome}` : 'Carregando...'}
            </h1>
            <div className="d-flex">
              <div className="input-group" style={{ width: '300px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Pesquisar cursos..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-primary" type="button">
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">A carregar cursos...</p>
            </div>
          ) : cursosFiltrados.length > 0 ? (
            <Row xs={1} md={2} lg={3} className="g-4">
              {cursosFiltrados.map(curso => (
                <Col key={curso.id_curso}>
                  <CourseCard curso={curso} areaNome={area?.nome} />
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center py-5">
              <div className="mb-3">
                <FaBookOpen size={48} className="text-muted" />
              </div>
              <h3 className="h5">Nenhum curso encontrado</h3>
              <p className="text-muted">
                {searchTerm ? 'Tente ajustar sua pesquisa' : 'Não há cursos disponíveis nesta área no momento'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CursosPorArea;