import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import SidebarFormando from '../components/SidebarFormando';
import { Card, Row, Col, Container, Badge } from 'react-bootstrap';
import { FaBookOpen, FaClock, FaCheckCircle, FaStar, FaSearch } from 'react-icons/fa';
import axios from 'axios';

// Função para transformar URL do Firebase em URL de download direto
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

// Componente para o cartão do curso
const CourseCard = ({ curso, areas, categorias }) => {
  const imagemCurso = transformFirebaseUrl(curso.imagem_capa);
  const areaCurso = areas.find(a => a.id_area === curso.id_area)?.nome || 'N/A';
  const categoriaCurso = categorias.find(c => c.id_categoria === curso.id_categoria)?.nome || 'N/A';
  const dataInicio = new Date(curso.data_inicio).toLocaleDateString('pt-PT');
  const dataFim = new Date(curso.data_fim).toLocaleDateString('pt-PT');
  const isSincrono = curso.tipo === 'sincrono';

  return (
    <Card className="h-100 shadow-sm">
      <div className="position-relative">
        <Card.Img 
          variant="top" 
          src={imagemCurso || 'https://via.placeholder.com/300x150?text=Sem+Imagem'} 
          alt={`Capa do curso ${curso.titulo}`}
          style={{ height: '150px', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x150?text=Sem+Imagem';
          }}
        />
        <div className="position-absolute top-0 end-0 m-2">
          <span className={`badge ${isSincrono ? 'bg-primary' : 'bg-success'}`}>
            {isSincrono ? 'Síncrono' : 'Assíncrono'}
          </span>
        </div>
      </div>
      <Card.Body className="d-flex flex-column">
        <div className="mb-2">
          <span className="badge bg-light text-dark me-2">{areaCurso}</span>
          <span className="badge bg-light text-dark">{categoriaCurso}</span>
        </div>
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
          <Link to={`/curso/${curso.id_curso}`} className="btn btn-sm btn-primary">
            Ver detalhes
          </Link>
        </div>
      </Card.Footer>
    </Card>
  );
};

// Componente para descrição expandível com "Mostrar mais / Mostrar menos"
const DescricaoExpandivel = ({ texto, limite = 100 }) => {
  const [expandido, setExpandido] = useState(false);

  if (!texto) return <span>Sem descrição</span>;

  const mostrarTexto = expandido ? texto : texto.slice(0, limite);

  return (
    <div style={{ maxWidth: '300px' }}>
      <p style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
        {mostrarTexto}
        {!expandido && texto.length > limite ? '...' : ''}
      </p>
      {texto.length > limite && (
        <button 
          onClick={() => setExpandido(!expandido)}
          style={{
            background: 'none',
            border: 'none',
            color: '#0d6efd',
            cursor: 'pointer',
            padding: 0,
            fontSize: '0.875rem',
            fontWeight: '600',
          }}
          aria-expanded={expandido}
        >
          {expandido ? 'Mostrar menos' : 'Mostrar mais'}
        </button>
      )}
    </div>
  );
};

const DashboardFormando = () => {
  const location = useLocation();
  const { user } = location.state || {};
  const [cursosAgendados, setCursosAgendados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [areaFiltro, setAreaFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [cursosFiltrados, setCursosFiltrados] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriasRes, areasRes, cursosRes] = await Promise.all([
          axios.get('http://localhost:3000/api/categorias'),
          axios.get('http://localhost:3000/api/areas-formacao'),
          fetch('http://localhost:3000/api/cursos').then(res => res.json())
        ]);

        setCategorias(categoriasRes.data.categorias || []);
        setAreas(areasRes.data.areas || []);
        
        const agendados = (cursosRes.data || []).filter(curso => curso.estado === 'agendado');
        setCursosAgendados(agendados);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Using the transformFirebaseUrl function defined at the top of the file

  useEffect(() => {
    let filtrados = [...cursosAgendados];
    
    if (areaFiltro) {
      filtrados = filtrados.filter(curso => curso.id_area === areaFiltro);
    }
    
    if (categoriaFiltro) {
      filtrados = filtrados.filter(curso => curso.id_categoria === categoriaFiltro);
    }
    
    setCursosFiltrados(filtrados);
  }, [cursosAgendados, areaFiltro, categoriaFiltro]);

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">Utilizador não autenticado.</div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <SidebarFormando />
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Bem-vindo de volta, {user?.nome || 'Utilizador'}</h1>
            <div className="d-flex">
              <div className="input-group" style={{ width: '300px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Pesquisar cursos..." 
                />
                <button className="btn btn-primary" type="button">
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="row mb-4">
            <div className="col-md-4">
              <select
                className="form-select"
                value={areaFiltro}
                onChange={e => setAreaFiltro(e.target.value)}
              >
                <option value="">Todas as áreas</option>
                {areas.map(area => (
                  <option key={area.id_area} value={area.id_area}>
                    {area.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={categoriaFiltro}
                onChange={e => setCategoriaFiltro(e.target.value)}
              >
                <option value="">Todas as categorias</option>
                {categorias.map(cat => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cursos em Destaque */}
          <div className="mb-5">
            <h2 className="h4 mb-4">Cursos em Destaque</h2>
            <Row xs={1} md={2} lg={3} className="g-4">
              {cursosFiltrados.slice(0, 3).map(curso => (
                <Col key={curso.id_curso}>
                  <CourseCard curso={curso} areas={areas} categorias={categorias} />
                </Col>
              ))}
            </Row>
          </div>

          {/* Todos os Cursos */}
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h4 mb-0">Todos os Cursos</h2>
              <div className="text-muted">
                {cursosFiltrados.length} cursos encontrados
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
                <p className="mt-2">A carregar cursos...</p>
              </div>
            ) : cursosFiltrados.length > 0 ? (
              <Row xs={1} md={2} lg={3} className="g-4">
                {cursosFiltrados.map(curso => (
                  <Col key={curso.id_curso}>
                    <CourseCard curso={curso} areas={areas} categorias={categorias} />
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-center py-5">
                <div className="mb-3">
                  <FaBookOpen size={48} className="text-muted" />
                </div>
                <h3 className="h5">Nenhum curso encontrado</h3>
                <p className="text-muted">Tente ajustar os filtros de pesquisa</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardFormando;