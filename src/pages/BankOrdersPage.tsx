import React, { useState, useEffect } from 'react';
import { ContentCard, ActionButton, Table } from '../components/ui';
import api from '../services/api';

interface BankOrder {
  id: string;
  account: string;
  order_number: string;
  month: string;
  year: string;
  value: number;
  cnpj: string;
  favored: string;
  process_number?: string;
  object?: string;
  commitment?: string;
  element?: string;
  status: boolean;
  auditor_initial: string;
  observation?: string;
}

interface BankOrderStats {
  by_month: {
    month: string;
    year: string;
    count: number;
    total: number;
  }[];
  by_process: {
    process_number: string;
    count: number;
    total: number;
  }[];
  by_auditor: {
    auditor_initial: string;
    count: number;
    total: number;
  }[];
  by_year: {
    year: string;
    count: number;
    total: number;
  }[];
}

const BankOrdersPage: React.FC = () => {
  const [bankOrders, setBankOrders] = useState<BankOrder[]>([]);
  const [stats, setStats] = useState<BankOrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    imported_count: number;
    failed_count: number;
    failed_rows: string[];
  } | null>(null);
  
  useEffect(() => {
    const fetchBankOrders = async () => {
      try {
        setLoading(true);
        
        const [ordersResponse, statsResponse] = await Promise.all([
          api.get('/bank-orders'),
          api.get('/bank-orders/stats')
        ]);
        
        setBankOrders(ordersResponse.data.bank_orders || []);
        setStats(statsResponse.data);
        
      } catch (err) {
        console.error('Erro ao carregar ordens bancárias:', err);
        setError('Não foi possível carregar as ordens bancárias. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBankOrders();
  }, []);

  const handleImportClick = () => {
    setShowImportModal(true);
    setImportResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) return;
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await api.post('/bank-orders/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setImportResult(response.data);
      
      // Recarregar dados após importação bem-sucedida
      if (response.data.imported_count > 0) {
        const [ordersResponse, statsResponse] = await Promise.all([
          api.get('/bank-orders'),
          api.get('/bank-orders/stats')
        ]);
        
        setBankOrders(ordersResponse.data.bank_orders || []);
        setStats(statsResponse.data);
      }
      
    } catch (err) {
      console.error('Erro ao importar arquivo:', err);
      alert('Não foi possível importar o arquivo. Verifique o formato e tente novamente.');
    }
  };

  const handleCloseModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setImportResult(null);
  };

  const columns = [
    { key: 'order_number', header: 'Ordem Bancária' },
    { key: 'month', header: 'Mês' },
    { key: 'year', header: 'Ano' },
    { 
      key: 'value', 
      header: 'Valor',
      render: (value: number) => `R$ ${value.toFixed(2)}`
    },
    { key: 'cnpj', header: 'CNPJ' },
    { key: 'favored', header: 'Favorecido' },
    { key: 'process_number', header: 'Processo' },
    { key: 'object', header: 'Objeto' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: boolean) => value ? 'OK' : 'Pendente'
    },
    { key: 'auditor_initial', header: 'Auditor' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Carregando ordens bancárias...</p>
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
        <h1 className="text-2xl font-bold">Conferência de Ordens Bancárias</h1>
        <ActionButton 
          label="Importar Planilha" 
          onClick={handleImportClick} 
        />
      </div>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <ContentCard title="Total por Ano">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left">Ano</th>
                    <th className="py-2 px-4 text-left">Quantidade</th>
                    <th className="py-2 px-4 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.by_year.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-4">{item.year}</td>
                      <td className="py-2 px-4">{item.count}</td>
                      <td className="py-2 px-4">R$ {item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ContentCard>
          
          <ContentCard title="Total por Mês">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left">Mês/Ano</th>
                    <th className="py-2 px-4 text-left">Quantidade</th>
                    <th className="py-2 px-4 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.by_month.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-4">{item.month}/{item.year}</td>
                      <td className="py-2 px-4">{item.count}</td>
                      <td className="py-2 px-4">R$ {item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ContentCard>
          
          <ContentCard title="Total por Processo">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left">Processo</th>
                    <th className="py-2 px-4 text-left">Quantidade</th>
                    <th className="py-2 px-4 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.by_process.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-4">{item.process_number}</td>
                      <td className="py-2 px-4">{item.count}</td>
                      <td className="py-2 px-4">R$ {item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ContentCard>
          
          <ContentCard title="Total por Auditor">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left">Auditor</th>
                    <th className="py-2 px-4 text-left">Quantidade</th>
                    <th className="py-2 px-4 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.by_auditor.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-4">{item.auditor_initial}</td>
                      <td className="py-2 px-4">{item.count}</td>
                      <td className="py-2 px-4">R$ {item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ContentCard>
        </div>
      )}
      
      <ContentCard title="Ordens Bancárias">
        <Table 
          columns={columns} 
          data={bankOrders} 
        />
      </ContentCard>
      
      {/* Modal de importação */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Importar Ordens Bancárias</h2>
            
            {importResult ? (
              <div>
                <div className="mb-4">
                  <p className="text-green-600 font-medium">{importResult.imported_count} ordens bancárias importadas com sucesso!</p>
                  
                  {importResult.failed_count > 0 && (
                    <div className="mt-2">
                      <p className="text-red-600 font-medium">{importResult.failed_count} linhas falharam na importação:</p>
                      <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                        {importResult.failed_rows.slice(0, 5).map((row, index) => (
                          <li key={index}>{row}</li>
                        ))}
                        {importResult.failed_rows.length > 5 && (
                          <li>... e mais {importResult.failed_rows.length - 5} erros</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleCloseModal}
                    className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleImportSubmit}>
                <div className="mb-4">
                  <p className="mb-2">Selecione o arquivo Excel (.xlsx) contendo as ordens bancárias:</p>
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  <p>O arquivo deve conter as seguintes colunas:</p>
                  <p>Conta | Ordem Bancária | mês | valor | CNPJ | Favorecido | Processo | Objeto | Empenho | Elemento | Status | Auditor | Observação</p>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedFile}
                    className={`px-4 py-2 rounded ${
                      selectedFile
                        ? 'bg-blue-800 text-white hover:bg-blue-900'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Importar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BankOrdersPage;
