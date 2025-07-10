import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import { message, Spin } from "antd";
import SidebarFormador from "../components/SidebarFormador";
import '../css/DashboardFormador.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardFormador = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => {
    // Try to get user from location state first, then localStorage
    return location.state?.user || JSON.parse(localStorage.getItem('userData')) || {};
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCursos: 0,
    cursosEmAndamento: 0,
    cursosTerminados: 0
  });

  useEffect(() => {
    const userId = localStorage.getItem('usuarioId');
    const token = localStorage.getItem('token');
    console.log("User ID:-------------************************", userId);
    
    if (!userId ) {
      setIsAuthenticated(false);
      message.warning('Redirecionando para login...');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
      return;
    }

    if (!user?.id) {
      const storedUser = JSON.parse(localStorage.getItem('userData'));
      console.log("Stored User Data:", storedUser);
      if (storedUser?.id) {
        setUser(storedUser);
        fetchCursosDoFormador(storedUser);
      } else {
        //console.log("User ID:-------------novovoooo************************", userId);
        fetchUserData(userId);
      }
    } else {
      fetchCursosDoFormador(user);
    }
  }, [navigate]);

  const fetchUserData = async (userId) => {

  try {
    const response = await axios.get(`http://localhost:3000/api/utilizadores/utilizador/nome/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    const userData = response.data;
    console.log("Dados do usuário:", userData);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    fetchCursosDoFormador(userId); 
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    message.error("Erro ao carregar dados do usuário");
    setLoading(false);
  }
};

  const fetchCursosDoFormador = async (userData) => {
  //  console.log("Fetching cursos for user:", userData);
    const userId = localStorage.getItem('usuarioId');
//console.log("User ID:-------------************************", userId);
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/cursos/formador/${userId}`, {
       
      });
      const cursosData = response.data;
      
      const totalCursos = cursosData.length;
      const cursosEmAndamento = cursosData.filter(c => c.estado === 'em_curso').length;
      const cursosTerminados = cursosData.filter(c => c.estado === 'terminado').length;
      
      setCursos(cursosData);
      setStats({
        totalCursos,
        cursosEmAndamento,
        cursosTerminados
      });
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      message.error("Erro ao carregar cursos");
    } finally {
      setLoading(false);
    }
  };

  const handleIrParaCursos = () => {
    navigate('/formador/cursos', { state: { user } });
  };

  const prepareChartData = () => {
    const cursosComNotas = cursos.filter(curso => curso.mediaNotas !== undefined);
    
    return {
      labels: cursosComNotas.map(curso => curso.titulo),
      datasets: [
        {
          label: 'Média das Notas',
          data: cursosComNotas.map(curso => curso.mediaNotas),
          backgroundColor: '#05C7F2',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          borderRadius: 5
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
            weight: '600',
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          },
          color: "#333"
        }
      },
      title: {
        display: true,
        text: "Média de Notas por Curso",
        font: {
          size: 18,
          weight: '700',
          family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        },
        color: "#222",
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.75)",
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}`;
          },
          title: function(context) {
            return cursos.find(c => c.titulo === context[0].label)?.titulo || context[0].label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 10,
          precision: 0,
          color: "#444",
          font: { size: 12, family: "'Segoe UI', sans-serif" }
        },
        title: {
          display: true,
          text: 'Média de Notas',
          color: "#555",
          font: { size: 14, weight: '600' }
        },
        grid: {
          color: "#eee"
        }
      },
      x: {
        ticks: {
          autoSkip: false,
          color: "#444",
          font: { 
            size: 12, 
            family: "'Segoe UI', sans-serif"
          },
          callback: function(value) {
            const label = this.getLabelForValue(value);
            if (label.length > 15) {
              return label.substr(0,20) + '...'; 
            }
            return label;
          }
        },
        title: {
          display: true,
          text: 'Cursos',
          color: "#555",
          font: { size: 14, weight: '600' }
        },
        grid: {
          display: false
        }
      }
    },
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 50, 
        left: 20
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="dashboard-container">
        <SidebarFormador />
        <main className="main-content">
          <p>Redirecionando para login...</p>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <SidebarFormador />
        <main className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" tip="Carregando dados..." />
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <SidebarFormador />
      
      <main className="main-content">
        <h2 className="greeting-title">
          Olá, {user?.nome || 'Formador'} <span role="img" aria-label="wave">👋</span>
        </h2>
        <hr className="divider" />
        
        <section className="stats-container">
          <div className="stat-card" 
               onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
               onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <h5>Total de Cursos</h5>
            <p className="stat-value">
              {stats.totalCursos}
            </p>
          </div>
          <div className="stat-card" 
               onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
               onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <h5>Cursos em Andamento</h5>
            <p className="stat-value text-primary">
              {stats.cursosEmAndamento}
            </p>
          </div>
          <div className="stat-card" 
               onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
               onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <h5>Cursos Terminados</h5>
            <p className="stat-value text-success">
              {stats.cursosTerminados}
            </p>
          </div>
        </section>

        <section className="chart-container">
          <h5>Desempenho dos Cursos</h5>
          <div className="chart-wrapper">
            {cursos.length > 0 ? (
              <Bar data={prepareChartData()} options={chartOptions} />
            ) : (
              <p className="no-courses-message">Nenhum curso encontrado</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardFormador;