import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SelecionarPerfil = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = location.state || {};

    const handleSelecionar = (perfil) => {
        console.log("Perfil selecionado:", perfil);
        navigate(`/dashboard/${perfil.nome.toLowerCase()}`, { state: { user, perfil } });
    };

    if (!user || !user.perfis) return <p>Erro: informação do utilizador em falta.</p>;

    return (
        <div className="container mt-5">
            <h2>Olá {user.nome}, escolhe o teu perfil:</h2>
            <div className="d-flex flex-wrap gap-3 mt-4">
                {user.perfis.map((perfil) => (
                    <button
                        key={perfil.id}
                        className="btn btn-outline-primary"
                        onClick={() => handleSelecionar(perfil)}
                    >
                        {perfil.nome}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SelecionarPerfil;
