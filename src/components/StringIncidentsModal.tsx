import React, { useState, useMemo } from 'react';
import { X, Search, Calendar, User, Tag, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Incident } from '../types/incident';
import { formatDate, parseDate } from '../utils/dateUtils';
import { highlightSearchTerm, incidentContainsString } from '../utils/stringUtils';

interface StringIncidentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedString: string;
  incidents: Incident[];
  darkMode?: boolean;
  periodFilter?: {
    start: Date;
    end: Date;
  };
  preFilteredIncidents?: Incident[]; // Para casos onde os incidentes já estão filtrados (KPI cards)
}

export const StringIncidentsModal: React.FC<StringIncidentsModalProps> = ({
  isOpen,
  onClose,
  selectedString,
  incidents,
  darkMode = false,
  periodFilter,
  preFilteredIncidents
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Reset do estado quando o modal abrir/fechar
  React.useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIncident(null);
      console.log('Modal opened for string:', selectedString);
    }
  }, [isOpen, selectedString]);

  // Filtrar incidentes que contêm a string selecionada ou usar lista pré-filtrada
  const relatedIncidents = useMemo(() => {
    // Se temos incidentes pré-filtrados (ex: KPI cards), usar esses
    if (preFilteredIncidents) {
      console.log('Using pre-filtered incidents:', preFilteredIncidents.length);
      return preFilteredIncidents;
    }
    
    // Senão, usar a lógica original de busca por string
    if (!selectedString) return [];
    
    console.log('Filtering incidents for string:', selectedString);
    
    let filteredByString = incidents.filter(incident => 
      incidentContainsString(incident, selectedString)
    );
    
    // Aplicar filtro de período se fornecido
    if (periodFilter) {
      filteredByString = filteredByString.filter(incident => {
        const openedDate = parseDate(incident.opened);
        if (!openedDate) {
          return true; // Incluir incidentes sem data válida
        }
        return openedDate >= periodFilter.start && openedDate <= periodFilter.end;
      });
    }
    
    console.log('Found incidents:', filteredByString.length);
    return filteredByString;
  }, [incidents, selectedString, periodFilter, preFilteredIncidents]);

  // Aplicar filtro de busca adicional
  const filteredIncidents = useMemo(() => {
    if (!searchTerm) return relatedIncidents;
    
    const searchLower = searchTerm.toLowerCase();
    return relatedIncidents.filter(incident => 
      incident.number.toLowerCase().includes(searchLower) ||
      incident.shortDescription.toLowerCase().includes(searchLower) ||
      incident.caller.toLowerCase().includes(searchLower) ||
      incident.category.toLowerCase().includes(searchLower)
    );
  }, [relatedIncidents, searchTerm]);

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'open':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'in progress':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'closed':
        return 'text-gray-700 bg-gray-100 border-gray-200';
      case 'resolved':
        return 'text-green-700 bg-green-100 border-green-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    const priorityLower = priority.toLowerCase();
    if (priorityLower.includes('critical') || priorityLower.includes('1')) {
      return 'text-red-800 bg-red-100 border-red-200';
    }
    if (priorityLower.includes('high') || priorityLower.includes('2')) {
      return 'text-red-700 bg-red-50 border-red-200';
    }
    if (priorityLower.includes('moderate') || priorityLower.includes('3')) {
      return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
    if (priorityLower.includes('low') || priorityLower.includes('4')) {
      return 'text-green-700 bg-green-50 border-green-200';
    }
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const getStateIcon = (state: string) => {
    switch (state.toLowerCase()) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Tag className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <div>
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Incidentes relacionados à string: "{selectedString}"
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {filteredIncidents.length} de {relatedIncidents.length} incidentes encontrados
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar nos incidentes filtrados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-200px)]">
          {/* Lista de Incidentes */}
          <div className="w-1/2 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
            {filteredIncidents.length === 0 ? (
              <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum incidente encontrado</p>
                <p className="text-sm">
                  {relatedIncidents.length === 0 
                    ? `Não há incidentes que contenham a string "${selectedString}"`
                    : 'Tente ajustar os termos de busca'
                  }
                </p>
              </div>
            ) : (
              <div className="p-4">
                {filteredIncidents.map((incident, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedIncident(incident)}
                    className={`p-4 rounded-lg border mb-3 cursor-pointer transition-all hover:shadow-md ${
                      selectedIncident?.number === incident.number
                        ? darkMode
                          ? 'bg-blue-900 border-blue-700'
                          : 'bg-blue-50 border-blue-200'
                        : darkMode
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStateIcon(incident.state)}
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {incident.number}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStateColor(incident.state)}`}>
                          {incident.state}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(incident.priority)}`}>
                          {incident.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {highlightSearchTerm(incident.shortDescription, selectedString)}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                            {incident.caller}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                            {formatDate(incident.opened)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes do Incidente */}
          <div className="w-1/2 overflow-y-auto">
            {selectedIncident ? (
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Detalhes do Incidente {selectedIncident.number}
                    </h3>
                    <div className="flex space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStateColor(selectedIncident.state)}`}>
                        {selectedIncident.state}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(selectedIncident.priority)}`}>
                        {selectedIncident.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Descrição
                      </label>
                      <div className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {highlightSearchTerm(selectedIncident.shortDescription, selectedString)}
                      </div>
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Solicitante
                      </label>
                      <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {selectedIncident.caller}
                      </p>
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Categoria
                      </label>
                      <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {selectedIncident.category}
                      </p>
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Grupo de Atribuição
                      </label>
                      <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {selectedIncident.assignmentGroup}
                      </p>
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Atribuído para
                      </label>
                      <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {selectedIncident.assignedTo || 'Não atribuído'}
                      </p>
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Aberto em
                      </label>
                      <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {formatDate(selectedIncident.opened)}
                      </p>
                    </div>
                  </div>

                  {selectedIncident.commentsAndWorkNotes && (
                    <div>
                      <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Comentários e Notas de Trabalho
                      </label>
                      <div className={`mt-1 p-3 rounded-lg ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <div className={`whitespace-pre-wrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {highlightSearchTerm(selectedIncident.commentsAndWorkNotes, selectedString)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Selecione um incidente</p>
                <p className="text-sm">
                  Clique em um incidente na lista para ver os detalhes
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex justify-between items-center">
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              String destacada em <span className="bg-yellow-100 text-yellow-800 font-bold px-1 rounded">amarelo</span> nos textos
            </div>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg transition-colors ${
                darkMode
                  ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};