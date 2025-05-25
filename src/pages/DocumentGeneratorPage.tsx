import React, { useState, useEffect } from 'react';
import { ContentCard, ActionButton, Table, FormField } from '../components/ui';
import api from '../services/api';

interface DocumentType {
  id: string;
  name: string;
}

interface Document {
  id: string;
  title: string;
  entity_type: string;
  entity_id: string;
  document_type_id: string;
  document_type_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const DocumentGeneratorPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    entity_type: '',
    entity_id: '',
    document_type_id: '',
    content: ''
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [documentsResponse, typesResponse] = await Promise.all([
          api.get('/documents/documents'),
          api.get('/documents/document-types')
        ]);
        
        setDocuments(documentsResponse.data.documents || []);
        setDocumentTypes(typesResponse.data.document_types || []);
        
      } catch (err) {
        console.error('Erro ao carregar documentos:', err);
        setError('Não foi possível carregar os documentos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleCreateDocument = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFormData({
      title: '',
      entity_type: '',
      entity_id: '',
      document_type_id: '',
      content: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/documents/documents', formData);
      
      // Adicionar novo documento à lista
      setDocuments(prev => [response.data.document, ...prev]);
      
      // Fechar modal
      handleCloseModal();
      
    } catch (err) {
      console.error('Erro ao criar documento:', err);
      alert('Não foi possível criar o documento. Verifique os dados e tente novamente.');
    }
  };

  const handleViewDocument = (document: Document) => {
    // Abrir documento em nova janela ou modal
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${document.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              h1 { color: #2563eb; }
              .metadata { color: #666; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <h1>${document.title}</h1>
            <div class="metadata">
              <p>Tipo: ${document.document_type_name}</p>
              <p>Criado em: ${new Date(document.created_at).toLocaleDateString('pt-BR')}</p>
              <p>Atualizado em: ${new Date(document.updated_at).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>${document.content}</div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este documento? Esta operação será irreversível.')) {
      try {
        await api.delete(`/documents/documents/${documentId}`);
        
        // Atualizar lista após exclusão
        setDocuments(documents.filter(doc => doc.id !== documentId));
        
      } catch (err) {
        console.error('Erro ao excluir documento:', err);
        alert('Não foi possível excluir o documento selecionado.');
      }
    }
  };

  const columns = [
    { key: 'title', header: 'Título' },
    { key: 'document_type_name', header: 'Tipo de Documento' },
    { 
      key: 'entity_type', 
      header: 'Entidade',
      render: (value: string, doc: Document) => `${value} #${doc.entity_id}`
    },
    { 
      key: 'created_at', 
      header: 'Data de Criação',
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR')
    },
    { 
      key: 'actions', 
      header: 'Ações',
      render: (_: any, doc: Document) => (
        <div className="flex space-x-2">
          <button 
            onClick={(e) => { e.stopPropagation(); handleViewDocument(doc); }}
            className="text-blue-600 hover:text-blue-800"
          >
            Visualizar
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }}
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
        <p className="text-gray-600">Carregando documentos...</p>
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
        <h1 className="text-2xl font-bold">Gerador de Documentos</h1>
        <ActionButton 
          label="Novo Documento" 
          onClick={handleCreateDocument} 
        />
      </div>
      
      <ContentCard title="Documentos Gerados">
        <Table 
          columns={columns} 
          data={documents} 
          onRowClick={handleViewDocument}
        />
      </ContentCard>
      
      {/* Modal de criação de documento */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Criar Novo Documento</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField
                  label="Título"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
                
                <FormField
                  label="Tipo de Documento"
                  id="document_type_id"
                  value={formData.document_type_id}
                  onChange={handleInputChange}
                  required
                  options={documentTypes.map(type => ({
                    value: type.id,
                    label: type.name
                  }))}
                />
                
                <FormField
                  label="Tipo de Entidade"
                  id="entity_type"
                  value={formData.entity_type}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: 'Auditoria', label: 'Auditoria' },
                    { value: 'Processo', label: 'Processo de Pagamento' }
                  ]}
                />
                
                <FormField
                  label="ID da Entidade"
                  id="entity_id"
                  value={formData.entity_id}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="mb-4">
                <FormField
                  label="Conteúdo"
                  id="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={10}
                />
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
                  className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900"
                >
                  Criar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentGeneratorPage;
