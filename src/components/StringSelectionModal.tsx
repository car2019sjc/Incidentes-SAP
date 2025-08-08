import React, { useMemo } from 'react';
import { X, Filter, Search, Trash2, AlertTriangle } from 'lucide-react';
import { StringSelection, Incident } from '../types/incident';
import { incidentContainsString } from '../utils/stringUtils';

interface StringSelectionModalProps {
  stringSelections: StringSelection[];
  selectedString: string;
  onSelectString: (string: string) => void;
  onClose: () => void;
  onRemoveString?: (stringId: string) => void;
  darkMode: boolean;
  incidents?: Incident[]; // Opcional para compatibilidade
}

export const StringSelectionModal: React.FC<StringSelectionModalProps> = ({
  stringSelections,
  selectedString,
  onSelectString,
  onClose,
  onRemoveString,
  darkMode,
  incidents = []
}) => {
  const handleStringSelect = (string: string) => {
    onSelectString(string === selectedString ? '' : string);
    onClose();
  };

  const handleRemoveString = (e: React.MouseEvent, stringId: string) => {
    e.stopPropagation();
    if (onRemoveString) {
      onRemoveString(stringId);
    }
  };

  // Calcular incidentes não mapeados
  const unmappedIncidentsCount = useMemo(() => {
    if (incidents.length === 0 || stringSelections.length === 0) {
      return 0;
    }

    const unmappedIncidents = incidents.filter(incident => {
      // Verifica se o incidente não corresponde a nenhuma string configurada
      return !stringSelections.some(stringSelection => 
        incidentContainsString(incident, stringSelection.string)
      );
    });

    return unmappedIncidents.length;
  }, [incidents, stringSelections]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Filter className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Filtrar por String
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Selecione uma string para filtrar incidentes que contenham essa palavra na descrição
          </p>
          {stringSelections.length > 0 && (
            <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {stringSelections.length} string{stringSelections.length !== 1 ? 's' : ''} salva{stringSelections.length !== 1 ? 's' : ''} localmente
            </p>
          )}
          
          {/* Nota sobre incidentes não mapeados */}
          {incidents.length > 0 && unmappedIncidentsCount > 0 && (
            <div className={`mt-3 p-3 rounded-lg border-l-4 ${
              darkMode 
                ? 'bg-yellow-900/20 border-yellow-600 text-yellow-200' 
                : 'bg-yellow-50 border-yellow-400 text-yellow-800'
            }`}>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <div className="text-sm">
                  <strong>{unmappedIncidentsCount}</strong> chamado{unmappedIncidentsCount !== 1 ? 's' : ''} não {unmappedIncidentsCount !== 1 ? 'estão' : 'está'} coberto{unmappedIncidentsCount !== 1 ? 's' : ''} pelas strings configuradas
                </div>
              </div>
              <div className={`mt-1 text-xs ${
                darkMode ? 'text-yellow-300' : 'text-yellow-700'
              }`}>
                {incidents.length > 0 ? 
                  `${((unmappedIncidentsCount / incidents.length) * 100).toFixed(1)}% do total de ${incidents.length} incidentes` :
                  'Nenhum incidente carregado'
                }
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {stringSelections.length === 0 ? (
            <div className="text-center py-8">
              <Search className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Nenhuma string de seleção carregada
              </p>
              <p className={`mt-2 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Carregue um arquivo de strings na tela de upload
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Clear filter option */}
              <button
                onClick={() => handleStringSelect('')}
                className={`
                  w-full text-left p-3 rounded-lg transition-colors border
                  ${selectedString === ''
                    ? darkMode
                      ? 'bg-blue-900 border-blue-700 text-blue-200'
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                    : darkMode
                      ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Todos os incidentes</div>
                    <div className={`text-sm ${
                      selectedString === ''
                        ? darkMode ? 'text-blue-300' : 'text-blue-600'
                        : darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Remover filtro de string
                    </div>
                  </div>
                  {selectedString === '' && (
                    <div className={`w-2 h-2 rounded-full ${
                      darkMode ? 'bg-blue-400' : 'bg-blue-600'
                    }`}></div>
                  )}
                </div>
              </button>

              {/* String options */}
              {stringSelections.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleStringSelect(item.string)}
                  className={`
                    w-full text-left p-3 rounded-lg transition-colors border
                    ${selectedString === item.string
                      ? darkMode
                        ? 'bg-blue-900 border-blue-700 text-blue-200'
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                      : darkMode
                        ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.string}</div>
                      {item.description && (
                        <div className={`text-sm ${
                          selectedString === item.string
                            ? darkMode ? 'text-blue-300' : 'text-blue-600'
                            : darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {item.description}
                        </div>
                      )}
                    </div>
                    {selectedString === item.string && (
                      <div className="flex items-center space-x-2">
                        {onRemoveString && (
                          <button
                            onClick={(e) => handleRemoveString(e, item.id)}
                            className={`
                              p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity
                              ${darkMode 
                                ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                                : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                              }
                            `}
                            title="Remover string"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                        <div className={`w-2 h-2 rounded-full ${
                          darkMode ? 'bg-blue-400' : 'bg-blue-600'
                        }`}></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg transition-colors ${
                darkMode
                  ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};