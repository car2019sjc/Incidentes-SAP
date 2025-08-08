import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Filter, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Incident, StringSelection } from '../types/incident';
import { isValidFileType, generateStringId, removeDuplicateStrings } from '../utils/stringUtils';
import { validateAndCleanIncidents, validateAndCleanStringSelections, validateFileSize, generateValidationReport, validateIncident } from '../utils/validation';

interface FileUploadProps {
  onDataLoaded: (data: Incident[]) => void;
  onStringSelectionsLoaded: (data: StringSelection[]) => void;
  stringSelections: StringSelection[];
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onDataLoaded, 
  onStringSelectionsLoaded, 
  stringSelections 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showStringUpload, setShowStringUpload] = useState(false);

  const parseCSV = (text: string): Incident[] => {
    const lines = text.split('\n').filter(line => line.trim());
    console.log(`📄 PARSING CSV:`);
    console.log(`- Total de linhas no arquivo: ${lines.length}`);
    console.log(`- Linhas após filtrar vazias: ${lines.length}`);
    
    if (lines.length < 2) throw new Error('Arquivo deve conter pelo menos um cabeçalho e uma linha de dados');

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log(`- Cabeçalhos encontrados: ${headers.length}`, headers.slice(0, 5));
    
    const data: Incident[] = [];
    let skippedLines = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      // Reduzir requisito mínimo de campos para ser mais inclusivo
      if (values.length >= 10) {
        data.push({
          number: values[0] || '',
          shortDescription: values[1] || '',
          caller: values[2] || '',
          state: values[3] || '',
          category: values[4] || '',
          assignmentGroup: values[5] || '',
          assignedTo: values[6] || '',
          priority: values[7] || '',
          closed: values[8] || '',
          opened: values[9] || '',
          updated: values[10] || '',
          resolved: values[11] || '',
          updatedByTags: values[12] || '',
          commentsAndWorkNotes: values[14] || values[13] || '', // Fallback para coluna 13 se 14 não existir
        });
      } else {
        skippedLines++;
        if (skippedLines <= 5) {
          console.warn(`- Linha ${i + 1} pulada (${values.length} campos):`, values.slice(0, 3));
        }
      }
    }

    console.log(`- Incidentes processados: ${data.length}`);
    console.log(`- Linhas puladas: ${skippedLines}`);
    
    return data;
  };

  const parseExcel = (buffer: ArrayBuffer): Incident[] => {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log(`📊 PARSING EXCEL:`);
    console.log(`- Total de linhas no arquivo: ${jsonData.length}`);
    console.log(`- Nome da aba: ${sheetName}`);

    if (jsonData.length < 2) throw new Error('Arquivo deve conter pelo menos um cabeçalho e uma linha de dados');

    const data: Incident[] = [];
    let skippedRows = 0;
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      // Reduzir requisito mínimo de campos para ser mais inclusivo
      if (row && row.length >= 10) {
        data.push({
          number: String(row[0] || ''),
          shortDescription: String(row[1] || ''),
          caller: String(row[2] || ''),
          state: String(row[3] || ''),
          category: String(row[4] || ''),
          assignmentGroup: String(row[5] || ''),
          assignedTo: String(row[6] || ''),
          priority: String(row[7] || ''),
          closed: String(row[8] || ''),
          opened: String(row[9] || ''),
          updated: String(row[10] || ''),
          resolved: String(row[11] || ''),
          updatedByTags: String(row[12] || ''),
          commentsAndWorkNotes: String(row[14] || row[13] || ''), // Fallback para coluna 13 se 14 não existir
        });
      } else {
        skippedRows++;
        if (skippedRows <= 5) {
          console.warn(`- Linha ${i + 1} pulada (${row ? row.length : 0} campos):`, row ? row.slice(0, 3) : []);
        }
      }
    }

    console.log(`- Incidentes processados: ${data.length}`);
    console.log(`- Linhas puladas: ${skippedRows}`);

    return data;
  };

  const parseStringSelections = (text: string): StringSelection[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('Arquivo deve conter pelo menos um cabeçalho e uma linha de dados');

    const data: StringSelection[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length >= 1) {
        data.push({
          id: `string_${i}`,
          string: values[0] || '',
          description: values[1] || '',
        });
      }
    }

    return data;
  };

  const parseStringSelectionsExcel = (buffer: ArrayBuffer): StringSelection[] => {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length < 2) throw new Error('Arquivo deve conter pelo menos um cabeçalho e uma linha de dados');

    const data: StringSelection[] = [];
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (row && row.length >= 1) {
        data.push({
          id: `string_${i}`,
          string: String(row[0] || ''),
          description: String(row[1] || ''),
        });
      }
    }

    return data;
  };

  const handleFile = useCallback(async (file: File) => {
    if (!isValidFileType(file)) {
      setUploadStatus('error');
      setErrorMessage('Por favor, selecione apenas arquivos CSV (.csv), TXT (.txt), Excel (.xlsx) ou (.xls)');
      return;
    }

    setIsProcessing(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      let incidents: Incident[];
      
      const isCSV = file.name.endsWith('.csv') || file.name.endsWith('.txt');
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      
      if (isCSV) {
        const text = await file.text();
        incidents = parseCSV(text);
      } else {
        const buffer = await file.arrayBuffer();
        incidents = parseExcel(buffer);
      }
      
      if (incidents.length === 0) {
        throw new Error('Nenhum incidente válido encontrado no arquivo');
      }

      // Adicionar logs detalhados para diagnóstico
      console.log(`📊 DIAGNÓSTICO UPLOAD:`);
      console.log(`- Incidentes carregados do arquivo: ${incidents.length}`);
      
      // Validar e limpar os dados
      const cleanIncidents = validateAndCleanIncidents(incidents);
      const validationReport = generateValidationReport(incidents, []);
      
      console.log(`- Incidentes após validação: ${cleanIncidents.length}`);
      console.log(`- Incidentes removidos na validação: ${validationReport.incidents.invalid}`);
      
      if (cleanIncidents.length === 0) {
        throw new Error('Nenhum incidente válido encontrado após validação');
      }

      if (validationReport.incidents.invalid > 0) {
        console.warn(`⚠️ ATENÇÃO: ${validationReport.incidents.invalid} incidentes foram removidos na validação por não atenderem aos critérios:`);
        console.warn(`- Campos obrigatórios: number, shortDescription, caller, state`);
        
        // Identificar quais incidentes foram removidos
        const removedIncidents = incidents.filter(incident => !validateIncident(incident));
        console.warn(`- Primeiros 5 incidentes removidos:`, removedIncidents.slice(0, 5));
      }

      console.log(`✅ RESULTADO FINAL:`);
      console.log(`- Incidentes enviados para o dashboard: ${cleanIncidents.length}`);
      console.log(`- Diferença desde o arquivo original: ${incidents.length - cleanIncidents.length}`);
      
      onDataLoaded(cleanIncidents);
      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido ao processar arquivo');
    } finally {
      setIsProcessing(false);
    }
  }, [onDataLoaded]);

  const handleStringFile = useCallback(async (file: File) => {
    if (!isValidFileType(file)) {
      setUploadStatus('error');
      setErrorMessage('Por favor, selecione apenas arquivos CSV (.csv), TXT (.txt), Excel (.xlsx) ou (.xls)');
      return;
    }

    setIsProcessing(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      let stringSelections: StringSelection[];
      
      const isCSV = file.name.endsWith('.csv') || file.name.endsWith('.txt');
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      
      if (isCSV) {
        const text = await file.text();
        stringSelections = parseStringSelections(text);
      } else {
        const buffer = await file.arrayBuffer();
        stringSelections = parseStringSelectionsExcel(buffer);
      }
      
      if (stringSelections.length === 0) {
        throw new Error('Nenhuma string de seleção válida encontrada no arquivo');
      }

      // Validar e limpar as strings
      const cleanStringSelections = validateAndCleanStringSelections(stringSelections);
      const validationReport = generateValidationReport([], stringSelections);
      
      if (cleanStringSelections.length === 0) {
        throw new Error('Nenhuma string válida encontrada após validação');
      }

      // Remover duplicatas
      const uniqueStringSelections = removeDuplicateStrings(cleanStringSelections);

      if (validationReport.strings.invalid > 0) {
        console.warn(`Validação: ${validationReport.strings.invalid} strings inválidas foram removidas`);
      }

      // Substituir completamente as strings existentes pelas novas
      onStringSelectionsLoaded(uniqueStringSelections);
      setShowStringUpload(false);
      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido ao processar arquivo');
    } finally {
      setIsProcessing(false);
    }
  }, [onStringSelectionsLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleStringFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleStringFile(files[0]);
    }
  }, [handleStringFile]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <div className="flex flex-col items-center space-y-4">
          {isProcessing ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isProcessing ? 'Processando arquivo...' : 'Carregar arquivo de incidentes'}
            </h3>
            <p className="text-gray-600 mb-4">
              Arraste e solte um arquivo CSV ou Excel aqui ou clique para selecionar
            </p>
            
            <input
              type="file"
              accept=".csv,.txt,.xlsx,.xls"
              onChange={handleFileInput}
              className="hidden"
              id="file-input"
              disabled={isProcessing}
            />
            <label
              htmlFor="file-input"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <FileText className="h-4 w-4 mr-2" />
              Selecionar arquivo
            </label>
          </div>
        </div>
      </div>

      {/* String Selection Upload Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Strings de Seleção (Opcional)</h4>
            <p className="text-sm text-gray-600">
              Carregue uma tabela com palavras-chave para filtrar incidentes
            </p>
          </div>
          <button
            onClick={() => setShowStringUpload(!showStringUpload)}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showStringUpload ? 'Cancelar' : 'Adicionar Strings'}
          </button>
        </div>

        {stringSelections.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Filter className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">
                {stringSelections.length} strings de seleção carregadas
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {stringSelections.slice(0, 5).map((item) => (
                <span key={item.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {item.string}
                </span>
              ))}
              {stringSelections.length > 5 && (
                <span className="text-blue-600 text-xs">
                  +{stringSelections.length - 5} mais
                </span>
              )}
            </div>
          </div>
        )}

        {showStringUpload && (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Filter className="h-8 w-8 text-gray-400" />
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-2">
                  Carregar Strings de Seleção
                </h4>
                <p className="text-gray-600 mb-4">
                  Arquivo CSV ou Excel com strings para filtrar incidentes
                </p>
                
                <input
                  type="file"
                  accept=".csv,.txt,.xlsx,.xls"
                  onChange={handleStringFileInput}
                  className="hidden"
                  id="string-file-input"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="string-file-input"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Selecionar arquivo
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {uploadStatus === 'success' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800">Arquivo carregado com sucesso!</span>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{errorMessage}</span>
        </div>
      )}

    </div>
  );
};