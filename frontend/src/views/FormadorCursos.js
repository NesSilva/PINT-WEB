import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarFormador from "../components/SidebarFormador";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
import '../css/FormadorCursos.css';

const FormadorCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [userId, setUserId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Obter o ID do usuário do localStorage
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('usuarioId');
        if (storedUser) {
          // Tenta parsear como JSON (caso seja um objeto)
          const userData = JSON.parse(storedUser);
          const id = userData?.id_utilizador || userData?.id || storedUser;
          setUserId(id);
          fetchCursosDoFormador(id);
        }
      } catch (e) {
        console.error("Erro ao carregar usuário:", e);
      }
    };

    loadUser();
  }, []);

  const fetchCursosDoFormador = async (idFormador) => {
    console.log("Fetching cursos for formador ID:", idFormador);
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/cursos/formador/${idFormador}`);
      setCursos(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
      setMessage({ text: "Erro ao carregar cursos", type: "danger" });
      setCursos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalhes = (curso) => {
    navigate(`/formador/curso/${curso.id_curso}/conteudos`, {
      state: { userId, curso }
    });
  };

  const mostrarMensagem = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  if (!userId) {
    return (
      <div className="formador-cursos-container">
        <SidebarFormador />
        <main className="main-content">
          <Alert variant="danger" className="status-message">
            Erro: informação do formador em falta. Por favor, faça login novamente.
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="formador-cursos-container">
      <SidebarFormador />
      
      <main className="main-content">
        <div className="page-header">
          <h2>Meus Cursos</h2>
        </div>

        {message.text && (
          <Alert 
            variant={message.type === 'success' ? 'success' : 'danger'}
            className="status-message"
          >
            {message.text}
          </Alert>
        )}

        {loading ? (
          <div className="loading-message">
            Carregando cursos...
          </div>
        ) : cursos.length === 0 ? (
          <div className="no-results">
            Nenhum curso encontrado.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="cursos-table">
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
                      <span className={`status-badge ${curso.estado}`}>
                        {curso.estado === 'agendado' && 'Agendado'}
                        {curso.estado === 'em_curso' && 'Em curso'}
                        {curso.estado === 'terminado' && 'Terminado'}
                      </span>
                    </td>
                    <td>{curso.vagas ?? "Ilimitado"}</td>
                    <td>{curso.tipo}</td>
                    <td className="actions-cell">
                      <button 
                        className="btn btn-primary btn-sm action-btn"
                        onClick={() => handleVerDetalhes(curso)}
                      >
                        Gerir Conteúdo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default FormadorCursos;