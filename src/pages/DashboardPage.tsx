import React, { useEffect, useState } from 'react';
import { ContentCard, StatCard, Table, ActionButton } from '../components/ui';
import api from '../services/api';

interface AuditCount {
  planned: number;
  inExecution: number;
  completed: number;
}

interface Audit {
  id: string;
  status: string;
  type: string;
  responsibleSection: string;
  object: string;
  lastUpdated: string;
}

const DashboardPage: React.FC = () => {
  const [auditCounts, setAuditCounts] = useState<AuditCount>({
    planned: 0,
    inExecution: 0,
    completed: 0
  });
  
  const [plannedAudits, setPlannedAudits] = useState<Audit[]>([]);
  const [executionAudits, setExecutionAudits] = useState<Audit[]>([]);
  const [completedAudits, setCompletedAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Buscar contagem de auditorias por status
        const plannedResponse = await api.get('/audits?status=Planejada');
        const executionResponse = await api.get('/audits?status=Em execução');
        const completedResponse = await api.get('/audits?status=Concluída - Acompanhamento das recomendações');
        
        setPlannedAudits(plannedResponse.data.audits || []);
        setExecutionAudits(executionResponse.data.audits || []);
        setCompletedAudits(completedResponse.data.audits || []);
        
        setAuditCounts({
          planned: plannedResponse.data.audits?.length || 0,
          inExecution: executionResponse.data.audits?.length || 0,
          completed: completedResponse.data.audits?.length || 0
        });
        
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const plannedColumns = [
    { key: 'type', header: 'Tipo de Auditoria' },
    { key: 'responsibleSection', header: 'Seção Responsável' },
    { key: 'object', header: 'Objeto' },
    { key: 'lastUpdated', header: 'Última atualização' }
  ];
  
  const executionColumns = [
    { key: 'seiProcess', header: 'Processo SEI' },
    { key: 'type', header: 'Tipo de Auditoria' },
    { key: 'responsibleSection', header: 'Seção Responsável' },
    { key: 'object', header: 'Objeto' },
    { key: 'lastUpdated', header: 'Última atualização' }
  ];
  
  const completedColumns = [
    { key: 'seiProcess', header: 'Processo SEI' },
    { key: 'responsibleSection', header: 'Seção Responsável' },
    { key: 'lastUpdated', header: 'Última atualização' }
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Auditorias planejadas" 
          value={auditCounts.planned} 
          color="blue" 
          icon="📋" 
        />
        <StatCard 
          title="Auditorias em execução" 
          value={auditCounts.inExecution} 
          color="yellow" 
          icon="🔍" 
        />
        <StatCard 
          title="Auditorias concluídas" 
          value={auditCounts.completed} 
          color="green" 
          icon="✅" 
        />
      </div>
      
      <ContentCard 
        title="Auditorias planejadas"
        actions={
          <ActionButton 
            label="Nova auditoria" 
            onClick={() => {}} 
          />
        }
      >
        <Table 
          columns={plannedColumns} 
          data={plannedAudits} 
          onRowClick={(audit) => {}}
        />
      </ContentCard>
      
      <ContentCard title="Auditorias em execução">
        <Table 
          columns={executionColumns} 
          data={executionAudits} 
          onRowClick={(audit) => {}}
        />
      </ContentCard>
      
      <ContentCard title="Auditorias concluídas - Acompanhamento das recomendações">
        <Table 
          columns={completedColumns} 
          data={completedAudits} 
          onRowClick={(audit) => {}}
        />
      </ContentCard>
    </div>
  );
};

export default DashboardPage;
