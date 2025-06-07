import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ResetPasswordRequest = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

   const handleResetRequest = async (e) => {
    e.preventDefault();
    console.log("Email enviado:", email); 
    try {
        const response = await axios.post("http://localhost:3000/api/password/reset-password-request", { email });
        console.log(response.data);
        if (response.data.success) {
            setMessage("Código enviado. Verifique seu e-mail.");
            setTimeout(() => navigate("/reset-password"), 3000); 
        } else {
            setMessage(response.data.message);
        }
    } catch (err) {
        console.log("Erro ao solicitar reset:", err); 
        setMessage("Erro ao solicitar o reset de senha.");
    }
};

    

    return (
        <div className="container mt-5">
            <h2>Solicitar Código de Recuperação</h2>
            <form onSubmit={handleResetRequest}>
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
                <button type="submit" className="btn btn-primary mt-3">
                    Solicitar Código
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResetPasswordRequest;
