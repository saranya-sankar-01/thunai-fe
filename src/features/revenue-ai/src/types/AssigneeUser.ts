export interface AssigneeUser {
    id: string;
    user_id: string;
    username: string;
    emailid: string;
    default_tenant_id: string;
    allowed_tenants: string[];
    unifed_tenant_id: string;
    role: string;
    uploaded_by: string;
    created: string;
    updated: string;
    is_active?: boolean
}