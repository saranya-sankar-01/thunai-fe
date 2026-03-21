export interface PolicyPayload {
    client_id: string;
    is_enabled: boolean;
    orgId: string;
    rules: Record<string, string | boolean | null>[];
}