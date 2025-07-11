import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FiGrid, 
  FiBookOpen, 
  FiLayers, 
  FiFileText, 
  FiChevronLeft, 
  FiChevronRight, 
  FiUsers 
} from "react-icons/fi";
import axios from "axios";
import '../css/Sidebar.css';

const SidebarFormador = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, perfil } = location.state || {};

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [nomeUtilizador, setNomeUtilizador] = useState('');

  // Buscar nome do utilizador pelo ID
  const fetchNomeUtilizador = async () => {
    try {
      const usuarioId = localStorage.getItem('usuarioId');
      if (!usuarioId) return;

      const response = await axios.get(
        `https://backend-8pyn.onrender.com/api/utilizadores/utilizador/nome/${usuarioId}`
      );

      if (response.data.success) {
        setNomeUtilizador(response.data.nome);
      }
    } catch (error) {
      console.error('Erro ao buscar nome do utilizador:', error);
    }
  };

  useEffect(() => {
    fetchNomeUtilizador();
  }, []);

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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleItemHover = (index) => {
    setActiveItem(index);
  };

  const handleItemLeave = () => {
    setActiveItem(null);
  };

  const highlightPosition = activeItem !== null ? 16 + (activeItem * 54) : -70;

  const menuItems = [
    { path: "/dashboard/formador", icon: <FiGrid size={20} />, label: "Dashboard" },
    { path: "/formador/cursos", icon: <FiBookOpen size={20} />, label: "Gerir Conteúdos" },
    { path: "/formador/cursos/ava", icon: <FiLayers size={20} />, label: "Gerir Avaliações" },
    { path: "/forumFormador", icon: <FiUsers size={20} />, label: "Fórum" }
  ];

  return (
    <>
      <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <a href="#" onClick={handleLogoClick} className="sidebar-logo-link">
            <img 
              src="/logotipo-softinsa.png" 
              alt="Logotipo Softinsa" 
              className="sidebar-logo-img"
            />
          </a>

          <button 
            onClick={toggleSidebar}
            className="sidebar-toggle-btn"
          >
            {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
          </button>
        </div>

        <hr className="sidebar-divider" />

        <div className="sidebar-content">
          <div 
            className="sidebar-highlight" 
            style={{ top: `${highlightPosition}px` }}
          >
            <div className="highlight-top-circle" />
            <div className="highlight-bottom-circle" />
          </div>

          <div className="sidebar-menu">
            {menuItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                state={{ user, perfil }}
                className={`sidebar-menu-item ${activeItem === index ? 'active' : ''}`}
                onMouseEnter={() => handleItemHover(index)}
                onMouseLeave={handleItemLeave}
              >
                <div className="sidebar-menu-icon">
                  {item.icon}
                </div>
                <span className="sidebar-menu-label">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="footer-avatar" />
          
          {!isCollapsed && (
            <div className="footer-user-info">
              <div className="footer-user-name">
                {nomeUtilizador || user?.nome || 'Formador'}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        {children}
      </div>
    </>
  );
};

export default SidebarFormador;