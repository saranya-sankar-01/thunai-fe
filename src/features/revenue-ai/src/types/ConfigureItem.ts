export interface ConfigureItem {
  tenant_id: string;
  name: string;
  fields: Record<string, unknown>;
  action_fields: Record<string, unknown>;
  widget_id: string;
  created: string;
  updated: string;
  id: string;
}
