import axios from 'axios';

// Configuração da URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'https://sistema-auditoria-backend.onrender.com/api';

// Criação da instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 segundos
});

// Interceptor para adicionar token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros nas respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratamento de erros de autenticação (401)
    if (error.response && error.response.status === 401) {
      // Limpar dados de autenticação e redirecionar para login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Tratamento de erros de permissão (403)
    if (error.response && error.response.status === 403) {
      console.error('Acesso não autorizado:', error.response.data.message);
    }
    
    // Tratamento de erros de servidor (500)
    if (error.response && error.response.status >= 500) {
      console.error('Erro no servidor:', error.response.data.message || 'Erro interno do servidor');
    }
    
    // Tratamento de timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Tempo limite de conexão excedido. Verifique sua conexão com a internet.');
    }
    
    // Tratamento de erro de rede
    if (!error.response) {
      console.error('Erro de rede. Verifique sua conexão com a internet.');
    }
    
    return Promise.reject(error);
  }
);

// Serviço de autenticação
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  },
  
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify-token');
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Exportação dos demais serviços
export default api;
