export interface CanvasFile {
    id: string;
    user_id: string;
    file_name: string;
    file_hash: string;
    cloud_storage_file_path: string;
    tenant_id: string;
    created: string;
    updated: string;
    logs: string;
    percentage: number;
    status: string;
    embeddings_generated: string;
    extracted_text: string;
  }

  export interface CanvasDialogProps {
    widgetId?: string;
  }
