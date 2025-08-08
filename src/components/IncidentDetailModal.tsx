import React from 'react';
import { X, Calendar, User, Tag, AlertCircle, Clock, CheckCircle, Users, FileText, MessageSquare, CheckSquare, Square } from 'lucide-react';
import { Incident } from '../types/incident';
import { formatDate, parseDate } from '../utils/dateUtils';

interface IncidentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident | null;
  darkMode?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalCount?: number;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  isOpen,
  onClose,
  incident,
  darkMode = false,
  onPrevious,
  onNext,
  currentIndex,
  totalCount,
  isSelected = false,
  onToggleSelection
}) => {
  if (!isOpen || !incident) return null;

  const getStateColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'new':
      case 'novo':
        return darkMode ? 'text-blue-400 bg-blue-900/20' : 'text-blue-700 bg-blue-100';
      case 'in progress':
      case 'em andamento':
        return darkMode ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-700 bg-yellow-100';
      case 'resolved':
      case 'resolvido':
        return darkMode ? 'text-green-400 bg-green-900/20' : 'text-green-700 bg-green-100';
      case 'closed':
      case 'fechado':
        return darkMode ? 'text-gray-400 bg-gray-900/20' : 'text-gray-700 bg-gray-100';
      default:
        return darkMode ? 'text-gray-400 bg-gray-900/20' : 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case '1 - critical':
      case '1 - crítico':
        return darkMode ? 'text-red-400 bg-red-900/20' : 'text-red-700 bg-red-100';
      case '2 - high':
      case '2 - alto':
        return darkMode ? 'text-orange-400 bg-orange-900/20' : 'text-orange-700 bg-orange-100';
      case '3 - moderate':
      case '3 - moderado':
        return darkMode ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-700 bg-yellow-100';
      case '4 - low':
      case '4 - baixo':
        return darkMode ? 'text-green-400 bg-green-900/20' : 'text-green-700 bg-green-100';
      default:
        return darkMode ? 'text-gray-400 bg-gray-900/20' : 'text-gray-600 bg-gray-100';
    }
  };

  const formatDateField = (dateString: string) => {
    if (!dateString || dateString === 'N/A') return 'Não informado';
    const date = parseDate(dateString);
    return date ? formatDate(date) : 'Data inválida';
  };

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
            <FileText className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Detalhes do Incidente
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {incident.number}
                {currentIndex !== undefined && totalCount && (
                  <span className="ml-2">
                    ({currentIndex + 1} de {totalCount})
                  </span>
                )}
              </p>
            </div>
            
            {/* Checkbox de Seleção */}
            {onToggleSelection && (
              <div className="ml-6">
                <button
                  onClick={onToggleSelection}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all hover:shadow-sm ${
                    isSelected
                      ? darkMode
                        ? 'bg-blue-900/30 border-blue-600/70 text-blue-300'
                        : 'bg-blue-50 border-blue-300 text-blue-700'
                      : darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-300 hover:border-blue-600'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  {isSelected ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {isSelected ? 'Selecionado' : 'Selecionar'}
                  </span>
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Navigation buttons */}
            {onPrevious && onNext && totalCount && totalCount > 1 && (
              <div className="flex items-center space-x-1 mr-4">
                <button
                  onClick={onPrevious}
                  disabled={currentIndex === 0}
                  className={`p-2 rounded-lg transition-colors ${
                    currentIndex === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : darkMode
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  ←
                </button>
                <span className={`text-sm px-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentIndex! + 1}/{totalCount}
                </span>
                <button
                  onClick={onNext}
                  disabled={currentIndex === totalCount - 1}
                  className={`p-2 rounded-lg transition-colors ${
                    currentIndex === totalCount - 1
                      ? 'opacity-50 cursor-not-allowed'
                      : darkMode
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  →
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className={`p-4 rounded-lg border ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <AlertCircle className="h-5 w-5 mr-2" />
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Número do Incidente
                  </label>
                  <p className={`text-sm font-mono p-2 rounded mt-1 ${
                    darkMode ? 'bg-gray-600 text-blue-400' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {incident.number}
                  </p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Estado
                  </label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateColor(incident.state)}`}>
                      {incident.state || 'Não informado'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Prioridade
                  </label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(incident.priority)}`}>
                      {incident.priority || 'Não informado'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Categoria
                  </label>
                  <p className={`text-sm p-2 rounded mt-1 ${
                    darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {incident.category || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className={`p-4 rounded-lg border ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <MessageSquare className="h-5 w-5 mr-2" />
                Descrição
              </h3>
              <p className={`text-sm p-3 rounded leading-relaxed ${
                darkMode ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-700'
              }`}>
                {incident.shortDescription || 'Descrição não disponível'}
              </p>
            </div>

            {/* Assignment Information */}
            <div className={`p-4 rounded-lg border ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Users className="h-5 w-5 mr-2" />
                Atribuição
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Assignment Group
                  </label>
                  <p className={`text-sm p-2 rounded mt-1 ${
                    darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {incident.assignmentGroup || 'Não atribuído'}
                  </p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Atribuído para
                  </label>
                  <p className={`text-sm p-2 rounded mt-1 ${
                    darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {incident.assignedTo || 'Não atribuído'}
                  </p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Solicitante
                  </label>
                  <p className={`text-sm p-2 rounded mt-1 ${
                    darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {incident.caller || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className={`p-4 rounded-lg border ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Clock className="h-5 w-5 mr-2" />
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    darkMode ? 'bg-blue-400' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Aberto
                      </span>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDateField(incident.opened)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {incident.updated && incident.updated !== 'N/A' && (
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      darkMode ? 'bg-yellow-400' : 'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Última Atualização
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDateField(incident.updated)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {incident.resolved && incident.resolved !== 'N/A' && (
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      darkMode ? 'bg-green-400' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Resolvido
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDateField(incident.resolved)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {incident.closed && incident.closed !== 'N/A' && (
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      darkMode ? 'bg-gray-400' : 'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Fechado
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDateField(incident.closed)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments and Work Notes */}
            {incident.commentsAndWorkNotes && incident.commentsAndWorkNotes !== 'N/A' && (
              <div className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Comentários e Notas de Trabalho
                </h3>
                <div className={`text-sm p-3 rounded max-h-40 overflow-y-auto ${
                  darkMode ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-700'
                }`}>
                  <pre className="whitespace-pre-wrap font-sans">
                    {incident.commentsAndWorkNotes}
                  </pre>
                </div>
              </div>
            )}

            {/* Tags */}
            {incident.updatedByTags && incident.updatedByTags !== 'N/A' && (
              <div className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <Tag className="h-5 w-5 mr-2" />
                  Tags de Atualização
                </h3>
                <div className={`text-sm p-3 rounded ${
                  darkMode ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-700'
                }`}>
                  {incident.updatedByTags}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};