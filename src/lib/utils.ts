import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'planejada':
      return 'bg-blue-100 text-blue-800'
    case 'em execução':
    case 'em execucao':
      return 'bg-yellow-100 text-yellow-800'
    case 'concluída':
    case 'concluida':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 6
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0
}

export function validateNumber(value: string): boolean {
  return !isNaN(Number(value))
}

export function validateDate(value: string): boolean {
  const date = new Date(value)
  return !isNaN(date.getTime())
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
