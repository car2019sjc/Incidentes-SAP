/**
 * Constantes da aplicação
 */

// Configurações de arquivo
export const FILE_CONFIG = {
  MAX_SIZE_MB: 10,
  SUPPORTED_EXTENSIONS: ['.csv', '.txt', '.xlsx', '.xls'],
  STORAGE_KEY: 'incident-management-strings'
} as const;

// Configurações de paginação
export const PAGINATION_CONFIG = {
  ITEMS_PER_PAGE: 20,
  MAX_PAGES_SHOWN: 5
} as const;

// Configurações de cores para gráficos
export const CHART_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#F43F5E', '#8B5A2B', '#6D28D9', '#DC2626'
] as const;

// Estados de incidentes
export const INCIDENT_STATES = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed'
} as const;

// Prioridades de incidentes
export const INCIDENT_PRIORITIES = {
  CRITICAL: '1 - Critical',
  HIGH: '2 - High',
  MODERATE: '3 - Moderate',
  LOW: '4 - Low'
} as const;

// Lista ordenada de prioridades para seleção
export const PRIORITY_OPTIONS = [
  { value: '1 - Critical', label: '1 - Critical', level: 1 },
  { value: '2 - High', label: '2 - High', level: 2 },
  { value: '3 - Moderate', label: '3 - Moderate', level: 3 },
  { value: '4 - Low', label: '4 - Low', level: 4 }
] as const;

// Períodos de análise
export const ANALYSIS_PERIODS = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  CUSTOM: 'custom'
} as const;

// Configurações de validação
export const VALIDATION_CONFIG = {
  REQUIRED_INCIDENT_FIELDS: ['number', 'shortDescription', 'caller', 'state'],
  MIN_STRING_LENGTH: 1,
  MAX_STRING_LENGTH: 100
} as const;

// Mensagens de erro
export const ERROR_MESSAGES = {
  INVALID_FILE_TYPE: 'Por favor, selecione apenas arquivos CSV (.csv), TXT (.txt), Excel (.xlsx) ou (.xls)',
  FILE_TOO_LARGE: 'Arquivo muito grande. Tamanho máximo permitido: 10MB',
  NO_VALID_INCIDENTS: 'Nenhum incidente válido encontrado no arquivo',
  NO_VALID_STRINGS: 'Nenhuma string de seleção válida encontrada no arquivo',
  INVALID_DATE: 'Data inválida',
  LOADING_ERROR: 'Erro ao carregar dados'
} as const;

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: 'Arquivo carregado com sucesso!',
  DATA_EXPORTED: 'Dados exportados com sucesso!',
  STRINGS_SAVED: 'Strings salvas com sucesso!'
} as const; 