import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/login.css";

const SelecionarPerfil = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = location.state || {};

  const handleSelecionar = (perfil) => {
    console.log("Perfil selecionado:", perfil);
    navigate(`/dashboard/${perfil.nome.toLowerCase()}`, { state: { user, perfil } });
  };

  if (!user || !user.perfis) {
    return <p className="text-center mt-5 text-danger">Erro: informação do utilizador em falta.</p>;
  }

  return (
    <div className="login-wrapper">
      <div className="login-card text-center">
        <img
          src="/logotipo-softinsa.png"
          alt="Logo Softinsa"
          style={{ maxWidth: "220px", marginBottom: "1rem" }}
        />

        <h2>Bem-vindo, {user.nome.toLowerCase()}</h2>
        <p className="mb-4">Escolhe o teu perfil abaixo:</p>

        <div className="d-flex flex-wrap justify-content-center gap-3">
          {user.perfis.map((perfil) => (
            <button
              key={perfil.id}
              className="btn btn-outline-light"
              onClick={() => handleSelecionar(perfil)}
            >
              {perfil.nome}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelecionarPerfil;