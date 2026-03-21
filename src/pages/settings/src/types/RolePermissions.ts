export interface Permission{
  display_name: string;
  description: string;
}
export interface RolePermissions {
  permissions: Record<string, Permission>;
  role_mapping: Record<string, string[] | "*">;
}
