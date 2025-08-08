import React, { useState } from 'react';
import { CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
import { PRIORITY_OPTIONS } from '../config/constants';

interface PriorityMultiSelectProps {
  selectedPriorities: string[];
  onPriorityChange: (priorities: string[]) => void;
  darkMode?: boolean;
}

export const PriorityMultiSelect: React.FC<PriorityMultiSelectProps> = ({
  selectedPriorities,
  onPriorityChange,
  darkMode = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectAll = () => {
    if (selectedPriorities.length === PRIORITY_OPTIONS.length) {
      onPriorityChange([]);
    } else {
      onPriorityChange(PRIORITY_OPTIONS.map(p => p.value));
    }
  };

  const handlePriorityToggle = (priority: string) => {
    if (selectedPriorities.includes(priority)) {
      onPriorityChange(selectedPriorities.filter(p => p !== priority));
    } else {
      onPriorityChange([...selectedPriorities, priority]);
    }
  };

  const isAllSelected = selectedPriorities.length === PRIORITY_OPTIONS.length;
  const hasSelection = selectedPriorities.length > 0;

  return (
    <div className="relative">
      {/* Button to toggle dropdown */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between ${
          darkMode 
            ? 'bg-gray-700 border-gray-600 text-white' 
            : 'bg-white border-gray-300 text-gray-900'
        }`}
      >
        <span className="text-sm">
          {hasSelection 
            ? `${selectedPriorities.length} prioridade${selectedPriorities.length !== 1 ? 's' : ''} selecionada${selectedPriorities.length !== 1 ? 's' : ''}`
            : 'Selecionar Prioridades'
          }
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute z-10 w-full mt-1 border rounded-lg shadow-lg ${
          darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
        }`}>
          <div className="p-2">
            {/* Select All */}
            <label className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-opacity-50 ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                isAllSelected
                  ? 'bg-blue-500 border-blue-500'
                  : darkMode
                    ? 'border-gray-500'
                    : 'border-gray-300'
              }`}>
                {isAllSelected && <CheckSquare className="h-3 w-3 text-white" />}
              </div>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                (Selecionar Tudo)
              </span>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="sr-only"
              />
            </label>

            {/* Individual Priority Options */}
            {PRIORITY_OPTIONS.map((priority) => {
              const isSelected = selectedPriorities.includes(priority.value);
              return (
                <label
                  key={priority.value}
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-opacity-50 ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    isSelected
                      ? 'bg-blue-500 border-blue-500'
                      : darkMode
                        ? 'border-gray-500'
                        : 'border-gray-300'
                  }`}>
                    {isSelected && <CheckSquare className="h-3 w-3 text-white" />}
                  </div>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {priority.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handlePriorityToggle(priority.value)}
                    className="sr-only"
                  />
                </label>
              );
            })}

            {/* Priority Label */}
            <div className={`mt-2 pt-2 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className={`flex items-center space-x-2 p-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <CheckSquare className="h-4 w-4" />
                <span className="text-sm font-medium">Priority</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};