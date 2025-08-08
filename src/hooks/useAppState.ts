import { useState, useEffect, useCallback } from 'react';
import { Incident, StringSelection } from '../types/incident';

const STORAGE_KEY = 'incident-management-strings';

// Strings padrão baseadas na interface mostrada na imagem
const DEFAULT_STRINGS: StringSelection[] = [
  { id: '1', string: 'Interface', color: '#3B82F6' },
  { id: '2', string: 'Authentication failure', color: '#EF4444' },
  { id: '3', string: 'Cadastro', color: '#10B981' },
  { id: '4', string: 'Lentidão', color: '#F59E0B' },
  { id: '5', string: 'CPI', color: '#8B5CF6' },
  { id: '6', string: 'API connection', color: '#EC4899' },
  { id: '7', string: 'Replication', color: '#06B6D4' },
  { id: '8', string: 'Difal', color: '#84CC16' },
  { id: '9', string: 'valor', color: '#F97316' },
  { id: '10', string: 'validação fiscal', color: '#6366F1' },
  { id: '11', string: 'CTE', color: '#14B8A6' },
  { id: '12', string: 'Imposto', color: '#F43F5E' },
  { id: '13', string: 'Miro', color: '#8B5A2B' },
  { id: '14', string: 'Fatura', color: '#6D28D9' }
];

interface AppState {
  incidents: Incident[];
  stringSelections: StringSelection[];
  selectedStringFilter: string;
  darkMode: boolean;
  isLoading: boolean;
}

interface AppActions {
  setIncidents: (incidents: Incident[]) => void;
  setStringSelections: (strings: StringSelection[]) => void;
  setSelectedStringFilter: (filter: string) => void;
  setDarkMode: (darkMode: boolean) => void;
  removeString: (stringId: string) => void;
  clearFilters: () => void;
}

export const useAppState = (): AppState & AppActions => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stringSelections, setStringSelections] = useState<StringSelection[]>(DEFAULT_STRINGS);
  const [selectedStringFilter, setSelectedStringFilter] = useState<string>('');
  const [darkMode, setDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar strings do localStorage na inicialização
  useEffect(() => {
    setIsLoading(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStringSelections(parsed);
        } else {
          // Se não há strings salvas ou o array está vazio, usar as strings padrão
          setStringSelections(DEFAULT_STRINGS);
        }
      } else {
        // Se não há nada no localStorage, usar as strings padrão
        setStringSelections(DEFAULT_STRINGS);
      }
    } catch (error) {
      console.warn('Erro ao carregar strings do localStorage:', error);
      // Em caso de erro, usar as strings padrão
      setStringSelections(DEFAULT_STRINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar strings no localStorage sempre que mudarem
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stringSelections));
    } catch (error) {
      console.warn('Erro ao salvar strings no localStorage:', error);
    }
  }, [stringSelections]);

  const removeString = useCallback((stringId: string) => {
    setStringSelections(prevStrings => 
      prevStrings.filter(s => s.id !== stringId)
    );
    
    // Se a string removida estava sendo usada como filtro, limpar o filtro
    const removedString = stringSelections.find(s => s.id === stringId);
    if (removedString && selectedStringFilter === removedString.string) {
      setSelectedStringFilter('');
    }
  }, [stringSelections, selectedStringFilter]);

  const clearFilters = useCallback(() => {
    setSelectedStringFilter('');
  }, []);

  return {
    incidents,
    stringSelections,
    selectedStringFilter,
    darkMode,
    isLoading,
    setIncidents,
    setStringSelections,
    setSelectedStringFilter,
    setDarkMode,
    removeString,
    clearFilters
  };
}; 