import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../css/sidebar.css";

// Ícones Lucide
import { Users, BookOpen, Layers, Grid, UserCheck } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, perfil } = location.state || {};

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (user && perfil) {
      navigate(`/dashboard/${perfil.nome.toLowerCase()}`, { state: { user, perfil } });
    } else if (user) {
      navigate("/selecionar-perfil", { state: { user } });
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="custom-sidebar">
      <a href="#" onClick={handleLogoClick}>
        <img src="/logotipo-softinsa.png" alt="Logotipo Softinsa" />
      </a>

      <ul className="nav flex-column mt-4">
        <li className="nav-item">
          <Link className="nav-link" to="/utilizadores" state={{ user, perfil }}>
            <Users size={18} className="me-2" />
            Utilizadores
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/cursos" state={{ user, perfil }}>
            <BookOpen size={18} className="me-2" />
            Cursos
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/gerenciar-categorias" state={{ user, perfil }}>
            <Layers size={18} className="me-2" />
            Categorias
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/gerir-areas-formacao" state={{ user, perfil }}>
            <Grid size={18} className="me-2" />
            Áreas de Formação
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/formandos" state={{ user, perfil }}>
            <UserCheck size={18} className="me-2" />
            Inscritos
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
