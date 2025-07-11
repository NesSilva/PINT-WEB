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
  import ForumPublicacoesFormador from "./views/ForumPublicacoesFormador";

  import PublicacaoDetalhes from "./views/PublicacaoDetalhes";
    import PublicacaoDetalhesFormador from "./views/PublicacaoDetalhesFormador";


  import NovaPublicacao from "./views/NovaPublicacao";
    import NovaPublicacaoFormador from "./views/NovaPublicacaoFormador";

  import DetalhesCurso from './views/DetalheCurso';
  import DetalhesCursoTodos from './views/CursosDestalhesdetodos';

  import Inscricoes from './views/Inscricoes'
  import MeusCursos from './views/MeusCursos';
  import DashboardFormador from "./views/DashboardFormador";
import FormadorCursos from "./views/FormadorCursos";
import ConteudoCursoFormador from "./views/ConteudoCursoFormador";
import AvaliacaoCursoFormador from "./views/GerirAvaliações";
import AvaliarAlunos from "./views/AlunosInscritos";
import CursosPorArea from "./views/CursosPorArea";
import AdminForum from "./views/AdminForum";
import AdminEditarTopico from "./views/AdminEditarTopico";
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
          <Route path="/forumFormador" element={<ForumPublicacoesFormador />} />
          <Route path="/forumFormador/publicacao/:id_publicacao" element={<PublicacaoDetalhesFormador />} />

          <Route path="/forum/publicacao/:id_publicacao" element={<PublicacaoDetalhes />} />
          <Route path="/forum/nova-publicacao" element={<NovaPublicacao />} />
          <Route path="/forumFormador/nova-publicacao" element={<NovaPublicacaoFormador />} />

          <Route path="/curso/:id_curso" element={<DetalhesCurso />} />
          <Route path="/cursod/:id_curso" element={<DetalhesCursoTodos />} />

          <Route path="/inscricoes" element={<Inscricoes />} /> 
          <Route path="/meus-cursos" element={<MeusCursos />} />
          <Route path="/dashboard/formador" element={<DashboardFormador />} />
        <Route path="/formador/cursos" element={<FormadorCursos />} />
        <Route path="/formador/cursos/ava" element={<AvaliacaoCursoFormador />} />

        <Route path="/formador/curso/:id_curso/conteudos" element={<ConteudoCursoFormador />} />
        <Route path="/formador/curso/:id_curso/avaliar-alunos" element={<AvaliarAlunos />} />
        <Route path="/cursos/area/:id_area" element={<CursosPorArea />} />
        // No seu arquivo de rotas principal (App.js)
<Route path="/admin/forum" element={<AdminForum />} />
<Route path="/admin/forum/editar/:id_topico" element={<AdminEditarTopico />} />






          


        </Routes>
      </Router>
    );
  }

  export default App;