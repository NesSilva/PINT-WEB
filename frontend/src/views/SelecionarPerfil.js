import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SelecionarPerfil = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = location.state || {};

    const handleSelecionar = (perfil) => {
    console.log("Perfil selecionado:", perfil);
    // Atualize para usar os paths definidos nas rotas
    if (perfil.nome.toLowerCase() === 'formando') {
        navigate('/dashboard/formando', { state: { user, perfil } });
    } else if (perfil.nome.toLowerCase() === 'administrador') {
        navigate('/dashboard/administrador', { state: { user, perfil } });
    }
    // Adicione outros perfis conforme necessário
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
