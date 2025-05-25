import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredData = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          // Verificar se o token ainda é válido
          await authService.verifyToken();
          setUser(JSON.parse(storedUser));
        } catch (error) {
          // Token inválido, limpar localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };
    
    loadStoredData();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      
      const { token, user } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const signOut = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading,
        signIn,
        signOut,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
