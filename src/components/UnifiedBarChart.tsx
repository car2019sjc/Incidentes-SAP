import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Calendar, Filter, BarChart3, Eye, CheckSquare, Square, Users } from 'lucide-react';
import { Incident, StringSelection } from '../types/incident';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseDate } from '../utils/dateUtils';
import { countIncidentsByString } from '../utils/stringUtils';
import { StringIncidentsModal } from './StringIncidentsModal';
import { StringCategoryModal } from './StringCategoryModal';
import { AssignmentGroupModal } from './AssignmentGroupModal';

interface UnifiedBarChartProps {
  incidents: Incident[];
  stringSelections: StringSelection[];
  darkMode?: boolean;
  title?: string;
  showFilters?: boolean;
  showSummary?: boolean;
  periodType?: PeriodType;
  setPeriodType?: (periodType: PeriodType) => void;
  startDate?: string;
  setStartDate?: (date: string) => void;
  endDate?: string;
  setEndDate?: (date: string) => void;
}

type PeriodType = 'day' | 'week' | 'month' | 'custom' | 'manual' | 'all';

interface ChartData {
  name: string;
  count: number;
  color: string;
  id: string;
  description?: string;
}

export const UnifiedBarChart: React.FC<UnifiedBarChartProps> = ({ 
  incidents, 
  stringSelections, 
  darkMode = false,
  title = "Gráfico de Barras",
  showFilters = true,
  showSummary = true,
  periodType: externalPeriodType = 'custom',
  setPeriodType: externalSetPeriodType,
  startDate: externalStartDate = '',
  setStartDate: externalSetStartDate,
  endDate: externalEndDate = '',
  setEndDate: externalSetEndDate
}) => {
  // Usar props externas ou fallback para estado interno (compatibilidade)
  const [, setInternalPeriodType] = useState<PeriodType>('custom');
  const [internalStartDate, setInternalStartDate] = useState<string>('');
  const [internalEndDate, setInternalEndDate] = useState<string>('');

  const periodType = externalPeriodType;
  const setPeriodType = externalSetPeriodType || setInternalPeriodType;
  const startDate = externalStartDate || internalStartDate;
  const setStartDate = externalSetStartDate || setInternalStartDate;
  const endDate = externalEndDate || internalEndDate;
  const setEndDate = externalSetEndDate || setInternalEndDate;
  const sortOrder = 'desc'; // Sempre ordenar do maior para menor
  const [selectedStrings, setSelectedStrings] = useState<Set<string>>(new Set());
  // showFiltersPanel sempre visível por isso foi removido
  const [showIncidentsModal, setShowIncidentsModal] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [showAssignmentGroupModal, setShowAssignmentGroupModal] = useState<boolean>(false);
  const [selectedStringForModal, setSelectedStringForModal] = useState<string>('');
  const [viewMode, setViewMode] = useState<'incidents' | 'categories'>('incidents');
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  // Debug: Rastrear mudanças de estado do modal
  React.useEffect(() => {
    if (showCategoryModal && selectedStringForModal) {
      console.log('🎭 Modal de categorias aberto para:', selectedStringForModal);
    }
  }, [showCategoryModal, selectedStringForModal]);

  // Inicializar com todas as strings selecionadas
  React.useEffect(() => {
    if (stringSelections.length > 0 && !hasInitialized) {
      setSelectedStrings(new Set(stringSelections.map(s => s.string)));
      setHasInitialized(true);
    }
  }, [stringSelections, hasInitialized]);



  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    
    switch (periodType) {
      case 'day':
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        };
      case 'week':
        return {
          start: startOfWeek(now, { locale: ptBR }),
          end: endOfWeek(now, { locale: ptBR })
        };
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'custom':
        const start = startDate ? new Date(startDate) : (() => {
          const twelveMonthsAgo = new Date(now);
          twelveMonthsAgo.setMonth(now.getMonth() - 12);
          return twelveMonthsAgo;
        })();
        const end = endDate ? new Date(endDate) : now;
        return { start, end };
      case 'manual':
        // Para período manual, usar as datas definidas pelo usuário ou data atual como fallback
        const manualStart = startDate ? new Date(startDate) : new Date(now.getFullYear(), 0, 1); // Início do ano atual
        const manualEnd = endDate ? new Date(endDate) : now;
        return { start: manualStart, end: manualEnd };
      case 'all':
        // Período todo - desde o incidente mais antigo até o mais recente
        if (incidents.length === 0) {
          return { start: now, end: now };
        }
        
        const incidentDates = incidents
          .map(incident => {
            const openedDate = parseDate(incident.opened);
            return openedDate;
          })
          .filter(date => date !== null) as Date[];
        
        if (incidentDates.length === 0) {
          return { start: now, end: now };
        }
        
        const earliestDate = new Date(Math.min(...incidentDates.map(d => d.getTime())));
        const latestDate = new Date(Math.max(...incidentDates.map(d => d.getTime())));
        
        return { start: earliestDate, end: latestDate };
      default:
        const defaultStart = new Date(now);
        defaultStart.setMonth(now.getMonth() - 12);
        return { start: defaultStart, end: now };
    }
  };

  const getColorForString = (index: number): string => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
      '#14B8A6', '#F43F5E', '#8B5A2B', '#6D28D9', '#DC2626'
    ];
    return colors[index % colors.length];
  };

  // Extrair lógica de filtro de incidentes para uso geral
  const filteredIncidents = useMemo(() => {
    if (periodType === 'all') {
      console.log('🌟 Período Todo selecionado - usando todos os incidentes:', incidents.length);
      return incidents; // Todos os incidentes
    } else {
      const { start, end } = getDateRange();
      console.log('📅 Filtrando incidentes entre:', start.toISOString(), 'e', end.toISOString());
      
      // Filtrar incidentes por período
      const beforeDateFilter = incidents.length;
      const filtered = incidents.filter(incident => {
        const openedDate = parseDate(incident.opened);
        if (!openedDate) {
          return true; // Incluir incidentes sem data válida
        }
        return openedDate >= start && openedDate <= end;
      });
      
      console.log(`📊 FILTRO POR DATA:`);
      console.log(`- Antes do filtro: ${beforeDateFilter}`);
      console.log(`- Depois do filtro: ${filtered.length}`);
      console.log(`- Removidos por data: ${beforeDateFilter - filtered.length}`);
      
      return filtered;
    }
  }, [incidents, periodType, startDate, endDate]);

  const chartData = useMemo(() => {
    if (stringSelections.length === 0) return [];

    // Filtrar apenas strings selecionadas
    const filteredStringSelections = stringSelections.filter(s => 
      selectedStrings.has(s.string)
    );

    // Contar incidentes para cada string selecionada
    const stringCounts = countIncidentsByString(filteredIncidents, filteredStringSelections);
    
    const chartData: ChartData[] = stringCounts.map((item, index) => ({
      name: item.string,
      count: item.count,
      color: getColorForString(index),
      id: item.id,
      description: item.description
    }));

    // Ordenar por quantidade
    return chartData.sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.count - a.count;
      }
      return a.count - b.count;
    });
  }, [filteredIncidents, stringSelections, selectedStrings]);

  const getPeriodLabel = (type: PeriodType): string => {
    switch (type) {
      case 'day': return 'Hoje';
      case 'week': return 'Esta Semana';
      case 'month': return 'Este Mês';
      case 'custom': return 'Últimos 12 Meses';
      case 'manual': return 'Período Personalizado';
      case 'all': return 'Período Todo';
      default: return 'Últimos 12 Meses';
    }
  };

  // Funções para gerenciar filtros de strings
  const handleStringToggle = (stringValue: string) => {
    const newSelected = new Set(selectedStrings);
    if (newSelected.has(stringValue)) {
      newSelected.delete(stringValue);
    } else {
      newSelected.add(stringValue);
    }
    setSelectedStrings(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedStrings(new Set(stringSelections.map(s => s.string)));
  };

  const handleDeselectAll = () => {
    console.log('🔄 Desmarcando todas as strings...');
    setSelectedStrings(new Set<string>());
    console.log('✅ Strings desmarcadas!');
  };



  // Função para lidar com clique nas barras
  const handleBarClick = (data: any, event?: any) => {
    console.log('🎯 handleBarClick - ViewMode:', viewMode);
    
    let stringName = '';
    
    // PRINCIPAL: Se data tem activeLabel (evento do BarChart)
    if (data && data.activeLabel) {
      stringName = data.activeLabel;
    }
    
    // FALLBACK 1: Se data é um evento do Recharts
    if (!stringName && data && data.activePayload && data.activePayload.length > 0) {
      const payload = data.activePayload[0].payload;
      if (payload && payload.name) {
        stringName = payload.name;
      }
    }
    
    // FALLBACK 2: Se data é o objeto direto
    if (!stringName && data && data.name) {
      stringName = data.name;
    }
    
    // FALLBACK 3: Tentar outras formas de extrair
    if (!stringName && data && data.payload && data.payload.name) {
      stringName = data.payload.name;
    }
    
    if (stringName) {
      console.log('✅ String selecionada:', stringName);
      setSelectedStringForModal(stringName);
      
      // Verificar se Ctrl está pressionado para forçar modo categorias
      if (event && (event.ctrlKey || event.metaKey)) {
        console.log('⌨️ Ctrl+Click: abrindo modal de categorias');
        setShowCategoryModal(true);
      } else {
        // Respeitar o viewMode atual escolhido pelo usuário
        if (viewMode === 'categories') {
          console.log('📊 Modo categorias: abrindo modal de categorias');
          setShowCategoryModal(true);
        } else {
          console.log('📋 Modo incidentes: abrindo modal de incidentes');
          setShowIncidentsModal(true);
        }
      }
    } else {
      console.log('❌ Erro: nenhuma string encontrada nos dados');
    }
  };

  const totalIncidents = chartData.reduce((sum, item) => sum + item.count, 0);
  const stringsWithIncidents = chartData.filter(item => item.count > 0).length;

  // Sempre mostrar o gráfico, mesmo sem strings configuradas (não deve acontecer com as strings padrão)

  return (
    <div className={`p-6 rounded-xl shadow-sm border transition-colors ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {totalIncidents} incidentes encontrados no período selecionado
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
              💡 Use o dropdown "Modo de Análise" e clique nas barras para ver detalhes
            </p>
          </div>
        </div>
      </div>

      {/* Assignment Group Analysis Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowAssignmentGroupModal(true)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 font-medium transition-all hover:shadow-md ${
            darkMode
              ? 'bg-purple-900/20 border-purple-600/50 text-purple-300 hover:bg-purple-800/30 hover:border-purple-500'
              : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300'
          }`}
        >
          <Users className="h-5 w-5" />
          <span>📊 Análise por Assignment Group (Top 10)</span>
        </button>
      </div>

      {/* Controls - Calendário Central Único */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Period Selection - Calendário Central */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <Calendar className="inline h-4 w-4 mr-1" />
            📅 PERÍODO ÚNICO (controla tudo)
          </label>
          <select
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value as PeriodType)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="day">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="custom">Últimos 12 Meses</option>
            <option value="manual">📅 Personalizado</option>
            <option value="all">Período Todo</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className={`p-3 rounded-lg border-2 ${
          darkMode 
            ? 'bg-orange-900/20 border-orange-600/50' 
            : 'bg-orange-50 border-orange-200'
        }`}>
          <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
            🔍 Modo de Análise ⚠️
          </label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'incidents' | 'categories')}
            className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
              darkMode 
                ? 'bg-orange-900 border-orange-600 text-orange-100' 
                : 'bg-orange-100 border-orange-400 text-orange-900'
            } font-semibold`}
          >
            <option value="incidents">📋 Incidentes Detalhados</option>
            <option value="categories">📊 Análise por Categoria</option>
          </select>
          <p className={`text-xs mt-2 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
            ⚠️ Define qual modal será aberta ao clicar nas barras
          </p>
        </div>
      </div>

      {/* Custom Date Range - Calendário Central Único */}
      {(periodType === 'custom' || periodType === 'manual') && (
        <div className={`mb-4 rounded-lg border ${
          periodType === 'manual' 
            ? darkMode 
              ? 'bg-blue-900/20 border-blue-600/50' 
              : 'bg-blue-50/60 border-blue-300/70'
            : darkMode
              ? 'bg-gray-800/50 border-gray-600/50'
              : 'bg-blue-50/40 border-blue-200/60'
        }`}>
          {/* Header Section */}
          <div className={`px-4 py-2 border-b ${
            darkMode ? 'border-gray-600/50' : 'border-blue-200/60'
          }`}>
            <div className="flex items-center space-x-2">
              <Calendar className={`h-4 w-4 ${
                periodType === 'manual'
                  ? darkMode ? 'text-blue-300' : 'text-blue-600'
                  : darkMode ? 'text-gray-400' : 'text-blue-500'
              }`} />
              <h4 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {periodType === 'manual' ? '📅 Período Personalizado' : '📅 Calendário Único'}
              </h4>
              {periodType === 'manual' && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  darkMode 
                    ? 'bg-blue-700/50 text-blue-200' 
                    : 'bg-blue-200/70 text-blue-800'
                }`}>
                  Ativo
                </span>
              )}
            </div>
          </div>

          {/* Date Selection Section */}
          <div className="px-4 py-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={`flex items-center space-x-1 text-xs font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <Calendar className="h-3 w-3" />
                  <span>Data Inicial</span>
                  {startDate && (
                    <span className={`text-xs px-1 py-0.5 rounded text-green-600 ${
                      darkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      ✓
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min="2020-01-01"
                  max="2030-12-31"
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700/50 border-gray-600/50 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`flex items-center space-x-1 text-xs font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <Calendar className="h-3 w-3" />
                  <span>Data Final</span>
                  {endDate && (
                    <span className={`text-xs px-1 py-0.5 rounded text-green-600 ${
                      darkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      ✓
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min="2020-01-01"
                  max="2030-12-31"
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700/50 border-gray-600/50 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className={`px-4 py-2 border-t ${
            darkMode ? 'border-gray-600/50' : 'border-blue-200/60'
          }`}>
            <p className={`text-xs flex items-center space-x-1 ${
              darkMode ? 'text-yellow-400' : 'text-yellow-700'
            }`}>
              <span>⚠️</span>
              <span>Controla Dashboard Executivo, modais e análises</span>
            </p>
          </div>
        </div>
      )}

      {/* String Filters */}
      {showFilters && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h4 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Filtros de Strings
              </h4>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                ({selectedStrings.size} de {stringSelections.length} selecionadas)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium ${
                darkMode
                  ? 'bg-blue-700 text-blue-200'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                <Eye className="h-4 w-4" />
                <span>Filtros Ativos</span>
              </div>
            </div>
          </div>

          {/* Filtros sempre visíveis */}
          <div className={`p-4 rounded-lg border ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            {/* Filter Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                <button
                  onClick={handleSelectAll}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                    darkMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  <CheckSquare className="h-3 w-3" />
                  <span>Selecionar Todas</span>
                </button>
                <button
                  onClick={handleDeselectAll}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                    darkMode
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      : 'bg-gray-400 text-white hover:bg-gray-500'
                  }`}
                >
                  <Square className="h-3 w-3" />
                  <span>Desmarcar Todas</span>
                </button>
              </div>
            </div>

            {/* String Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {stringSelections.map((stringSelection, index) => {
                const isSelected = selectedStrings.has(stringSelection.string);
                return (
                  <label
                    key={stringSelection.id}
                    className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                      isSelected
                        ? darkMode
                          ? 'bg-blue-900/30 border border-blue-700/50'
                          : 'bg-blue-50/60 border border-blue-200/70'
                        : darkMode
                          ? 'hover:bg-gray-600/40'
                          : 'hover:bg-gray-100/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleStringToggle(stringSelection.string)}
                      className="sr-only"
                    />
                    <div className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'bg-blue-500/80 border-blue-500/80'
                        : darkMode
                          ? 'border-gray-500/60'
                          : 'border-gray-300/70'
                    }`}>
                      {isSelected && (
                        <CheckSquare className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0 opacity-70" 
                        style={{ backgroundColor: getColorForString(index) }}
                      ></div>
                      <span className={`text-sm font-medium truncate ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {stringSelection.string}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Controle de data removido - usando apenas o controle principal acima */}
        </div>
      )}

      {/* Chart */}
      <div className="h-96 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              barCategoryGap="20%"
              onClick={handleBarClick}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={darkMode ? '#374151' : '#E5E7EB'} 
              />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ 
                  fontSize: 11, 
                  fill: darkMode ? '#D1D5DB' : '#374151' 
                }}
              />
              <YAxis 
                allowDecimals={false}
                domain={[0, 'dataMax + 1']}
                tick={{ 
                  fontSize: 12, 
                  fill: darkMode ? '#D1D5DB' : '#374151' 
                }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#FFFFFF' : '#000000',
                  boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{
                  color: darkMode ? '#FFFFFF' : '#000000',
                  fontWeight: 'bold'
                }}
                itemStyle={{
                  color: darkMode ? '#F3F4F6' : '#374151'
                }}
                formatter={(value: number) => [value, 'Incidentes']}
                labelFormatter={(label: string) => `String: "${label}"`}
              />
              <Bar 
                dataKey="count" 
                radius={[4, 4, 0, 0]}
                minPointSize={2}
                cursor="pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                  />
                ))}
                <LabelList 
                  dataKey="count" 
                  position="top" 
                  style={{ 
                    fill: darkMode ? '#FFFFFF' : '#000000', 
                    fontSize: '12px', 
                    fontWeight: 'bold' 
                  }}
                  formatter={(value: any) => (typeof value === 'number' && value > 0) ? value.toString() : ''}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className={`flex items-center justify-center h-full ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum dado encontrado</p>
              <p className="text-sm">
                {selectedStrings.size === 0 
                  ? 'Selecione pelo menos uma string nos filtros acima'
                  : `Não há incidentes no período selecionado: ${getPeriodLabel(periodType)}`
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tabela de Strings Clicáveis */}
      {chartData.length > 0 && (
        <div className={`mt-6 p-4 rounded-lg border ${
          darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <h4 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Clique para ver incidentes por string:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {chartData.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  console.log('Button clicked for:', item.name);
                  setSelectedStringForModal(item.name);
                  setShowIncidentsModal(true);
                }}
                className={`p-3 rounded-lg border transition-all hover:shadow-md text-left ${
                  darkMode
                    ? 'bg-gray-600 border-gray-500 hover:bg-gray-500 text-white'
                    : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full opacity-70" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="font-medium text-sm truncate">{item.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.count}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {showSummary && stringSelections.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Período:</strong> {getPeriodLabel(periodType)}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Strings analisadas:</strong> {selectedStrings.size}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Strings com incidentes:</strong> {stringsWithIncidents}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Total de incidentes:</strong> {totalIncidents}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Incidentes */}
      <StringIncidentsModal
        isOpen={showIncidentsModal}
        onClose={() => setShowIncidentsModal(false)}
        selectedString={selectedStringForModal}
        incidents={incidents}
        darkMode={darkMode}
        periodFilter={getDateRange()}
      />

      {/* Modal de Categorias */}
      <StringCategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          console.log('🎭 Modal de categorias sendo fechado');
          setShowCategoryModal(false);
        }}
        selectedString={selectedStringForModal}
        incidents={filteredIncidents}
        darkMode={darkMode}
      />

      {/* Modal de Assignment Groups */}
      <AssignmentGroupModal
        isOpen={showAssignmentGroupModal}
        onClose={() => setShowAssignmentGroupModal(false)}
        incidents={filteredIncidents}
        stringSelections={stringSelections}
        darkMode={darkMode}
      />
    </div>
  );
}; 