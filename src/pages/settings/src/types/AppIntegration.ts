export interface AppIntegration {
  id: string;
  integrationType: string;
  created: string;
  updated: string;
  user_count?: number;
  is_auto_revoke?: boolean;
  last_synced_date?: string;
  configuration: IntegrationConfiguration;
}

export interface IntegrationConfiguration {
  // Common fields (found in multiple types)
  default_permission?: string;
  group_permission?: string;
  selected_group?: string | null;

  // Azure specific
  client_id?: string;
  client_secret?: string;
  tenant_id?: string;

  // AWS Cognito specific
  aws_config?: {
    access_key_id?: string;
    secret_access_key?: string;
    region?: string;
    user_pool_id?: string;
  };

  // Google/Okta/Auth0/LDAP specific (Placeholder for future)
  domain?: string;
  api_token?: string;
  
  // Allow any other properties for future apps
  [key: string]: any;
}
