import { Routes, Route } from 'react-router-dom'
import Login from './pages/login.jsx'
import SolicitarConta from './pages/solicitarConta.jsx'
import ConfirmacaoPedido from './pages/confirmacaoPedido.jsx'
import PerfilEscolha from './pages/perfilEscolha.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/solicitar" element={<SolicitarConta />} />
      <Route path="/confirmacao" element={<ConfirmacaoPedido />} />
      <Route path="/perfil" element={<PerfilEscolha />} />
    </Routes>
  )
}

export default App
