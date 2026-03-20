export interface Session {
    unique_id: string;
    title: string;
    created: string;
    updated: string;
}

export interface SavedChat {
    sessions: Session[];
    count: number;
    user_id: string;
    tenant_id: string;
}