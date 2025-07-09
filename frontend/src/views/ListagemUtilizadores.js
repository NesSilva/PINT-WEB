import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from "axios";
import "../css/ListarUtilizadores.css";


const ListarUtilizadores = () => {
  // Estados
  const [utilizadores, setUtilizadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursos, setCursos] = useState([]);
  const [perfisDisponiveis, setPerfisDisponiveis] = useState([]);
  
  // Estados para modais e ações
  const [utilizadorAtual, setUtilizadorAtual] = useState(null);
  const [novoPerfil, setNovoPerfil] = useState("");
  const [perfis, setPerfis] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProgressoModal, setShowProgressoModal] = useState(false);
  
  // Estados para formulários
  const [novoUtilizador, setNovoUtilizador] = useState({
    nome: "",
    email: "",
    morada: "",
    senha: "",
    perfis: []
  });
  
  // Estados para filtros
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState("");
  
  // Estados para senhas
  const [senha, setSenha] = useState(""); 
  const [senhaParaAceitar, setSenhaParaAceitar] = useState("");
  
  // Estados para pedidos
  const [utilizadorParaAceitar, setUtilizadorParaAceitar] = useState(null);
  
  const [progressoCursos, setProgressoCursos] = useState([]);
  const [utilizadorSelecionado, setUtilizadorSelecionado] = useState(null);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [filtroCursoNome, setFiltroCursoNome] = useState("");

  // Efeitos para carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [utilizadoresRes, cursosRes, perfisRes] = await Promise.all([
          fetch("http://localhost:3000/api/utilizadores/utilizadores"),
          axios.get("http://localhost:3000/api/cursos/todos"),
          fetch("http://localhost:3000/api/perfis")
        ]);

        const [utilizadoresData, perfisData] = await Promise.all([
          utilizadoresRes.json(),
          perfisRes.json()
        ]);

        if (Array.isArray(utilizadoresData)) {
          setUtilizadores(utilizadoresData);
        } else {
          console.error("A resposta da API não é um array:", utilizadoresData);
        }

        setCursos(cursosRes.data);

        if (Array.isArray(perfisData)) {
          setPerfisDisponiveis(perfisData);
        } else {
          console.error("A resposta da API de perfis não é um array:", perfisData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Funções auxiliares
  const getTituloCurso = (id_curso) => {
    const curso = cursos.find((c) => c.id_curso === id_curso);
    return curso ? curso.titulo : "Desconhecido";
  };

  const getDataInicio = (id_curso) => {
    const curso = cursos.find((c) => c.id_curso === id_curso);
    return curso ? curso.data_inicio : "Dia não definido";
  };

  const getDataFim = (id_curso) => {
    const curso = cursos.find((c) => c.id_curso === id_curso);
    return curso ? curso.data_fim : "Dia não definido";
  };

  // Handlers para ações
  const handleDeleteClick = async (id_utilizador) => {
    const confirmDelete = window.confirm("Tem certeza que deseja eliminar este utilizador?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/api/utilizadores/utilizadores/${id_utilizador}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUtilizadores(utilizadores.filter(u => u.id_utilizador !== id_utilizador));
        alert("Utilizador eliminado com sucesso!");
      } else {
        alert("Erro ao eliminar utilizador!");
      }
    } catch (error) {
      console.error("Erro ao fazer a requisição de delete:", error);
      alert("Erro ao eliminar utilizador!");
    }
  };

  const buscarProgresso = async (id) => {
    try {
      let url = `http://localhost:3000/api/progressos/utilizador/${id}`;
      const query = [];

      if (dataInicio) query.push(`dataInicio=${dataInicio}`);
      if (dataFim) query.push(`dataFim=${dataFim}`);

      if (query.length > 0) url += `?${query.join("&")}`;

      const res = await fetch(url);
      const data = await res.json();
      setProgressoCursos(data);
    } catch (err) {
      console.error("Erro ao buscar progresso:", err);
    }
  };

  const handleEditClick = (utilizador) => {
    setUtilizadorAtual(utilizador);
    setPerfis(Array.isArray(utilizador.perfis) ? utilizador.perfis : utilizador.perfis.split(/,\s*/));
    setSenha("");
    setShowModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const corpo = {
        nome: utilizadorAtual.nome,
        email: utilizadorAtual.email,
        morada: utilizadorAtual.morada,
        perfis,
      };
      
      if (senha.trim() !== "") {
        corpo.senha = senha.trim();
      }

      const response = await fetch(`http://localhost:3000/api/utilizadores/utilizadores/${utilizadorAtual.id_utilizador}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });

      if (response.ok) {
        setUtilizadores(prev => prev.map(u => 
          u.id_utilizador === utilizadorAtual.id_utilizador 
            ? { ...utilizadorAtual, perfis: perfis.join(", ") } 
            : u
        ));
        alert("Utilizador atualizado com sucesso!");
        setShowModal(false);
      } else {
        alert("Erro ao atualizar utilizador!");
      }
    } catch (error) {
      console.error("Erro ao atualizar utilizador:", error);
      alert("Erro ao atualizar utilizador!");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/utilizadores/utilizadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: novoUtilizador.nome,
          email: novoUtilizador.email,
          morada: novoUtilizador.morada,
          senha: novoUtilizador.senha,
          perfis: novoUtilizador.perfis,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setShowCreateModal(false);
        setNovoUtilizador({ nome: "", email: "", morada: "", senha: "", perfis: [] });
        
        const refreshResponse = await fetch("http://localhost:3000/api/utilizadores/utilizadores");
        const refreshData = await refreshResponse.json();
        
        if (Array.isArray(refreshData)) {
          setUtilizadores(refreshData);
        }
        alert("Novo utilizador criado com sucesso!");
      } else {
        alert(data.message || "Erro ao criar utilizador!");
      }
    } catch (error) {
      console.error("Erro ao criar utilizador:", error);
      alert("Erro ao criar utilizador!");
    }
  };

  const handlePedido = async (id, valor) => {
    try {
      const response = await fetch(`http://localhost:3000/api/utilizadores/pedido/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoAceitoSN: valor }),
      });

      if (response.ok) {
        setUtilizadores(prev => prev.map(u => 
          u.id_utilizador === id ? { ...u, pedidoAceitoSN: valor } : u
        ));
      } else {
        alert("Erro ao atualizar pedido");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao enviar pedido");
    }
  };

  const aceitarPedido = async (idUtilizador, senha) => {
    try {
      const response = await fetch("http://localhost:3000/api/utilizadores/admin/aceitar-pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_utilizador: idUtilizador, senha })
      });

      if (response.ok) {
        alert("Pedido aceito com sucesso!");
      } else {
        const errorData = await response.json();
        alert("Erro ao aceitar pedido: " + (errorData.message || response.statusText));
      }
    } catch (error) {
      console.error("Erro ao aceitar pedido:", error);
      alert("Erro ao aceitar pedido, verifique o console.");
    }
  };

  // Funções auxiliares de UI
  const handleCloseModal = () => {
    setShowModal(false);
    setUtilizadorAtual(null);
    setPerfis([]);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNovoUtilizador({ nome: "", email: "", morada: "", perfis: [] });
  };

  const limparFiltros = () => {
    setFiltroNome("");
    setFiltroPerfil("");
  };

  if (loading) {
    return <div className="loading-spinner">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">A carregar utilizadores...</span>
      </div>
    </div>;
  }

  return (
    <div className="listar-utilizadores-container">
      <Sidebar />

      <main className="main-content">
        <header className="page-header">
          <h2 className="page-title">Lista de Utilizadores</h2>
          <div className="header-actions">
            <button className="btn " onClick={() => setShowCreateModal(true)} style={{ backgroundColor: "#00B0EB", color: "white" }}>
              <i className="bi bi-plus-circle me-2"></i>Criar Utilizador
            </button>

            <div className="filter-controls">
              <input
                type="text"
                className="form-control nome-filter"
                placeholder="Filtrar por nome..."
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
              />
              
              <select
                className="form-control perfil-filter"
                value={filtroPerfil}
                onChange={(e) => setFiltroPerfil(e.target.value)}
              >
                <option value="">Todos os perfis</option>
                {perfisDisponiveis.map((perfil) => (
                  <option key={perfil.id} value={perfil.nome}>
                    {perfil.nome}
                  </option>
                ))}
              </select>

              <button className="btn btn-outline-secondary limpar-filtros" onClick={limparFiltros}>
                <i className="bi bi-x-circle me-1"></i>Limpar
              </button>
            </div>
          </div>
        </header>

        <div className="table-responsive">
          <table className="utilizadores-table">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Email</th>
                <th scope="col">Morada</th>
                <th scope="col">Perfis</th>
                <th scope="col">Ações</th>
                <th scope="col">Pedido</th>
                <th scope="col">Percurso</th>
              </tr>
            </thead>
            <tbody>
              {utilizadores && utilizadores.length > 0 ? (
                utilizadores
                  .filter((utilizador) => {
                    const nomeMatch = utilizador.nome?.toLowerCase().includes(filtroNome.toLowerCase());
                    const perfilMatch = filtroPerfil === "" || 
                                      (utilizador.perfis && 
                                      (typeof utilizador.perfis === 'string' ? 
                                        utilizador.perfis.includes(filtroPerfil) : 
                                        utilizador.perfis.some(p => p.includes(filtroPerfil))));
                    return nomeMatch && perfilMatch;
                  })
                  .map((utilizador) => (
                    <tr key={utilizador.id_utilizador}>
                      <td>{utilizador.nome}</td>
                      <td>{utilizador.email}</td>
                      <td>{utilizador.morada}</td>
                      <td>
                        {typeof utilizador.perfis === 'string' 
                          ? utilizador.perfis 
                          : utilizador.perfis?.join(', ')}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEditClick(utilizador)}
                            className="btn btn-sm btn-warning"
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(utilizador.id_utilizador)}
                            className="btn btn-sm btn-danger"
                            title="Eliminar"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>

                      <td>
                        {utilizador.pedidoAceitoSN === 0 ? (
                          <div className="pedido-buttons">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => {
                                setUtilizadorParaAceitar(utilizador);
                                setShowPasswordModal(true);
                              }}
                              title="Aceitar"
                            >
                              <i className="bi bi-check"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handlePedido(utilizador.id_utilizador, 2)}
                              title="Recusar"
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        ) : utilizador.pedidoAceitoSN === 1 ? (
                          <span className="badge bg-success">Aceite</span>
                        ) : utilizador.pedidoAceitoSN === 2 ? (
                          <span className="badge bg-danger">Negado</span>
                        ) : null}
                      </td>
                      
                      <td>
                        <button
                          className="btn btn-sm btn-info ver-percurso"
                          onClick={() => {
                            setUtilizadorSelecionado(utilizador);
                            setShowProgressoModal(true);
                            buscarProgresso(utilizador.id_utilizador);
                          }}
                          title="Ver Percurso"
                        >
                          <i className="bi bi-graph-up"></i>
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-results">
                    <div className="alert alert-info mb-0">
                      Nenhum utilizador encontrado
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de Criação */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Criar Novo Utilizador</h5>
                  <button type="button" className="btn-close" onClick={handleCloseCreateModal}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleCreateSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Nome</label>
                        <input
                          type="text"
                          className="form-control"
                          value={novoUtilizador.nome}
                          onChange={(e) => setNovoUtilizador({ ...novoUtilizador, nome: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={novoUtilizador.email}
                          onChange={(e) => setNovoUtilizador({ ...novoUtilizador, email: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="col-12">
                        <label className="form-label">Morada</label>
                        <input
                          type="text"
                          className="form-control"
                          value={novoUtilizador.morada}
                          onChange={(e) => setNovoUtilizador({ ...novoUtilizador, morada: e.target.value })}
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label">Senha</label>
                        <input
                          type="password"
                          className="form-control"
                          value={novoUtilizador.senha || ""}
                          onChange={(e) => setNovoUtilizador({ ...novoUtilizador, senha: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label">Perfis</label>
                        <div className="input-group">
                          <select
                            className="form-select"
                            value={novoPerfil}
                            onChange={(e) => setNovoPerfil(e.target.value)}
                          >
                            <option value="">Selecione um perfil</option>
                            {perfisDisponiveis.map((perfil) => (
                              <option key={`${perfil.id}-${perfil.nome}`} value={perfil.nome}>
                                {perfil.nome}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => {
                              if (novoPerfil && !novoUtilizador.perfis.includes(novoPerfil)) {
                                setNovoUtilizador({ ...novoUtilizador, perfis: [...novoUtilizador.perfis, novoPerfil] });
                                setNovoPerfil("");
                              }
                            }}
                            disabled={!novoPerfil}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                        
                        {novoUtilizador.perfis.length > 0 && (
                          <div className="perfis-selecionados">
                            {novoUtilizador.perfis.map((perfil) => (
                              <span key={perfil} className="perfil-badge">
                                {perfil}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNovoUtilizador({
                                      ...novoUtilizador,
                                      perfis: novoUtilizador.perfis.filter((item) => item !== perfil),
                                    });
                                  }}
                                  className="btn-close"
                                />
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={handleCloseCreateModal}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Criar Utilizador
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Progresso */}
        {showProgressoModal && (
          <div className="modal-overlay">
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Progresso de {utilizadorSelecionado?.nome}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowProgressoModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-4 g-3">
  {/* Novo campo de filtro por nome do curso */}
  <div className="col-md-3">
    <label className="form-label">Nome do Curso</label>
    <input 
      type="text" 
      className="form-control" 
      placeholder="Filtrar por nome"
      value={filtroCursoNome}
      onChange={(e) => setFiltroCursoNome(e.target.value)}
    />
  </div>
  
  {/* Campos de data existentes */}
  <div className="col-md-3">
    <label className="form-label">Data Início</label>
    <input 
      type="date" 
      className="form-control" 
      value={dataInicio} 
      onChange={(e) => setDataInicio(e.target.value)} 
    />
  </div>
  
  <div className="col-md-3">
    <label className="form-label">Data Fim</label>
    <input 
      type="date" 
      className="form-control" 
      value={dataFim} 
      onChange={(e) => setDataFim(e.target.value)} 
    />
  </div>
  
  <div className="col-md-3 d-flex align-items-end">
    <button 
      className="btn btn-primary w-100" 
      onClick={() => buscarProgresso(utilizadorSelecionado.id_utilizador)}
    >
      <i className="bi bi-funnel me-2"></i>Filtrar
    </button>
  </div>
</div>

                  <div className="table-responsive">
                    <table className="progresso-table">
                      <thead>
                        <tr>
                          <th>Curso</th>
                          <th>Progresso</th>
                          <th>Data Início</th>
                          <th>Data Fim</th>
                        </tr>
                      </thead>
                      <tbody>
                        {progressoCursos.length > 0 ? (
                          progressoCursos
                            .filter((item) => {
  // Filtro por nome do curso (novo)
  const cursoNome = getTituloCurso(item.id_curso).toLowerCase();
  const filtroNomeCurso = filtroCursoNome.toLowerCase();
  
  // Se houver filtro por nome e o curso não corresponder, retorna false
  if (filtroCursoNome && !cursoNome.includes(filtroNomeCurso)) {
    return false;
  }

  // Seu filtro original de datas (mantido)
  const dataInicioCurso = new Date(getDataInicio(item.id_curso));
  const dataFimCurso = new Date(getDataFim(item.id_curso));

  if (dataInicio && !dataFim) {
    const filtro = new Date(dataInicio);
    return (
      dataInicioCurso.getFullYear() === filtro.getFullYear() &&
      dataInicioCurso.getMonth() === filtro.getMonth() &&
      dataInicioCurso.getDate() === filtro.getDate()
    );
  }

  if (!dataInicio && dataFim) {
    const filtro = new Date(dataFim);
    return (
      dataFimCurso.getFullYear() === filtro.getFullYear() &&
      dataFimCurso.getMonth() === filtro.getMonth() &&
      dataFimCurso.getDate() === filtro.getDate()
    );
  }

  if (dataInicio && dataFim) {
    const inicioFiltro = new Date(dataInicio);
    const fimFiltro = new Date(dataFim);

    return (
      dataInicioCurso.getFullYear() === inicioFiltro.getFullYear() &&
      dataInicioCurso.getMonth() === inicioFiltro.getMonth() &&
      dataInicioCurso.getDate() === inicioFiltro.getDate() &&
      dataFimCurso.getFullYear() === fimFiltro.getFullYear() &&
      dataFimCurso.getMonth() === fimFiltro.getMonth() &&
      dataFimCurso.getDate() === fimFiltro.getDate()
    );
  }

  return true;
})
                            .map((item) => (
                              <tr key={item.id_progresso}>
                                <td>{getTituloCurso(item.id_curso)}</td>
                                <td>
                                  <div className="progress">
                                    <div 
                                      className="progress-bar" 
                                      role="progressbar" 
                                      style={{ width: `${item.percentual_completo}%` }}
                                      aria-valuenow={item.percentual_completo}
                                      aria-valuemin="0" 
                                      aria-valuemax="100"
                                    >
                                      {item.percentual_completo}%
                                    </div>
                                  </div>
                                </td>
                                <td>{getDataInicio(item.id_curso)}</td>
                                <td>{getDataFim(item.id_curso)}</td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="no-progress">
                              <div className="alert alert-warning mb-0">
                                Nenhum progresso encontrado para este utilizador
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowProgressoModal(false)}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição */}
        {showModal && utilizadorAtual && (
          <div className="modal-overlay">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Editar Utilizador</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleEditSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Nome</label>
                        <input
                          type="text"
                          className="form-control"
                          value={utilizadorAtual.nome}
                          onChange={(e) => setUtilizadorAtual({ ...utilizadorAtual, nome: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={utilizadorAtual.email}
                          onChange={(e) => setUtilizadorAtual({ ...utilizadorAtual, email: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="col-12">
                        <label className="form-label">Morada</label>
                        <input
                          type="text"
                          className="form-control"
                          value={utilizadorAtual.morada}
                          onChange={(e) => setUtilizadorAtual({ ...utilizadorAtual, morada: e.target.value })}
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label">Nova Senha (opcional)</label>
                        <input
                          type="password"
                          className="form-control"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          placeholder="Deixe em branco para manter a atual"
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label">Perfis</label>
                        <div className="input-group">
                          <select
                            className="form-select"
                            value={novoPerfil}
                            onChange={(e) => setNovoPerfil(e.target.value)}
                          >
                            <option value="">Selecione um perfil</option>
                            {perfisDisponiveis.map((perfil) => (
                              <option key={perfil.id} value={perfil.nome}>
                                {perfil.nome}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => {
                              if (novoPerfil && !perfis.includes(novoPerfil)) {
                                setPerfis([...perfis, novoPerfil]);
                                setNovoPerfil("");
                              }
                            }}
                            disabled={!novoPerfil}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                        
                        {perfis.length > 0 && (
                          <div className="perfis-selecionados">
                            {perfis.map((perfil, index) => (
                              <span key={index} className="perfil-badge">
                                {perfil}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPerfis(perfis.filter((item) => item !== perfil));
                                  }}
                                  className="btn-close"
                                />
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Atualizar Utilizador
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Senha */}
        {showPasswordModal && utilizadorParaAceitar && (
          <div className="modal-overlay">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirmar Senha</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setSenhaParaAceitar("");
                      setUtilizadorParaAceitar(null);
                    }}
                  />
                </div>
                <div className="modal-body">
                  <p>Confirme a senha para aceitar o pedido de <strong>{utilizadorParaAceitar.nome}</strong></p>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Digite sua senha"
                    value={senhaParaAceitar}
                    onChange={(e) => setSenhaParaAceitar(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setSenhaParaAceitar("");
                      setUtilizadorParaAceitar(null);
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      aceitarPedido(utilizadorParaAceitar.id_utilizador, senhaParaAceitar);
                      setShowPasswordModal(false);
                      setSenhaParaAceitar("");
                      setUtilizadorParaAceitar(null);
                    }}
                    disabled={!senhaParaAceitar}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ListarUtilizadores;