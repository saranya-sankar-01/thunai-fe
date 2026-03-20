interface AssociatedEmail {
    name: string;
    email: string;
}

interface ActionItems {
    "Action Item": string;
    Responsible: string;
    Deadline: string;
    "Context/Dependencies": string;
}

export interface Activity {
    updated: string;
    id: string;
    associated_emails: AssociatedEmail[];
    action_items: ActionItems[];
    user_id: string;
    summary: string;
    subject: string;
    source_from: string;
    created: string;
    invited_participants: AssociatedEmail[];
    type: string;
    meeting_name: string;
    source: {
        source: string;
        excerpt: string;
        matched_maturity_indicators_in_source: string[];
        date: string;
        sale_id: string;
        share_id: string;
        owner: AssociatedEmail;
        source_from: string;
    };
    owner: AssociatedEmail;
    user_has_access: boolean;
    already_requested: boolean
}