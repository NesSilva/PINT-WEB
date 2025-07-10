import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiUsers, FiBookOpen, FiGrid, FiLayers, FiFileText, FiChevronLeft, FiChevronRight, FiMessageSquare, FiLogOut } from "react-icons/fi";
import '../css/Sidebar.css';

const Sidebar = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, perfil } = location.state || {};

  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState(null);
  const [showLogout, setShowLogout] = React.useState(false);

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (user && perfil) {
      navigate(`/dashboard/${perfil.nome.toLowerCase()}`, { state: { user, perfil } });
    } else if (user) {
      navigate("/selecionar-perfil", { state: { user } });
    } else {
      navigate("/dashboard/administrador");
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
    { path: "/utilizadores", icon: <FiUsers size={20} />, label: "Utilizadores" },
    { path: "/cursos", icon: <FiBookOpen size={20} />, label: "Cursos" },
    { path: "/gerenciar-categorias", icon: <FiGrid size={20} />, label: "Categorias" },
    { path: "/gerir-areas-formacao", icon: <FiLayers size={20} />, label: "Áreas de Formação" },
    { path: "/admin/forum", icon: <FiMessageSquare size={20} />, label: "Moderar Fórum" }
  ];

  return (
    <>
      <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <a href="/dashboard/administrador" onClick={handleLogoClick} className="sidebar-logo-link">
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
              <div 
                className="footer-user-name"
                onClick={() => setShowLogout(!showLogout)}
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                {user?.nome || 'Utilizador'}
                
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

export default Sidebar;