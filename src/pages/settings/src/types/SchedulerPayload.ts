export interface SchedulerPayload {
    access_key_id: string;
    client_id: string;
    created_by: string;
    created_on: string;
    infisigntenantId: string;
    orgId: string;
    periodically: Record<string, string | boolean | null>;
    schedulerRules: [];
    schedulerType: string;
    tenantUniqueIdentifier: string;
    urlIdentifier: string;
}