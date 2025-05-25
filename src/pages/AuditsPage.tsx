import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentCard, ActionButton, Table, FormField } from '../components/ui';
import api from '../services/api';

interface Audit {
  id: string;
  status: string;
  type: string;
  responsibleSection: string;
  object: string;
  lastUpdated: string;
  seiProcess?: string;
  auditedParties?: string;
  currentPhase?: string;
  nextPhase?: string;
}

const AuditsPage: React.FC = () => {
  const [plannedAudits, setPlannedAudits] = useState<Audit[]>([]);
  const [executionAudits, setExecutionAudits] = useState<Audit[]>([]);
  const [completedAudits, setCompletedAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAudits, setSelectedAudits] = useState<string[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        setLoading(true);
        
        const plannedResponse = await api.get('/audits?status=Planejada');
        const executionResponse = await api.get('/audits?status=Em execução');
        const completedResponse = await api.get('/audits?status=Concluída - Acompanhamento das recomendações');
        
        setPlannedAudits(plannedResponse.data.audits || []);
        setExecutionAudits(executionResponse.data.audits || []);
        setCompletedAudits(completedResponse.data.audits || []);
        
      } catch (err) {
        console.error('Erro ao carregar auditorias:', err);
        setError('Não foi possível carregar as auditorias. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAudits();
  }, []);

  const handleCreateAudit = () => {
    // Implementar modal ou navegação para criação de auditoria
    console.log('Criar nova auditoria');
  };

  const handleViewAudit = (audit: Audit) => {
    // Navegar para página de detalhes da auditoria
    console.log('Ver auditoria:', audit);
  };

  const handleDeleteSelected = async () => {
    if (selectedAudits.length === 0) return;
    
    if (window.confirm(`Tem certeza de que deseja excluir ${selectedAudits.length} auditoria(s)? Esta operação será irreversível.`)) {
      try {
        await api.post('/audits/batch-delete', { audit_ids: selectedAudits });
        
        // Atualizar listas após exclusão
        setPlannedAudits(plannedAudits.filter(audit => !selectedAudits.includes(audit.id)));
        setExecutionAudits(executionAudits.filter(audit => !selectedAudits.includes(audit.id)));
        setCompletedAudits(completedAudits.filter(audit => !selectedAudits.includes(audit.id)));
        
        setSelectedAudits([]);
      } catch (err) {
        console.error('Erro ao excluir auditorias:', err);
        alert('Não foi possível excluir as auditorias selecionadas.');
      }
    }
  };

  const toggleAuditSelection = (auditId: string) => {
    if (selectedAudits.includes(auditId)) {
      setSelectedAudits(selectedAudits.filter(id => id !== auditId));
    } else {
      setSelectedAudits([...selectedAudits, auditId]);
    }
  };

  const plannedColumns = [
    { 
      key: 'select', 
      header: '', 
      render: (_: any, audit: Audit) => (
        <input 
          type="checkbox" 
          checked={selectedAudits.includes(audit.id)} 
          onChange={() => toggleAuditSelection(audit.id)}
          onClick={(e) => e.stopPropagation()}
        />
      )
    },
    { key: 'type', header: 'Tipo de Auditoria' },
    { key: 'responsibleSection', header: 'Seção Responsável' },
    { key: 'object', header: 'Objeto' },
    { key: 'lastUpdated', header: 'Última atualização' },
    { 
      key: 'actions', 
      header: 'Ações',
      render: (_: any, audit: Audit) => (
        <div className="flex space-x-2">
          <button 
            onClick={(e) => { e.stopPropagation(); handleViewAudit(audit); }}
            className="text-blue-600 hover:text-blue-800"
          >
            Visualizar
          </button>
        </div>
      )
    }
  ];
  
  const executionColumns = [
    { 
      key: 'select', 
      header: '', 
      render: (_: any, audit: Audit) => (
        <input 
          type="checkbox" 
          checked={selectedAudits.includes(audit.id)} 
          onChange={() => toggleAuditSelection(audit.id)}
          onClick={(e) => e.stopPropagation()}
        />
      )
    },
    { key: 'seiProcess', header: 'Processo SEI' },
    { key: 'type', header: 'Tipo de Auditoria' },
    { key: 'responsibleSection', header: 'Seção Responsável' },
    { key: 'object', header: 'Objeto' },
    { key: 'currentPhase', header: 'Fase atual' },
    { key: 'nextPhase', header: 'Próxima fase' },
    { key: 'lastUpdated', header: 'Última atualização' },
    { 
      key: 'actions', 
      header: 'Ações',
      render: (_: any, audit: Audit) => (
        <div className="flex space-x-2">
          <button 
            onClick={(e) => { e.stopPropagation(); handleViewAudit(audit); }}
            className="text-blue-600 hover:text-blue-800"
          >
            Visualizar
          </button>
        </div>
      )
    }
  ];
  
  const completedColumns = [
    { 
      key: 'select', 
      header: '', 
      render: (_: any, audit: Audit) => (
        <input 
          type="checkbox" 
          checked={selectedAudits.includes(audit.id)} 
          onChange={() => toggleAuditSelection(audit.id)}
          onClick={(e) => e.stopPropagation()}
        />
      )
    },
    { key: 'seiProcess', header: 'Processo SEI' },
    { key: 'responsibleSection', header: 'Seção Responsável' },
    { key: 'auditedParties', header: 'Auditados' },
    { key: 'lastUpdated', header: 'Última atualização' },
    { 
      key: 'actions', 
      header: 'Ações',
      render: (_: any, audit: Audit) => (
        <div className="flex space-x-2">
          <button 
            onClick={(e) => { e.stopPropagation(); handleViewAudit(audit); }}
            className="text-blue-600 hover:text-blue-800"
          >
            Visualizar
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Carregando auditorias...</p>
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
      <div className="flex justify-between items-center mb-6">
        <ActionButton 
          label="Nova auditoria" 
          onClick={handleCreateAudit} 
        />
        
        {selectedAudits.length > 0 && (
          <ActionButton 
            label={`Excluir selecionadas (${selectedAudits.length})`} 
            onClick={handleDeleteSelected} 
            primary={false}
          />
        )}
      </div>
      
      <ContentCard title="Auditorias planejadas">
        <Table 
          columns={plannedColumns} 
          data={plannedAudits} 
          onRowClick={handleViewAudit}
        />
      </ContentCard>
      
      <ContentCard title="Auditorias em execução">
        <Table 
          columns={executionColumns} 
          data={executionAudits} 
          onRowClick={handleViewAudit}
        />
      </ContentCard>
      
      <ContentCard title="Auditorias concluídas - Acompanhamento das recomendações">
        <Table 
          columns={completedColumns} 
          data={completedAudits} 
          onRowClick={handleViewAudit}
        />
      </ContentCard>
    </div>
  );
};

export default AuditsPage;
