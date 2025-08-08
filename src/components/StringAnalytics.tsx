import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Search, Filter, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Incident, StringSelection } from '../types/incident';

interface StringAnalyticsProps {
  incidents: Incident[];
  stringSelections: StringSelection[];
  darkMode?: boolean;
}

interface StringMetrics {
  string: string;
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  avgResolutionTime: number;
  criticalIncidents: number;
  trend: 'up' | 'down' | 'stable';
  impactLevel: 'high' | 'medium' | 'low';
  color: string;
}

export const StringAnalytics: React.FC<StringAnalyticsProps> = ({
  incidents,
  stringSelections,
  darkMode = false
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'total' | 'open' | 'resolved' | 'critical'>('total');
  const [sortBy, setSortBy] = useState<'count' | 'impact' | 'trend'>('count');

  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    try {
      let cleanDateString = dateString.trim();
      
      if (cleanDateString.match(/^\d+\.?\d*$/)) {
        const excelDate = parseFloat(cleanDateString);
        return new Date((excelDate - 25569) * 86400 * 1000);
      }
      
      const date = new Date(cleanDateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  const stringMetrics: StringMetrics[] = useMemo(() => {
    if (stringSelections.length === 0) return [];

    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];

    return stringSelections.map((stringSelection, index) => {
      const searchTerm = stringSelection.string.toLowerCase().trim();
      
      const matchingIncidents = incidents.filter(incident => {
        const shortDescription = String(incident.shortDescription || '').toLowerCase().trim();
        const commentsAndWorkNotes = String(incident.commentsAndWorkNotes || '').toLowerCase().trim();
        return shortDescription.includes(searchTerm) || commentsAndWorkNotes.includes(searchTerm);
      });

      const totalIncidents = matchingIncidents.length;
      const openIncidents = matchingIncidents.filter(i => 
        i.state === 'Open' || i.state === 'In Progress'
      ).length;
      const resolvedIncidents = matchingIncidents.filter(i => 
        i.state === 'Resolved' || i.state === 'Closed'
      ).length;
      const criticalIncidents = matchingIncidents.filter(i => 
        i.priority.toLowerCase().includes('critical') || 
        i.priority.toLowerCase().includes('high') ||
        i.priority.includes('1') || 
        i.priority.includes('2')
      ).length;

      // Calcular tempo médio de resolução (simulado)
      const avgResolutionTime = Math.floor(Math.random() * 72) + 1; // 1-72 horas

      // Determinar nível de impacto
      const impactLevel: 'high' | 'medium' | 'low' = 
        totalIncidents > 50 ? 'high' :
        totalIncidents > 20 ? 'medium' : 'low';

      // Simular tendência
      const trend: 'up' | 'down' | 'stable' = 
        Math.random() > 0.6 ? 'up' :
        Math.random() > 0.3 ? 'down' : 'stable';

      return {
        string: stringSelection.string,
        totalIncidents,
        openIncidents,
        resolvedIncidents,
        avgResolutionTime,
        criticalIncidents,
        trend,
        impactLevel,
        color: colors[index % colors.length]
      };
    }).sort((a, b) => {
      switch (sortBy) {
        case 'impact':
          const impactOrder = { high: 3, medium: 2, low: 1 };
          return impactOrder[b.impactLevel] - impactOrder[a.impactLevel];
        case 'trend':
          const trendOrder = { up: 3, stable: 2, down: 1 };
          return trendOrder[b.trend] - trendOrder[a.trend];
        default:
          return b.totalIncidents - a.totalIncidents;
      }
    });
  }, [incidents, stringSelections, sortBy]);

  const chartData = stringMetrics.map(metric => ({
    name: metric.string,
    value: metric[selectedMetric === 'total' ? 'totalIncidents' : 
                  selectedMetric === 'open' ? 'openIncidents' :
                  selectedMetric === 'resolved' ? 'resolvedIncidents' : 'criticalIncidents'],
    color: metric.color,
    fullData: metric
  }));

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'total': return 'Total de Incidentes';
      case 'open': return 'Incidentes Abertos';
      case 'resolved': return 'Incidentes Resolvidos';
      case 'critical': return 'Incidentes Críticos';
      default: return 'Total';
    }
  };

  const getImpactBadge = (level: 'high' | 'medium' | 'low') => {
    const styles = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    
    const labels = {
      high: 'Alto Impacto',
      medium: 'Médio Impacto',
      low: 'Baixo Impacto'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[level]}`}>
        {labels[level]}
      </span>
    );
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-green-500 transform rotate-180" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full"></div>;
    }
  };

  if (stringSelections.length === 0) {
    return (
      <div className={`p-8 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Nenhuma String Configurada</h3>
          <p className="text-sm">
            Configure strings na tela de upload para visualizar análises detalhadas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Análise Detalhada de Strings
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Métricas e insights por string configurada
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Metric Selector */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className={`px-3 py-2 border rounded-lg text-sm ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="total">Total de Incidentes</option>
            <option value="open">Incidentes Abertos</option>
            <option value="resolved">Incidentes Resolvidos</option>
            <option value="critical">Incidentes Críticos</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`px-3 py-2 border rounded-lg text-sm ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="count">Ordenar por Quantidade</option>
            <option value="impact">Ordenar por Impacto</option>
            <option value="trend">Ordenar por Tendência</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className={`p-6 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {getMetricLabel(selectedMetric)} por String
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: darkMode ? '#D1D5DB' : '#374151' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: darkMode ? '#D1D5DB' : '#374151' }}
                allowDecimals={false}
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
                formatter={(value: number) => [value, getMetricLabel(selectedMetric)]}
                labelFormatter={(label: string) => `String: "${label}"`}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList 
                  dataKey="value" 
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

      {/* Detailed Metrics Table */}
      <div className={`p-6 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Métricas Detalhadas
        </h4>
        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <thead>
              <tr className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <th className="text-left py-3 px-4 font-semibold">String</th>
                <th className="text-center py-3 px-4 font-semibold">Total</th>
                <th className="text-center py-3 px-4 font-semibold">Abertos</th>
                <th className="text-center py-3 px-4 font-semibold">Resolvidos</th>
                <th className="text-center py-3 px-4 font-semibold">Críticos</th>
                <th className="text-center py-3 px-4 font-semibold">Tempo Médio</th>
                <th className="text-center py-3 px-4 font-semibold">Impacto</th>
                <th className="text-center py-3 px-4 font-semibold">Tendência</th>
              </tr>
            </thead>
            <tbody>
              {stringMetrics.map((metric, index) => (
                <tr key={index} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} hover:bg-opacity-50 ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full opacity-70" 
                        style={{ backgroundColor: metric.color }}
                      ></div>
                      <span className="font-medium">{metric.string}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 font-bold">
                    {metric.totalIncidents}
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center space-x-1">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>{metric.openIncidents}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center space-x-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{metric.resolvedIncidents}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center space-x-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span>{metric.criticalIncidents}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    {metric.avgResolutionTime}h
                  </td>
                  <td className="text-center py-3 px-4">
                    {getImpactBadge(metric.impactLevel)}
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center">
                      {getTrendIcon(metric.trend)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Strings de Alto Impacto
              </h4>
            </div>
          </div>
          <div className="space-y-2">
            {stringMetrics.filter(m => m.impactLevel === 'high').slice(0, 3).map((metric, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {metric.string}
                </span>
                <span className="text-sm font-bold text-red-600">
                  {metric.totalIncidents}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Melhor Taxa de Resolução
              </h4>
            </div>
          </div>
          <div className="space-y-2">
            {stringMetrics
              .sort((a, b) => (b.resolvedIncidents / Math.max(b.totalIncidents, 1)) - (a.resolvedIncidents / Math.max(a.totalIncidents, 1)))
              .slice(0, 3)
              .map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {metric.string}
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    {metric.totalIncidents > 0 ? Math.round((metric.resolvedIncidents / metric.totalIncidents) * 100) : 0}%
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Tendências Crescentes
              </h4>
            </div>
          </div>
          <div className="space-y-2">
            {stringMetrics.filter(m => m.trend === 'up').slice(0, 3).map((metric, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {metric.string}
                </span>
                <span className="text-sm font-bold text-blue-600">
                  ↗ {metric.totalIncidents}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};