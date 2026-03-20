export interface VersionInfo {
  version: number;
  created: string;
}

export interface KnowledgeBaseItem {
  available_versions?: VersionInfo[];
  version?: number;
  is_active?: boolean;
  id: string;
  tenant_id?: string;
  title: string | null;
  type: "file" | "web-link" | "video" | "stream" | "image" | "text";
  shared_tenant_ids?: string[] | null;
  synced_from?: string | null;
  user_id?: string;
  file_name?: string;
  added_type?: string;
  url: string;
  publicUrl: string;
  summary: string;
  tags: string[];
  uploadedAt: string;
  uploaded_by: string;
  views?: number;
  insights?: number;
  thumbnail?: string;
  favicon?: string;
  size?: number;
  public_share?: boolean;
  categories?: [];
  original_text: string;
  extracted_text?:string
  result_data: any[];
  hash_data: string;
  aititle: string | null;
  theme: string | null;
  status: "done" | "failed" | "started" | "pending";
  platform: string | null;
  created: string;
  updated: string;
  percentage: number;
  viewed_by: string;
  crawl: any | null;
  crawl_level: any | null;
  text_correction_done: any | null;
  data_description: string;
  links_data?: string;
  ai_instructions?: string;
  category?:string[]
}
