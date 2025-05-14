import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="bg-white text-black p-3" style={{ width: '220px', borderRight: '1px solid #ddd', minHeight: '100vh' }}>
      <Link to="/dashboard/administrador">
        <img 
          src="/logotipo-softinsa.png" 
          alt="Logotipo Softinsa" 
          style={{ width: "150px", height: "auto" }} 
        />
      </Link>

      <ul className="nav flex-column mt-4">
        <li className="nav-item mb-2">
          <a className="nav-link text-black" href="/utilizadores">Utilizadores</a>
        </li>
        <li className="nav-item mb-2">
          <Link className="nav-link text-black" to="/cursos">Cursos</Link> {/* <-- AQUI ALTERADO */}
        </li>
        <li className="nav-item mb-2">
          <a className="nav-link text-black" href="/formandos">Formandos</a>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
