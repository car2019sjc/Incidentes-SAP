export interface Incident {
  number: string;
  shortDescription: string;
  caller: string;
  state: string;
  category: string;
  assignmentGroup: string;
  assignedTo: string;
  priority: string;
  closed: string;
  opened: string;
  updated: string;
  resolved: string;
  updatedByTags: string;
  commentsAndWorkNotes: string;
}

export interface IncidentStats {
  total: number;
  open: number;
  closed: number;
  resolved: number;
  highPriority: number;
}

export interface FilterOptions {
  state: string;
  priority: string;
  priorities?: string[]; // Para seleção múltipla
  category: string;
  assignmentGroup: string;
  dateRange: {
    start: string;
    end: string;
  };
  stringFilter: string;
}

export interface StringSelection {
  id: string;
  string: string;
  description?: string;
}