import React, { useEffect, useState } from 'react';
import { ContentCard, StatCard, Table, ActionButton } from '../components/ui';
import api from '../services/api';

interface AuditedNotification {
  id: string;
  title: string;
  date: string;
  read: boolean;
}

interface AuditedReport {
  id: string;
  title: string;
  type: string;
  date: string;
  viewed: boolean;
}

const AuditedDashboardPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AuditedNotification[]>([]);
  const [reports, setReports] = useState<AuditedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Simulação de dados para o dashboard do auditado
    // Em uma implementação real, estes dados viriam da API
    setTimeout(() => {
      setNotifications([
        { id: '1', title: 'Nova auditoria iniciada', date: '20/05/2025', read: false },
        { id: '2', title: 'Solicitação de documentos', date: '18/05/2025', read: true },
      ]);
      
      setReports([
        { id: '1', title: 'Relatório preliminar - Auditoria de Contratos', type: 'Relatório preliminar', date: '15/05/2025', viewed: true },
        { id: '2', title: 'Nota de auditoria - Processos de Pagamento', type: 'Nota de auditoria', date: '10/05/2025', viewed: false },
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const notificationColumns = [
    { key: 'title', header: 'Título' },
    { key: 'date', header: 'Data' },
    { key: 'read', header: 'Status', render: (value: boolean) => value ? 'Lida' : 'Não lida' }
  ];
  
  const reportColumns = [
    { key: 'title', header: 'Título' },
    { key: 'type', header: 'Tipo' },
    { key: 'date', header: 'Data' },
    { key: 'viewed', header: 'Status', render: (value: boolean) => value ? 'Visualizado' : 'Não visualizado' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Carregando dados do dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-bold py-1 px-3 rounded"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StatCard 
          title="Notificações não lidas" 
          value={notifications.filter(n => !n.read).length} 
          color="blue" 
          icon="🔔" 
        />
        <StatCard 
          title="Relatórios pendentes" 
          value={reports.filter(r => !r.viewed).length} 
          color="yellow" 
          icon="📝" 
        />
      </div>
      
      <ContentCard 
        title="Notificações recentes"
        actions={
          <ActionButton 
            label="Ver todas" 
            onClick={() => {}} 
          />
        }
      >
        <Table 
          columns={notificationColumns} 
          data={notifications} 
          onRowClick={(notification) => {}}
        />
      </ContentCard>
      
      <ContentCard 
        title="Relatórios e notas de auditoria"
        actions={
          <ActionButton 
            label="Ver todos" 
            onClick={() => {}} 
          />
        }
      >
        <Table 
          columns={reportColumns} 
          data={reports} 
          onRowClick={(report) => {}}
        />
      </ContentCard>
    </div>
  );
};

export default AuditedDashboardPage;
