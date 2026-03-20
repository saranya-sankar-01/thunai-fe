export interface CommonWidget{
    id: string;
    name: string;
    description: string;
    active: boolean;
    agent_type: string | null;
    conversation_count: number;
    created: string;
    interface: string[];
    is_active: boolean;
    paused: boolean;
    updated: string;
    widget_id: string;
}