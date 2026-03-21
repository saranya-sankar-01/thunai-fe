export interface UserInfo {
  access_token: string;
  refresh_token: string;
  expires_in: string;
  default_tenant_id: string;
  urlidentifier: string;
  profile?: { user_id: string };
  csrfToken: string;
  [key: string]: any;
}
