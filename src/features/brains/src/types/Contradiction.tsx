export interface Contradiction {
  id: string;
  title: string;
  summary?: string;
  severity: "high" | "medium" | "low";
  status?: string;
  affected_documents: {
    id: string;
    name: string;
  }[];
  conflict_topic?: string;
  contradiction1?: string;
  contradiction2?: string;
  suggestion?: string;
  actions?: {
    resolve?: boolean;
    mark_resolved?: boolean;
  };
  description: string;
  documents: string[];
contradicting_text:{}
  resolved: boolean;
  ai_instructions?: string;
  related_documents?:  {
  id: string;
  name: string;
  rel_title: string;
  summary: string;
}[];
}
