import React, { useState } from "react";

const SolicitarConta = () => {
  const [email, setEmail] = useState("");
  const [numeroColaborador, setNumeroColaborador] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resposta = await fetch("http://localhost:3000/api/utilizadores/solicitar", {
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
    <div className="container mt-5">
      <h2>Solicitar Conta</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu email"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Número de Colaborador</label>
          <input
            type="text"
            className="form-control"
            value={numeroColaborador}
            required
            onChange={(e) => setNumeroColaborador(e.target.value)}
            placeholder="Digite seu número de colaborador"
          />
        </div>
        <button type="submit" className="btn btn-primary">Solicitar Conta</button>
      </form>

      {mensagem && (
        <div className={`alert mt-3 alert-${tipoMensagem}`}>
          {mensagem}
        </div>
      )}
    </div>
  );
};

export default SolicitarConta;
