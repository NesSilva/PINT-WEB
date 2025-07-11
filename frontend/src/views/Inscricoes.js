import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../css/Inscricoes.css";

const Inscricoes = () => {
  // Estados
  const [inscricoes, setInscricoes] = useState([]);
  const [inscricoesFiltradas, setInscricoesFiltradas] = useState([]);
  const [utilizadores, setUtilizadores] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [filtros, setFiltros] = useState({ 
    nome_utilizador: "", 
    titulo_curso: "" 
  });
  const [loading, setLoading] = useState(true);

  // Buscar dados ao montar o componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [inscricoesRes, utilizadoresRes, cursosRes] = await Promise.all([
          axios.get("https://frontend-z8p8.onrender.com/api/inscricoes"),
          axios.get("https://frontend-z8p8.onrender.com/api/utilizadores/utilizadores"),
          axios.get("https://frontend-z8p8.onrender.com/api/cursos/todos")
        ]);
        
        setInscricoes(inscricoesRes.data);
        setInscricoesFiltradas(inscricoesRes.data);
        setUtilizadores(utilizadoresRes.data);
        setCursos(cursosRes.data);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Funções para obter nome do utilizador e título do curso
  const getNomeUtilizador = (id_utilizador) => {
    const user = utilizadores.find((u) => u.id_utilizador === id_utilizador);
    return user ? user.nome : "Desconhecido";
  };

  const getTituloCurso = (id_curso) => {
    const curso = cursos.find((c) => c.id_curso === id_curso);
    return curso ? curso.titulo : "Desconhecido";
  };

  // Filtrar inscrições
  useEffect(() => {
    const nomeFiltro = filtros.nome_utilizador.toLowerCase();
    const tituloFiltro = filtros.titulo_curso.toLowerCase();

    const filtradas = inscricoes.filter((inscricao) => {
      const nomeUser = getNomeUtilizador(inscricao.id_utilizador).toLowerCase();
      const tituloCurso = getTituloCurso(inscricao.id_curso).toLowerCase();

      return nomeUser.includes(nomeFiltro) && tituloCurso.includes(tituloFiltro);
    });

    setInscricoesFiltradas(filtradas);
  }, [filtros, inscricoes, utilizadores, cursos]);

  // Manipulador de mudança de filtro
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="inscricoes-container">
      <Sidebar />

      <main className="main-content">
        <div className="page-header">
          <h2>Lista de Inscrições</h2>
        </div>

        <div className="filtros-container">
          <div className="form-group">
            <label>Nome do Utilizador</label>
            <input
              type="text"
              name="nome_utilizador"
              value={filtros.nome_utilizador}
              onChange={handleFilterChange}
              className="form-control"
              placeholder="Filtrar por nome"
            />
          </div>
          
          <div className="form-group">
            <label>Título do Curso</label>
            <input
              type="text"
              name="titulo_curso"
              value={filtros.titulo_curso}
              onChange={handleFilterChange}
              className="form-control"
              placeholder="Filtrar por curso"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-message">
            Carregando inscrições...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="inscricoes-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Utilizador</th>
                  <th>Curso</th>
                  <th>Data de Inscrição</th>
                </tr>
              </thead>
              <tbody>
                {inscricoesFiltradas.length > 0 ? (
                  inscricoesFiltradas.map((inscricao) => (
                    <tr key={inscricao.id_inscricao}>
                      <td>{inscricao.id_inscricao}</td>
                      <td>{getNomeUtilizador(inscricao.id_utilizador)}</td>
                      <td>{getTituloCurso(inscricao.id_curso)}</td>
                      <td>
                        {new Date(inscricao.data_inscricao).toLocaleDateString("pt-PT")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-results">
                      Nenhuma inscrição encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inscricoes;