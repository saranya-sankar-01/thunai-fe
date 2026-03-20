interface Assignee {
    assignee_user_id: string;
    assignee_name: string;
    assignee_email: string;
}

export interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    organisation: string;
    role: string;
    contactId: string;
    created: string;
    crm_name: string;
    crm_rev_enabled: any[];
    custom_crm_names: any[];
    custom_crm: {
        [key: string]: string;
    };
    custom_fields: Record<string, any>;
    assignee: Assignee;
    designation: string;
    domain: string;
    engagement: string;
    engagement_type: string;
    last_interaction: string;
    portalId: string | null
    tags: any[]
    tenant_id: string;
    updated: string;
    uploaded_by: string;
    user_id: string;
    consent: boolean | null;
    contact_id: string | null;

}

export interface EngagementType {
    high_engagement: number;
    low_engagement: number;
}