import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-800">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/logo-jfsc.jpeg" 
            alt="Logo JFSC" 
            className="h-24 mb-4" 
          />
          <h1 className="text-2xl font-bold text-gray-800">Sistema de Auditoria Interna</h1>
          <h2 className="text-lg text-gray-600">DAIN/JFSC</h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="seu.email@jfsc.jus.br"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="******"
            />
          </div>
          
          <div className="flex items-center justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Usuários para teste:</p>
          <p>Diretor: hugo@jfsc.jus.br / 123456</p>
          <p>Auditor: joao@jfsc.jus.br / 123456</p>
          <p>Auditado: pedro@jfsc.jus.br / 123456</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
