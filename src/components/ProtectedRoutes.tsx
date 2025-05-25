import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import DashboardPage from '../pages/DashboardPage';
import AuditedDashboardPage from '../pages/AuditedDashboardPage';
import AuditsPage from '../pages/AuditsPage';
import PaymentsPage from '../pages/PaymentsPage';
import BankOrdersPage from '../pages/BankOrdersPage';
import DocumentGeneratorPage from '../pages/DocumentGeneratorPage';
import UsersPage from '../pages/UsersPage';
import NormsAndManualsPage from '../pages/NormsAndManualsPage';

// Páginas temporárias para os módulos
const NotFoundPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-64">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Página não encontrada</h2>
    <p className="text-gray-600">A página que você está procurando não existe ou está em desenvolvimento.</p>
  </div>
);

const ProtectedRoutes: React.FC = () => {
  const { user } = useAuth();
  
  // Redirecionar para dashboard específico com base no papel do usuário
  const getDefaultRoute = () => {
    if (user?.role === 'Usuário externo - Auditado') {
      return '/audited-dashboard';
    }
    return '/dashboard';
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={getDefaultRoute()} />} />
        
        {/* Rotas para usuários internos (Diretor e Auditor) */}
        <Route 
          path="/dashboard" 
          element={
            user?.role !== 'Usuário externo - Auditado' 
              ? <DashboardPage /> 
              : <Navigate to="/audited-dashboard" />
          } 
        />
        
        <Route 
          path="/audits" 
          element={
            user?.role !== 'Usuário externo - Auditado' 
              ? <AuditsPage /> 
              : <Navigate to="/audited-dashboard" />
          } 
        />
        
        <Route 
          path="/payment-processes" 
          element={
            user?.role !== 'Usuário externo - Auditado' 
              ? <PaymentsPage /> 
              : <Navigate to="/audited-dashboard" />
          } 
        />
        
        <Route 
          path="/bank-orders" 
          element={
            user?.role !== 'Usuário externo - Auditado' 
              ? <BankOrdersPage /> 
              : <Navigate to="/audited-dashboard" />
          } 
        />
        
        <Route 
          path="/document-generator" 
          element={
            user?.role !== 'Usuário externo - Auditado' 
              ? <DocumentGeneratorPage /> 
              : <Navigate to="/audited-dashboard" />
          } 
        />
        
        <Route 
          path="/norms-manuals" 
          element={<NormsAndManualsPage />} 
        />
        
        <Route 
          path="/users" 
          element={
            user?.role === 'Usuário interno - Diretor da Divisão' 
              ? <UsersPage /> 
              : <Navigate to="/dashboard" />
          } 
        />
        
        {/* Rotas para usuário auditado */}
        <Route 
          path="/audited-dashboard" 
          element={
            user?.role === 'Usuário externo - Auditado' 
              ? <AuditedDashboardPage /> 
              : <Navigate to="/dashboard" />
          } 
        />
        
        <Route path="/notifications" element={<NotFoundPage />} />
        <Route path="/reports" element={<NotFoundPage />} />
        <Route path="/access-requests" element={<NotFoundPage />} />
        <Route path="/responses" element={<NotFoundPage />} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
};

export default ProtectedRoutes;
