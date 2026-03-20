export const ApprovalStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const;
export type ApprovalStatus = typeof ApprovalStatus[keyof typeof ApprovalStatus];

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  meetingCriteria: string;
  contentFormatTemplate: string;
  humanInTheLoop: boolean;
  approvers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  transcript: string;
}

export interface RelatedSource {
  id: string;
  title: string;
  url: string;
  type: 'doc' | 'link';
}

export interface EmailLog {
  timestamp: string;
  recipient: string;
  status: string;
}

export interface SummaryContent {
  summary: string;
  keyTopics: string[];
  actionItems: string[];
  decisions: string[];
  participants: string[];
  problems: string[];
  markdown: string;
}

export interface Summary {
  id: string;
  meetingId: string;
  agentId: string;
  title: string;
  category: string;
  status: ApprovalStatus;
  version: number;
  submittedBy: string;
  submittedAt: string;
  relatedSources: RelatedSource[];
  emailLogs: EmailLog[];
  previousVersions?: SummaryContent[];
  content: SummaryContent;
}

export const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Network Infrastructure', description: 'Systems, VPNs, and hardware', color: '#6366f1' },
  { id: 'c2', name: 'Product Strategy', description: 'Roadmap and feature planning', color: '#10b981' },
  { id: 'c3', name: 'Internal Engineering', description: 'DevOps and DX', color: '#f59e0b' },
  { id: 'c4', name: 'Compliance & Security', description: 'SOC2 and Legal standards', color: '#ef4444' },
  { id: 'c5', name: 'Client Success', description: 'Onboarding and feedback', color: '#0ea5e9' }
];

export const MOCK_AGENTS: Agent[] = [
  {
    id: '1',
    name: 'Engineering Brain Core',
    description: 'Processes technical design docs and stand-ups into categorized knowledge blocks.',
    meetingCriteria: 'Include design reviews, sprint planning, and architecture syncs.',
    contentFormatTemplate: '## Technical Specification\n{summary}\n\n## Actionable Items\n- {action_items}',
    humanInTheLoop: true,
    approvers: ['sriman@entrans.io'],
    createdAt: '20 Dec 2024, 01:54 pm',
    updatedAt: '20 Jan 2025, 08:28 pm'
  },
  {
    id: '2',
    name: 'Product Roadmap Scout',
    description: 'Extracts feature requests and customer pain points from strategy calls.',
    meetingCriteria: 'Include roadmap discussions and feedback sessions.',
    contentFormatTemplate: '## Feature Brief\n{summary}',
    humanInTheLoop: true,
    approvers: ['product@entrans.io'],
    createdAt: '05 Jan 2025, 10:00 am',
    updatedAt: '18 Jan 2025, 04:12 pm'
  },
  {
    id: '3',
    name: 'Security & Compliance Guard',
    description: 'Monitors audit-related meetings for security action items.',
    meetingCriteria: 'Security reviews and SOC2 compliance syncs.',
    contentFormatTemplate: '## Audit Findings\n{summary}',
    humanInTheLoop: true,
    approvers: ['security@entrans.io'],
    createdAt: '12 Jan 2025, 09:00 am',
    updatedAt: '15 Jan 2025, 11:30 am'
  }
];

export const MOCK_MEETINGS: Meeting[] = [
  {
    id: 'm1',
    title: 'Architecture Review: VPN Integration',
    date: '14 Jan 2025',
    duration: '55m',
    transcript: 'Sriman: We need to finalize the GlobalProtect integration.'
  }
];

