import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/login.css";

const SolicitarConta = () => {
  const [email, setEmail] = useState("");
  const [numeroColaborador, setNumeroColaborador] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resposta = await fetch("https://backend-8pyn.onrender.com/api/utilizadores/solicitar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, numeroColaborador }),
      });

      const data = await resposta.json();

      if (resposta.ok) {
        setMensagem(data.message);
        setTipoMensagem("success");
        setEmail("");
        setNumeroColaborador("");
      } else {
        setMensagem(data.message || "Erro ao solicitar conta.");
        setTipoMensagem("danger");
      }
    } catch (error) {
      setMensagem("Erro na requisição.");
      setTipoMensagem("danger");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="text-center">Solicitar conta</h2>
        <p className="text-center">
          Preencha e solicite o login ou <Link to="/" className="text-info">faça log in</Link>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 w-100">
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

          <div className="mb-4 w-100">
            <label htmlFor="numeroColaborador" className="form-label">Número de colaborador</label>
            <input
              type="text"
              id="numeroColaborador"
              className="form-control"
              placeholder="Digite seu número de colaborador"
              value={numeroColaborador}
              onChange={(e) => setNumeroColaborador(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Solicitar conta</button>
        </form>

        {mensagem && (
          <div className={`alert mt-3 alert-${tipoMensagem}`} role="alert">
            {mensagem}
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitarConta;