import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import SidebarFormando from "../components/SidebarFormando";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

// Componente para descrição expandível
const DescricaoExpandivel = ({ texto, limite = 100 }) => {
  const [expandido, setExpandido] = useState(false);
  if (!texto) return null;
  const mostrarTexto = expandido ? texto : texto.slice(0, limite);
  return (
    <div style={{ maxWidth: "300px" }}>
      <p style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
        {mostrarTexto}
        {!expandido && texto.length > limite ? "..." : ""}
      </p>
      {texto.length > limite && (
        <button
          onClick={() => setExpandido(!expandido)}
          style={{
            background: "none",
            border: "none",
            color: "#0d6efd",
            cursor: "pointer",
            padding: 0,
            fontSize: "0.875rem",
            fontWeight: "600",
          }}
          aria-expanded={expandido}
        >
          {expandido ? "Mostrar menos" : "Mostrar mais"}
        </button>
      )}
    </div>
  );
};

const DashboardFormando = () => {
  const location = useLocation();
  const { user } = location.state || {};
  const [cursosAgendados, setCursosAgendados] = useState([]);
  const [conteudosPorCurso, setConteudosPorCurso] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [areaFiltro, setAreaFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, areaRes, cursosRes] = await Promise.all([
          axios.get("http://localhost:3000/api/categorias"),
          axios.get("http://localhost:3000/api/areas-formacao"),
          fetch("http://localhost:3000/api/cursos"),
        ]);

        setCategorias(catRes.data.categorias || []);
        setAreas(areaRes.data.areas || []);

        const result = await cursosRes.json();
        const cursos = result.data;

        const hoje = new Date();
        const cursosAtualizados = cursos.map((curso) => {
          const inicio = new Date(curso.data_inicio);
          const fim = new Date(curso.data_fim);
          let estado = curso.estado;
          if (hoje > fim) estado = "terminado";
          else if (hoje >= inicio && hoje <= fim) estado = "em-curso";
          return { ...curso, estado };
        });

        const agendados = cursosAtualizados.filter(c => c.estado === "agendado");

        // Buscar conteúdos por curso
        const conteudosPromises = agendados.map(async (curso) => {
          try {
            const res = await fetch(`http://localhost:3000/api/cursos/${curso.id_curso}/conteudos`);
            const conteudos = await res.json();
            return { cursoId: curso.id_curso, conteudos };
          } catch {
            return { cursoId: curso.id_curso, conteudos: [] };
          }
        });

        const conteudosResults = await Promise.all(conteudosPromises);
        const conteudosMap = conteudosResults.reduce((acc, { cursoId, conteudos }) => {
          acc[cursoId] = conteudos;
          return acc;
        }, {});

        setCursosAgendados(cursosAtualizados);
        setConteudosPorCurso(conteudosMap);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const transformFirebaseUrl = (url) => {
    if (!url) return null;
    if (url.includes("firebasestorage.googleapis.com/v0/b/") || !url.includes("storage.googleapis.com")) return url;
    const matches = url.match(/https:\/\/storage\.googleapis\.com\/([^\/]+)\/(.+)/);
    if (matches) {
      const [_, bucket, path] = matches;
      return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
    }
    return url;
  };

  if (!user) return <div className="alert alert-danger">Utilizador não autenticado.</div>;

  const cursosFiltrados = cursosAgendados.filter((curso) => {
    const areaMatch = areaFiltro ? curso.id_area === parseInt(areaFiltro) : true;
    const categoriaMatch = categoriaFiltro ? curso.id_categoria === parseInt(categoriaFiltro) : true;
    return areaMatch && categoriaMatch;
  });

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <SidebarFormando />
      <div className="container-fluid mt-4" style={{ marginLeft: "200px" }}>
        <h2>Olá {user.nome} 👋</h2>
        <p className="text-muted">Bem-vindo ao seu painel de formando</p>
        <hr />

        {/* Filtros */}
        <div className="row mb-3">
          <div className="col-md-3">
            <label htmlFor="areaFiltro" className="form-label">Filtrar por Área</label>
            <select className="form-select" value={areaFiltro} onChange={e => setAreaFiltro(e.target.value)}>
              <option value="">Todas as áreas</option>
              {areas.map(area => (
                <option key={area.id_area} value={area.id_area}>{area.nome}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label htmlFor="categoriaFiltro" className="form-label">Filtrar por Categoria</label>
            <select className="form-select" value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}>
              <option value="">Todas as categorias</option>
              {categorias.map(cat => (
                <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cursos */}
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Cursos Agendados</h5>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-2">Carregando cursos...</p>
              </div>
            ) : cursosFiltrados.length ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Imagem</th>
                      <th>Título</th>
                      <th>Descrição</th>
                      <th>Categoria</th>
                      <th>Área</th>
                      <th>Data Início</th>
                      <th>Data Fim</th>
                      <th>Tipo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cursosFiltrados.map(curso => {
                      const img = transformFirebaseUrl(curso.imagem_capa);
                      return (
                        <tr key={curso.id_curso}>
                          <td>
                            {img ? (
                              <img src={img} alt="Capa" className="img-thumbnail" style={{ width: 60, height: 60, objectFit: "cover" }} />
                            ) : (
                              <FontAwesomeIcon icon={faImage} className="text-muted" />
                            )}
                          </td>
                          <td><Link to={`/curso/${curso.id_curso}`}>{curso.titulo}</Link></td>
                          <td><DescricaoExpandivel texto={curso.descricao} /></td>
                          <td>{categorias.find(c => c.id_categoria === curso.id_categoria)?.nome || 'Desconhecida'}</td>
                          <td>{areas.find(a => a.id_area === curso.id_area)?.nome || 'Desconhecida'}</td>
                          <td>{new Date(curso.data_inicio).toLocaleDateString('pt-PT')}</td>
                          <td>{new Date(curso.data_fim).toLocaleDateString('pt-PT')}</td>
                          <td><span className={`badge ${curso.tipo === 'sincrono' ? 'bg-primary' : 'bg-success'}`}>{curso.tipo}</span></td>
                          <td>{curso.estado}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">Nenhum curso encontrado com os filtros selecionados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFormando;
