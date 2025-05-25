import React, { useState, useEffect } from 'react';
import { ContentCard, ActionButton, Table, FormField } from '../components/ui';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  last_login?: string;
}

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        const response = await api.get('/users');
        setUsers(response.data.users || []);
        
      } catch (err) {
        console.error('Erro ao carregar usuários:', err);
        setError('Não foi possível carregar os usuários. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    // Verificar se o usuário atual é Diretor da Divisão
    if (currentUser?.role === 'Usuário interno - Diretor da Divisão') {
      fetchUsers();
    } else {
      setError('Acesso não autorizado. Apenas o Diretor da Divisão pode acessar este módulo.');
    }
  }, [currentUser]);

  const handleCreateUser = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/users', formData);
      
      // Adicionar novo usuário à lista
      setUsers(prev => [response.data.user, ...prev]);
      
      // Fechar modal
      handleCloseModal();
      
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      alert('Não foi possível criar o usuário. Verifique os dados e tente novamente.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este usuário? Esta operação será irreversível.')) {
      try {
        await api.delete(`/users/${userId}`);
        
        // Atualizar lista após exclusão
        setUsers(users.filter(user => user.id !== userId));
        
      } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        alert('Não foi possível excluir o usuário selecionado.');
      }
    }
  };

  const columns = [
    { key: 'name', header: 'Nome' },
    { key: 'email', header: 'E-mail' },
    { key: 'role', header: 'Perfil' },
    { 
      key: 'created_at', 
      header: 'Data de Criação',
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR')
    },
    { 
      key: 'last_login', 
      header: 'Último Login',
      render: (value: string) => value ? new Date(value).toLocaleDateString('pt-BR') : 'Nunca'
    },
    { 
      key: 'actions', 
      header: 'Ações',
      render: (_: any, user: User) => (
        <div className="flex space-x-2">
          <button 
            onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id); }}
            className="text-red-600 hover:text-red-800"
            disabled={user.id === currentUser?.id}
          >
            {user.id === currentUser?.id ? 'Usuário atual' : 'Excluir'}
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Carregando usuários...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
        <p>{error}</p>
        {error.includes('Acesso não autorizado') ? null : (
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-bold py-1 px-3 rounded"
          >
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <ActionButton 
          label="Novo Usuário" 
          onClick={handleCreateUser} 
        />
      </div>
      
      <ContentCard title="Usuários do Sistema">
        <Table 
          columns={columns} 
          data={users} 
        />
      </ContentCard>
      
      {/* Modal de criação de usuário */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Criar Novo Usuário</h2>
            
            <form onSubmit={handleSubmit}>
              <FormField
                label="Nome"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              
              <FormField
                label="E-mail"
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              
              <FormField
                label="Senha"
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              
              <FormField
                label="Perfil"
                id="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                options={[
                  { value: 'Usuário interno - Diretor da Divisão', label: 'Diretor da Divisão' },
                  { value: 'Usuário interno - Auditor', label: 'Auditor' },
                  { value: 'Usuário externo - Auditado', label: 'Auditado' }
                ]}
              />
              
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
                >
                  Criar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
