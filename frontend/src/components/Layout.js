import React from 'react';
import SidebarFormando from './SidebarFormando';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  // Obter user e perfil do localStorage se não estiverem no state
   const getCurrentUser = () => {
    try {
      const usuarioId = localStorage.getItem('usuarioId');
      console.log('usuarioId:', usuarioId);
      if (usuarioId) {
        return {
          id_utilizador: usuarioId,
        };
      }
      return null;
    } catch (error) {
      console.error("Erro ao obter usuário:", error);
      return null;
    }
  };

  const getCurrentProfile = () => {
    try {
      return JSON.parse(localStorage.getItem('perfil')) || null;
    } catch (error) {
      console.error("Erro ao obter perfil:", error);
      return null;
    }
  };

  const user = getCurrentUser();
  const perfil = location.state?.perfil || JSON.parse(localStorage.getItem('perfil')) || null;
  console.log('Sidebar user:', user);
console.log('Sidebar perfil:', perfil);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!['/login', '/reset-password', '/primeiro-login'].includes(location.pathname) && (
        <SidebarFormando user={user} perfil={perfil} />
      )}
      
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;