import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from "axios";


const ListarUtilizadores = () => {
  const [utilizadores, setUtilizadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [utilizadorAtual, setUtilizadorAtual] = useState(null);
  const [novoPerfil, setNovoPerfil] = useState("");
  const [perfis, setPerfis] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [perfisDisponiveis, setPerfisDisponiveis] = useState([]);
  const [novoUtilizador, setNovoUtilizador] = useState({
    nome: "",
    email: "",
    morada: "",
    perfis: []
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState("");
  const [senha, setSenha] = React.useState(""); 
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [utilizadorParaAceitar, setUtilizadorParaAceitar] = useState(null);
  const [senhaParaAceitar, setSenhaParaAceitar] = useState("");
  const [progressoCursos, setProgressoCursos] = useState([]);
const [utilizadorSelecionado, setUtilizadorSelecionado] = useState(null);
const [dataInicio, setDataInicio] = useState("");
const [dataFim, setDataFim] = useState("");
const [showProgressoModal, setShowProgressoModal] = useState(false);
  const [cursos, setCursos] = useState([]);





  useEffect(() => {
    const fetchUtilizadores = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/utilizadores/utilizadores");
        const data = await response.json();
        if (Array.isArray(data)) {
          setUtilizadores(data);
        } else {
          console.error("A resposta da API não é um array:", data);
        }
      } catch (error) {
        console.error("Erro ao carregar utilizadores:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCursos = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/cursos/todos");
      setCursos(res.data);
    } catch (err) {
      console.error("Erro ao buscar cursos:", err);
    }
  };
    const fetchPerfis = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/perfis");
        const data = await response.json();
        if (Array.isArray(data)) {
          setPerfisDisponiveis(data);
        } else {
          console.error("A resposta da API de perfis não é um array:", data);
        }
      } catch (error) {
        console.error("Erro ao carregar perfis:", error);
      }
    };

    fetchUtilizadores();
    fetchPerfis();
    fetchCursos();
  }, []);

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

  const handleDeleteClick = async (id_utilizador) => {
    const confirmDelete = window.confirm("Tem certeza que deseja eliminar este utilizador?");
    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:3000/api/utilizadores/utilizadores/${id_utilizador}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setUtilizadores(utilizadores.filter(utilizador => utilizador.id_utilizador !== id_utilizador));
          alert("Utilizador eliminado com sucesso!");
        } else {
          alert("Erro ao eliminar utilizador!");
        }
      } catch (error) {
        console.error("Erro ao fazer a requisição de delete:", error);
        alert("Erro ao eliminar utilizador!");
      }
    }
  };

  const buscarProgresso = async (id) => {
      console.log("ID do utilizador:", id); // <-- ADICIONAR ISTO

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
  setSenha(""); // limpa senha ao abrir modal
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(corpo),
    });

    if (response.ok) {
      setUtilizadores((prevUtilizadores) =>
        prevUtilizadores.map((utilizador) =>
          utilizador.id_utilizador === utilizadorAtual.id_utilizador
            ? { ...utilizadorAtual, perfis: perfis.join(", ") }
            : utilizador
        )
      );
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
      headers: {
        "Content-Type": "application/json",
      },
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

  const handleCloseModal = () => {
    setShowModal(false);
    setUtilizadorAtual(null);
    setPerfis([]);
  };

 const handlePedido = async (id, valor) => {
  try {
    const response = await fetch(`http://localhost:3000/api/utilizadores/pedido/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pedidoAceitoSN: valor }),
    });

    if (response.ok) {
      setUtilizadores((prev) =>
        prev.map((u) =>
          u.id_utilizador === id ? { ...u, pedidoAceitoSN: valor } : u
        )
      );
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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id_utilizador: idUtilizador,
        senha: senha
      })
    });

    if (response.ok) {
      const data = await response.json();
      alert("Pedido aceito com sucesso!");
      // Aqui você pode atualizar o estado para refletir a mudança
    } else {
      const errorData = await response.json();
      alert("Erro ao aceitar pedido: " + (errorData.message || response.statusText));
    }
  } catch (error) {
    console.error("Erro ao aceitar pedido:", error);
    alert("Erro ao aceitar pedido, verifique o console.");
  }
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
    return <p>A carregar utilizadores...</p>;
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar />

      <div className="container-fluid mt-4" style={{ marginLeft: '220px' }}>
        <h2>Lista de Utilizadores</h2>
        <button
          className="btn btn-primary mb-3"
          onClick={() => setShowCreateModal(true)}
        >
          Criar Utilizador
        </button>

        <div className="row mb-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Filtrar por nome..."
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <select
              className="form-control"
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
          </div>
        </div>

        <button
          className="btn btn-secondary mb-3"
          onClick={limparFiltros}
        >
          Limpar Filtros
        </button>

        <table className="table">
          <thead>
            <tr>
              <th scope="col">Nome</th>
              <th scope="col">Email</th>
              <th scope="col">Morada</th>
              <th scope="col">Perfis</th>
              <th scope="col">Ação</th>
              <th scope="col">Pedido</th>
              <th scope="col">Percurso</th> 


            </tr>
          </thead>
          <tbody>
            {utilizadores && utilizadores.length > 0 ? (
              utilizadores
                .filter((utilizador) => {
                  const nomeMatch = utilizador.nome && utilizador.nome.toLowerCase().includes(filtroNome.toLowerCase());
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
                    <td>{utilizador.perfis}</td>
                    <td>
                      <button
                        onClick={() => handleEditClick(utilizador)}
                        className="btn btn-warning"
                      >
                        <i className="bi bi-pencil"></i> Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(utilizador.id_utilizador)}
                        className="btn btn-danger"
                      >
                        <i className="bi bi-trash"></i> Eliminar
                      </button>
                    </td>

                    <td>
                      {utilizador.pedidoAceitoSN === 0 ? (
                        <>
                        <button
                          className="btn btn-success btn-sm mr-2"
                          onClick={() => {
                            setUtilizadorParaAceitar(utilizador);
                            setShowPasswordModal(true);
                          }}
                        >
                          Aceitar
                        </button>


                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handlePedido(utilizador.id_utilizador, 2)}
                          >
                            Recusar
                          </button>
                        </>
                      ) : utilizador.pedidoAceitoSN === 1 ? (
                        <span className="text-success">Aceite</span>
                      ) : utilizador.pedidoAceitoSN === 2 ? (
                        <span className="text-danger">Negado</span>
                      ) : null}
                    </td>
                    <td>
  <button
    className="btn btn-info btn-sm"
    onClick={() => {
      setUtilizadorSelecionado(utilizador);
      setShowProgressoModal(true);
      buscarProgresso(utilizador.id_utilizador);
    }}
  >
    Ver Percurso
  </button>
</td>



                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="5">Nenhum utilizador encontrado</td>
              </tr>
            )}
          </tbody>
        </table>

        {showCreateModal && (
          <div className="modal fade show" style={{ display: 'block' }} role="dialog">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Criar Novo Utilizador</h5>
                  <button type="button" className="close" onClick={handleCloseCreateModal}>
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleCreateSubmit}>
                    <div className="form-group">
                      <label>Nome</label>
                      <input
                        type="text"
                        className="form-control"
                        value={novoUtilizador.nome}
                        onChange={(e) => setNovoUtilizador({ ...novoUtilizador, nome: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={novoUtilizador.email}
                        onChange={(e) => setNovoUtilizador({ ...novoUtilizador, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Morada</label>
                      <input
                        type="text"
                        className="form-control"
                        value={novoUtilizador.morada}
                        onChange={(e) => setNovoUtilizador({ ...novoUtilizador, morada: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Senha</label>
                      <input
                        type="password"
                        className="form-control"
                        value={novoUtilizador.senha || ""}
                        onChange={(e) => setNovoUtilizador({ ...novoUtilizador, senha: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Perfis</label>
                      <select
                        className="form-control"
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
                        className="btn btn-info mt-2"
                        onClick={() => {
                          if (novoPerfil && !novoUtilizador.perfis.includes(novoPerfil)) {
                            setNovoUtilizador({ ...novoUtilizador, perfis: [...novoUtilizador.perfis, novoPerfil] });
                            setNovoPerfil("");
                          }
                        }}
                      >
                        Adicionar Perfil
                      </button>
                      <ul>
                        {novoUtilizador.perfis.map((perfil) => (
                          <li key={perfil}>
                            {perfil}
                            <button
                              type="button"
                              onClick={() => {
                                setNovoUtilizador({
                                  ...novoUtilizador,
                                  perfis: novoUtilizador.perfis.filter((item) => item !== perfil),
                                });
                              }}
                              className="btn btn-danger btn-sm"
                            >
                              Remover
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button type="submit" className="btn btn-success mt-2">
                      Criar Utilizador
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {showProgressoModal && (
  <div className="modal fade show" style={{ display: 'block' }} role="dialog">
    <div className="modal-dialog modal-lg" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Progresso de {utilizadorSelecionado?.nome}</h5>
          <button type="button" className="close" onClick={() => setShowProgressoModal(false)}>
            <span>&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <div className="row mb-6">
            <div className="col">
              <label>Data Início</label>
              <input type="date" className="form-control" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div className="col">
              <label>Data Fim</label>
              <input type="date" className="form-control" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
            <div className="col d-flex align-items-end">
              <button className="btn btn-secondary w-100" onClick={() => buscarProgresso(utilizadorSelecionado.id_utilizador)}>
                Filtrar
              </button>
            </div>
          </div>

          <table className="table table-striped">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Processo</th>
                <th>Data Inicio </th>
                <th>Data Fim</th>
              </tr>
            </thead>
            <tbody>
  {progressoCursos.length > 0 ? (
  progressoCursos
 .filter((item) => {
  const dataInicioCurso = new Date(getDataInicio(item.id_curso));
  const dataFimCurso = new Date(getDataFim(item.id_curso));

  // Apenas dataInicio → cursos com data de início igual
  if (dataInicio && !dataFim) {
    const filtro = new Date(dataInicio);
    return (
      dataInicioCurso.getFullYear() === filtro.getFullYear() &&
      dataInicioCurso.getMonth() === filtro.getMonth() &&
      dataInicioCurso.getDate() === filtro.getDate()
    );
  }

  // Apenas dataFim → cursos com data de fim igual
  if (!dataInicio && dataFim) {
    const filtro = new Date(dataFim);
    return (
      dataFimCurso.getFullYear() === filtro.getFullYear() &&
      dataFimCurso.getMonth() === filtro.getMonth() &&
      dataFimCurso.getDate() === filtro.getDate()
    );
  }

  // Ambos definidos → cursos com dataInicio == dataInicio e dataFim == dataFim
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

  // Nenhum filtro → mostrar todos
  return true;
})


    .map((item) => (

      <tr key={item.id_progresso}>
        <td>{getTituloCurso(item.id_curso)}</td> {/* Corrigido para usar item.id_curso */}
        <td>{item.percentual_completo}%</td>
        <td>{getDataInicio(item.id_curso)}</td> {/* Corrigido para usar item.id_curso */}
        <td>{getDataFim(item.id_curso)}</td> {/* Corrigido para usar item.id_curso */}
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="3">Sem dados encontrados.</td>
    </tr>
  )}
</tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
)}


        {/* Modal de Edição de Utilizador */}
        {showModal && utilizadorAtual && (
          <div className="modal fade show" style={{ display: 'block' }} role="dialog">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Editar Utilizador</h5>
                  <button type="button" className="close" onClick={handleCloseCreateModal}>
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleEditSubmit}>
                    <div className="form-group">
                      <label>Nome</label>
                      <input
                        type="text"
                        className="form-control"
                        value={utilizadorAtual.nome}
                        onChange={(e) => setUtilizadorAtual({ ...utilizadorAtual, nome: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={utilizadorAtual.email}
                        onChange={(e) => setUtilizadorAtual({ ...utilizadorAtual, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Morada</label>
                      <input
                        type="text"
                        className="form-control"
                        value={utilizadorAtual.morada}
                        onChange={(e) => setUtilizadorAtual({ ...utilizadorAtual, morada: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Senha </label>
                      <input
                        type="password"
                        className="form-control"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Nova senha"
                      />
                    </div>

                    <div className="form-group">
                      <label>Perfis</label>
                      <select
                        className="form-control"
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
                        className="btn btn-info mt-2"
                        onClick={() => {
                          if (novoPerfil && !utilizadorAtual.perfis.includes(novoPerfil)) {
                            setPerfis([...perfis, novoPerfil]);
                            setNovoPerfil("");
                          }
                        }}
                      >
                        Adicionar Perfil
                      </button>
                      <ul>
                        {perfis.map((perfil, index) => (
                          <li key={index}>
                            {perfil}
                            <button
                              type="button"
                              onClick={() => {
                                setPerfis(perfis.filter((item) => item !== perfil));
                              }}
                              className="btn btn-danger btn-sm"
                            >
                              Remover
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button type="submit" className="btn btn-success mt-2">
                      Atualizar Utilizador
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {showPasswordModal && utilizadorParaAceitar && (
  <div className="modal fade show" style={{ display: 'block' }} role="dialog">
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Confirme a senha para aceitar pedido</h5>
          <button
            type="button"
            className="close"
            onClick={() => {
              setShowPasswordModal(false);
              setSenhaParaAceitar("");
              setUtilizadorParaAceitar(null);
            }}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <input
            type="password"
            className="form-control"
            placeholder="Senha"
            value={senhaParaAceitar}
            onChange={(e) => setSenhaParaAceitar(e.target.value)}
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
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </div>
)}


      </div>
    </div>
  );
};

export default ListarUtilizadores;
