import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const PrimeiroLogin = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage("As palavras-passe não coincidem.");
            return;
        }

        try {
            const response = await axios.post("https://backend-8pyn.onrender.com/api/password/first-login", {
                email,
                newPassword,
            });

            if (response.data.success) {
                setMessage("Senha atualizada com sucesso. Redirecionando...");
                setTimeout(() => navigate("/"), 2000);
            } else {
                setMessage(response.data.message || "Erro ao atualizar senha.");
            }
        } catch (err) {
            console.error("Erro ao atualizar senha:", err);
            setMessage("Erro ao atualizar senha.");
        }
    };

    return (
        <div className="container mt-5">
            <h2>Definir Nova Palavra-passe</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nova Palavra-passe:</label>
                    <input
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Confirmar Palavra-passe:</label>
                    <input
                        type="password"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary mt-3">
                    Atualizar Senha
                </button>
            </form>
            {message && <p className="mt-3">{message}</p>}
        </div>
    );
};

export default PrimeiroLogin;
