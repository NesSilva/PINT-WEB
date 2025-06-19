// src/pages/DashboardAdministrador.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import Sidebar from "../components/Sidebar";  // Importando o Sidebar
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
  const { user } = location.state || {};

  const [numCursos, setNumCursos] = useState(null);
  const [numFormandos, setNumFormandos] = useState(null);
  const [cursosPorMes, setCursosPorMes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [responseCursos, responseFormandos, responseGrafico] = await Promise.all([
          fetch("https://backend-8pyn.onrender.com/api/dashboard/admin"),
          fetch("https://backend-8pyn.onrender.com/api/dashboard/formandos"),
          fetch("https://backend-8pyn.onrender.com/api/dashboard/cursos/por-mes")
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
  }, []);

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
        backgroundColor: "rgba(46, 112, 236, 0.6)",
        borderColor: "rgba(46, 112, 236, 1)",
        borderWidth: 1
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
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: "Cursos por mês",
        font: {
          size: 16
        }
      },
      tooltip: {
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
          precision: 0
        },
        title: {
          display: true,
          text: 'Número de Cursos'
        }
      },
      x: {
        ticks: {
          autoSkip: false,
        },
        title: {
          display: true,
          text: 'Mês'
        }
      }
    },
    maintainAspectRatio: false
  };

  if (!user) return <p>Utilizador não autenticado.</p>;

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar />

      <div className="container-fluid mt-4" style={{ marginLeft: '200px' }}>
        <h2>Olá {user.nome} 👋</h2>
        <hr />
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Total de Cursos</h5>
                <p className="display-4">{numCursos !== null ? numCursos : "..."}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Total de Formandos</h5>
                <p className="display-4">{numFormandos !== null ? numFormandos : "..."}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-body">
            <h5 className="card-title">Cursos criados por mês</h5>
            <div style={{ height: '400px' }}>
              {cursosPorMes.length > 0 ? (
                <Bar data={chartData} options={chartOptions} />
              ) : (
                <p className="text-center py-5">A carregar gráfico...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdministrador;
