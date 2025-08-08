import React, { useState, useEffect } from 'react';
import { X, Bot, Loader2, AlertCircle, CheckCircle, Copy, Settings } from 'lucide-react';
import { Incident } from '../types/incident';
import { openAIService, AIAnalysisResponse } from '../services/openaiService';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident | null;
  selectedString: string;
  category: string;
  darkMode?: boolean;
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  isOpen,
  onClose,
  incident,
  selectedString,
  category,
  darkMode = false
}) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isOpenAIConfigured, setIsOpenAIConfigured] = useState(false);

  // Reset state quando o modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      setAnalysis(null);
      setError(null);
      setCopied(false);
      setIsOpenAIConfigured(openAIService.isConfigured());
      if (incident) {
        generateAnalysis();
      }
    }
  }, [isOpen, incident]);

  const generateAnalysis = async () => {
    if (!incident) return;

    setIsLoading(true);
    setError(null);

    try {
      let analysisResult: AIAnalysisResponse;
      
      if (openAIService.isConfigured()) {
        // Usar API real da OpenAI
        analysisResult = await openAIService.generateAnalysis(incident, selectedString, category);
      } else {
        // Usar análise simulada
        analysisResult = await openAIService.generateMockAnalysis(incident, selectedString, category);
      }
      
      setAnalysis(analysisResult);
    } catch (err) {
      console.error('Erro ao gerar análise:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao gerar análise';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };



  const copyAnalysisToClipboard = () => {
    if (!analysis) return;

    const formattedAnalysis = `
ANÁLISE DE CAUSA RAIZ - INCIDENTE ${incident?.number}
=================================================

🔍 CAUSA RAIZ PROVÁVEL:
${analysis.causaRaiz}

📋 EVIDÊNCIA CONTEXTUAL:
${analysis.evidenciaContextual}

🔧 AÇÃO CORRETIVA:
${analysis.acaoCorretiva}

🛡️ AÇÃO PREVENTIVA:
${analysis.acaoPreventiva}

💡 SUGESTÃO ADICIONAL:
${analysis.sugestaoAdicional || 'N/A'}

---
Gerado por IA em ${new Date().toLocaleString('pt-BR')}
String analisada: "${selectedString}"
Categoria: "${category}"
    `.trim();

    navigator.clipboard.writeText(formattedAnalysis).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex-shrink-0 p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
                <Bot className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  🤖 Agente de IA - Análise de Causa Raiz SAP
                </h2>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Incidente: <span className="font-medium">{incident?.number}</span>
                  </span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    String: <span className="font-medium">"{selectedString}"</span>
                  </span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Categoria: <span className="font-medium">{category}</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    <Settings className="h-3 w-3" />
                    <span className={`text-xs ${
                      isOpenAIConfigured 
                        ? darkMode ? 'text-green-400' : 'text-green-600'
                        : darkMode ? 'text-yellow-400' : 'text-yellow-600'
                    }`}>
                      {isOpenAIConfigured ? 'OpenAI Configurada' : 'Modo Simulação'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
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
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className={`h-8 w-8 animate-spin mb-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <p className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {isOpenAIConfigured ? 'Consultando OpenAI...' : 'Gerando análise simulada...'}
              </p>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {isOpenAIConfigured 
                  ? 'Processando dados com IA especializada em SAP'
                  : 'Usando algoritmo interno para análise de causa raiz'
                }
              </p>
            </div>
          )}

          {error && (
            <div className={`flex items-center space-x-3 p-4 rounded-lg ${
              darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
            }`}>
              <AlertCircle className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
              <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                {error}
              </p>
            </div>
          )}

          {analysis && (
            <div className="space-y-6">
              {/* Actions Bar */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`h-5 w-5 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                  <span className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    Análise concluída
                  </span>
                </div>
                <button
                  onClick={copyAnalysisToClipboard}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    copied
                      ? darkMode 
                        ? 'bg-green-900 text-green-300 border border-green-700'
                        : 'bg-green-100 text-green-700 border border-green-300'
                      : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  <Copy className="h-4 w-4" />
                  <span>{copied ? 'Copiado!' : 'Copiar Análise'}</span>
                </button>
              </div>

              {/* Analysis Sections */}
              <div className="space-y-4">
                <AnalysisSection
                  title="🔍 Causa Raiz Provável"
                  content={analysis.causaRaiz}
                  darkMode={darkMode}
                />
                
                <AnalysisSection
                  title="📋 Evidência Contextual"
                  content={analysis.evidenciaContextual}
                  darkMode={darkMode}
                />
                
                <AnalysisSection
                  title="🔧 Ação Corretiva"
                  content={analysis.acaoCorretiva}
                  darkMode={darkMode}
                />
                
                <AnalysisSection
                  title="🛡️ Ação Preventiva"
                  content={analysis.acaoPreventiva}
                  darkMode={darkMode}
                />
                
                {analysis.sugestaoAdicional && (
                  <AnalysisSection
                    title="💡 Sugestão Adicional"
                    content={analysis.sugestaoAdicional}
                    darkMode={darkMode}
                  />
                )}
              </div>

              {/* Footer Info */}
              <div className={`text-xs p-3 rounded-lg ${
                darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-500'
              }`}>
                <p>
                  ⚡ Análise gerada por IA especializada em SAP • {new Date().toLocaleString('pt-BR')}
                </p>
                <p className="mt-1">
                  💡 Esta análise é uma sugestão baseada em padrões conhecidos. Sempre valide com especialistas técnicos.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para seções da análise
interface AnalysisSectionProps {
  title: string;
  content: string;
  darkMode: boolean;
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({ title, content, darkMode }) => (
  <div className={`p-4 rounded-lg border ${
    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
  }`}>
    <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {title}
    </h3>
    <div className={`text-sm leading-relaxed whitespace-pre-line ${
      darkMode ? 'text-gray-300' : 'text-gray-700'
    }`}>
      {content}
    </div>
  </div>
);
