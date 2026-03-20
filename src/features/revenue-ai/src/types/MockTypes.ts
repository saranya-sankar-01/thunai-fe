export interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    role: string;
    platform: string;
    tenants: string;
    domain: string;
    avatar: string;
    engagementScore: number;
    lastInteraction: string;
    tags: string[];
    conversations: Conversation[];
    actionItems: ActionItem[];
    meetings: Meeting[];
    notes: Note[];
    opportunities: Opportunity[];
}

export interface Conversation {
    id: string;
    type: 'email' | 'meeting' | 'chat' | 'call';
    title: string;
    content: string;
    timestamp: string;
    participants: string[];
    summary?: string;
    actionItems?: string[];
}

export interface ActionItem {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    createdFrom: string;
    type: 'email' | 'meeting' | 'manual';
}

export interface Meeting {
    id: string;
    title: string;
    date: string;
    duration: string;
    participants: string[];
    transcript?: string;
    summary: string;
    actionItems: string[];
}

export interface Note {
    id: string;
    title: string;
    content: string;
    timestamp: string;
    author: string;
    tags: string[];
}

export interface Opportunity {
    id: string;
    title: string;
    description: string;
    value: number;
    currency: string;
    stage: 'lead' | 'discovery' | 'qualification' | 'needs-analysis' | 'proposal' | 'negotiation' | 'contract-review' | 'closed-won' | 'closed-lost';
    confidenceScore: number;
    source: string;
    extractedFrom: string;
    createdDate: string;
    expectedCloseDate: string;
    userFeedback?: 'confirmed' | 'rejected' | null;
    feedbackNotes?: string;
    maturityIndicators: string[];
    visibility: 'public' | 'private';
    sourcesVisibility: 'public' | 'private';
    associatedContacts: AssociatedContact[];
    assignedTo?: string;
}

export interface AssociatedContact {
    id: string;
    name: string;
    email: string;
    company: string;
    role: string;
    avatar: string;
    relevanceScore: number;
    lastInteraction: string;
}

export interface Activity {
    id: string;
    type: 'email' | 'meeting' | 'chat' | 'call' | 'note';
    title: string;
    content: string;
    timestamp: string;
    participants: string[];
    summary: string;
    actionItems: string[];
    visibility: 'public' | 'private';
}