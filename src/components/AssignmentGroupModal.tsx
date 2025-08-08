import React, { useState, useMemo } from 'react';
import { X, Users, TrendingDown, BarChart3, Eye, ChevronRight, ArrowLeft, FileText, Calendar, AlertCircle, User, Tag, Download, CheckSquare } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Incident, StringSelection } from '../types/incident';
import { countIncidentsByString } from '../utils/stringUtils';
import { IncidentDetailModal } from './IncidentDetailModal';
import { formatDate, parseDate } from '../utils/dateUtils';

interface AssignmentGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  stringSelections: StringSelection[];
  darkMode?: boolean;
}

interface GroupData {
  groupName: string;
  count: number;
  percentage: number;
}

interface StringDataForGroup {
  string: string;
  count: number;
  incidents: Incident[];
}

export const AssignmentGroupModal: React.FC<AssignmentGroupModalProps> = ({
  isOpen,
  onClose,
  incidents,
  stringSelections,
  darkMode = false
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'groups' | 'strings' | 'incidents'>('groups');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showIncidentDetail, setShowIncidentDetail] = useState<boolean>(false);
  const [currentIncidentIndex, setCurrentIncidentIndex] = useState<number>(0);
  const [selectedIncidents, setSelectedIncidents] = useState<Set<string>>(new Set());

  // Reset do estado quando o modal abrir/fechar
  React.useEffect(() => {
    if (isOpen) {
      setSelectedGroup(null);
      setViewMode('groups');
      setSelectedIncident(null);
      setShowIncidentDetail(false);
      setCurrentIncidentIndex(0);
      setSelectedIncidents(new Set());
    }
  }, [isOpen]);

  // Calcular dados dos grupos (Top 10)
  const groupData = useMemo(() => {
    if (incidents.length === 0) return [];

    // Contar incidentes por Assignment Group
    const groupCounts: { [key: string]: number } = {};
    
    incidents.forEach(incident => {
      const group = incident.assignmentGroup || 'Não Atribuído';
      groupCounts[group] = (groupCounts[group] || 0) + 1;
    });

    // Converter para array e ordenar por quantidade (Top 10)
    const groupArray = Object.entries(groupCounts)
      .map(([groupName, count]) => ({
        groupName,
        count,
        percentage: (count / incidents.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10

    return groupArray;
  }, [incidents]);

  // Calcular dados das strings para o grupo selecionado
  const stringDataForSelectedGroup = useMemo(() => {
    if (!selectedGroup || stringSelections.length === 0) return [];

    // Filtrar incidentes do grupo selecionado
    const groupIncidents = incidents.filter(incident => 
      (incident.assignmentGroup || 'Não Atribuído') === selectedGroup
    );

    if (groupIncidents.length === 0) return [];

    // Contar incidentes por string dentro do grupo
    const stringCounts = countIncidentsByString(groupIncidents, stringSelections);
    
    return stringCounts
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .map(item => ({
        string: item.string,
        count: item.count,
        incidents: groupIncidents.filter(incident => {
          // Verificar se o incidente contém a string
          const searchFields = [
            incident.shortDescription,
            incident.category,
            incident.commentsAndWorkNotes,
            incident.updatedByTags
          ].join(' ').toLowerCase();
          
          return searchFields.includes(item.string.toLowerCase());
        })
      }));
  }, [selectedGroup, incidents, stringSelections]);

  // Calcular incidentes do grupo selecionado
  const groupIncidents = useMemo(() => {
    if (!selectedGroup) return [];
    return incidents
      .filter(incident => (incident.assignmentGroup || 'Não Atribuído') === selectedGroup)
      .sort((a, b) => {
        const dateA = parseDate(a.opened);
        const dateB = parseDate(b.opened);
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime(); // Mais recentes primeiro
      });
  }, [selectedGroup, incidents]);

  const handleGroupClick = (groupName: string) => {
    setSelectedGroup(groupName);
    setViewMode('strings');
  };

  const handleViewAllIncidents = () => {
    setViewMode('incidents');
  };

  const handleIncidentClick = (incident: Incident, incidentIndex: number) => {
    setSelectedIncident(incident);
    setCurrentIncidentIndex(incidentIndex);
    setShowIncidentDetail(true);
  };

  const handleNextIncident = () => {
    if (currentIncidentIndex < groupIncidents.length - 1) {
      const nextIndex = currentIncidentIndex + 1;
      setCurrentIncidentIndex(nextIndex);
      setSelectedIncident(groupIncidents[nextIndex]);
    }
  };

  const handlePreviousIncident = () => {
    if (currentIncidentIndex > 0) {
      const prevIndex = currentIncidentIndex - 1;
      setCurrentIncidentIndex(prevIndex);
      setSelectedIncident(groupIncidents[prevIndex]);
    }
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setViewMode('groups');
  };

  // Funções para gerenciar seleção de incidentes
  const handleToggleIncidentSelection = (incidentNumber: string) => {
    const newSelected = new Set(selectedIncidents);
    if (newSelected.has(incidentNumber)) {
      newSelected.delete(incidentNumber);
    } else {
      newSelected.add(incidentNumber);
    }
    setSelectedIncidents(newSelected);
  };

  const isIncidentSelected = (incidentNumber: string) => {
    return selectedIncidents.has(incidentNumber);
  };

  // Função para exportar incidentes selecionados para Excel
  const exportSelectedIncidentsToExcel = () => {
    if (selectedIncidents.size === 0) {
      alert('Nenhum incidente selecionado para exportar!');
      return;
    }

    // Filtrar apenas os incidentes selecionados
    const selectedIncidentsList = groupIncidents.filter(incident => 
      selectedIncidents.has(incident.number)
    );

    // Identificar qual string está sendo analisada (se na vista de strings)
    let currentString = '';
    if (viewMode === 'strings' && stringDataForSelectedGroup.length > 0) {
      // Encontrar qual string tem incidentes selecionados
      const stringsWithSelectedIncidents = stringDataForSelectedGroup.filter(stringData => 
        stringData.incidents.some(incident => selectedIncidents.has(incident.number))
      );
      
      if (stringsWithSelectedIncidents.length === 1) {
        currentString = stringsWithSelectedIncidents[0].string;
      } else if (stringsWithSelectedIncidents.length > 1) {
        currentString = 'MultipleStrings';
      }
    }

    // Preparar dados para Excel
    const excelData = selectedIncidentsList.map(incident => ({
      'Número do Incidente': incident.number,
      'Estado': incident.state || 'N/A',
      'Prioridade': incident.priority || 'N/A',
      'Categoria': incident.category || 'N/A',
      'Descrição': incident.shortDescription || 'N/A',
      'Assignment Group': incident.assignmentGroup || 'N/A',
      'Atribuído para': incident.assignedTo || 'N/A',
      'Solicitante': incident.caller || 'N/A',
      'Data de Abertura': incident.opened || 'N/A',
      'Data de Atualização': incident.updated || 'N/A',
      'Data de Resolução': incident.resolved || 'N/A',
      'Data de Fechamento': incident.closed || 'N/A',
      'Comentários': incident.commentsAndWorkNotes || 'N/A',
      'Tags': incident.updatedByTags || 'N/A',
      'String Relacionada': currentString || 'N/A'
    }));

    // Criar workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    
    // Nome da aba baseado na string ou contexto
    const sheetName = currentString ? `String_${currentString.substring(0, 20)}` : 'Incidentes_Selecionados';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 15 }, // Número do Incidente
      { wch: 12 }, // Estado
      { wch: 15 }, // Prioridade
      { wch: 20 }, // Categoria
      { wch: 40 }, // Descrição
      { wch: 20 }, // Assignment Group
      { wch: 20 }, // Atribuído para
      { wch: 20 }, // Solicitante
      { wch: 18 }, // Data de Abertura
      { wch: 18 }, // Data de Atualização
      { wch: 18 }, // Data de Resolução
      { wch: 18 }, // Data de Fechamento
      { wch: 30 }, // Comentários
      { wch: 20 }, // Tags
      { wch: 15 }  // String Relacionada
    ];
    worksheet['!cols'] = colWidths;

    // Criar nome do arquivo baseado no contexto
    const sanitizeFileName = (name: string) => {
      return name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    };

    const date = new Date().toISOString().split('T')[0];
    const groupName = sanitizeFileName(selectedGroup || 'Grupo');
    const stringName = currentString ? sanitizeFileName(currentString) : '';
    
    let fileName = '';
    if (stringName && stringName !== 'MultipleStrings') {
      fileName = `incidentes_${groupName}_${stringName}_${date}.xlsx`;
    } else if (stringName === 'MultipleStrings') {
      fileName = `incidentes_${groupName}_MultipleStrings_${date}.xlsx`;
    } else {
      fileName = `incidentes_${groupName}_TodosChamados_${date}.xlsx`;
    }

    // Salvar arquivo
    XLSX.writeFile(workbook, fileName);

    // Mostrar confirmação detalhada
    const contextInfo = currentString && currentString !== 'MultipleStrings' 
      ? ` da string "${currentString}"`
      : currentString === 'MultipleStrings'
        ? ' de múltiplas strings'
        : ' do grupo';
    
    alert(`${selectedIncidents.size} incidentes${contextInfo} exportados para "${fileName}"`);
  };

  const getStateColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'new':
      case 'novo':
        return darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'in progress':
      case 'em andamento':
        return darkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
      case 'resolved':
      case 'resolvido':
        return darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-700';
      case 'closed':
      case 'fechado':
        return darkMode ? 'bg-gray-900/20 text-gray-400' : 'bg-gray-100 text-gray-700';
      default:
        return darkMode ? 'bg-gray-900/20 text-gray-400' : 'bg-gray-100 text-gray-600';
    }
  };

  if (!isOpen) return null;

  const totalIncidents = incidents.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-4xl max-h-[90vh] rounded-lg shadow-xl ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            {(viewMode === 'strings' || viewMode === 'incidents') && (
              <button
                onClick={handleBackToGroups}
                className={`p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <Users className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {viewMode === 'groups' 
                  ? 'Assignment Groups - Top 10' 
                  : viewMode === 'strings'
                    ? `Strings em: ${selectedGroup}`
                    : `Todos os Chamados - ${selectedGroup}`
                }
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {viewMode === 'groups' 
                  ? `${totalIncidents} incidentes analisados`
                  : viewMode === 'strings'
                    ? `${stringDataForSelectedGroup.length} strings com incidentes`
                    : `${groupIncidents.length} incidentes no grupo`
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {viewMode === 'groups' ? (
            /* Vista de Grupos */
            <div className="space-y-4">
              {groupData.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum grupo encontrado</p>
                  <p className="text-sm">Não há dados de Assignment Group nos incidentes</p>
                </div>
              ) : (
                groupData.map((group, index) => (
                  <div
                    key={group.groupName}
                    onClick={() => handleGroupClick(group.groupName)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 hover:border-blue-500 hover:bg-gray-600'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                          }`}>
                            #{index + 1}
                          </span>
                          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {group.groupName}
                          </h3>
                        </div>
                        <div className="mt-2 flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <BarChart3 className={`h-4 w-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <span className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              {group.count}
                            </span>
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              incidentes
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingDown className={`h-4 w-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                            <span className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                              {group.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        {/* Barra de progresso */}
                        <div className={`mt-3 w-full h-2 rounded-full ${
                          darkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                            style={{ width: `${Math.min(group.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          Drilldown
                        </span>
                        <ChevronRight className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : viewMode === 'strings' ? (
            /* Vista de Strings para o grupo selecionado */
            <div className="space-y-4">
              {/* Button to view all incidents */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={handleViewAllIncidents}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 font-medium transition-all hover:shadow-md ${
                    darkMode
                      ? 'bg-green-900/20 border-green-600/50 text-green-300 hover:bg-green-800/30 hover:border-green-500'
                      : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300'
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  <span>📋 Ver Todos os {groupIncidents.length} Chamados</span>
                </button>
              </div>
              
              {stringDataForSelectedGroup.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhuma string encontrada</p>
                  <p className="text-sm">Não há ocorrências das strings configuradas neste grupo</p>
                </div>
              ) : (
                stringDataForSelectedGroup.map((stringData, index) => (
                  <div
                    key={stringData.string}
                    className={`p-4 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {stringData.string}
                        </h4>
                        <div className="mt-1 flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <BarChart3 className={`h-4 w-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                            <span className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                              {stringData.count}
                            </span>
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              incidentes
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="text-xs">
                          {((stringData.count / stringDataForSelectedGroup.reduce((sum, s) => sum + s.count, 0)) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs">do grupo</div>
                      </div>
                    </div>
                    
                    {/* Lista de todos os incidentes */}
                    {stringData.incidents.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Todos os {stringData.incidents.length} incidentes:
                        </p>
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                          {stringData.incidents.map((incident, idx) => {
                            const incidentIndex = groupIncidents.findIndex(gi => gi.number === incident.number);
                            const openedDate = parseDate(incident.opened);
                            return (
                              <div
                                key={incident.number}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleIncidentClick(incident, incidentIndex >= 0 ? incidentIndex : idx);
                                }}
                                className={`text-xs p-3 rounded cursor-pointer transition-all hover:bg-opacity-80 hover:shadow-sm border-2 ${
                                  isIncidentSelected(incident.number)
                                    ? darkMode
                                      ? 'bg-blue-900/20 border-blue-600 shadow-lg shadow-blue-900/20'
                                      : 'bg-blue-50 border-blue-400 shadow-lg shadow-blue-500/20'
                                    : darkMode 
                                      ? 'bg-gray-600 hover:bg-gray-550 border-gray-500 hover:border-gray-400' 
                                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                {/* Header com número, seleção e estado */}
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center space-x-2">
                                    {/* Mini Checkbox de Seleção */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleIncidentSelection(incident.number);
                                      }}
                                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all hover:scale-110 ${
                                        isIncidentSelected(incident.number)
                                          ? darkMode
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'bg-blue-500 border-blue-500 text-white'
                                          : darkMode
                                            ? 'border-gray-500 hover:border-blue-500'
                                            : 'border-gray-300 hover:border-blue-400'
                                      }`}
                                    >
                                      {isIncidentSelected(incident.number) && (
                                        <CheckSquare className="h-3 w-3" />
                                      )}
                                    </button>
                                    
                                    <span className={`font-mono font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                      {incident.number}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1">
                                    {incident.state && (
                                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getStateColor(incident.state)}`}>
                                        {incident.state}
                                      </span>
                                    )}
                                    {incident.priority && (
                                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                                        incident.priority.includes('1') || incident.priority.toLowerCase().includes('critical')
                                          ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                                          : incident.priority.includes('2') || incident.priority.toLowerCase().includes('high')
                                          ? darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'
                                          : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {incident.priority}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Descrição */}
                                <div className={`mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {incident.shortDescription.substring(0, 120)}
                                  {incident.shortDescription.length > 120 ? '...' : ''}
                                </div>
                                
                                {/* Informações adicionais */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    {incident.caller && (
                                      <div className="flex items-center space-x-1">
                                        <User className={`h-3 w-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                          {incident.caller.substring(0, 15)}
                                          {incident.caller.length > 15 ? '...' : ''}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex items-center space-x-1">
                                      <Calendar className={`h-3 w-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {openedDate ? formatDate(openedDate) : 'Data inválida'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {/* Badge de Selecionado */}
                                    {isIncidentSelected(incident.number) && (
                                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                                        darkMode ? 'bg-blue-600/80 text-blue-100' : 'bg-blue-500 text-white'
                                      }`}>
                                        ✓ Selecionado
                                      </span>
                                    )}
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                      Ver detalhes
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Vista de Todos os Incidentes do Grupo */
            <div className="space-y-4">
              {groupIncidents.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum chamado encontrado</p>
                  <p className="text-sm">Não há incidentes neste grupo de atribuição</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {groupIncidents.map((incident, index) => {
                    const openedDate = parseDate(incident.opened);

                    return (
                      <div
                        key={incident.number}
                        onClick={() => handleIncidentClick(incident, index)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] ${
                          isIncidentSelected(incident.number)
                            ? darkMode
                              ? 'bg-blue-900/20 border-blue-600 shadow-lg shadow-blue-900/20'
                              : 'bg-blue-50 border-blue-400 shadow-lg shadow-blue-500/20'
                            : darkMode
                              ? 'bg-gray-700 border-gray-600 hover:border-blue-500 hover:bg-gray-650'
                              : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            {/* Header com número, seleção e estado */}
                            <div className="flex items-center space-x-2 mb-2">
                              {/* Mini Checkbox de Seleção */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleIncidentSelection(incident.number);
                                }}
                                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all hover:scale-110 ${
                                  isIncidentSelected(incident.number)
                                    ? darkMode
                                      ? 'bg-blue-600 border-blue-600 text-white'
                                      : 'bg-blue-500 border-blue-500 text-white'
                                    : darkMode
                                      ? 'border-gray-500 hover:border-blue-500'
                                      : 'border-gray-300 hover:border-blue-400'
                                }`}
                              >
                                {isIncidentSelected(incident.number) && (
                                  <CheckSquare className="h-3 w-3" />
                                )}
                              </button>
                              
                              <span className={`font-mono text-sm font-medium ${
                                darkMode ? 'text-blue-400' : 'text-blue-600'
                              }`}>
                                {incident.number}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateColor(incident.state)}`}>
                                {incident.state || 'N/A'}
                              </span>
                              {incident.priority && (
                                <span className={`text-xs px-2 py-1 rounded ${
                                  incident.priority.includes('1') || incident.priority.toLowerCase().includes('critical')
                                    ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                                    : incident.priority.includes('2') || incident.priority.toLowerCase().includes('high')
                                    ? darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'
                                    : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {incident.priority}
                                </span>
                              )}
                            </div>

                            {/* Descrição */}
                            <h4 className={`font-medium mb-2 line-clamp-2 ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {incident.shortDescription || 'Sem descrição'}
                            </h4>

                            {/* Detalhes secundários */}
                            <div className="space-y-1">
                              {incident.caller && (
                                <div className="flex items-center space-x-1">
                                  <User className={`h-3 w-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {incident.caller}
                                  </span>
                                </div>
                              )}
                              
                              {incident.category && (
                                <div className="flex items-center space-x-1">
                                  <Tag className={`h-3 w-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {incident.category}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-1">
                                <Calendar className={`h-3 w-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Aberto: {openedDate ? formatDate(openedDate) : 'Data inválida'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action indicator */}
                          <div className="flex items-center ml-4 space-x-2">
                            {/* Badge de Selecionado */}
                            {isIncidentSelected(incident.number) && (
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                darkMode ? 'bg-blue-600/80 text-blue-100' : 'bg-blue-500 text-white'
                              }`}>
                                ✓ Selecionado
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded ${
                              darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              Ver detalhes
                            </span>
                            <ChevronRight className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer com estatísticas */}
        <div className={`px-6 py-4 border-t ${
          darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
        }`}>
          {viewMode === 'groups' ? (
            <div className="flex items-center justify-between text-sm">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Mostrando top 10 grupos de um total de {groupData.length} grupos
              </span>
              <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                Clique em um grupo para ver as strings
              </span>
            </div>
          ) : viewMode === 'strings' ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {stringDataForSelectedGroup.reduce((sum, s) => sum + s.count, 0)} incidentes no grupo "{selectedGroup}"
                </span>
                <span className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {stringDataForSelectedGroup.length} strings com ocorrências
                </span>
                <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                  💡 Clique no ☐ para selecionar chamados
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Contador de Selecionados */}
                {selectedIncidents.size > 0 && (
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                    darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <CheckSquare className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {selectedIncidents.size} selecionados
                    </span>
                  </div>
                )}
                
                {/* Botão de Export */}
                <button
                  onClick={exportSelectedIncidentsToExcel}
                  disabled={selectedIncidents.size === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                    selectedIncidents.size > 0
                      ? darkMode
                        ? 'bg-green-900/20 border-green-600/50 text-green-300 hover:bg-green-800/30 hover:border-green-500'
                        : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300'
                      : darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Download className="h-4 w-4" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {groupIncidents.length} chamados no grupo "{selectedGroup}"
                </span>
                <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Clique em um chamado para ver detalhes completos
                </span>
                <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                  💡 Clique no ☐ para selecionar chamados
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Contador de Selecionados */}
                {selectedIncidents.size > 0 && (
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                    darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <CheckSquare className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {selectedIncidents.size} selecionados
                    </span>
                  </div>
                )}
                
                {/* Botão de Export */}
                <button
                  onClick={exportSelectedIncidentsToExcel}
                  disabled={selectedIncidents.size === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                    selectedIncidents.size > 0
                      ? darkMode
                        ? 'bg-green-900/20 border-green-600/50 text-green-300 hover:bg-green-800/30 hover:border-green-500'
                        : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300'
                      : darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Download className="h-4 w-4" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes do Incidente */}
      <IncidentDetailModal
        isOpen={showIncidentDetail}
        onClose={() => setShowIncidentDetail(false)}
        incident={selectedIncident}
        darkMode={darkMode}
        onPrevious={handlePreviousIncident}
        onNext={handleNextIncident}
        currentIndex={currentIncidentIndex}
        totalCount={groupIncidents.length}
        isSelected={selectedIncident ? isIncidentSelected(selectedIncident.number) : false}
        onToggleSelection={selectedIncident ? () => handleToggleIncidentSelection(selectedIncident.number) : undefined}
      />
    </div>
  );
};