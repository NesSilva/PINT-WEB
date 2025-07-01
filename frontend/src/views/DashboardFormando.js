import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarFormando from '../components/SidebarFormando';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { FaBookOpen, FaClock, FaSearch } from 'react-icons/fa';
import axios from 'axios';

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

const CourseCard = ({ curso, areas, categorias }) => {
  const imagemCurso = transformFirebaseUrl(curso.imagem_capa);
  const areaCurso = areas.find(a => a.id_area === curso.id_area)?.nome || 'N/A';
  const categoriaCurso = categorias.find(c => c.id_categoria === curso.id_categoria)?.nome || 'N/A';
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
          <Link to={`/cursod/${curso.id_curso}`} className="btn btn-sm btn-primary">
            Ver detalhes
          </Link>
        </div>
      </Card.Footer>
    </Card>
  );
};

const DashboardFormando = () => {
  // Estado para user e perfil
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Buscar user e perfil do localStorage quando componente monta
  useEffect(() => {
    const loadUserData = () => {
      try {
        // 1. Obter dados completos do usuário
        const usuarioData = JSON.parse(localStorage.getItem('usuarioData') || '{}');
        
        // 2. Se não tiver dados completos, verifica os campos antigos
        if (!usuarioData.id && !usuarioData.id_utilizador) {
          const usuarioId = localStorage.getItem('usuarioId');
          const usuarioNome = localStorage.getItem('usuarioNome');
          
          if (usuarioId) {
            usuarioData.id = usuarioId;
            usuarioData.id_utilizador = usuarioId;
            usuarioData.nome = usuarioNome || 'Usuário';
          }
        }

        // 3. Garantir que temos os campos mínimos necessários
        if (usuarioData.id || usuarioData.id_utilizador) {
          const userObj = {
            ...usuarioData,
            id: usuarioData.id || usuarioData.id_utilizador,
            id_utilizador: usuarioData.id_utilizador || usuarioData.id,
            nome: usuarioData.nome || 'Usuário'
          };

          console.log("User object:", userObj);
          setUser(userObj);
        }

        // 4. Carregar perfil
        const usuarioPerfil = JSON.parse(localStorage.getItem('perfil') || null);
        if (usuarioPerfil) {
          console.log("Perfil carregado:", usuarioPerfil);
          setPerfil(usuarioPerfil);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    loadUserData();
  }, []);

  const [cursosAgendados, setCursosAgendados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [areaFiltro, setAreaFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [cursosFiltrados, setCursosFiltrados] = useState([]);

  // Debug: verificar estado atual
  useEffect(() => {
  if (user?.id_utilizador) {
    axios.get(`http://localhost:3000/api/notificacoes/${user.id_utilizador}`)
      .then(response => {
        console.log("Notificações:", response.data);
      })
      .catch(error => {
        console.error("Erro ao buscar notificações:", error);
      });
  }
}, [user]);

  // Buscar dados da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriasRes, areasRes, cursosRes] = await Promise.all([
          axios.get('http://localhost:3000/api/categorias'),
          axios.get('http://localhost:3000/api/areas-formacao'),
          axios.get('http://localhost:3000/api/cursos'),
        ]);

        setCategorias(categoriasRes.data?.categorias || []);
        setAreas(areasRes.data?.areas || []);

        const agendados = (cursosRes.data?.data || []).filter(curso => curso.estado === 'agendado');
        setCursosAgendados(agendados);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
  let filtrados = [...cursosAgendados];

  if (areaFiltro) {
    filtrados = filtrados.filter(curso => curso.id_area.toString() === areaFiltro);
  }

  if (categoriaFiltro) {
    filtrados = filtrados.filter(curso => curso.id_categoria.toString() === categoriaFiltro);
  }

  if (searchTerm.trim() !== '') {
      const termoLower = searchTerm.toLowerCase();
      filtrados = filtrados.filter(curso =>
        curso.titulo.toLowerCase().includes(termoLower)
      );
    }
  setCursosFiltrados(filtrados);
}, [cursosAgendados, areaFiltro, categoriaFiltro , searchTerm]);

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
        {/* Passa user e perfil para o Sidebar */}
        <SidebarFormando user={user} perfil={perfil} />
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Bem-vindo de volta, {user.nome}</h1>
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