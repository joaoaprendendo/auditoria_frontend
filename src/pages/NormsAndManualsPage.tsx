import React, { useState, useEffect } from 'react';
import { ContentCard, ActionButton, Table, FormField } from '../components/ui';
import api from '../services/api';

interface NormManual {
  id: string;
  title: string;
  link?: string;
  file_name?: string;
  file_path?: string;
  uploaded_at: string;
}

const NormsAndManualsPage: React.FC = () => {
  const [normsManuals, setNormsManuals] = useState<NormManual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'link' | 'file'>('link');
  const [formData, setFormData] = useState({
    title: '',
    link: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  useEffect(() => {
    const fetchNormsManuals = async () => {
      try {
        setLoading(true);
        
        const response = await api.get('/norms-manuals');
        setNormsManuals(response.data.norms_manuals || []);
        
      } catch (err) {
        console.error('Erro ao carregar normas e manuais:', err);
        setError('Não foi possível carregar as normas e manuais. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNormsManuals();
  }, []);

  const handleCreateNormManual = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setCreateType('link');
    setFormData({
      title: '',
      link: ''
    });
    setSelectedFile(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let response;
      
      if (createType === 'link') {
        // Enviar link
        response = await api.post('/norms-manuals', formData);
      } else {
        // Enviar arquivo
        if (!selectedFile) return;
        
        const formDataObj = new FormData();
        formDataObj.append('file', selectedFile);
        formDataObj.append('title', formData.title);
        
        response = await api.post('/norms-manuals', formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      // Adicionar nova norma/manual à lista
      setNormsManuals(prev => [response.data.norm_manual, ...prev]);
      
      // Fechar modal
      handleCloseModal();
      
    } catch (err) {
      console.error('Erro ao criar norma/manual:', err);
      alert('Não foi possível criar a norma/manual. Verifique os dados e tente novamente.');
    }
  };

  const handleViewNormManual = (normManual: NormManual) => {
    if (normManual.link) {
      // Abrir link em nova aba
      window.open(normManual.link, '_blank');
    } else if (normManual.file_path) {
      // Abrir arquivo em nova aba
      window.open(`/api/norms-manuals/download/${normManual.id}`, '_blank');
    }
  };

  const handleDeleteNormManual = async (normManualId: string) => {
    if (window.confirm('Tem certeza de que deseja excluir esta norma/manual? Esta operação será irreversível.')) {
      try {
        await api.delete(`/norms-manuals/${normManualId}`);
        
        // Atualizar lista após exclusão
        setNormsManuals(normsManuals.filter(item => item.id !== normManualId));
        
      } catch (err) {
        console.error('Erro ao excluir norma/manual:', err);
        alert('Não foi possível excluir a norma/manual selecionada.');
      }
    }
  };

  const columns = [
    { key: 'title', header: 'Título' },
    { 
      key: 'type', 
      header: 'Tipo',
      render: (_: any, item: NormManual) => item.link ? 'Link' : 'Arquivo'
    },
    { 
      key: 'uploaded_at', 
      header: 'Data de Upload',
      render: (value: string) => value
    },
    { 
      key: 'actions', 
      header: 'Ações',
      render: (_: any, item: NormManual) => (
        <div className="flex space-x-2">
          <button 
            onClick={(e) => { e.stopPropagation(); handleViewNormManual(item); }}
            className="text-blue-600 hover:text-blue-800"
          >
            {item.link ? 'Abrir Link' : 'Baixar Arquivo'}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleDeleteNormManual(item.id); }}
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
        <p className="text-gray-600">Carregando normas e manuais...</p>
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
        <h1 className="text-2xl font-bold">Normas e Manuais</h1>
        <ActionButton 
          label="Nova Norma/Manual" 
          onClick={handleCreateNormManual} 
        />
      </div>
      
      <ContentCard title="Normas e Manuais Disponíveis">
        <Table 
          columns={columns} 
          data={normsManuals} 
          onRowClick={handleViewNormManual}
        />
      </ContentCard>
      
      {/* Modal de criação de norma/manual */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Adicionar Nova Norma/Manual</h2>
            
            <div className="mb-4">
              <div className="flex border-b border-gray-200">
                <button
                  className={`py-2 px-4 ${createType === 'link' ? 'border-b-2 border-blue-800 text-blue-800' : 'text-gray-500'}`}
                  onClick={() => setCreateType('link')}
                >
                  Adicionar por Link
                </button>
                <button
                  className={`py-2 px-4 ${createType === 'file' ? 'border-b-2 border-blue-800 text-blue-800' : 'text-gray-500'}`}
                  onClick={() => setCreateType('file')}
                >
                  Fazer Upload de Arquivo
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <FormField
                label="Título"
                id="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              
              {createType === 'link' ? (
                <FormField
                  label="Link"
                  id="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  required
                  placeholder="https://exemplo.com/documento.pdf"
                />
              ) : (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Arquivo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-2 mt-6">
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
                  disabled={createType === 'file' && !selectedFile}
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NormsAndManualsPage;
