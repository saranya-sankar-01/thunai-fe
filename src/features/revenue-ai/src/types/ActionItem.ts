interface Comment {
    comment: string;
    created: string;
    email: string;
    id: string;
    name: string;
}

export interface ActionItem {
    "Action Item": string;
    "Context/Dependencies": string;
    Deadline: string;
    Responsible: string;
    action_item: string;
    context_dependencies: string;
    created: string;
    deadline: string;
    responsible: string;
    meeting_name: string;
    reference_id: string;
    source_from: string;
    status: string;
    responsible_user_id: string;
    comments: Comment[];
}