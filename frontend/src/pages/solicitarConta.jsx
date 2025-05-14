import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function solicitarConta() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState("");

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-white text-center" style={{ backdropFilter: 'blur(3px)' }}>
      <h2>Solicitar Conta</h2>
      <p>Preencha e solicite o login ou <a href="/" className="text-info">faça login</a></p>
      <div className="w-25">
        <input className="form-control my-2" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} />
        <input className="form-control my-2" placeholder="Número de Funcionário" value={numero} onChange={e => setNumero(e.target.value)} />
        <button className="btn btn-primary w-100 mt-2" onClick={() => navigate("/confirmacao")}>Solicitar Conta</button>
      </div>
    </div>
  );
}
