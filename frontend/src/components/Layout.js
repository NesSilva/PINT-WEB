import React from 'react';
import SidebarFormando from './SidebarFormando';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user, perfil } = location.state || {};

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!['/login', '/reset-password', '/primeiro-login'].includes(location.pathname) && (
        <SidebarFormando user={user} perfil={perfil} />
      )}
      
      <div style={{ flex: 1, padding: '20px' }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;