export const MOCK_SUMMARIES: Summary[] = [
  {
    id: 's1',
    meetingId: 'm1',
    agentId: '1',
    title: 'VPN Client Logic: Version 2.0 Deployment',
    category: 'Network Infrastructure',
    status: ApprovalStatus.PENDING,
    version: 2,
    submittedBy: 'AI Pipeline',
    submittedAt: '15 Jan 2025, 09:17 am',
    relatedSources: [
      { id: 'rs1', title: 'GlobalProtect SDK Docs', url: '#', type: 'doc' },
      { id: 'rs2', title: 'Network Topology V1', url: '#', type: 'link' }
    ],
    emailLogs: [
      { timestamp: '15 Jan, 09:17 am', recipient: 'sriman@entrans.io', status: 'sent' }
    ],
    previousVersions: [
      {
        summary: 'Initial draft.',
        keyTopics: [],
        actionItems: [],
        decisions: [],
        participants: [],
        problems: [],
        markdown: `# Executive Intelligence\nInitial draft focusing only on the VPN client without firewall context.\n\n## Key Topics\n- VPN Client Standards\n- Legacy Auth Protocols\n\n## Decisions\n- Use version 1.0 for testing`
      }
    ],
    content: {
      summary: 'The technical review focused on deploying GlobalProtect VPN clients.',
      keyTopics: ['GlobalProtect SDK', 'Firewall Automation'],
      actionItems: ['Review VPC Peering', 'Update Terraform'],
      decisions: ['Staged rollout in US-West-2'],
      participants: ['Sriman', 'Sam'],
      problems: ['High injection delay'],
      markdown: `# Executive Intelligence\nThe technical review focused on deploying GlobalProtect VPN clients across the engineering subnet. **Key goal**: reduce firewall rule injection latency to under 10s.\n\n## Core Knowledge\n- GlobalProtect SDK Integration\n- Firewall Automation Latency\n- Subnet Topology V2\n\n## Final Decisions\n- Proceed with staged rollout in US-West-2\n- Adopt Tailwind v4 for UI components\n\n## Action Roadmap\n- Review VPC Peering configuration for latency\n- Update terraform scripts to v1.4`
    }
  },
  {
    id: 's2',
    meetingId: 'm2',
    agentId: '2',
    title: 'Product Sync: Dashboard V3 Features',
    category: 'Product Strategy',
    status: ApprovalStatus.PENDING,
    version: 1,
    submittedBy: 'Roadmap Scout',
    submittedAt: '16 Jan 2025, 11:45 am',
    relatedSources: [],
    emailLogs: [],
    content: {
      summary: 'Initial discussion on Dashboard V3 layout.',
      keyTopics: ['Dashboard UX', 'Real-time Feeds'],
      actionItems: ['Finalize Figma mocks'],
      decisions: ['Adopt Tailwind v4 for UI'],
      participants: ['Sarah', 'John'],
      problems: ['Current load times are suboptimal'],
      markdown: `# Executive Summary\nInitial discussion on Dashboard V3 layout. Focus on **Real-time Analytics** and customizable widget panels for enterprise users.\n\n## Feature Requirements\n- Real-time Websocket Feeds\n- Draggable Widget Grid\n- Dark Mode Default\n\n## Key Decisions\n- Adopt Tailwind v4 for UI\n- Deprecate Legacy Chart Library\n\n## Next Steps\n- Finalize Figma mocks\n- Interview 3 power users`
    }
  },
  {
    id: 's3',
    meetingId: 'm3',
    agentId: '3',
    title: 'Quarterly Security Audit Sync',
    category: 'Compliance & Security',
    status: ApprovalStatus.APPROVED,
    version: 1,
    submittedBy: 'Security Guard',
    submittedAt: '10 Jan 2025, 02:00 pm',
    relatedSources: [{ id: 'rs3', title: 'SOC2 Report 2024', url: '#', type: 'doc' }],
    emailLogs: [],
    content: {
      summary: 'Review of quarterly security patches.',
      keyTopics: ['SOC2 Compliance'],
      actionItems: ['Update password policy'],
      decisions: ['Rotate all root API keys'],
      participants: ['Alice', 'Bob'],
      problems: ['Manual key rotation is slow'],
      markdown: `# Audit Summary\nReview of quarterly security patches and access control lists. All systems verified compliant with latest internal policy.\n\n## Compliance Status\n- SOC2 Type II: **Compliant**\n- GDPR: **Compliant**\n\n## Remediation Plan\n- Rotate all root API keys immediately\n- Update password complexity policy`
    }
  },
  {
    id: 's4',
    meetingId: 'm4',
    agentId: '1',
    title: 'Deprecated API Cleanup Session',
    category: 'Internal Engineering',
    status: ApprovalStatus.REJECTED,
    version: 1,
    submittedBy: 'Brain Core',
    submittedAt: '18 Jan 2025, 10:30 am',
    relatedSources: [],
    emailLogs: [],
    content: {
      summary: 'Proposal to remove v1 endpoints.',
      keyTopics: ['API Lifecycle'],
      actionItems: [],
      decisions: ['Maintain v1 until Q3'],
      participants: ['Sriman', 'Team'],
      problems: ['Migration friction'],
      markdown: `# Decommissioning Proposal\nProposal to remove v1 endpoints by EOM. **Rejected** due to legacy customer dependencies still polling these routes.\n\n## Impact Analysis\n- 14 Enterprise clients using v1\n- Estimated MRR risk: $40k\n\n## Decision\n- Maintain v1 until Q3 2025`
    }
  }
];

export const Icons = {
  Brain: ({ className = "w-8 h-8 text-indigo-600" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  Bell: ({ className = "w-8 h-8 text-indigo-600" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  ArrowLeft: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Edit: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Delete: ({ className = "w-4 h-4 text-red-500" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Check: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Refresh: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Filter: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Save: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  ),
  Expand: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  ),
  ChevronDown: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  ChevronRight: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  FileText: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Clock: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};
