import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  FiGrid, 
  FiBookOpen, 
  FiUsers,
  FiBell,
  FiChevronLeft, 
  FiChevronRight,
  FiFolder,
  FiChevronDown,
  FiChevronUp,
  FiLogOut
} from "react-icons/fi";
import "../css/SidebarFormando.css";

const SidebarFormando = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const popupRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [categoriesWithAreas, setCategoriesWithAreas] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCategories, setShowCategories] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [nomeUtilizador, setNomeUtilizador] = useState('');
  const { user, perfil } = location.state || {};

  // Buscar nome do utilizador pelo ID
  const fetchNomeUtilizador = async () => {
    try {
      const usuarioId = localStorage.getItem('usuarioId');
      if (!usuarioId) return;

      const response = await axios.get(
        `https://backend-8pyn.onrender.com/api/utilizadores/utilizador/nome/${usuarioId}`
      );
      console.log('Nome do utilizador:', response);

      if (response.data.success) {
        setNomeUtilizador(response.data.nome);
      }
    } catch (error) {
      console.error('Erro ao buscar nome do utilizador:', error);
    }
  };

  // Buscar categorias e áreas
  useEffect(() => {
    const fetchCategoriesAndAreas = async () => {
      try {
        const [categoriesRes, areasRes] = await Promise.all([
          axios.get('https://backend-8pyn.onrender.com/api/categorias'),
          axios.get('https://backend-8pyn.onrender.com/api/areas-formacao')
        ]);

        const categories = categoriesRes.data?.categorias || [];
        const areas = areasRes.data?.areas || [];

        const categoriesWithAreasData = categories.map(category => ({
          ...category,
          areas: areas.filter(area => area.id_categoria === category.id_categoria)
        }));

        setCategoriesWithAreas(categoriesWithAreasData);
      } catch (error) {
        console.error('Erro ao buscar categorias e áreas:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategoriesAndAreas();
    fetchNomeUtilizador();
  }, []);

  // Buscar notificações
  const getCurrentUser = () => {
    try {
      const usuarioId = localStorage.getItem('usuarioId');
      if (usuarioId) {
        return {
          id_utilizador: usuarioId,
        };
      }
      return null;
    } catch (error) {
      console.error("Erro ao obter usuário:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const user = getCurrentUser();
        const userId = user?.id_utilizador || user?.id;
        
        if (!userId) {
          setLoadingNotificacoes(false);
          return;
        }
        
        const response = await axios.get(
          `https://backend-8pyn.onrender.com/api/notificacoes/${userId}`,
          { timeout: 5000 }
        );
        
        if (response.data?.success) {
          setNotificacoes(response.data.notificacoes || []);
        }
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
      } finally {
        setLoadingNotificacoes(false);
      }
    };

    const timer = setTimeout(fetchNotifications, 100);
    return () => clearTimeout(timer);
  }, [user?.id, user?.id_utilizador]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (user && perfil) {
      navigate(`/dashboard/${perfil.nome.toLowerCase()}`, { 
        state: { user, perfil } 
      });
    } else if (user) {
      navigate("/selecionar-perfil", { state: { user } });
    } else {
      navigate("/");
    }
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const togglePopup = () => setShowPopup(!showPopup);
  const toggleCategoriesDropdown = () => setShowCategories(!showCategories);

  const handleItemHover = (index) => setActiveItem(index);
  const handleItemLeave = () => setActiveItem(null);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const highlightPosition = activeItem !== null ? 16 + (activeItem * 54) : -70;

  const marcarComoLida = async (id_notificacao) => {
    try {
      await axios.patch(
        `https://backend-8pyn.onrender.com/api/notificacoes/${id_notificacao}/lida`,
        null,
        { timeout: 3000 }
      );
      setNotificacoes(prev => prev.filter(n => n.id_notificacao !== id_notificacao));
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  const menuItems = [
    { path: "/dashboard/formando", icon: <FiGrid size={20} />, label: "Dashboard" },
    { path: "/meus-cursos", icon: <FiBookOpen size={20} />, label: "Meus Cursos" },
    { path: "/forum", icon: <FiUsers size={20} />, label: "Fórum" }
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
                {!isCollapsed && (
                  <span className="sidebar-menu-label">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}

            <div className="categories-dropdown">
              <div 
                className={`sidebar-menu-item ${showCategories ? 'active' : ''}`}
                onClick={toggleCategoriesDropdown}
              >
                <div className="sidebar-menu-icon">
                  <FiFolder size={20} />
                </div>
                {!isCollapsed && (
                  <>
                    <span className="sidebar-menu-label">
                      Categorias
                    </span>
                    <div className="dropdown-arrow">
                      {showCategories ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                    </div>
                  </>
                )}
              </div>

              {showCategories && !isCollapsed && (
                <div className={`categories-dropdown-content ${showCategories ? 'show' : ''}`}>
                  {loadingCategories ? (
                    <div className="categories-loading">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Carregando...</span>
                      </div>
                    </div>
                  ) : (
                    categoriesWithAreas.map(category => (
                      <div key={category.id_categoria} className="category-item">
                        <div 
                          className="category-header"
                          onClick={() => toggleCategory(category.id_categoria)}
                        >
                          <span>{category.nome}</span>
                          {expandedCategories[category.id_categoria] ? 
                            <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                        </div>
                        
                        {expandedCategories[category.id_categoria] && (
                          <div className="areas-list">
                            {category.areas.map(area => (
                              <Link
                                key={area.id_area}
                                to={`/cursos/area/${area.id_area}`}
                                className="area-item"
                              >
                                {area.nome}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div 
              className={`sidebar-menu-item notification-item ${activeItem === menuItems.length + 1 ? 'active' : ''}`}
              onMouseEnter={() => handleItemHover(menuItems.length + 1)}
              onMouseLeave={handleItemLeave}
              onClick={togglePopup}
              style={{ cursor: 'pointer' }}
            >
              <div className="sidebar-menu-icon">
                <FiBell size={20} />
                {!loadingNotificacoes && notificacoes.length > 0 && (
                  <span className="notification-badge">
                    {notificacoes.length}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <span className="sidebar-menu-label">
                  Notificações
                </span>
              )}
            </div>
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
                {nomeUtilizador || user?.nome || 'Formando'}
              </div>
            </div>
          )}
        </div>

        {showPopup && (
          <div ref={popupRef} className="notification-popup">
            {loadingNotificacoes ? (
              <div className="notification-loading">
                <div className="spinner-border spinner-border-sm me-2"></div>
                Carregando...
              </div>
            ) : notificacoes.length > 0 ? (
              notificacoes.map(notif => (
                <div key={notif.id_notificacao} className="notification-entry">
                  <div className="notification-header">
                    <strong>{notif.titulo || 'Nova notificação'}</strong>
                    <small className="text-muted ms-2">
                      {new Date(notif.data_criacao).toLocaleDateString('pt-PT')}
                    </small>
                  </div>
                  <div className="notification-body">
                    {notif.mensagem}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      marcarComoLida(notif.id_notificacao);
                    }}
                    className="btn btn-sm btn-outline-primary mt-2"
                  >
                    <i className="bi bi-check2-circle me-1"></i>
                    Visualizar
                  </button>
                </div>
              ))
            ) : (
              <div className="notification-empty">
                Sem notificações no momento
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        {children}
      </div>
    </>
  );
};

export default SidebarFormando;