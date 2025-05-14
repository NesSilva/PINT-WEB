import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './views/Login'; 
import ResetPassword from './views/ResetPasswordForm';
import ResetPasswordRequest from './views/ResetPasswordRequest';
import PrimeiroLogin from './views/PrimeiroLogin';
import SelecionarPerfil from "./views/SelecionarPerfil";
import DashboardAdministrador from "./views/DashboardAdministrador";
import ListarUtilizadores from "./views/ListagemUtilizadores";
import CriarCurso from "./views/CriarCurso"; // <--- IMPORTAR a nova página
import ListarCursos from "./views/ListarCursos"; // importar o novo componente

import './App.css';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/primeiro-login" element={<PrimeiroLogin />} />
        <Route path="/selecionar-perfil" element={<SelecionarPerfil />} />
        <Route path="/dashboard/administrador" element={<DashboardAdministrador />} />
        <Route path="/utilizadores" element={<ListarUtilizadores />} />
        <Route path="/criar-curso" element={<CriarCurso />} /> {/* <-- NOVA ROTA */}
        <Route path="/cursos" element={<ListarCursos />} />

      </Routes>
    </Router>
  );
}

export default App;
