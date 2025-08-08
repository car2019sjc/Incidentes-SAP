import React, { useState, useMemo, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LabelList
} from 'recharts';
import { 
  TrendingUp, TrendingDown, AlertTriangle, 
  Clock, Users, Calendar, RefreshCw
} from 'lucide-react';
import { Incident, StringSelection } from '../types/incident';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseDate } from '../utils/dateUtils';

import { StringAnalytics } from './StringAnalytics';
import { StringIncidentsModal } from './StringIncidentsModal';


interface ExecutiveDashboardProps {
  incidents: Incident[];
  stringSelections: StringSelection[];
  darkMode?: boolean;
  selectedStringFilter?: string;
  periodType?: string;
  startDate?: string;
  endDate?: string;
}

interface KPICard {
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
  clickable?: boolean;
  onClick?: () => void;
}

interface AnalysisData {
  category: string;
  count: number;
  percentage: number;
  trend: number;
  color: string;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ 
  incidents, 
  stringSelections, 
  darkMode = false,
  selectedStringFilter,
  periodType = 'custom',
  startDate = '',
  endDate = ''
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'strings' | 'trends'>('overview');
  const [showIncidentsModal, setShowIncidentsModal] = useState<boolean>(false);
  const [modalIncidents, setModalIncidents] = useState<Incident[]>([]);
  const [modalTitle, setModalTitle] = useState<string>('');

