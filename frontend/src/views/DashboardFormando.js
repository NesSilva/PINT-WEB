import React, { useEffect, useState } from "react";
import { useLocation , Link  } from "react-router-dom";
import SidebarFormando from "../components/SidebarFormando";
import { Bar } from "react-chartjs-2";
import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Componente para descrição expandível com "Mostrar mais / Mostrar menos"
const DescricaoExpandivel = ({ texto, limite = 100 }) => {
  const [expandido, setExpandido] = useState(false);

  if (!texto) return null;

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

  // Estados dos filtros
  const [areaFiltro, setAreaFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');

  useEffect(() => {
  const fetchData = async () => {
    try {
      const categoriasRes = await axios.get('http://localhost:3000/api/categorias');
      setCategorias(categoriasRes.data.categorias || []);

      const areasRes = await axios.get('http://localhost:3000/api/areas-formacao');
      setAreas(areasRes.data.areas || []);

      const response = await fetch("http://localhost:3000/api/cursos");
      const result = await response.json();

      const cursos = result.data;

      const cursosAtualizados = cursos.map(curso => {
        const hoje = new Date();
        const dataInicio = new Date(curso.data_inicio);
        const dataFim = new Date(curso.data_fim);

        let estadoAtualizado = curso.estado;

        if (hoje > dataFim) {
          estadoAtualizado = "terminado";
        } else if (hoje >= dataInicio && hoje <= dataFim) {
          estadoAtualizado = "em-curso";
        }
        // Caso contrário, mantém estado original

        return { ...curso, estado: estadoAtualizado };
      });

      setCursosAgendados(cursosAtualizados);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setLoading(false);
    }
  };

  fetchData();
}, []);


  // Função para transformar URL do Firebase em URL de download direto
  const transformFirebaseUrl = (url) => {
    if (!url) return null;

    if (url.includes('firebasestorage.googleapis.com/v0/b/') ||
        !url.includes('storage.googleapis.com')) {
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

  if (!user) return <div className="alert alert-danger">Utilizador não autenticado.</div>;

  // Obter listas únicas para preencher os selects de filtro
  const areasUnicas = [...new Set(cursosAgendados.map(curso => curso.area).filter(Boolean))];
  const categoriasUnicas = [...new Set(cursosAgendados.map(curso => curso.categoria).filter(Boolean))];

 const cursosFiltrados = cursosAgendados.filter(curso => {
  const areaMatch = areaFiltro ? curso.id_area === parseInt(areaFiltro) : true;
  const categoriaMatch = categoriaFiltro ? curso.id_categoria === parseInt(categoriaFiltro) : true;
  return areaMatch && categoriaMatch;
});

  return (
  <div className="d-flex" style={{ minHeight: '100vh' }}>
    <SidebarFormando />

    <div className="container-fluid mt-4" style={{ marginLeft: '200px' }}>
      <h2>Olá {user.nome} 👋</h2>
      <p className="text-muted">Bem-vindo ao seu painel de formando</p>
      <hr />

      {/* Filtros */}
      <div className="row mb-3">
        <div className="col-md-3">
          <label htmlFor="areaFiltro" className="form-label">Filtrar por Área</label>
          <select
            id="areaFiltro"
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

        <div className="col-md-3">
          <label htmlFor="categoriaFiltro" className="form-label">Filtrar por Categoria</label>
          <select
            id="categoriaFiltro"
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

      {/* Cursos Agendados */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Cursos Agendados</h5>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                  <p className="mt-2">Carregando cursos...</p>
                </div>
              ) : cursosFiltrados.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>Imagem</th>
                        <th>Título</th>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>ID Categoria</th>
                        <th>ID Área</th>
                        <th>Data de Início</th>
                        <th>Data de Fim</th>
                        <th>Tipo</th>
                            <th>Estado</th>

                      </tr>
                    </thead>
                    <tbody>
                      {cursosFiltrados.map((curso) => {
                        const imagemCurso = transformFirebaseUrl(curso.imagem_capa);

                        return (
                          <tr key={curso.id_curso}>
                            <td>
                              {imagemCurso ? (
                                <div className="d-flex justify-content-center">
                                  <img
                                    src={imagemCurso}
                                    alt={`Capa do curso ${curso.titulo}`}
                                    className="img-thumbnail"
                                    style={{
                                      width: '60px',
                                      height: '60px',
                                      objectFit: 'cover',
                                      backgroundColor: '#f8f9fa'
                                    }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://via.placeholder.com/60?text=Sem+Imagem';
                                      e.target.style.objectFit = 'contain';
                                    }}
                                  />
                                </div>
                              ) : (
                                <div
                                  className="d-flex align-items-center justify-content-center"
                                  style={{
                                    width: '60px',
                                    height: '60px',
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #dee2e6'
                                  }}
                                >
                                  <FontAwesomeIcon icon={faImage} className="text-muted" />
                                </div>
                              )}
                            </td>
                            <td className="fw-semibold">
                              <Link to={`/curso/${curso.id_curso}`}>
                                {curso.titulo}
                              </Link>
                            </td>
                            <td>
                              <DescricaoExpandivel texto={curso.descricao} limite={100} />
                            </td>
                            <td>
                              <DescricaoExpandivel texto={curso.categoria} limite={100} />
                            </td>
                            <td>{categorias.find(c => c.id_categoria === curso.id_categoria)?.nome || 'Categoria não encontrada'}</td>
                            <td>{areas.find(a => a.id_area === curso.id_area)?.nome || 'Área não encontrada'}</td>

                            <td>{new Date(curso.data_inicio).toLocaleDateString('pt-PT')}</td>
                            <td>{new Date(curso.data_fim).toLocaleDateString('pt-PT')}</td>
                            <td>
                              <span className={`badge ${curso.tipo === 'sincrono' ? 'bg-primary' : 'bg-success'}`}>
                                {curso.tipo === 'sincrono' ? 'Síncrono' : 'Assíncrono'}
                              </span>
                            </td>
                            <tr key={curso.id_curso}>
      {/* outras colunas */}
      <td>{curso.estado}</td>
    </tr>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Não existem cursos que correspondam aos filtros.</p>
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
