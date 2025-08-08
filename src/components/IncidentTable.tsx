import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Download, Eye, Calendar, User, Tag, Users, CalendarDays } from 'lucide-react';
import { Incident, FilterOptions } from '../types/incident';
import { formatDate, formatDateForCSV, isDateInRange } from '../utils/dateUtils';
import { escapeCSV, highlightSearchTerm } from '../utils/stringUtils';
import { getSearchVariations } from '../utils/translations';
import { PriorityMultiSelect } from './PriorityMultiSelect';

interface IncidentTableProps {
  incidents: Incident[];
  searchTerm?: string;
}



export const IncidentTable: React.FC<IncidentTableProps> = ({ incidents, searchTerm: externalSearchTerm }) => {


  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Usar o termo de busca externo (filtro por string) ou interno (campo de busca)
  const activeSearchTerm = externalSearchTerm || searchTerm;

  // Debounce da busca para melhor performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(activeSearchTerm);
    }, 300); // 300ms de delay

    return () => clearTimeout(timer);
  }, [activeSearchTerm]);
  
  // Calcular data padrão (últimos 12 meses)
  const getDefaultDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  };
  
  const [filters, setFilters] = useState<FilterOptions>({
    state: '',
    priority: '',
    priorities: [], // Para seleção múltipla
    category: '',
    assignmentGroup: '',
    dateRange: getDefaultDateRange(),
    stringFilter: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      // Busca inteligente com traduções (usando termo com debounce para busca interna)
      const searchTermToUse = externalSearchTerm || debouncedSearchTerm;
      const matchesSearch = searchTermToUse === '' || (() => {
        const searchTermLower = searchTermToUse.toLowerCase().trim();
        
        // Obter todas as variações da palavra de busca (incluindo traduções)
        const searchVariations = getSearchVariations(searchTermLower);
        
        // Função para verificar se um texto contém alguma das variações
        const textContainsVariation = (text: string) => {
          const normalizedText = text.toLowerCase();
          return searchVariations.some(variation => 
            normalizedText.includes(variation)
          );
        };
        
        // Busca nas colunas principais com traduções
        const numberMatch = textContainsVariation(incident.number);
        const descriptionMatch = textContainsVariation(incident.shortDescription);
        const callerMatch = textContainsVariation(incident.caller);
        const assignedToMatch = textContainsVariation(incident.assignedTo);
        const categoryMatch = textContainsVariation(incident.category || '');
        const stateMatch = textContainsVariation(incident.state || '');
        const priorityMatch = textContainsVariation(incident.priority || '');
        const groupMatch = textContainsVariation(incident.assignmentGroup || '');
        
        // Busca na coluna Comments and Work Notes
        const commentsMatch = textContainsVariation(incident.commentsAndWorkNotes || '');
        
        return numberMatch || descriptionMatch || callerMatch || assignedToMatch || 
               categoryMatch || stateMatch || priorityMatch || groupMatch || commentsMatch;
      })();

      const matchesState = filters.state === '' || incident.state === filters.state;
      const matchesPriority = !filters.priorities || filters.priorities.length === 0 || 
        filters.priorities.some(selectedPriority => {
          const incidentPriority = incident.priority.toLowerCase();
          const selectedLower = selectedPriority.toLowerCase();
          return incidentPriority.includes(selectedLower.split(' - ')[1]) || 
                 incidentPriority.includes(selectedLower.split(' - ')[0]);
        });
      const matchesCategory = filters.category === '' || incident.category === filters.category;
      const matchesGroup = filters.assignmentGroup === '' || incident.assignmentGroup === filters.assignmentGroup;

      // Filtro por data
      let matchesDateRange = true;
      if (filters.dateRange.start || filters.dateRange.end) {
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end + 'T23:59:59') : null;
        
        matchesDateRange = isDateInRange(incident.opened, startDate, endDate);
      }

      return matchesSearch && matchesState && matchesPriority && matchesCategory && matchesGroup && matchesDateRange;
    });
  }, [incidents, externalSearchTerm, debouncedSearchTerm, filters]);

  const paginatedIncidents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredIncidents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredIncidents, currentPage]);

  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);

  const getUniqueValues = (key: keyof Incident) => {
    const values = incidents.map(incident => incident[key]).filter(Boolean);
    return Array.from(new Set(values)).sort();
  };

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

  const exportToCSV = () => {

    // Cabeçalhos em português (apenas uma linha)
    const headers = [
      'Número',
      'Descrição Resumida', 
      'Solicitante',
      'Estado',
      'Categoria',
      'Grupo de Atribuição',
      'Atribuído Para',
      'Prioridade',
      'Data de Fechamento',
      'Data de Abertura',
      'Data de Atualização',
      'Data de Resolução',
      'Atualizado por Tags',
      'Comentários e Notas de Trabalho'
    ];

    // Formatar dados
    const csvRows = [
      headers.join(','),
      ...filteredIncidents.map(incident => [
        escapeCSV(incident.number),
        escapeCSV(incident.shortDescription),
        escapeCSV(incident.caller),
        escapeCSV(incident.state),
        escapeCSV(incident.category),
        escapeCSV(incident.assignmentGroup),
        escapeCSV(incident.assignedTo),
        escapeCSV(incident.priority),
        escapeCSV(formatDateForCSV(incident.closed)),
        escapeCSV(formatDateForCSV(incident.opened)),
        escapeCSV(formatDateForCSV(incident.updated)),
        escapeCSV(formatDateForCSV(incident.resolved)),
        escapeCSV(incident.updatedByTags),
        escapeCSV(incident.commentsAndWorkNotes)
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');

    // Adicionar BOM UTF-8 para melhor compatibilidade com Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incidentes_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };



  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por número, descrição, solicitante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>
            
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        {/* Filtro de Período removido - usando calendário central do Dashboard */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              📅 Período controlado pelo calendário central do Dashboard
            </span>
          </div>
        </div>
        {showFilters && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            {/* Filtros de Estado, Prioridade, etc. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={filters.state}
              onChange={(e) => setFilters({...filters, state: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os Estados</option>
              {getUniqueValues('state').map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <PriorityMultiSelect
              selectedPriorities={filters.priorities || []}
              onPriorityChange={(priorities) => setFilters({...filters, priorities})}
              darkMode={false}
            />

            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas as Categorias</option>
              {getUniqueValues('category').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filters.assignmentGroup}
              onChange={(e) => setFilters({...filters, assignmentGroup: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os Grupos</option>
              {getUniqueValues('assignmentGroup').map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          Mostrando {paginatedIncidents.length} de {filteredIncidents.length} incidentes
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo de Atribuição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atribuído para</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aberto em</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechado em</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedIncidents.map((incident, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {incident.number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                    <div className="truncate" title={incident.shortDescription}>
                      {highlightSearchTerm(incident.shortDescription, activeSearchTerm)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      {highlightSearchTerm(incident.caller, activeSearchTerm)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStateColor(incident.state)}`}>
                      {incident.state}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(incident.priority)}`}>
                      {incident.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-gray-400" />
                      {highlightSearchTerm(incident.category, activeSearchTerm)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      {highlightSearchTerm(incident.assignmentGroup || 'Não definido', activeSearchTerm)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {highlightSearchTerm(incident.assignedTo || 'Não atribuído', activeSearchTerm)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(incident.opened) !== '-' ? formatDate(incident.opened) : 'Não informado'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {incident.state.toLowerCase() === 'closed' && formatDate(incident.closed) !== '-' 
                        ? formatDate(incident.closed) 
                        : incident.state.toLowerCase() === 'closed' 
                          ? 'Data não informada' 
                          : 'Em aberto'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedIncident(incident)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Detalhes do Incidente {selectedIncident.number}
                </h2>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Descrição</label>
                  <p className="text-gray-900">{highlightSearchTerm(selectedIncident.shortDescription, activeSearchTerm)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Solicitante</label>
                  <p className="text-gray-900">{highlightSearchTerm(selectedIncident.caller, activeSearchTerm)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStateColor(selectedIncident.state)}`}>
                    {selectedIncident.state}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Prioridade</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(selectedIncident.priority)}`}>
                    {selectedIncident.priority}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Categoria</label>
                  <p className="text-gray-900">{highlightSearchTerm(selectedIncident.category, activeSearchTerm)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Grupo de Atribuição</label>
                  <p className="text-gray-900">{highlightSearchTerm(selectedIncident.assignmentGroup, activeSearchTerm)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Atribuído para</label>
                  <p className="text-gray-900">{highlightSearchTerm(selectedIncident.assignedTo || 'Não atribuído', activeSearchTerm)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Aberto em</label>
                  <p className="text-gray-900">
                    {formatDate(selectedIncident.opened) !== '-' ? formatDate(selectedIncident.opened) : 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fechado em</label>
                  <p className="text-gray-900">
                    {selectedIncident.state.toLowerCase() === 'closed' && formatDate(selectedIncident.closed) !== '-' 
                      ? formatDate(selectedIncident.closed) 
                      : selectedIncident.state.toLowerCase() === 'closed' 
                        ? 'Data não informada' 
                        : 'Ainda em aberto'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Atualizado em</label>
                  <p className="text-gray-900">
                    {formatDate(selectedIncident.updated) !== '-' ? formatDate(selectedIncident.updated) : 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Resolvido em</label>
                  <p className="text-gray-900">
                    {formatDate(selectedIncident.resolved) !== '-' ? formatDate(selectedIncident.resolved) : 'Não informado'}
                  </p>
                </div>
              </div>
              
              {selectedIncident.commentsAndWorkNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Comentários e Notas de Trabalho</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-900 whitespace-pre-wrap">
                      {highlightSearchTerm(selectedIncident.commentsAndWorkNotes, activeSearchTerm)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};