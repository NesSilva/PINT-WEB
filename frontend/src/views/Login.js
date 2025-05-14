import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"; // Importando o Link para navegação

const Login = () => {
    const [email, setEmail] = useState("");
    const [senha, setsenha] = useState("");
    const [message, setMessage] = useState(""); // Estado para gerenciar a mensagem de sucesso/erro
    const [messageType, setMessageType] = useState(""); // Estado para gerenciar o tipo da mensagem (sucesso ou erro)
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // Evitar o comportamento padrão do formulário
        try {
            // Fazendo a requisição ao backend
            const response = await axios.post("http://localhost:3000/", {
                email: email,
                senha: senha
            });

            if (response.data.success) {
                setMessage("Login efetuado com sucesso!");
                setMessageType("success");
            
                // Verifica se é o primeiro login
                const primeiroLogin = response.data.user?.primeiroLogin;
                
                if (primeiroLogin === 0) {
                    // Redireciona para página de alteração de senha obrigatória
                    console.log("primeiroLogin:", response.data.user?.primeiroLogin);
                    console.log("Resposta completa:", response.data);


                    navigate("/primeiro-login", { state: { email: email } });
                } else {
                    // Redireciona para a home normalmente
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
        <div className="container mt-5">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="senha">Palavra-passe:</label>
                    <input
                        type="password"
                        id="senha"
                        className="form-control"
                        value={senha}
                        onChange={(e) => setsenha(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary mt-3">
                    Login
                </button>
            </form>

            {/* Exibir mensagens de sucesso ou erro */}
            {message && (
                <div
                    className={`mt-3 alert ${messageType === "success" ? "alert-success" : "alert-danger"}`}
                    role="alert"
                >
                    {message}
                </div>
            )}

            {/* Link para página de reset de senha */}
            <div className="mt-3">
                <p>Esqueceu sua senha? <Link to="/reset-password-request">Clique aqui para redefinir.</Link></p>
            </div>
        </div>
    );
};

export default Login;
