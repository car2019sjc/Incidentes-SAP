import React, { useState, useEffect } from 'react';
import { Incident, StringSelection } from '../types/incident';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { UnifiedBarChart } from './UnifiedBarChart';

type PeriodType = 'day' | 'week' | 'month' | 'custom' | 'manual' | 'all';

interface DashboardProps {
  incidents: Incident[];
  stringSelections: StringSelection[];
  darkMode?: boolean;
  selectedStringFilter?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ incidents, stringSelections, darkMode = false, selectedStringFilter }) => {
  // Estado compartilhado de período entre os componentes
  const [periodType, setPeriodType] = useState<PeriodType>('custom');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Inicializar com período padrão de 12 meses
  useEffect(() => {
    if (!startDate && !endDate) {
      const now = new Date();
      const twelveMonthsAgo = new Date(now);
      twelveMonthsAgo.setMonth(now.getMonth() - 12);
      
      setStartDate(twelveMonthsAgo.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    }
  }, [startDate, endDate]);
  return (
    <div className="space-y-8">
      {/* Dashboard Executivo - análise estratégica na parte superior */}
      <ExecutiveDashboard 
        incidents={incidents} 
        stringSelections={stringSelections} 
        darkMode={darkMode} 
        selectedStringFilter={selectedStringFilter}
        periodType={periodType}
        startDate={startDate}
        endDate={endDate}
      />

      {/* Gráfico de Barras Interativo - CALENDÁRIO CENTRAL */}
      <UnifiedBarChart
        incidents={incidents}
        stringSelections={stringSelections}
        darkMode={darkMode}
        title="📅 Calendário Central - Análise Interativa por String"
        showFilters={true}
        showSummary={true}
        periodType={periodType}
        setPeriodType={setPeriodType}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />
    </div>
  );
};