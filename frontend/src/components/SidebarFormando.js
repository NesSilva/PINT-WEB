import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const SidebarFormando = () => {
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

      <ul className="nav flex-column">
          <li className="nav-item">
            <Link to="/dashboard/formando" className="nav-link">Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link to="#" className="nav-link">Meus Cursos</Link>
          </li>
          <li className="nav-item">
            <Link to="#" className="nav-link">Certificados</Link>
          </li>
        </ul>
    </div>
  );
};

export default SidebarFormando;