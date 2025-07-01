import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarFormador from "../components/SidebarFormador";
import { useLocation, useNavigate } from "react-router-dom";

const FormadorCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state || {};

  console.log("user recebido em FormadorCursos:", user);

  useEffect(() => {
    const id = user?.id_utilizador || user?.id;
    if (user && id) {
    fetchCursosDoFormador(id);
    }
    }, [user]);

    const fetchCursosDoFormador = async (idFormador) => {
    console.log("Buscando cursos do formador em:", `http://localhost:3000/api/cursos/formador/${idFormador}`);
    try {
        const response = await axios.get(`http://localhost:3000/api/cursos/formador/${idFormador}`);
        setCursos(response.data || []);
    } catch (error) {
        setCursos([]);
    } finally {
        setLoading(false);
    }
    };

  const handleVerDetalhes = (curso) => {
    navigate(`/formador/curso/${curso.id_curso}`, { state: { user, curso } });
  };

  if (!user) {
    return <p className="text-center mt-5 text-danger">Erro: informação do formador em falta.</p>;
  }

  return (
    <div className="d-flex">
      <SidebarFormador />
      <div className="container mt-5">
        <h2>Meus Cursos</h2>
        <hr />
        {loading ? (
          <p>Carregando cursos...</p>
        ) : cursos.length === 0 ? (
          <p>Nenhum curso encontrado.</p>
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Título</th>
                <th>Descrição</th>
                <th>Data Início</th>
                <th>Data Fim</th>
                <th>Estado</th>
                <th>Vagas</th>
                <th>Tipo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map((curso) => (
                <tr key={curso.id_curso}>
                  <td>{curso.titulo}</td>
                  <td>{curso.descricao}</td>
                  <td>{curso.data_inicio?.split("T")[0]}</td>
                  <td>{curso.data_fim?.split("T")[0]}</td>
                  <td>
                    {curso.estado === 'agendado' && 'Agendado'}
                    {curso.estado === 'em_curso' && 'Em curso'}
                    {curso.estado === 'terminado' && 'Terminado'}
                  </td>
                  <td>{curso.vagas ?? "Ilimitado"}</td>
                  <td>{curso.tipo}</td>
                  <td>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleVerDetalhes(curso)}
                    >
                      Gerir Conteúdo / Avaliação
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FormadorCursos;
