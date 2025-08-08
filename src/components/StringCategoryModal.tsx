import React, { useMemo, useState } from 'react';

import { X, BarChart3, AlertCircle } from 'lucide-react';
import { Incident } from '../types/incident';
import { incidentContainsString } from '../utils/stringUtils';
import { formatDate } from '../utils/dateUtils';

interface StringCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedString: string;
  incidents: Incident[];
  darkMode?: boolean;
}

interface CategoryData {
  category: string;
  count: number;
  incidents: Incident[];
  percentage: number;
  color: string;
}

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#F43F5E', '#8B5A2B', '#6D28D9', '#DC2626'
];

export const StringCategoryModal: React.FC<StringCategoryModalProps> = ({
  isOpen,
  onClose,
  selectedString,
  incidents,
  darkMode = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showIncidentsList, setShowIncidentsList] = useState<boolean>(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Reset state quando o modal for fechado
  const handleClose = () => {
    setSelectedCategory(null);
    setShowIncidentsList(false);
    setSelectedIncident(null);
    onClose();
  };

  // Lidar com clique no incidente individual
  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident);
  };



  const categoryData = useMemo(() => {
    if (!selectedString) return [];

    // Filtrar incidentes que contêm a string selecionada
    const relatedIncidents = incidents.filter(incident => 
      incidentContainsString(incident, selectedString)
    );
    
    console.log('📊 StringCategoryModal:', selectedString, 'incidentes:', relatedIncidents.length);

    if (relatedIncidents.length === 0) return [];

    // Agrupar por categoria
    const categoryMap = new Map<string, Incident[]>();
    
    relatedIncidents.forEach(incident => {
      const category = incident.category || 'Sem Categoria';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(incident);
    });

    // Converter para array e calcular percentuais
    const total = relatedIncidents.length;
    const data: CategoryData[] = Array.from(categoryMap.entries())
      .map(([category, incidents], index) => ({
        category,
        count: incidents.length,
        incidents,
        percentage: (incidents.length / total) * 100,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.count - a.count);

    console.log('✅ Categorias:', data.length, 'processadas');

    return data;
  }, [incidents, selectedString]);

  const totalIncidents = categoryData.reduce((sum, item) => sum + item.count, 0);





  // Obter incidentes da categoria selecionada
  const selectedCategoryIncidents = useMemo(() => {
    if (!selectedCategory) return [];
    
    const categoryInfo = categoryData.find(cat => cat.category === selectedCategory);
    return categoryInfo?.incidents || [];
  }, [selectedCategory, categoryData]);

  // Lidar com clique na barra/categoria
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setShowIncidentsList(true);
  };

  if (!isOpen) return null;
  if (!selectedString) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
      <div className={`rounded-xl max-w-7xl w-full h-[98vh] flex flex-col ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex-shrink-0 p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
              <BarChart3 className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  📊 Análise Dinâmica por Categoria
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    String:
                  </span>
                  <span className={`text-sm font-semibold px-2 py-1 rounded ${
                    darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'
                  }`}>
                    "{selectedString}"
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>








        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {categoryData.length === 0 ? (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum incidente encontrado</p>
              <p className="text-sm">
                Não há incidentes que contenham a string "{selectedString}"
              </p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Todas as Categorias */}
              <div className="flex justify-center">
                <div className={`p-6 rounded-xl border-2 shadow-lg w-full max-w-6xl ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                }`}>
                    {/* Legenda das categorias */}
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                      <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        📋 Todas as Categorias:
                      </h4>
                      <div className="grid grid-cols-1 gap-1">
                        {categoryData.map((category, index) => (
                          <div 
                            key={index}
                            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                              selectedCategory === category.category 
                                ? (darkMode ? 'bg-gray-500' : 'bg-blue-100') 
                                : (darkMode ? 'hover:bg-gray-500' : 'hover:bg-gray-100')
                            }`}
                            onClick={() => handleCategoryClick(category.category)}
                          >
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category.color }} 
                              />
                              <span className={`text-xs font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                {category.category}
                              </span>
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {category.count} ({category.percentage.toFixed(1)}%)
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedCategory && (
                      <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-green-50 border border-green-200'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                              📊 Categoria selecionada: {selectedCategory}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {categoryData.find(c => c.category === selectedCategory)?.count} incidentes 
                              ({((categoryData.find(c => c.category === selectedCategory)?.count || 0) / totalIncidents * 100).toFixed(1)}%)
                            </p>
                          </div>
                          <button
                            onClick={() => setShowIncidentsList(!showIncidentsList)}
                            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                              showIncidentsList
                                ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                                : (darkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                            }`}
                          >
                            {showIncidentsList ? '🙈 Ocultar' : '👁️ Ver'} Incidentes
                          </button>
                        </div>
                        
                        {/* Lista de Incidentes */}
                        {showIncidentsList && selectedCategoryIncidents.length > 0 && (
                          <div className={`mt-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                            <div className={`p-3 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                              <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                📋 Incidentes da categoria <span className={`font-bold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>"{selectedCategory}"</span>
                                <br/>🎯 <span className={`text-xs uppercase tracking-wide ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Análise da String:</span> 
                                <span className={`ml-1 px-2 py-1 rounded font-bold text-xs ${
                                  darkMode ? 'bg-indigo-900/50 text-indigo-200' : 'bg-indigo-100 text-indigo-700'
                                }`}>"{selectedString}"</span>
                              </h4>
                              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                💡 Clique em qualquer incidente para ver todos os detalhes
                              </p>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {selectedCategoryIncidents.map((incident, index) => (
                                <div 
                                  key={incident.number || index}
                                  className={`p-3 border-b last:border-b-0 ${darkMode ? 'border-gray-600' : 'border-gray-100'} hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors cursor-pointer`}
                                  onClick={() => handleIncidentClick(incident)}
                                  title="Clique para ver detalhes completos do incidente"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'} hover:underline`}>
                                        {incident.number || `Incidente ${index + 1}`} 🔍
                                      </p>
                                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {incident.shortDescription || 'Sem descrição'}
                                      </p>
                                      <div className="flex items-center space-x-3 mt-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                          incident.state === 'Open' || incident.state === 'In Progress'
                                            ? (darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                                            : incident.state === 'Resolved'
                                            ? (darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800')
                                            : (darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                                        }`}>
                                          {incident.state || 'N/A'}
                                        </span>
                                        {incident.priority && (
                                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            incident.priority.toLowerCase().includes('critical') || incident.priority.toLowerCase().includes('high')
                                              ? (darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                                              : (darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800')
                                          }`}>
                                            {incident.priority}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {incident.opened && (
                                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-right`}>
                                        <p>Aberto em:</p>
                                        <p>{formatDate(incident.opened)}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>


        {/* Modal de Detalhes do Incidente */}
      {selectedIncident && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 z-60">
        <div className={`rounded-xl max-w-5xl w-full h-[95vh] flex flex-col ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header do Modal de Detalhes */}
          <div className={`flex-shrink-0 p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                  <span className="text-2xl">🔍</span>
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Detalhes do Incidente
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedIncident.number || 'Incidente sem número'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                ✖️
              </button>
                  </div>
                </div>

          {/* Conteúdo do Modal de Detalhes */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informações Básicas */}
                <div className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  📋 Informações Básicas
                  </h3>
                <div className="space-y-3">
                  <div>
                    <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Número do Incidente:
                    </label>
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedIncident.number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Descrição Resumida:
                    </label>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedIncident.shortDescription || 'Sem descrição'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Solicitante:
                    </label>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedIncident.caller || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Categoria:
                    </label>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedIncident.category || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status e Prioridade */}
              <div className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ⚡ Status e Prioridade
                  </h3>
                  <div className="space-y-3">
                  <div>
                    <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Status:
                    </label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedIncident.state === 'Open' || selectedIncident.state === 'In Progress'
                          ? (darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                          : selectedIncident.state === 'Resolved'
                          ? (darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800')
                          : (darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                      }`}>
                        {selectedIncident.state || 'N/A'}
                            </span>
                          </div>
                            </div>
                            <div>
                    <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Prioridade:
                    </label>
                    <div className="mt-1">
                      {selectedIncident.priority ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedIncident.priority.toLowerCase().includes('critical') || selectedIncident.priority.toLowerCase().includes('high')
                            ? (darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                            : (darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800')
                        }`}>
                          {selectedIncident.priority}
                        </span>
                      ) : (
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          N/A
                              </span>
                      )}
                    </div>
                            </div>
                            <div>
                    <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Data de Abertura:
                    </label>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedIncident.opened ? formatDate(selectedIncident.opened) : 'N/A'}
                    </p>
                            </div>
                            <div>
                    <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Data de Resolução:
                    </label>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedIncident.resolved ? formatDate(selectedIncident.resolved) : 'Não resolvido'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Descrição Completa e Comentários */}
            <div className={`mt-6 p-4 rounded-lg border ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                📝 Detalhes e Comentários
              </h3>
              <div className="space-y-4">
                {selectedIncident.shortDescription && (
                  <div>
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Descrição Resumida:
                    </label>
                    <div className={`mt-2 p-3 rounded border ${
                      darkMode ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                    } text-sm whitespace-pre-wrap`}>
                      {selectedIncident.shortDescription}
                    </div>
                  </div>
                )}
                {selectedIncident.commentsAndWorkNotes && (
                  <div>
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Comentários e Notas de Trabalho:
                    </label>
                    <div className={`mt-2 p-3 rounded border ${
                      darkMode ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                    } text-sm whitespace-pre-wrap max-h-40 overflow-y-auto`}>
                      {selectedIncident.commentsAndWorkNotes}
                    </div>
                  </div>
                )}
                {!selectedIncident.shortDescription && !selectedIncident.commentsAndWorkNotes && (
                  <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p className="text-sm">Nenhum detalhe adicional disponível</p>
            </div>
          )}
              </div>
            </div>

            {/* Botão para Fechar */}
            <div className="mt-6 flex items-center justify-center">
              <button
                onClick={() => setSelectedIncident(null)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  darkMode 
                    ? 'bg-gray-600 text-white hover:bg-gray-500' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ✖️ Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};