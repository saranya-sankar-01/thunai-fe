import { Activity } from "../types/MockTypes";

export const mockActivities: Activity[] = [
    {
        id: '1',
        type: 'email',
        title: 'Q1 Project Update',
        content: 'Clara replied with feedback on the updated timeline and asked for a revised delivery date.',
        timestamp: 'April 15, 2025',
        participants: ['Clara Johnson'],
        summary: 'Discussed project milestones and delivery timeline',
        actionItems: ['Schedule follow-up meeting', 'Send revised timeline'],
        visibility: 'public'
    },
    {
        id: '2',
        type: 'meeting',
        title: 'Weekly Sync',
        content: 'Discussed project milestones and blockers. Jane confirmed phase 2 kickoff on Monday',
        timestamp: 'April 13, 2025',
        participants: ['Clara Johnson', 'Jane Smith'],
        summary: 'Weekly project sync meeting',
        actionItems: ['Finalize phase 2 requirements', 'Update project board'],
        visibility: 'private'
    },
    {
        id: '3',
        type: 'chat',
        title: 'Sales Agent Chat',
        content: "Clara: Let's finalize the proposal by Friday.",
        timestamp: 'April 11, 2025',
        participants: ['Clara Johnson'],
        summary: 'Quick discussion about proposal timeline',
        actionItems: ['Complete proposal draft'],
        visibility: 'public'
    },
    {
        id: '4',
        type: 'call',
        title: 'CRM Agent Call',
        content: 'Call Summary: Jane left a voice message confirming her availability for next week\'s workshop.',
        timestamp: 'April 11, 2025',
        participants: ['Jane Smith'],
        summary: 'Workshop availability confirmation',
        actionItems: ['Send workshop agenda'],
        visibility: 'private'
    }
];