import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ResetPasswordForm = () => {
    const [email, setEmail] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // success | error
    const navigate = useNavigate();

    // Caso tenha salvo o email anteriormente na página de solicitação
    useEffect(() => {
        const savedEmail = localStorage.getItem("resetEmail");
        if (savedEmail) setEmail(savedEmail);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const response = await axios.post("https://backend-8pyn.onrender.com/api/password/reset-password", {
                email,
                resetCode,
                newPassword,
            });
            

            if (response.data.success) {
                setMessage("Senha alterada com sucesso!");
                setMessageType("success");

                // Limpar dados e redirecionar após 3 segundos
                localStorage.removeItem("resetEmail");
                setTimeout(() => navigate("/"), 3000);
            } else {
                setMessage(response.data.message || "Falha ao alterar a senha.");
                setMessageType("error");
            }
        } catch (err) {
            console.error("Erro ao redefinir senha:", err);
            setMessage("Erro no servidor. Tente novamente mais tarde.");
            setMessageType("error");
        }
    };

    return (
        <div className="container mt-5">
            <h2>Redefinir Senha</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Código de Recuperação:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Nova Senha:</label>
                    <input
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary mt-3">
                    Redefinir Senha
                </button>
            </form>

            {message && (
                <div
                    className={`alert mt-3 ${messageType === "success" ? "alert-success" : "alert-danger"}`}
                    role="alert"
                >
                    {message}
                </div>
            )}
        </div>
    );
};

export default ResetPasswordForm;
