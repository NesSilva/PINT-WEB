import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import "../css/login.css";

const PrimeiroLogin = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage("As palavras-passe não coincidem.");
            setMessageType("error");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/api/password/first-login", {
                email,
                newPassword,
            });

            if (response.data.success) {
                setMessage("Senha atualizada com sucesso. Redirecionando...");
                setMessageType("success");
                setTimeout(() => navigate("/"), 2000);
            } else {
                setMessage(response.data.message || "Erro ao atualizar senha.");
                setMessageType("error");
            }
        } catch (err) {
            console.error("Erro ao atualizar senha:", err);
            setMessage("Erro ao atualizar senha.");
            setMessageType("error");
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h2 className="text-center">Definir Nova Palavra-passe</h2>
                <p className="text-center">
                    Por favor, defina a sua nova palavra-passe
                </p>

                <form onSubmit={handleSubmit} className="w-100">
                    <div className="mb-3 w-100">
                        <label htmlFor="newPassword" className="form-label">Nova Palavra-passe</label>
                        <input
                            type="password"
                            id="newPassword"
                            className="form-control"
                            placeholder="Nova palavra-passe"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4 w-100">
                        <label htmlFor="confirmPassword" className="form-label">Confirmar Palavra-passe</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="form-control"
                            placeholder="Confirmar palavra-passe"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">Atualizar Senha</button>
                </form>

                {message && (
                    <div
                        className={`mt-3 alert ${messageType === "success" ? "alert-success" : "alert-danger"}`}
                        role="alert"
                    >
                        {message}
                    </div>
                )}

                <div className="forgot mt-3 text-center">
                    <Link to="/" className="text-info">Voltar ao login</Link>
                </div>
            </div>
        </div>
    );
};

export default PrimeiroLogin;