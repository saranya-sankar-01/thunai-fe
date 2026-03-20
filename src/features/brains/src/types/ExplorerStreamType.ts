
export interface ExplorerStreamType {
  id: string;
  event: string;
  status: "processing" | "completed" | "failed" | "queued";
  task_name: string;
  context_data_id: string;
  urlidentifier: string;
  message?: string | null;
  created: string;
}
