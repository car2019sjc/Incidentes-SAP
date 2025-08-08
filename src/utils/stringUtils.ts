/**
 * Utilitários para manipulação de strings e filtros
 */

import { Incident, StringSelection } from '../types/incident';
import React from 'react';

/**
 * Verifica se um incidente contém uma string específica
 */
export const incidentContainsString = (incident: Incident, searchTerm: string): boolean => {
  if (!searchTerm || !incident) return false;
  
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  const shortDescription = String(incident.shortDescription || '').toLowerCase().trim();
  const commentsAndWorkNotes = String(incident.commentsAndWorkNotes || '').toLowerCase().trim();
  
  return shortDescription.includes(normalizedSearchTerm) || commentsAndWorkNotes.includes(normalizedSearchTerm);
};

/**
 * Filtra incidentes por uma lista de strings
 */
export const filterIncidentsByStrings = (incidents: Incident[], stringSelections: StringSelection[]): Incident[] => {
  if (stringSelections.length === 0) return incidents;
  
  return incidents.filter(incident => 
    stringSelections.some(stringSelection => 
      incidentContainsString(incident, stringSelection.string)
    )
  );
};

/**
 * Conta quantos incidentes contêm cada string
 */
export const countIncidentsByString = (incidents: Incident[], stringSelections: StringSelection[]) => {
  return stringSelections.map(stringSelection => {
    const count = incidents.filter(incident => 
      incidentContainsString(incident, stringSelection.string)
    ).length;
    
    return {
      string: stringSelection.string,
      count,
      id: stringSelection.id,
      description: stringSelection.description
    };
  }).sort((a, b) => b.count - a.count);
};

/**
 * Escapa valores para CSV (trata vírgulas, aspas e quebras de linha)
 */
export const escapeCSV = (value: string): string => {
  if (!value) return '';
  
  // Se contém vírgula, aspas ou quebra de linha, precisa ser envolvido em aspas
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    // Duplica aspas internas e envolve em aspas
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  return value;
};

/**
 * Destaca termos de busca em um texto
 */
export const highlightSearchTerm = (text: string, searchTerm: string): JSX.Element => {
  if (!searchTerm || !text) {
    return React.createElement('span', null, text);
  }

  try {
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    const parts = text.split(regex);

    return React.createElement('span', null, 
      parts.map((part, index) => {
        const isMatch = regex.test(part);
        return isMatch 
          ? React.createElement('span', {
              key: index,
              className: 'bg-orange-800 text-white font-bold px-1 rounded shadow-sm'
            }, part)
          : React.createElement('span', { key: index }, part);
      })
    );
  } catch (error) {
    // Fallback caso a regex falhe
    return React.createElement('span', null, text);
  }
};

/**
 * Valida se um arquivo é um tipo suportado
 */
export const isValidFileType = (file: File): boolean => {
  const validExtensions = ['.csv', '.txt', '.xlsx', '.xls'];
  const fileName = file.name.toLowerCase();
  return validExtensions.some(ext => fileName.endsWith(ext));
};

/**
 * Gera um ID único para strings
 */
export const generateStringId = (): string => {
  return `string_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Remove strings duplicadas da lista
 */
export const removeDuplicateStrings = (stringSelections: StringSelection[]): StringSelection[] => {
  const seen = new Set<string>();
  return stringSelections.filter(item => {
    const normalized = item.string.toLowerCase().trim();
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}; 