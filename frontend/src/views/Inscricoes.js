// views/Inscricoes.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const Inscricoes = () => {
  const [inscricoes, setInscricoes] = useState([]);
  const [inscricoesFiltradas, setInscricoesFiltradas] = useState([]);
  const [utilizadores, setUtilizadores] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [filtros, setFiltros] = useState({ nome_utilizador: "", titulo_curso: "" });

  // Busca inscrições sem filtro (busca tudo)
  const fetchInscricoes = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/inscricoes");
      setInscricoes(res.data);
      setInscricoesFiltradas(res.data);
    } catch (err) {
      console.error("Erro ao buscar inscrições:", err);
    }
  };

  // Busca todos os utilizadores
  const fetchUtilizadores = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/utilizadores/utilizadores");
      setUtilizadores(res.data);
    } catch (err) {
      console.error("Erro ao buscar utilizadores:", err);
    }
  };

  // Busca todos os cursos
  const fetchCursos = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/cursos/todos");
      setCursos(res.data);
    } catch (err) {
      console.error("Erro ao buscar cursos:", err);
    }
  };

  // Buscar dados ao montar o componente
  useEffect(() => {
    fetchUtilizadores();
    fetchCursos();
    fetchInscricoes();
  }, []);

  // Funções para obter nome do utilizador e título do curso pelo id
  const getNomeUtilizador = (id_utilizador) => {
    const user = utilizadores.find((u) => u.id_utilizador === id_utilizador);
    return user ? user.nome : "Desconhecido";
  };

  const getTituloCurso = (id_curso) => {
    const curso = cursos.find((c) => c.id_curso === id_curso);
    return curso ? curso.titulo : "Desconhecido";
  };

  // Função para filtrar inscrições baseado no nome do utilizador e título do curso
  useEffect(() => {
    const nomeFiltro = filtros.nome_utilizador.toLowerCase();
    const tituloFiltro = filtros.titulo_curso.toLowerCase();

    const filtradas = inscricoes.filter((inscricao) => {
      const nomeUser = getNomeUtilizador(inscricao.id_utilizador).toLowerCase();
      const tituloCurso = getTituloCurso(inscricao.id_curso).toLowerCase();

      const matchUtilizador = nomeUser.includes(nomeFiltro);
      const matchCurso = tituloCurso.includes(tituloFiltro);

      return matchUtilizador && matchCurso;
    });

    setInscricoesFiltradas(filtradas);
  }, [filtros, inscricoes, utilizadores, cursos]);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div className="container mt-4">
        <h3>Lista de Inscrições</h3>

        <div className="mb-3">
          <label>Nome do Utilizador: </label>
          <input
            type="text"
            value={filtros.nome_utilizador}
            onChange={(e) => setFiltros({ ...filtros, nome_utilizador: e.target.value })}
            className="form-control"
            placeholder="Filtrar por nome do utilizador"
          />
          <label className="mt-2">Título do Curso: </label>
          <input
            type="text"
            value={filtros.titulo_curso}
            onChange={(e) => setFiltros({ ...filtros, titulo_curso: e.target.value })}
            className="form-control"
            placeholder="Filtrar por título do curso"
          />
        </div>

        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Utilizador</th>
              <th>Curso</th>
              <th>Data de Inscrição</th>
            </tr>
          </thead>
          <tbody>
            {inscricoesFiltradas.map((inscricao) => (
              <tr key={inscricao.id_inscricao}>
                <td>{inscricao.id_inscricao}</td>
                <td>{getNomeUtilizador(inscricao.id_utilizador)}</td>
                <td>{getTituloCurso(inscricao.id_curso)}</td>
                <td>{new Date(inscricao.data_inscricao).toLocaleDateString("pt-PT")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inscricoes;