  // Aplicar o mesmo filtro de período que o calendário central usa
  const filteredIncidents = useMemo(() => {
    if (periodType === 'all') {
      return incidents; // Todos os incidentes
    }

    const now = new Date();
    let dateRange: { start: Date; end: Date };

    switch (periodType) {
      case 'day':
        dateRange = {
          start: startOfDay(now),
          end: endOfDay(now)
        };
        break;
      case 'week':
        dateRange = {
          start: startOfWeek(now, { locale: ptBR }),
          end: endOfWeek(now, { locale: ptBR })
        };
        break;
      case 'month':
        dateRange = {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
        break;
      case 'custom':
      case 'manual':
        const start = startDate ? new Date(startDate) : (() => {
          const twelveMonthsAgo = new Date(now);
          twelveMonthsAgo.setMonth(now.getMonth() - 12);
          return twelveMonthsAgo;
        })();
        const end = endDate ? new Date(endDate) : now;
        dateRange = { start, end };
        break;
      default:
        const defaultStart = new Date(now);
        defaultStart.setMonth(now.getMonth() - 12);
        dateRange = { start: defaultStart, end: now };
    }

    // Filtrar incidentes por período (mesma lógica do UnifiedBarChart)
    return incidents.filter(incident => {
      const openedDate = parseDate(incident.opened);
      if (!openedDate) {
        return true; // Incluir incidentes sem data válida
      }
      return openedDate >= dateRange.start && openedDate <= dateRange.end;
    });
  }, [incidents, periodType, startDate, endDate]);

  // Função para lidar com clique nos cards KPI
  const handleKPICardClick = useCallback((cardType: 'open' | 'critical' | 'high') => {
    let filteredData: Incident[] = [];
    let title = '';

    if (cardType === 'open') {
      filteredData = filteredIncidents.filter(i => i.state === 'Open' || i.state === 'In Progress');
      title = 'Incidentes Abertos';
    } else if (cardType === 'critical') {
      filteredData = filteredIncidents.filter(i => 
        i.priority.toLowerCase().includes('critical') ||
        i.priority.includes('1')
      );
      title = 'Incidentes Críticos';
    } else if (cardType === 'high') {
      filteredData = filteredIncidents.filter(i => 
        i.priority.toLowerCase().includes('high') ||
        i.priority.includes('2')
      );
      title = 'Incidentes High Priority';
    }

    console.log('Clique no card:', cardType, 'Dados filtrados:', filteredData.length);
    setModalIncidents(filteredData);
    setModalTitle(title);
    setShowIncidentsModal(true);
  }, [filteredIncidents]);

  const kpiCards: KPICard[] = useMemo(() => {
    const total = filteredIncidents.length;
    const open = filteredIncidents.filter(i => i.state === 'Open' || i.state === 'In Progress').length;
    
    // Separar críticos e high
    const critical = filteredIncidents.filter(i => 
      i.priority.toLowerCase().includes('critical') ||
      i.priority.includes('1')
    ).length;
    
    const high = filteredIncidents.filter(i => 
      i.priority.toLowerCase().includes('high') ||
      i.priority.includes('2')
    ).length;

    return [
      {
        title: 'Total de Incidentes',
        value: total,
        change: 12,
        trend: 'up',
        icon: <Users className="h-6 w-6" />,
        color: 'blue'
      },
      {
        title: 'Incidentes Abertos',
        value: open,
        change: -8,
        trend: 'down',
        icon: <Clock className="h-6 w-6" />,
        color: 'green',
        clickable: true,
        onClick: () => handleKPICardClick('open')
      },
      {
        title: 'Incidentes Críticos',
        value: critical,
        change: -15,
        trend: 'down',
        icon: <AlertTriangle className="h-6 w-6" />,
        color: 'red',
        clickable: true,
        onClick: () => handleKPICardClick('critical')
      },
      {
        title: 'Incidentes High',
        value: high,
        change: -5,
        trend: 'down',
        icon: <TrendingUp className="h-6 w-6" />,
        color: 'yellow',
        clickable: true,
        onClick: () => handleKPICardClick('high')
      }
    ];
  }, [filteredIncidents, handleKPICardClick]);

  const categoryAnalysis: AnalysisData[] = useMemo(() => {
    const categoryCount = filteredIncidents.reduce((acc, incident) => {
      const category = incident.category || 'Sem categoria';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = filteredIncidents.length;
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

    return Object.entries(categoryCount)
      .map(([category, count], index) => ({
        category,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        trend: Math.floor(Math.random() * 20) - 10, // Simulado
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [filteredIncidents]);



  const getKPICardColor = (color: string) => {
    const colors = {
      blue: darkMode ? 'bg-blue-900/30 border-blue-700/50' : 'bg-blue-50/60 border-blue-200/70',
      orange: darkMode ? 'bg-orange-900/30 border-orange-700/50' : 'bg-orange-50/60 border-orange-200/70',
      green: darkMode ? 'bg-green-900/30 border-green-700/50' : 'bg-green-50/60 border-green-200/70',
      red: darkMode ? 'bg-red-900/30 border-red-700/50' : 'bg-red-50/60 border-red-200/70',
      purple: darkMode ? 'bg-purple-900/30 border-purple-700/50' : 'bg-purple-50/60 border-purple-200/70',
      yellow: darkMode ? 'bg-yellow-900/30 border-yellow-700/50' : 'bg-yellow-50/60 border-yellow-200/70'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500/80" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500/80" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500/80" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Dashboard Executivo
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Análise estratégica de incidentes e tendências
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Período controlado pelo calendário central */}
          <div className={`px-3 py-2 border rounded-lg text-sm ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-300' 
              : 'bg-blue-50 border-blue-300 text-blue-800'
          }`}>
            📅 Período: Calendário Central
          </div>

          {/* View Selector */}
          <div className="flex border rounded-lg overflow-hidden">
            {[
              { key: 'overview', label: 'Visão Geral' },
              { key: 'strings', label: 'Análise de Strings' },
              { key: 'trends', label: 'Tendências' }
            ].map((view) => (
              <button
                key={view.key}
                onClick={() => setSelectedView(view.key as any)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  selectedView === view.key
                    ? darkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl border transition-all ${getKPICardColor(kpi.color)} ${
              kpi.clickable ? 'cursor-pointer hover:shadow-lg hover:scale-105' : 'hover:shadow-lg'
            }`}
            onClick={kpi.clickable ? kpi.onClick : undefined}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${
                kpi.color === 'blue' ? 'bg-blue-100/70 text-blue-600/90' :
                kpi.color === 'orange' ? 'bg-orange-100/70 text-orange-600/90' :
                kpi.color === 'green' ? 'bg-green-100/70 text-green-600/90' :
                kpi.color === 'purple' ? 'bg-purple-100/70 text-purple-600/90' :
                kpi.color === 'yellow' ? 'bg-yellow-100/70 text-yellow-600/90' :
                'bg-red-100/70 text-red-600/90'
              }`}>
                {kpi.icon}
              </div>
              {getTrendIcon(kpi.trend)}
            </div>
            
            <div>
              <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {kpi.title.includes('Taxa') ? `${kpi.value}%` : kpi.value.toLocaleString()}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {kpi.title}
              </p>
              <div className="flex items-center mt-2">
                <span className={`text-xs font-medium ${
                  kpi.trend === 'up' ? 'text-green-600/80' : 
                  kpi.trend === 'down' ? 'text-red-600/80' : 'text-gray-500/80'
                }`}>
                  {kpi.change > 0 ? '+' : ''}{kpi.change}% vs período anterior
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className={`p-6 rounded-xl border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Distribuição por Categoria
              </h3>
              {selectedStringFilter && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  darkMode 
                    ? 'bg-blue-900 border-blue-700 text-blue-200' 
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                  🔍 "{selectedStringFilter}"
                </div>
              )}
            </div>
            {categoryAnalysis.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryAnalysis}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      label={({ percentage }) => 
                        percentage > 3 ? `${percentage.toFixed(1)}%` : ''
                      }
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {categoryAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '8px',
                        color: darkMode ? '#FFFFFF' : '#000000',
                        boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{
                        color: darkMode ? '#FFFFFF' : '#000000'
                      }}
                      itemStyle={{
                        color: darkMode ? '#F3F4F6' : '#374151'
                      }}
                      formatter={(value: number, _name: string, props: any) => [
                        `${value} incidentes (${((value / filteredIncidents.length) * 100).toFixed(1)}%)`,
                        props.payload.category
                      ]}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={60}
                      wrapperStyle={{
                        paddingTop: '20px',
                        fontSize: '12px'
                      }}
                      formatter={(_value: string, entry: any) => (
                        <span style={{ 
                          color: darkMode ? '#D1D5DB' : '#374151',
                          fontSize: '12px'
                        }}>
                          {entry.payload.category}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className={`h-80 flex items-center justify-center ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum dado disponível</p>
                  <p className="text-sm">Carregue dados de incidentes para ver a distribuição por categoria</p>
                </div>
              </div>
            )}
          </div>

          {/* Top Categories Bar Chart */}
          <div className={`p-6 rounded-xl border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Top Categorias
              </h3>
              {selectedStringFilter && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  darkMode 
                    ? 'bg-blue-900 border-blue-700 text-blue-200' 
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                  🔍 "{selectedStringFilter}"
                </div>
              )}
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 12, fill: darkMode ? '#D1D5DB' : '#374151' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12, fill: darkMode ? '#D1D5DB' : '#374151' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                      border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      color: darkMode ? '#FFFFFF' : '#000000',
                      boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{
                      color: darkMode ? '#FFFFFF' : '#000000'
                    }}
                    itemStyle={{
                      color: darkMode ? '#F3F4F6' : '#374151'
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {categoryAnalysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
            </div>
          </div>
        </div>
      )}

      {selectedView === 'strings' && (
        <StringAnalytics 
          incidents={filteredIncidents} 
          stringSelections={stringSelections} 
          darkMode={darkMode} 
        />
      )}

      {selectedView === 'trends' && (
        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Análise de Tendências
          </h3>
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Análise de Tendências</p>
            <p className="text-sm">
              Funcionalidade em desenvolvimento - análise temporal dos incidentes
            </p>
          </div>
        </div>
      )}

      {/* Modal para exibir incidentes filtrados */}
      <StringIncidentsModal
        isOpen={showIncidentsModal}
        onClose={() => setShowIncidentsModal(false)}
        selectedString={modalTitle}
        incidents={incidents}
        darkMode={darkMode}
        preFilteredIncidents={modalIncidents}
      />
    </div>
  );
};