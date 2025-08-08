/**
 * Utilitários para manipulação de datas
 */

/**
 * Converte uma string de data para um objeto Date
 * Suporta múltiplos formatos incluindo números do Excel
 */
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  try {
    let cleanDateString = dateString.trim();
    
    // Formato de número serial do Excel (ex: 45665.2939814148)
    if (cleanDateString.match(/^\d+\.?\d*$/)) {
      const excelDate = parseFloat(cleanDateString);
      // Excel conta dias desde 1 de janeiro de 1900, mas tem um bug que conta 1900 como ano bissexto
      // Então subtraímos 25569 para converter para timestamp Unix (dias desde 1/1/1970)
      return new Date((excelDate - 25569) * 86400 * 1000);
    }
    
    // Formato ISO (YYYY-MM-DD HH:mm:ss)
    if (cleanDateString.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(cleanDateString);
    }
    
    // Formato americano (MM/DD/YYYY)
    if (cleanDateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
      return new Date(cleanDateString);
    }
    
    // Formato de texto em inglês (Jan 15, 2024)
    if (cleanDateString.match(/[A-Za-z]{3}/)) {
      return new Date(cleanDateString);
    }
    
    // Timestamp Unix
    if (cleanDateString.match(/^\d{10,13}$/)) {
      const timestamp = parseInt(cleanDateString);
      return new Date(timestamp.toString().length === 10 ? timestamp * 1000 : timestamp);
    }
    
    // Tentativa genérica
    const date = new Date(cleanDateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.warn('Erro ao fazer parse da data:', dateString, error);
    return null;
  }
};

/**
 * Formata uma data para exibição em português brasileiro
 */
export const formatDate = (dateInput: string | Date): string => {
  if (!dateInput) return '-';
  
  // Se já é um objeto Date
  if (dateInput instanceof Date) {
    try {
      return dateInput.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Erro ao formatar data:', dateInput, error);
      return 'Erro na data';
    }
  }
  
  // Se é uma string
  const dateString = String(dateInput);
  if (dateString.toLowerCase() === 'invalid date' || dateString === 'Invalid Date') return 'Data inválida';
  
  const date = parseDate(dateString);
  if (!date) return 'Data inválida';
  
  try {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.warn('Erro ao formatar data:', dateString, error);
    return 'Erro na data';
  }
};

/**
 * Formata uma data para CSV (formato brasileiro simples)
 */
export const formatDateForCSV = (dateInput: string | Date): string => {
  if (!dateInput) return '';
  
  const formattedDate = formatDate(dateInput);
  if (formattedDate === '-' || formattedDate === 'Data inválida' || formattedDate === 'Erro na data') {
    return '';
  }
  
  return formattedDate;
};

/**
 * Valida se uma data está dentro de um intervalo
 */
export const isDateInRange = (dateString: string, startDate: Date | null, endDate: Date | null): boolean => {
  const date = parseDate(dateString);
  if (!date) return false;
  
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  
  return true;
}; 