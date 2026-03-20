interface IDPDetails {
  entity_id: string;
  idp_metadata: string;
  idp_metadata_link: string | null;
}

export interface SsoConfiguration {
  created: string;
  data: Record<string, string>;
  file: string;
  error_page_uri: string | null;
  id: string;
  idp_details: IDPDetails;
  is_active: boolean;
  is_configured: boolean;
  logout_redirect_uri: string;
  provider_logo: string | null;
  provider_name: string;
  redirect_uri: string;
  type: string;
  updated: string;
  urlidentifier: string;
  logo: string|null;
}
