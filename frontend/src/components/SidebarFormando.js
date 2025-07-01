import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const SidebarFormando = () => {
  const navigate = useNavigate();
  const popupRef = useRef(null);

  const getCurrentUser = () => {
    try {
      const id_user = localStorage.getItem('usuarioId');

      console.log('ID do usuário no localStorage:', id_user);
      if (!id_user) {
        console.warn('Nenhum usuário encontrado no localStorage');
        return null;
      }


      return { id_utilizador: id_user };

    } catch (error) {
      console.error("Erro ao obter usuário:", error);
      return null;
    }
  };

  const [user, setUser] = useState(() => {
    const userData = getCurrentUser();
    console.log('Usuário inicial:', userData);
    return userData;
  });

  const [perfil, setPerfil] = useState(() => {
    try {
      const perfilData = JSON.parse(localStorage.getItem('perfil')) || null;
      console.log('Perfil inicial:', perfilData);
      return perfilData;
    } catch (error) {
      console.error("Erro ao obter perfil:", error);
      return null;
    }
  });

  const [notificacoes, setNotificacoes] = useState([]);
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  // Busca notificações com tratamento robusto
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!user?.id_utilizador) {
          console.warn('ID do usuário não disponível para buscar notificações');
          setLoadingNotificacoes(false);
          return;
        }

        console.log(`Buscando notificações para usuário ${user.id_utilizador}`);
        const response = await axios.get(
          `http://localhost:3000/api/notificacoes/${user.id_utilizador}`,
          { timeout: 5000 }
        );

        if (response.data?.success) {
          console.log('Notificações recebidas:', response.data.notificacoes);
          setNotificacoes(response.data.notificacoes || []);
        } else {
          console.warn('API não retornou sucesso:', response.data);
        }
      } catch (error) {
        console.error('Erro ao buscar notificações:', {
          message: error.message,
          url: error.config?.url,
          status: error.response?.status
        });
      } finally {
        setLoadingNotificacoes(false);
      }
    };

    // Delay para garantir que o user esteja disponível
    const timer = setTimeout(fetchNotifications, 100);
    return () => clearTimeout(timer);
  }, [user?.id_utilizador]); // Só recarrega quando o ID muda

  // Fechar popup ao clicar fora
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
      navigate("/login");
    }
  };

  const togglePopup = () => setShowPopup(!showPopup);

  const marcarComoLida = async (id_notificacao) => {
    try {
      await axios.patch(
        `http://localhost:3000/api/notificacoes/${id_notificacao}/lida`,
        null,
        { timeout: 3000 }
      );
      setNotificacoes(prev => prev.filter(n => n.id_notificacao !== id_notificacao));
    } catch (error) {
      console.error("Erro ao marcar como lida:", {
        message: error.message,
        status: error.response?.status
      });
    }
  };

  return (
    <div className="bg-white text-black p-3 sidebar-container">
      <a href="#" onClick={handleLogoClick} className="logo-link">
        <img 
          src="/logotipo-softinsa.png" 
          alt="Logotipo Softinsa" 
          className="logo-img"
        />
      </a>

      <ul className="nav flex-column">
        <li className="nav-item">
          <Link to="/dashboard/formando" className="nav-link">
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/meus-cursos" className="nav-link">
            <i className="bi bi-book me-2"></i>
            Meus Cursos
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/certificados" className="nav-link">
            <i className="bi bi-award me-2"></i>
            Certificados
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/forum" className="nav-link">
            <i className="bi bi-people me-2"></i>
            Fórum
          </Link>
        </li>

        {/* Notifications */}
        <li className="nav-item position-relative mt-3 notification-item">
          <div 
            className="nav-link d-flex align-items-center" 
            onClick={togglePopup}
            style={{ cursor: 'pointer' }}
          >
            <i className="bi bi-bell me-2"></i>
            Notificações
            {!loadingNotificacoes && notificacoes.length > 0 && (
              <span className="badge bg-danger rounded-pill ms-2">
                {notificacoes.length}
              </span>
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
        </li>
      </ul>

      {/* Adicione isto no seu arquivo CSS */}
      <style jsx>{`
        .sidebar-container {
          width: 220px;
          border-right: 1px solid #ddd;
          min-height: 100vh;
          position: relative;
        }
        .logo-link {
          display: block;
          margin-bottom: 1rem;
        }
        .logo-img {
          width: 150px;
          height: auto;
        }
        .notification-popup {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 1000;
          width: 280px;
          max-height: 400px;
          overflow-y: auto;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 5px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 10px;
        }
        .notification-entry {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .notification-body {
          font-size: 0.85rem;
          color: #555;
          margin-top: 4px;
        }
        .notification-loading {
          display: flex;
          align-items: center;
          padding: 8px;
        }
        .notification-empty {
          padding: 8px;
          color: #666;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default SidebarFormando;