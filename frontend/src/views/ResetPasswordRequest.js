import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../css/login.css";

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const navigate = useNavigate();

  const handleResetRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://backend-8pyn.onrender.com/api/password/reset-password-request", { email });
      if (response.data.success) {
        setMessage("Código enviado. Verifique seu e-mail.");
        setMessageType("success");
        setTimeout(() => navigate("/reset-password"), 3000);
      } else {
        setMessage(response.data.message);
        setMessageType("danger");
      }
    } catch (err) {
      console.error("Erro ao solicitar reset:", err);
      setMessage("Erro ao solicitar o reset de senha.");
      setMessageType("danger");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="text-center">Solicitar recuperação</h2>
        <p className="text-center">
          Digite o seu email abaixo para receber um código de recuperação. Já tem conta?{" "}
          <Link to="/" className="text-info">Voltar para login</Link>
        </p>

        <form onSubmit={handleResetRequest}>
          <div className="mb-4 w-100">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Solicitar código
          </button>
        </form>

        {message && (
          <div className={`alert mt-3 alert-${messageType}`} role="alert">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordRequest;
