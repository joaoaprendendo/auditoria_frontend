import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import ProtectedRoutes from './components/ProtectedRoutes';
import DashboardPage from './pages/DashboardPage';
import AuditedDashboardPage from './pages/AuditedDashboardPage';
import AuditsPage from './pages/AuditsPage';
import PaymentsPage from './pages/PaymentsPage';
import BankOrdersPage from './pages/BankOrdersPage';
import DocumentGeneratorPage from './pages/DocumentGeneratorPage';
import UsersPage from './pages/UsersPage';
import NormsAndManualsPage from './pages/NormsAndManualsPage';

// Componente de proteção de rotas
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [] 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirecionar para dashboard específico com base no papel
    if (user.role === 'Usuário externo - Auditado') {
      return <Navigate to="/audited-dashboard" />;
    }
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={
            !isAuthenticated ? <LoginPage /> : <Navigate to="/" />
          } />
          
          <Route path="/*" element={
            <ProtectedRoute>
              <ProtectedRoutes />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
