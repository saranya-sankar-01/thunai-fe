export interface UserMappingPayload {
    access_key_id: string;
    client_id: string;
    created_by: string;
    created_on: string;
    infisigntenantId: string;
    mapped_attributes: Record<string, string | null>[];
    orgId: string;
    tenantUniqueIdentifier: string;
    urlIdentifier: string;
    schema_id: string;
}