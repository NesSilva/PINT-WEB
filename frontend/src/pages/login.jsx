import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../css/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="text-center">Seja bem vindo</h2>
        <p className="text-center">
          Faça o login ou <a href="/solicitar" className="text-info">solicite uma conta</a>
        </p>

        <div className="mb-3 w-100">
          <label htmlFor="email" className="form-label">Login</label>
          <input
            id="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4 w-100">
          <label htmlFor="password" className="form-label">Senha</label>
          <input
            id="password"
            className="form-control"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={() => navigate("/perfil")}>
          Login
        </button>

        <div className="forgot">Esqueci minha senha</div>
      </div>
    </div>
  );
}