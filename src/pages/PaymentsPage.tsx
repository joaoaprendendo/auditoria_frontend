import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentCard, ActionButton, Table, FormField } from '../components/ui';
import api from '../services/api';

interface PaymentProcess {
  id: string;
  sei_process_number: string;
  contract_number: string;
  contracted_company: string;
  cnpj: string;
  contract_object: string;
  monthly_contract_value: number;
  commitment_note: string;
  expense_element: string;
  initial_term: string;
  final_term: string;
  is_prorrogable: boolean;
}

const PaymentsPage: React.FC = () => {
  const [processes, setProcesses] = useState<PaymentProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        setLoading(true);
        
        const response = await api.get('/payments/payment-processes');
        setProcesses(response.data.payment_processes || []);
        
      } catch (err) {
        console.error('Erro ao carregar processos de pagamento:', err);
        setError('Não foi possível carregar os processos de pagamento. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProcesses();
  }, []);

  const handleCreateProcess = () => {
    // Implementar modal ou navegação para criação de processo
    console.log('Criar novo processo de pagamento');
  };

  const handleViewProcess = (process: PaymentProcess) => {
    // Navegar para página de detalhes do processo
    navigate(`/payment-processes/${process.id}`);
  };

  const handleDeleteProcess = async (processId: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este processo? Esta operação será irreversível.')) {
      try {
        await api.delete(`/payments/payment-processes/${processId}`);
        
        // Atualizar lista após exclusão
        setProcesses(processes.filter(process => process.id !== processId));
        
      } catch (err) {
        console.error('Erro ao excluir processo:', err);
        alert('Não foi possível excluir o processo selecionado.');
      }
    }
  };

  const columns = [
    { key: 'sei_process_number', header: 'Processo SEI' },
    { key: 'contract_number', header: 'Contrato' },
    { key: 'contracted_company', header: 'Empresa' },
    { key: 'contract_object', header: 'Objeto' },
    { 
      key: 'monthly_contract_value', 
      header: 'Valor Mensal',
      render: (value: number) => value ? `R$ ${value.toFixed(2)}` : '-'
    },
    { 
      key: 'initial_term', 
      header: 'Vigência Inicial',
    },
    { 
      key: 'final_term', 
      header: 'Vigência Final',
    },
    { 
      key: 'actions', 
      header: 'Ações',
      render: (_: any, process: PaymentProcess) => (
        <div className="flex space-x-2">
          <button 
            onClick={(e) => { e.stopPropagation(); handleViewProcess(process); }}
            className="text-blue-600 hover:text-blue-800"
          >
            Detalhes
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleDeleteProcess(process.id); }}
            className="text-red-600 hover:text-red-800"
          >
            Excluir
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Carregando processos de pagamento...</p>
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
        <h1 className="text-2xl font-bold">Processos de Pagamento Continuado</h1>
        <ActionButton 
          label="Novo Processo" 
          onClick={handleCreateProcess} 
        />
      </div>
      
      <ContentCard title="Lista de Processos">
        <Table 
          columns={columns} 
          data={processes} 
          onRowClick={handleViewProcess}
        />
      </ContentCard>
    </div>
  );
};

export default PaymentsPage;
