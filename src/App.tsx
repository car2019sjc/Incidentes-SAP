import { useState } from 'react';
import { FileText, BarChart3, Table, Moon, Sun, Filter } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { IncidentTable } from './components/IncidentTable';
import { StringSelectionModal } from './components/StringSelectionModal';
import { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp';
import { useAppState } from './hooks/useAppState';
import { useAppKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { FullScreenLoading } from './components/LoadingSpinner';

function App() {
  const {
    incidents,
    stringSelections,
    selectedStringFilter,
    darkMode,
    isLoading,
    setIncidents,
    setStringSelections,
    setSelectedStringFilter,
    setDarkMode,
    removeString
  } = useAppState();

  const [showStringModal, setShowStringModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'dashboard' | 'table'>('upload');

  // Configurar atalhos de teclado
  useAppKeyboardShortcuts(
    () => setDarkMode(!darkMode),
    undefined, // onToggleSearch será implementado na tabela
    () => setShowStringModal(!showStringModal),
    undefined // onExportData será implementado na tabela
  );

  const handleDataLoaded = (data: any[]) => {
    setIncidents(data);
    setActiveTab('dashboard');
  };

  const handleStringSelectionsLoaded = (newData: any[]) => {
    setStringSelections(newData);
    
    // Limpar o filtro ativo se a string não existir mais na nova lista
    if (selectedStringFilter && !newData.some((s: any) => s.string === selectedStringFilter)) {
      setSelectedStringFilter('');
    }
  };

  const filteredIncidents = selectedStringFilter 
    ? incidents.filter(incident => {
        const searchTerm = selectedStringFilter.toLowerCase().trim();
        const shortDescription = (incident.shortDescription || '').toLowerCase().trim();
        const commentsAndWorkNotes = (incident.commentsAndWorkNotes || '').toLowerCase().trim();
        
        return shortDescription.includes(searchTerm) || commentsAndWorkNotes.includes(searchTerm);
      })
    : incidents;

  const tabs = [
    { id: 'upload' as const, label: 'Upload', icon: FileText },
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 }, // Dashboard sempre disponível com strings padrão
    { id: 'table' as const, label: 'Incidentes', icon: Table, disabled: filteredIncidents.length === 0 },
  ];

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {isLoading ? (
        <FullScreenLoading darkMode={darkMode} />
      ) : (
        <>
      {/* Header */}
      <header className={`border-b transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Sistema de Gestão de Incidentes - SAP
                </h1>
                <p className={`text-sm transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Gerencie e monitore incidentes de forma eficiente
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {filteredIncidents.length > 0 && (
                <div className={`text-sm transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedStringFilter 
                    ? `${filteredIncidents.length} de ${incidents.length} incidentes (filtrados)`
                    : `${incidents.length} incidentes carregados`
                  }
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <KeyboardShortcutsHelp darkMode={darkMode} />
                
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={darkMode ? 'Modo claro (Ctrl+D)' : 'Modo escuro (Ctrl+D)'}
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`border-b transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    data-tab={tab.id}
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    disabled={tab.disabled}
                    className={`
                      flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : tab.disabled
                        ? `border-transparent cursor-not-allowed ${darkMode ? 'text-gray-500' : 'text-gray-400'}`
                        : `border-transparent hover:border-gray-300 ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className={`text-2xl font-bold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Carregar Dados de Incidentes
              </h2>
              <p className={`transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Faça upload de um arquivo CSV com os dados dos incidentes para começar
              </p>
            </div>
            <FileUpload 
              onDataLoaded={handleDataLoaded} 
              onStringSelectionsLoaded={handleStringSelectionsLoaded}
              stringSelections={stringSelections}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl font-bold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Dashboard de Incidentes
              </h2>
              <p className={`transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedStringFilter 
                  ? `Visão geral dos incidentes filtrados por: "${selectedStringFilter}"`
                  : 'Visão geral e métricas dos incidentes carregados'
                }
              </p>
            </div>
            
            <Dashboard incidents={filteredIncidents} stringSelections={stringSelections} darkMode={darkMode} selectedStringFilter={selectedStringFilter} />
            {selectedStringFilter && filteredIncidents.length === 0 ? (
              // Mensagem quando filtro não retorna resultados
              <div className={`text-center py-12 rounded-xl border-2 border-dashed ${
                darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'
              }`}>
                <div className={`mx-auto max-w-md ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Filter className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Nenhum incidente encontrado
                  </h3>
                  <p className="mb-4">
                    Não foram encontrados incidentes que contenham "{selectedStringFilter}" na descrição ou comentários.
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedStringFilter('')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        darkMode
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Remover Filtro
                    </button>
                    <div className="text-sm opacity-75">
                      ou ajuste o filtro para encontrar mais resultados
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'table' && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl font-bold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Lista de Incidentes
              </h2>
              <p className={`transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedStringFilter 
                  ? `Incidentes filtrados por: "${selectedStringFilter}"`
                  : 'Visualize, filtre e gerencie todos os incidentes'
                }
              </p>
            </div>
            
            {filteredIncidents.length > 0 ? (
              <IncidentTable 
                incidents={filteredIncidents} 
                searchTerm={selectedStringFilter}
              />
            ) : selectedStringFilter ? (
              // Mensagem quando filtro não retorna resultados
              <div className={`text-center py-12 rounded-xl border-2 border-dashed ${
                darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'
              }`}>
                <div className={`mx-auto max-w-md ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Filter className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Nenhum incidente encontrado
                  </h3>
                  <p className="mb-4">
                    Não foram encontrados incidentes que contenham "{selectedStringFilter}" na descrição ou comentários.
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedStringFilter('')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        darkMode
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Remover Filtro
                    </button>
                    <div className="text-sm opacity-75">
                      ou ajuste o filtro para encontrar mais resultados
                    </div>
                  </div>
                </div>
              </div>
            ) : incidents.length === 0 ? (
              // Mensagem quando não há dados carregados
              <div className={`text-center py-12 rounded-xl border-2 border-dashed ${
                darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'
              }`}>
                <div className={`mx-auto max-w-md ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Table className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Carregue dados para ver a tabela
                  </h3>
                  <p>
                    Vá para a aba "Upload" e carregue um arquivo de incidentes para começar a análise.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t mt-12 transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className={`text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Sistema de Gestão de Incidentes - SAP - Desenvolvido com React e TypeScript
            </p>
          </div>
        </div>
      </footer>
      
      {/* String Selection Modal */}
      {showStringModal && (
        <StringSelectionModal
          stringSelections={stringSelections}
          selectedString={selectedStringFilter}
          onSelectString={setSelectedStringFilter}
          onClose={() => setShowStringModal(false)}
          onRemoveString={removeString}
          darkMode={darkMode}
          incidents={incidents}
        />
      )}
        </>
      )}
    </div>
  );
}

export default App;