// frontend/src/components/SidebarFormador.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SidebarFormador = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = location.state || {};

  return (
    <div className="custom-sidebar">
      <img src="/logotipo-softinsa.png" alt="Logo" style={{ width: "150px", marginBottom: "32px", cursor: "pointer" }} onClick={() => navigate('/dashboard/formador', { state: { user } })} />
      <nav className="nav flex-column">
        <button className="nav-link btn btn-link text-start" onClick={() => navigate('/dashboard/formador', { state: { user } })}>
          Dashboard
        </button>
        <button className="nav-link btn btn-link text-start" onClick={() => navigate('/formador/cursos', { state: { user } })}>
          Gerir Conteúdos 
        </button>
         <button className="nav-link btn btn-link text-start" onClick={() => navigate('/formador/cursos/ava', { state: { user } })}>
          Gerir Avaliações
        </button>

        {/* Adicione outros menus específicos do formador aqui */}
      </nav>
    </div>
  );
};

export default SidebarFormador;