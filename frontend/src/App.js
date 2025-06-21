  import React from 'react';
  import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
  import Login from './views/Login'; 
  import ResetPassword from './views/ResetPasswordForm';
  import ResetPasswordRequest from './views/ResetPasswordRequest';
  import PrimeiroLogin from './views/PrimeiroLogin';
  import SelecionarPerfil from "./views/SelecionarPerfil";
  import DashboardAdministrador from "./views/DashboardAdministrador";
  import ListarUtilizadores from "./views/ListagemUtilizadores";
  import ListarCursos from "./views/ListarCursos";
  import SolicitarConta from "./views/SolicitarConta";
  import GerenciarCategorias from "./views/GerirCategorias";
  import GerirAreasFormacao from "./views/GerirAreasFormacao";
  import DashboardFormando from "./views/DashboardFormando";
  import ForumPublicacoes from "./views/ForumPublicacoes";
  import PublicacaoDetalhes from "./views/PublicacaoDetalhes";
  import NovaPublicacao from "./views/NovaPublicacao";
  import DetalhesCurso from './views/DetalheCurso';
  import Inscricoes from './views/Inscricoes'
  import MeusCursos from './views/MeusCursos';
  import './App.css';
  import 'bootstrap';
  import 'bootstrap/dist/css/bootstrap.min.css';

  function App() {
    return (
      <Router>
        <Routes>
          {/* Rotas existentes */}
          <Route path="/" element={<Login />} />
          <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/primeiro-login" element={<PrimeiroLogin />} />
          <Route path="/selecionar-perfil" element={<SelecionarPerfil />} />
          <Route path="/dashboard/administrador" element={<DashboardAdministrador />} />
          <Route path="/utilizadores" element={<ListarUtilizadores />} />
          <Route path="/cursos" element={<ListarCursos />} />
          <Route path="/solicitar" element={<SolicitarConta />} />
          <Route path="/gerenciar-categorias" element={<GerenciarCategorias />} />
          <Route path="/gerir-areas-formacao" element={<GerirAreasFormacao />} />
          <Route path="/dashboard/formando" element={<DashboardFormando />} />
          <Route path="/forum" element={<ForumPublicacoes />} />
          <Route path="/forum/publicacao/:id_publicacao" element={<PublicacaoDetalhes />} />
          <Route path="/forum/nova-publicacao" element={<NovaPublicacao />} />
          <Route path="/curso/:id_curso" element={<DetalhesCurso />} />
          <Route path="/inscricoes" element={<Inscricoes />} /> // adiciona no Routes
          <Route path="/meus-cursos" element={<MeusCursos />} />

          


        </Routes>
      </Router>
    );
  }

  export default App;