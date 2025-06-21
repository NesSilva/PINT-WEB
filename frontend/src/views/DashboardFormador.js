// frontend/src/views/DashboardFormador.js
import React from "react";
import SidebarFormador from "../components/SidebarFormador";
import { useNavigate, useLocation } from "react-router-dom";

const DashboardFormador = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = location.state || {};

  const handleIrParaCursos = () => {
    navigate('/formador/cursos', { state: { user } });
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <SidebarFormador />
      <div className="container-fluid mt-4" style={{ marginLeft: '200px' }}>
        <h2>Olá, Formador 👋</h2>
        <hr />
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <h5 className="card-title">Gerir Conteúdos</h5>
                  <p className="card-text">Adicione, edite ou remova conteúdos dos seus cursos.</p>
                </div>
                <button className="btn btn-primary mt-3" onClick={handleIrParaCursos}>
                  Gerir Conteúdos
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <h5 className="card-title">Avaliação dos Formandos</h5>
                  <p className="card-text">Lance notas, avalie trabalhos enviados e acompanhe o progresso dos formandos.</p>
                </div>
                <button className="btn btn-secondary mt-3" onClick={handleIrParaCursos}>
                  Acessar Avaliações
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Adicione gráficos, notificações, etc, se desejar */}
      </div>
    </div>
  );
};

export default DashboardFormador;
