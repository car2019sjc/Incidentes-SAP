import { Incident, StringSelection } from '../types/incident';

/**
 * Valida se um incidente tem os campos obrigatórios
 */
export const validateIncident = (incident: any): incident is Incident => {
  if (!incident || typeof incident !== 'object') {
    return false;
  }

  // Tornar validação menos restritiva - apenas verificar se tem pelo menos number OU shortDescription
  const hasNumber = incident.number !== undefined && incident.number !== null && incident.number !== '';
  const hasDescription = incident.shortDescription !== undefined && incident.shortDescription !== null && incident.shortDescription !== '';
  
  // Aceitar incidente se tiver pelo menos um dos campos principais
  return hasNumber || hasDescription;
};

/**
 * Valida se uma string de seleção é válida
 */
export const validateStringSelection = (stringSelection: any): stringSelection is StringSelection => {
  if (!stringSelection || typeof stringSelection !== 'object') {
    return false;
  }

  return stringSelection.string && 
         typeof stringSelection.string === 'string' && 
         stringSelection.string.trim().length > 0;
};

/**
 * Limpa e valida uma lista de incidentes
 */
export const validateAndCleanIncidents = (incidents: any[]): Incident[] => {
  if (!Array.isArray(incidents)) {
    return [];
  }

  return incidents
    .filter(validateIncident)
    .map(incident => ({
      number: String(incident.number || '').trim(),
      shortDescription: String(incident.shortDescription || '').trim(),
      caller: String(incident.caller || '').trim(),
      state: String(incident.state || '').trim(),
      category: String(incident.category || '').trim(),
      assignmentGroup: String(incident.assignmentGroup || '').trim(),
      assignedTo: String(incident.assignedTo || '').trim(),
      priority: String(incident.priority || '').trim(),
      closed: String(incident.closed || '').trim(),
      opened: String(incident.opened || '').trim(),
      updated: String(incident.updated || '').trim(),
      resolved: String(incident.resolved || '').trim(),
      updatedByTags: String(incident.updatedByTags || '').trim(),
      commentsAndWorkNotes: String(incident.commentsAndWorkNotes || '').trim(),
    }));
};

/**
 * Limpa e valida uma lista de strings de seleção
 */
export const validateAndCleanStringSelections = (stringSelections: any[]): StringSelection[] => {
  if (!Array.isArray(stringSelections)) {
    return [];
  }

  return stringSelections
    .filter(validateStringSelection)
    .map((item, index) => ({
      id: item.id || `string_${Date.now()}_${index}`,
      string: String(item.string || '').trim(),
      description: item.description ? String(item.description).trim() : undefined,
    }));
};

/**
 * Valida se um arquivo tem o tamanho apropriado
 */
export const validateFileSize = (file: File, maxSizeMB: number = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Gera um relatório de validação
 */
export const generateValidationReport = (incidents: any[], stringSelections: any[]) => {
  const totalIncidents = incidents.length;
  const validIncidents = validateAndCleanIncidents(incidents).length;
  const invalidIncidents = totalIncidents - validIncidents;

  const totalStrings = stringSelections.length;
  const validStrings = validateAndCleanStringSelections(stringSelections).length;
  const invalidStrings = totalStrings - validStrings;

  return {
    incidents: {
      total: totalIncidents,
      valid: validIncidents,
      invalid: invalidIncidents,
      validPercentage: totalIncidents > 0 ? (validIncidents / totalIncidents) * 100 : 0
    },
    strings: {
      total: totalStrings,
      valid: validStrings,
      invalid: invalidStrings,
      validPercentage: totalStrings > 0 ? (validStrings / totalStrings) * 100 : 0
    },
    overall: {
      hasErrors: invalidIncidents > 0 || invalidStrings > 0,
      totalRecords: totalIncidents + totalStrings,
      validRecords: validIncidents + validStrings
    }
  };
}; 