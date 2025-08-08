import React, { useState } from 'react';
import { Keyboard, X, HelpCircle } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  darkMode?: boolean;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ darkMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { keys: 'Ctrl + D', description: 'Alternar modo escuro' },
    { keys: 'Ctrl + F', description: 'Focar na busca' },
    { keys: 'Ctrl + Shift + F', description: 'Alternar filtros' },
    { keys: 'Ctrl + E', description: 'Exportar dados' },
    { keys: 'Alt + 1', description: 'Ir para Upload' },
    { keys: 'Alt + 2', description: 'Ir para Dashboard' },
    { keys: 'Alt + 3', description: 'Ir para Tabela' },
    { keys: 'Esc', description: 'Fechar modais' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`p-2 rounded-lg transition-colors ${
          darkMode
            ? 'text-gray-300 hover:text-white hover:bg-gray-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        title="Atalhos de teclado (Ajuda)"
      >
        <Keyboard className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`max-w-md w-full mx-4 rounded-xl shadow-lg ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <HelpCircle className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Atalhos de Teclado
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-1 rounded-lg transition-colors ${
                    darkMode
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {shortcut.description}
                    </span>
                    <div className={`px-2 py-1 rounded text-xs font-mono ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300 border border-gray-600'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}>
                      {shortcut.keys}
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-6 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  💡 Os atalhos não funcionam quando você está digitando em campos de texto.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};