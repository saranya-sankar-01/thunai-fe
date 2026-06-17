// Shared type definitions for Research components

export interface ResearchItem {
  id: string;
  chat_session_id?: string;
  prompt?: string;
  ai_title?: string;
  lastMessage: string;
  timestamp?: string;
  created?: string;
  isActive?: boolean;
  unique_id?: string;
  object_id?: string;
}

export interface ResearchVersion {
  summary_without_sources?: string;
  final_sources_gathered?: string[];
  sources: any[];
  version: number;
  results: string;
  id: string;
  status?: string;
  last_run?: string;
  next_run?: string;
  periodic?: {
    obj_id?: string;
    schedule_type?: string;
    schedule_time?: string | any;
    days?: string[];
    dates?: number[];
  };
}

export type ViewMode = "list" | "new" | "existing";
export type ScheduleType = "only_once" | "daily" | "weekly" | "monthly";

export interface ScheduleConfig {
  type: ScheduleType;
  time: string;
  days?: string[];
  dates?: number[];
}

export interface NewResearchFormProps {
  onSubmit: (query: string, schedule: ScheduleConfig) => void;
  onCancel?: () => void;
  initialSchedule?: ScheduleConfig | null;
}