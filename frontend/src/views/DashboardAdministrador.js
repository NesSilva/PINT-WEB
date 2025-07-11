import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Bar } from "react-chartjs-2";
import Sidebar from "../components/Sidebar";
import '../css/DashboardAdministrador.css';
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

const DashboardAdministrador = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = location.state || {};

  const [numCursos, setNumCursos] = useState(null);
  const [numFormandos, setNumFormandos] = useState(null);
  const [cursosPorMes, setCursosPorMes] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);


  useEffect(() => {
  const userId = localStorage.getItem('usuarioId');

  if (!userId) {
    setIsAuthenticated(false); // mostra mensagem
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 2000); // redireciona após 2 segundos
    return;
  }

  const fetchData = async () => {
    try {
      const [responseCursos, responseFormandos, responseGrafico] = await Promise.all([
        fetch("https://frontend-z8p8.onrender.com//dashboard/admin"),
        fetch("https://frontend-z8p8.onrender.com//dashboard/formandos"),
        fetch("https://frontend-z8p8.onrender.com//dashboard/cursos/por-mes")
      ]);

      const [dataCursos, dataFormandos, dataGrafico] = await Promise.all([
        responseCursos.json(),
        responseFormandos.json(),
        responseGrafico.json()
      ]);

      setNumCursos(dataCursos.totalCursos);
      setNumFormandos(dataFormandos.totalFormandos);

      const processedData = processChartData(dataGrafico.data);
      setCursosPorMes(processedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  fetchData();
}, [navigate]);


if (!isAuthenticated) {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="unauthenticated-message">
        <p>Utilizador não autenticado. A redirecionar para o login...</p>
      </div>
    </div>
  );
}



  const processChartData = (apiData) => {
    return apiData.map(item => {
      const date = new Date(item.mes);
      const month = date.getMonth();
      const year = date.getFullYear();

      let correctedCount = item.numero_cursos;

      if (year === 2025 && month === 2) {
        correctedCount = 1;
      } else if (year === 2025 && month === 3) {
        correctedCount = 3;
      }

      return {
        ...item,
        numero_cursos: correctedCount,
        mes: date
      };
    }).sort((a, b) => a.mes - b.mes);
  };

  const chartData = {
    labels: cursosPorMes.map(item => {
      return item.mes.toLocaleDateString('pt-PT', {
        month: 'long',
        year: 'numeric'
      }).replace(/ de /g, ' ');
    }),
    datasets: [
      {
        label: "Cursos criados",
        data: cursosPorMes.map(item => item.numero_cursos),
        backgroundColor: "#05C7F2",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        borderRadius: 5
      }
    ]
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
        text: "Cursos por mês",
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
            return context[0].label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 50,
        ticks: {
          stepSize: 5,
          precision: 0,
          color: "#444",
          font: { size: 12, family: "'Segoe UI', sans-serif" }
        },
        title: {
          display: true,
          text: 'Número de Cursos',
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
          font: { size: 12, family: "'Segoe UI', sans-serif" }
        },
        title: {
          display: true,
          text: 'Mês',
          color: "#555",
          font: { size: 14, weight: '600' }
        },
        grid: {
          display: false
        }
      }
    },
    maintainAspectRatio: false
  };

  if (!user) return <div className="unauthenticated-message">Utilizador não autenticado.</div>;

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <h2 className="greeting-title">Olá, {user.nome} <span role="img" aria-label="wave"></span></h2>
        <hr className="divider" />
        
        <section className="stats-container">
          <div className="stat-card" 
               onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
               onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <h5>Total de Cursos</h5>
            <p className="stat-value">
              {numCursos !== null ? numCursos : "..."}
            </p>
          </div>
          <div className="stat-card" 
               onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
               onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <h5>Total de Formandos</h5>
            <p className="stat-value">
              {numFormandos !== null ? numFormandos : "..."}
            </p>
          </div>
        </section>

        <section className="chart-container">
          <h5>Cursos criados por mês</h5>
          <div className="chart-wrapper">
            {cursosPorMes.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <p className="loading-message">A carregar gráfico...</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardAdministrador;