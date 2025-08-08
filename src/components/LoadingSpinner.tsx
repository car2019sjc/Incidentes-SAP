import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  darkMode?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Carregando...', 
  size = 'md',
  darkMode = false 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 mb-4`} />
      <p className={`${textClasses[size]} font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {message}
      </p>
    </div>
  );
};

export const FullScreenLoading: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Carregando Sistema de Gestão de Incidentes - SAP...',
  darkMode = false 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner message={message} size="lg" darkMode={darkMode} />
      </div>
    </div>
  );
}; 