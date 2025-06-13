import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
    <div className="bg-white text-black p-3" style={{ width: '220px', borderRight: '1px solid #ddd', minHeight: '100vh' }}>
      <a href="#" onClick={handleLogoClick} style={{ display: 'block' }}>
        <img 
          src="/logotipo-softinsa.png" 
          alt="Logotipo Softinsa" 
          style={{ width: "150px", height: "auto" }} 
        />
      </a>

      <ul className="nav flex-column mt-4">
        <li className="nav-item mb-2">
          <Link className="nav-link text-black" to="/utilizadores" state={{ user, perfil }}>
            Utilizadores
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link className="nav-link text-black" to="/cursos" state={{ user, perfil }}>
            Cursos
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link className="nav-link text-black" to="/gerenciar-categorias" state={{ user, perfil }}>
            Categorias
          </Link>
          
        </li>
        <li className="nav-item mb-2">
    <Link className="nav-link text-black" to="/gerir-areas-formacao" state={{ user, perfil }}>
        Áreas de Formação
    </Link>
</li>
        <li className="nav-item mb-2">
          <Link className="nav-link text-black" to="/formandos" state={{ user, perfil }}>
            Inscritos
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;