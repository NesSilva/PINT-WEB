import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const SidebarFormando = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, perfil } = location.state || {};
  const [notificacoes, setNotificacoes] = useState([]);
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(true);

  useEffect(() => {
    if (user?.id_utilizador) {
      axios.get(`http://localhost:3000/api/notificacoes/${user.id_utilizador}`)
        .then(res => {
          if (res.data.success) {
            setNotificacoes(res.data.notificacoes);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingNotificacoes(false));
    }
  }, [user]);

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
        <li className="nav-item position-relative">
          <Link to="/dashboard/formando" className="nav-link">
            Dashboard
            {!loadingNotificacoes && notificacoes.length > 0 && (
              <span style={{
                backgroundColor: 'red',
                borderRadius: '50%',
                color: 'white',
                padding: '2px 6px',
                fontSize: '0.75rem',
                position: 'absolute',
                top: '5px',
                right: '10px',
              }}>
                {notificacoes.length}
              </span>
            )}
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/meus-cursos" className="nav-link">Meus Cursos</Link>
        </li>
        <li className="nav-item">
          <Link to="/certificados" className="nav-link">Certificados</Link>
        </li>
        <li className="nav-item">
          <Link to="/forum" className="nav-link">Fórum</Link>
        </li>
      </ul>
    </div>
  );
};

export default SidebarFormando;
