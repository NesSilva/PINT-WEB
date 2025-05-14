import { useNavigate } from "react-router-dom";

export default function confirmacaoPedido() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-white text-center" style={{ backdropFilter: 'blur(3px)' }}>
      <h2>Pedido de Conta</h2>
      <p>O seu pedido foi enviado com sucesso. Aguarde as credenciais por email.</p>
      <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>Voltar para Login</button>
    </div>
  );
}
