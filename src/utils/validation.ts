/* Validações e tratamento de erros */
import { toast } from 'react-toastify';

// Função para exibir mensagens de erro
export const showError = (message: string) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Função para exibir mensagens de sucesso
export const showSuccess = (message: string) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Função para exibir mensagens de informação
export const showInfo = (message: string) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Validação de e-mail
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validação de senha (mínimo 6 caracteres)
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Validação de campos obrigatórios
export const validateRequiredFields = (data: Record<string, any>, requiredFields: string[]): string[] => {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missingFields.push(field);
    }
  }
  
  return missingFields;
};

// Tratamento de erros de API
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Erro com resposta do servidor
    const { status, data } = error.response;
    
    if (status === 400) {
      return data.message || 'Dados inválidos. Verifique as informações e tente novamente.';
    }
    
    if (status === 401) {
      return 'Sessão expirada. Faça login novamente.';
    }
    
    if (status === 403) {
      return 'Você não tem permissão para realizar esta ação.';
    }
    
    if (status === 404) {
      return 'Recurso não encontrado.';
    }
    
    if (status === 500) {
      return 'Erro interno do servidor. Tente novamente mais tarde.';
    }
    
    return data.message || 'Ocorreu um erro na requisição.';
  }
  
  if (error.request) {
    // Erro sem resposta do servidor
    return 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
  }
  
  // Erro na configuração da requisição
  return error.message || 'Ocorreu um erro inesperado.';
};

// Formatação de valores monetários
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Formatação de datas
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

// Formatação de CPF/CNPJ
export const formatCpfCnpj = (value: string): string => {
  if (!value) return '';
  
  // Remove caracteres não numéricos
  const numericValue = value.replace(/\D/g, '');
  
  if (numericValue.length <= 11) {
    // CPF: 000.000.000-00
    return numericValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    // CNPJ: 00.000.000/0000-00
    return numericValue
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
};

// Validação de CPF
export const isValidCpf = (cpf: string): boolean => {
  const numericCpf = cpf.replace(/\D/g, '');
  
  if (numericCpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numericCpf)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(numericCpf.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numericCpf.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(numericCpf.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numericCpf.substring(10, 11))) return false;
  
  return true;
};

// Validação de CNPJ
export const isValidCnpj = (cnpj: string): boolean => {
  const numericCnpj = cnpj.replace(/\D/g, '');
  
  if (numericCnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numericCnpj)) return false;
  
  // Validação dos dígitos verificadores
  let size = numericCnpj.length - 2;
  let numbers = numericCnpj.substring(0, size);
  const digits = numericCnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  size += 1;
  numbers = numericCnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};
