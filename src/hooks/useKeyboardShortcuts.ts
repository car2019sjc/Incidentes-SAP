import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Ignorar se o usuário estiver digitando em um input ou textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = (shortcut.ctrlKey ?? false) === event.ctrlKey;
      const altMatches = (shortcut.altKey ?? false) === event.altKey;
      const shiftMatches = (shortcut.shiftKey ?? false) === event.shiftKey;

      if (keyMatches && ctrlMatches && altMatches && shiftMatches) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return shortcuts;
};

// Hook específico para atalhos da aplicação
export const useAppKeyboardShortcuts = (
  onToggleDarkMode?: () => void,
  onToggleSearch?: () => void,
  onToggleFilters?: () => void,
  onExportData?: () => void
) => {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'd',
      ctrlKey: true,
      action: () => onToggleDarkMode?.(),
      description: 'Alternar modo escuro'
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => onToggleSearch?.(),
      description: 'Focar na busca'
    },
    {
      key: 'f',
      ctrlKey: true,
      shiftKey: true,
      action: () => onToggleFilters?.(),
      description: 'Alternar filtros'
    },
    {
      key: 'e',
      ctrlKey: true,
      action: () => onExportData?.(),
      description: 'Exportar dados'
    },
    {
      key: '1',
      altKey: true,
      action: () => {
        const uploadTab = document.querySelector('[data-tab="upload"]') as HTMLElement;
        uploadTab?.click();
      },
      description: 'Ir para Upload'
    },
    {
      key: '2',
      altKey: true,
      action: () => {
        const dashboardTab = document.querySelector('[data-tab="dashboard"]') as HTMLElement;
        dashboardTab?.click();
      },
      description: 'Ir para Dashboard'
    },
    {
      key: '3',
      altKey: true,
      action: () => {
        const tableTab = document.querySelector('[data-tab="table"]') as HTMLElement;
        tableTab?.click();
      },
      description: 'Ir para Tabela'
    }
  ];

  return useKeyboardShortcuts(shortcuts);
};