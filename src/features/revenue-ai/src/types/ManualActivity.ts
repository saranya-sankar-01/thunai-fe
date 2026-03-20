interface Participants {
    name: string;
    email: string;
}

export interface ManualActivity {
    tenant_id: string;
    user_id: string;
    email: string;
    type: string;
    created_from: string;
    activity_type: string;
    status_key: string;
    title: string;
    notes: string;
    participants: Participants[];
    activity_date: string;
    opportunity_id: string;
    created: string;
    updated: string;
    action_items_status: string;
    id: string;
}