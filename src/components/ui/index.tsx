import React from 'react';
import { useNavigate } from 'react-router-dom';

// Componente para exibir um card de estatística no dashboard
interface StatCardProps {
  title: string;
  value: number;
  color: string;
  icon?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color, icon }) => {
  const bgColor = `bg-${color}-50`;
  const borderColor = `border-${color}-200`;
  const textColor = `text-${color}-800`;

  return (
    <div className={`${bgColor} p-4 rounded-lg border ${borderColor}`}>
      <div className="flex justify-between items-center">
        <h3 className={`font-medium ${textColor}`}>{title}</h3>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
};

// Componente para botão de ação
interface ActionButtonProps {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, onClick, primary = true }) => {
  const buttonClass = primary
    ? "bg-blue-800 hover:bg-blue-900 text-white"
    : "bg-gray-200 hover:bg-gray-300 text-gray-800";

  return (
    <button
      onClick={onClick}
      className={`${buttonClass} px-4 py-2 rounded font-medium transition-colors`}
    >
      {label}
    </button>
  );
};

// Componente para tabela de dados
interface TableColumn {
  key: string;
  header: string;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  onRowClick?: (item: any) => void;
}

const Table: React.FC<TableProps> = ({ columns, data, onRowClick }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((column) => (
              <th
                key={column.key}
                className="py-2 px-4 border-b text-left font-medium text-gray-700"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr
                key={index}
                className={`border-b hover:bg-gray-50 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="py-2 px-4">
                    {item[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="py-4 px-4 text-center text-gray-500"
              >
                Nenhum dado encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Componente para card de conteúdo
interface ContentCardProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const ContentCard: React.FC<ContentCardProps> = ({ title, children, actions }) => {
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {actions && <div>{actions}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

// Componente para formulário
interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  required = false,
  options,
  placeholder,
  multiline = false,
  rows = 3,
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {options ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required={required}
        >
          <option value="">Selecione...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder={placeholder}
          required={required}
          rows={rows}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );
};

export { StatCard, ActionButton, Table, ContentCard, FormField };
