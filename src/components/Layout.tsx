import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  children: React.ReactNode;
}

const Layout: React.FC<SidebarProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  // Definir menus com base no papel do usuário
  const getMenuItems = () => {
    if (user?.role === 'Usuário externo - Auditado') {
      return [
        { path: '/audited-dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/notifications', label: 'Notificações', icon: '🔔' },
        { path: '/reports', label: 'Relatórios e notas de auditorias', icon: '📝' },
        { path: '/access-requests', label: 'Requisições de acesso a outros documentos', icon: '🔑' },
        { path: '/responses', label: 'Respostas/Manifestações', icon: '💬' },
      ];
    }

    const menuItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/audits', label: 'Auditorias', icon: '🔍' },
      { path: '/payment-processes', label: 'Processos de Pagamento Continuado', icon: '💰' },
      { path: '/bank-orders', label: 'Conferência de Ordens Bancárias', icon: '🏦' },
      { path: '/document-generator', label: 'Gerador de Documentos', icon: '📄' },
      { path: '/norms-manuals', label: 'Normas e Manuais', icon: '📚' },
    ];

    // Adicionar módulo de Usuários apenas para Diretor da Divisão
    if (user?.role === 'Usuário interno - Diretor da Divisão') {
      menuItems.push({ path: '/users', label: 'Usuários', icon: '👥' });
    }

    return menuItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white">
        <div className="p-4 flex items-center">
          <img src="/logo-jfsc.jpeg" alt="Logo JFSC" className="h-10 mr-2" />
          <div>
            <h1 className="text-lg font-semibold">DAIN/JFSC</h1>
            <p className="text-xs">Sistema de Auditoria</p>
          </div>
        </div>
        
        <div className="mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 hover:bg-blue-700 ${
                location.pathname === item.path ? 'bg-blue-700' : ''
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-3">
            <h2 className="text-xl font-semibold text-gray-800">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
            <div className="flex items-center">
              <div className="mr-4 text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
