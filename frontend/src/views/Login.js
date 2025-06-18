import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"; 
import "../css/login.css";



const Login = () => {
    const [email, setEmail] = useState("");
    const [senha, setsenha] = useState("");
    const [message, setMessage] = useState(""); 
    const [messageType, setMessageType] = useState(""); 
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:3000/", {
                email: email,
                senha: senha
            });

            if (response.data.success) {
                localStorage.setItem('usuarioId', response.data.user.id);
                setMessage("Login efetuado com sucesso!");
                setMessageType("success");
            
                const primeiroLogin = response.data.user?.primeiroLogin;
                
                if (primeiroLogin === 0) {

                    navigate("/primeiro-login", { state: { email: email } });
                } else {
                    console.log("primeiroLogin:", response.data.user?.primeiroLogin);

                    const user = response.data.user;
                    navigate("/selecionar-perfil", { state: { user } });

                }
            }
             else {
                setMessage("Erro no login: " + response.data.message);
                setMessageType("error");
            }
        } catch (err) {
            console.error("Erro no login:", err);
            setMessage("Erro ao efetuar login. Verifique suas credenciais.");
            setMessageType("error");
        }
    };

    return (
  <div className="login-wrapper">
    <div className="login-card">
      <h2 className="text-center">Seja bem-vindo</h2>
      <p className="text-center">
        Faça o login ou <Link to="/solicitar" className="text-info">solicite uma conta</Link>
      </p>

      <form onSubmit={handleLogin} className="w-100">
        <div className="mb-3 w-100">
          <label htmlFor="email" className="form-label">Login</label>
          <input
            type="email"
            id="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4 w-100">
          <label htmlFor="senha" className="form-label">Palavra-passe</label>
          <input
            type="password"
            id="senha"
            className="form-control"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setsenha(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>

      {}
      {message && (
        <div
          className={`mt-3 alert ${messageType === "success" ? "alert-success" : "alert-danger"}`}
          role="alert"
        >
          {message}
        </div>
      )}

      <div className="forgot mt-3 text-center">
        Esqueceu sua senha? <Link to="/reset-password-request" className="text-info">Clique aqui</Link>
      </div>
      <p className="text-center">
        Faça o login ou <Link to="/solicitar" className="text-info">solicite uma conta</Link>
      </p>

    </div>
  </div>
);
};


export default Login;
