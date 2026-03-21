export interface DesignObject {
  body: {
    footers: any[];
    headers: any[];
    id: string;
    rows: any[];
    values: Record<string, any>;
  };
  counters: Record<string, any>;
}

export interface EmailTemplateDetail {
  created?: string;
  html: string;
  id: string;
  is_default?: boolean;
  subject: string;
  template_key: string;
  updated?: string;
  variables?: string[];
  design_object: DesignObject;
}
