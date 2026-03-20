
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import ISTTime from '@/components/shared-components/ISTTime';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckCircle, Loader2, Maximize2, Minimize, RefreshCw, XCircle, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Icons } from './constants';
import { getLocalStorageItem, requestApi } from '../../../Service/MeetingService';

export const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
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
  name?: string;
  description: string;
  meetingCriteria: string;
  contentFormatTemplate: string;
  humanInTheLoop: boolean;
  approvers: string[];
  createdAt: string;
  updatedAt: string;
  tenant_id?: string;
  user_id?: string;
  meeting_criteria: string;
  content_template: string;

  approval_workflow: {
    human_in_loop_enabled: boolean;
    approvers: Record<string, string>;
  };

  status?: string;
  created?: string;
  updated?: string;
}

export interface Meeting {
  id: string;
  content_title: string;
  date: string;
  duration: string;
  transcript: string;
}

export interface RelatedSource {
  id: string;
  content_title: string;
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
export interface RelevantSource {
  source_obj_id: string;
  content_title: string;
  file_name: string | null;
}

export interface EmailMap {
  email_id: string;
  status: boolean;
}

export interface VersionMap {
  version_number: number;
  meeting_record_id: string | null;
}
export interface Summary {
  category?: string;
  id: string;
  tenant_id: string;
  agent_id: string;
  content_title: string;
  sales_reference_id: string;
  status: ApprovalStatus;
  brain_content_format: string;
  submitted_by: string;
  reviewed_by: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  review_comments: string | null;
  created: string;
  updated: string;
  version: number;
  version_map: VersionMap[] | null;
  email_map: EmailMap[];
  relevent_sources: RelevantSource[];
  previousVersions?: SummaryContent[];
}

export interface Thread {
  thread_id: string;
  meeting_list: Summary[];
}

export interface AgentGroup {
  agent_id: string;
  threads: Thread[];
}


const markdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-2xl font-bold mb-4 text-slate-900">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-xl font-semibold mb-3 text-slate-900">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-lg font-medium mb-2 text-slate-900">
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p className="mb-3 text-slate-700 leading-relaxed">
      {children}
    </p>
  ),
  ul: ({ children }: any) => <ul className="list-disc list-outside pl-6 break-words">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal  pl-6 break-words">{children}</ol>,
  li: ({ children }: any) => <li className="mb-1">{children}</li>,
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full border-collapse border border-border">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: any) => (
    <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
                      <td className="border border-border px-2 py-1 whitespace-normal break-words sm:break-normal sm:whitespace-normal break-all">
                        {children}
                      </td>
                    ),
  a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-4">
      {children}
    </blockquote>
  ),
  code: ({ inline, children }: any) =>
    inline ? (
      <code className="bg-slate-100 px-1 py-0.5 rounded text-sm">
        {children}
      </code>
    ) : (
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm mb-4">
        <code>{children}</code>
      </pre>
    ),

};

export const Approvals: React.FC = ({ }) => {
  const [agentGroups, setAgentGroups] = useState<AgentGroup[]>([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ApprovalStatus>(ApprovalStatus.PENDING);
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({ '1': true, '2': true, '3': true });
  const [versionPreviewId, setVersionPreviewId] = useState<string | null>(null);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editBuffer, setEditBuffer] = useState('');

  // Title Edit State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userInfo = getLocalStorageItem("user_info") || {};
  const tenant_id = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 100;
  const { toast } = useToast();
const [brainAgents, setBrainAgents] = useState<Agent[]>([]);
const [isSavingEdit, setIsSavingEdit] = useState(false);
const [categories, setCategories] = useState<Category[]>([]);
const [isCurrentUserAnApprover, setIsCurrentUserAnApprover] = useState(false);
const currentUserId = userInfo?.user_id ||  localStorage.getItem('user_id'); 
const [isRejecting, setIsRejecting] = useState(false);
const [isApproving, setIsApproving] = useState(false);
const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  console.log(setCurrentPage)
  console.log(totalPages)
  const fetchMeetingAgents = async () => {
    try {
      const response = await requestApi("GET", `brain/meeting-agents/${tenant_id}/`, null, 'brainService');
      const result = response;
      if (result.data) {
        setBrainAgents(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch meeting agents:", error);
    }
  };
const isCurrentUserApprover = (currentUserId: string, agentId: string | undefined, meetingAgents: Agent[]): boolean => {
  if (!agentId) {
    return false;
  }
  const agent = meetingAgents.find(agent => agent.id === agentId);

  if (!agent || !agent.approval_workflow || !agent.approval_workflow.human_in_loop_enabled) {
    return false;
  }

  const approvers = agent.approval_workflow.approvers;

  if (approvers === null || typeof approvers !== 'object') {
    return false; // Approvers not defined or not an object/array
  }

  if (Array.isArray(approvers)) {
    return approvers.includes(currentUserId);
  }
  // If it's an object, check if the currentUserId is among the values
  return Object.values(approvers).includes(currentUserId);
};
  const fetchPendingApprovals = async () => {
     const filters = searchTerm
    ? [{ key_name: "content_title", key_value: searchTerm, operator: "==" }]
    : [];
    const payload = {
  "filter":filters,
  "page": {"page_number": currentPage, "size": pageSize}
}
    try {
      const response = await requestApi("POST",`brain/meeting-agent-approvals/${tenant_id}/filter/`,payload,'brainService');

      const result = response;
      if (result.data) {
        setAgentGroups(result.data);
      }
       if (result.total) {
            setTotalPages(Math.ceil(result.total / pageSize));
        }
    } catch (error) {
      console.error("Failed to fetch pending approvals:", error);
    }
  };
    useEffect(() => {
    const loadData = async () => {
      setIsLoading(true); 
      await Promise.all([fetchPendingApprovals(),fetchMeetingAgents()]);
      setIsLoading(false); 
    };
    loadData();
  }, [currentPage]);

  const toggleAgent = (agent_id: string) => {
    setExpandedAgents(prev => ({
      ...prev,
      [agent_id]: !(prev[agent_id] ?? true)
    }));
  };
  
  const allSummaries = useMemo(() => {
    return agentGroups.flatMap(group =>
      group.threads.flatMap(thread => thread.meeting_list)
    );
  }, [agentGroups]);

  const filteredSummaries = useMemo(() => {
    return allSummaries.filter(s =>
      s.status === activeTab &&
      (s.content_title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allSummaries, activeTab, searchTerm]);

  // const selectedSummary = useMemo(() =>
  //   allSummaries.find(s => s.id === selectedSummaryId),
  //   [allSummaries, selectedSummaryId]
  // );

  // New logic: Find all versions within the same thread
  const threadVersions = useMemo(() => {
    if (!selectedSummaryId) return [];
    for (const group of agentGroups) {
      for (const thread of group.threads) {
        if (thread.meeting_list.some(m => m.id === selectedSummaryId)) {
          return [...thread.meeting_list].sort((a, b) => b.version - a.version);
        }
      }
    }
    return [];
  }, [agentGroups, selectedSummaryId]);

  // Determine the document content to display (either the main selection or a historical one from the thread)
  const activeDoc = useMemo(() => {
    if (!selectedSummaryId) return null;
    const doc = threadVersions.find(v => v.id === (versionPreviewId || selectedSummaryId));
    return doc || null;
  }, [threadVersions, selectedSummaryId, versionPreviewId]);

const displayContent = useMemo((): SummaryContent | null => {
  if (!activeDoc) return null;

  return {
    summary: activeDoc.brain_content_format,
    keyTopics: [],
    actionItems: [],
    decisions: [],
    participants: [],
    problems: [],
    markdown: activeDoc.brain_content_format
  };
}, [activeDoc]);

useEffect(() => {
  if (currentUserId && activeDoc?.agent_id) {
    const isApprover = isCurrentUserApprover(currentUserId, activeDoc.agent_id, brainAgents);
    setIsCurrentUserAnApprover(isApprover);
  } else {
    setIsCurrentUserAnApprover(false);
  }
}, [currentUserId, activeDoc, brainAgents]);

  useEffect(() => {
    if (displayContent) {
      const initialContent = displayContent.markdown || `# ${activeDoc?.content_title}\n${displayContent.summary}`;
      setEditBuffer(initialContent);
      setIsEditing(false);
    }
    if (activeDoc) {
      setEditedTitle(activeDoc.content_title);
      setIsEditingTitle(false);
    }
  }, [displayContent, activeDoc]);

  useEffect(() => {
    if (filteredSummaries.length > 0) {
      const isCurrentSelectionInTab = filteredSummaries.some(s => s.id === selectedSummaryId);
      if (!selectedSummaryId || !isCurrentSelectionInTab) {
        setSelectedSummaryId(filteredSummaries[0].id);
        setVersionPreviewId(null);
      }
    } else {
      setSelectedSummaryId(null);
      setVersionPreviewId(null);
    }
  }, [filteredSummaries]);


const handleReject = async (id:string) => {
  setIsRejecting(true);

  try {
    const payload = { review_comments: "Bad",
        brain_content_format: editBuffer
     };

    const response:any = await requestApi(
      "POST",
      `brain/meeting-agent-approvals/${tenant_id}/${id}/reject/`,
      payload,
      "brainService"
    );

     if(response.status=== "error"){
      throw new Error(response.message || "Token expired");
    }
    await fetchPendingApprovals();
      toast({
        title: "Content Rejected",
        description:
          response?.data?.data?.message ||
          response?.data?.message ||
          "The meeting content has been rejected and will not be added to the Brain.",
    })
  } catch (error:any) {
    console.error("Reject API error:", error);

    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "There was an error rejecting the content. Please try again.";

    toast({
      title: "Rejection Failed",
      description: errorMessage,
      variant: "destructive",
    });

  } finally {
    setIsRejecting(false);
  }
};
  const handleApprove = async (id: string) => {
    setIsApproving(true); 
    try {
      const payload = {
        review_comments: "Good",
        brain_content_format: editBuffer
      }
      const response:any = await requestApi('POST', `brain/meeting-agent-approvals/${tenant_id}/${id}/approve/`, payload, 'brainService')
     if(response.status=== "error"){
      throw new Error(response.message || "Token expired");
    }
    await fetchPendingApprovals();

      toast({
        title: "Content Approved",
        description: "Meeting content approved successfully.",
      });

    } catch (error) {
      console.error('Approve API error:', error);
      toast({
        title: "Approval Failed",
        description: "There was an error approving the content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false); 
    }
  };
  const handleSaveEdit = async (id:string) => {
  setIsSavingEdit(true);

  try {
    const payload = {
      brain_content_format: editBuffer,
    };

    const response: any = await requestApi(
      "PATCH",
      `brain/meeting-agent-approvals/${tenant_id}/${id}/`,
      payload,
      "brainService"
    );

    if (response.status === "error") {
      throw new Error(response.message || "Save failed");
    }

    toast({
      title: "Saved Successfully",
      description: "Changes have been saved.",
    });

    setIsEditing(false);

  } catch (error: any) {
    console.error("Save API error:", error);

    toast({
      title: "Save Failed",
      description:
        error?.message || "There was an error saving the content.",
      variant: "destructive",
    });
  } finally {
    setIsSavingEdit(false);
  }
};

const saveTitle = async () => {
    if (!editedTitle.trim() || !activeDoc) return;
    setIsSavingTitle(true);
    try {
      const response: any = await requestApi("PATCH", `brain/meeting-agent-approvals/${tenant_id}/${activeDoc.id}/`, { content_title: editedTitle }, "brainService");
      if (response.status === "error") throw new Error(response.message || "Save failed");
      toast({ title: "Title Updated", description: "Title saved successfully." });
      await fetchPendingApprovals();
      setIsEditingTitle(false);
    } catch (error: any) {
      toast({ title: "Update Failed", description: error?.message || "Unable to save title.", variant: "destructive" });
    } finally {
      setIsSavingTitle(false);
    }
  };

  const getCategory = async () => {
  try {
    const response = await requestApi(
      "GET",
      `brain/knowledge-category/categories/${tenant_id ||localStorage.getItem("tenant_id") }/`,
      null,
      "brainService"
    );

    const result = response
    console.log(result);
    setCategories(result.data);
  } catch (error: any) {
    console.error("Error fetching categories:", error);

    toast({
      title: "Error",
      description:
        error.response?.data?.message || error.response?.data?.detail ||
        error.response?.data || error?.response?.message ||
        "Failed to fetch categories. Please try again.",
      variant: "destructive",
    });
  }
};

const updateCategory = async (id: string, newCat: string) => {
  try {
    setAgentGroups(prevGroups => 
      prevGroups.map(group => ({
        ...group,
        threads: group.threads.map(thread => ({
          ...thread,
          meeting_list: thread.meeting_list.map(summary => 
            summary.id === id ? { ...summary, category: newCat } : summary
          )
        }))
      }))
    );
  } catch (error) {
    console.error("Failed to update category:", error);
  } finally {
    setIsDropdownOpen(false);
  }
};


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
 useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
     await fetchPendingApprovals();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);
  useEffect(() => {
    const loadCategories = async () => {
      await getCategory();
    };
    loadCategories();
  }, []);
  const handleRefresh = async () => {  
    setIsLoading(true);     
  await fetchPendingApprovals();
    setIsLoading(false); 
};
  const isHistoricalVersion = versionPreviewId !== null && versionPreviewId !== selectedSummaryId;

  const canEdit = activeDoc?.status === ApprovalStatus.PENDING  && 
                isCurrentUserAnApprover;
const capitalizeFirst = (text = "") =>
  text.charAt(0).toUpperCase() + text.slice(1);
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden ">
      {/* Sidebar */}
      <aside className="w-[340px] bg-white border-r border-slate-200 flex flex-col shrink-0 z-20">
        <header className="px-6 py-6 border-b border-slate-100">
          <button onClick={() => navigate('/meeting-feed/agent')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors group">
            <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Back</span>
          </button>
          
          <div className="bg-slate-100 p-1 rounded-xl mb-6 flex">
            {[ApprovalStatus.PENDING, ApprovalStatus.APPROVED, ApprovalStatus.REJECTED].map(status => (
              <button 
                key={status}
                onClick={() => { setActiveTab(status); }}
                className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${activeTab === status ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
              {status && status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
<div className="flex items-center gap-2 w-full">
  {/* Search */}
  <div className="relative group flex-1">
    <Icons.Filter className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-slate-400
                             group-focus-within:text-blue-500
                             transition-colors" />

    <input 
      type="text" 
      placeholder="Search file name..." 
      className="w-full pl-10 pr-4 py-3 bg-slate-50
                 border border-slate-200 rounded-xl
                 text-sm font-medium outline-none
                 focus:border-blue-500 focus:bg-white
                 transition-all placeholder:text-slate-400"
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
    />
  </div>

  {/* Refresh */}
  <button
    onClick={handleRefresh}
    disabled={isLoading}
    title="Refresh"
    className={`h-[46px] w-[46px] flex items-center justify-center
                rounded-xl border transition-colors
                ${
                  isLoading
                    ? "cursor-not-allowed border-slate-200 text-slate-400"
                    : "border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
  >
    <RefreshCw
      className={`w-4 h-4 `}
    />
  </button>
</div>

        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
           {isLoading ? (
    // Skeleton Loader
    Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="px-4 py-4 animate-pulse border-b border-slate-200 last:border-0">
        <div className="h-3 bg-slate-200 rounded w-3/4 mb-3"></div>
        <div className="h-2 bg-slate-200 rounded w-1/2"></div>
      </div>
    ))
) : agentGroups.length === 0 ? (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
      <Icons.FileText className="w-10 h-10 text-slate-300 mb-3" />
      <p className="text-sm font-semibold">No data found</p>
      
    </div>
) : (
 agentGroups.map(group => {
    const agent = brainAgents.find(a => a.id === group.agent_id);
    const isExpanded = expandedAgents[group.agent_id] ?? true;
    
    // Calculate total files for this agent in the current tab
    const agentTabCount = group.threads.reduce((acc, t) => 
        acc + t.meeting_list.filter(s => s.status === activeTab).length, 0
    );

    return (
        <div key={group.agent_id} className="mb-2">
            <button
                onClick={() => toggleAgent(group.agent_id)}
                className="w-full flex items-center justify-between px-3 py-3 text-left hover:bg-slate-50 rounded-lg group transition-colors"
            >
                <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
                    {agent?.name || 'Unknown Agent'}
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {agentTabCount}
                    </span>
                    <Icons.ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {isExpanded && (
                <div className="mt-1 space-y-2 pl-2">
                    {agentTabCount === 0 ? (
                         <p className="px-4 py-2 text-xs text-slate-400 italic">
                  No files under this agent
                </p>
                    ) : (
                        group.threads.map(thread => {
                            const threadSummaries = thread.meeting_list.filter(s => s.status === activeTab);
                            if (threadSummaries.length === 0) return null;

                            return (
                                <div key={thread.thread_id}>
                                    <div className="mt-1 space-y-1">
                                        {threadSummaries.map(summary => (
                                            <button 
                        key={summary.id}
                        onClick={() => { setSelectedSummaryId(summary.id); setVersionPreviewId(null); }}
                        className={`w-full px-4 py-3 text-left relative group rounded-lg transition-all ${selectedSummaryId === summary.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}
                      >
                        {selectedSummaryId === summary.id && (
                          <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full"></div>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`text-[14px] font-semibold truncate mb-0.5 ${selectedSummaryId === summary.id ? 'text-blue-700' : 'text-slate-700'}`}>{summary.content_title}</h3>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">v{summary.version}</span>
                        </div>
                        <p className="text-[9px] text-slate-400"><ISTTime utcString={summary.submitted_at} /></p>
                      </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                  </div>
                )}
              </div>
            );
          }))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 ">
        {activeDoc && displayContent ? (
          <div className="flex flex-col h-full">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex h-full">
                {/* Document View */}
                <div className="flex-1 px-6 py-8 min-w-0">
                 <div
  className={`w-full mx-auto ${
    isFullScreen ? "space-y-0" : "space-y-8"
  }`}
>

                    
                    {/* Header Section */}
                    <div>
                       {/* Version Banner */}
                       {/* {isHistoricalVersion && (
                         <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
                           <Icons.Clock className="w-5 h-5 text-amber-600" />
                           <div>
                             <p className="text-xs font-black uppercase tracking-widest text-amber-600">Viewing Saved Snapshot</p>
                             <p className="text-xs text-amber-800">You are viewing version v{activeDoc.version}.0. You can edit this version if its status is pending.</p>
                           </div>
                         </div>
                       )} */}

                      <div className="flex items-center gap-3 mb-6 group">
                        {isEditingTitle ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input 
                              type="text" 
                              className="text-base md:text-normal lg:text-2xl font-extrabold text-slate-900 border-b-2 border-blue-500 outline-none bg-transparent flex-1"
                              value={editedTitle}
                              onChange={(e) => setEditedTitle(e.target.value)}
                              autoFocus
                            />
                            <Button size="icon" variant="ghost" className="text-green-600" onClick={saveTitle} disabled={isSavingTitle}>
                              {isSavingTitle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="text-red-600" onClick={() => { setIsEditingTitle(false); setEditedTitle(activeDoc.content_title); }}>
                              <X className="w-5 h-5" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <h1 className="text-base font-extrabold text-slate-900 leading-tight md:text-normal lg:text-2xl">{activeDoc.content_title}</h1>
                            {canEdit && (
                              <Button size="icon" variant="ghost" className="" onClick={() => setIsEditingTitle(true)}>
                                <Edit2 className="w-4 h-4 text-slate-400" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 pb-6 border-b border-slate-200">
                        {/* Custom Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                          <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm transition-all group hover:border-blue-200`}
                          >
                            <span className="text-sm font-bold text-slate-800">
                              <span className="text-slate-400 font-medium mr-2">Category:</span>
                              {activeDoc.category || 'Select category'}
                            </span>
                            <Icons.ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {isDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 overflow-auto">
                              {categories.map(c => (
                                <button
                                  key={c.id}
                                  onClick={() => updateCategory(activeDoc.id, c.name)}
                                  className="w-full text-left px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                >
                                  {c.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="h-8 w-px bg-slate-200"></div>

                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                             {isHistoricalVersion ? 'SAVED SNAPSHOT' : 'CURRENT VERSION'}
                          </span>
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            v{activeDoc.version}.0 
                            <span className="text-slate-300">•</span> 
                            {<ISTTime utcString={activeDoc.submitted_at} />}
                          </span>
                        </div>
                      </div>
                    </div>

                 {/* Single Document Card */}
<section
  className={`
    bg-white rounded-2xl border border-slate-100 shadow-sm
    flex flex-col transition-all duration-300
    ${isFullScreen
      ? "fixed inset-0 z-50 p-4 sm:p-6 lg:p-10 m-auto"
      : `
        relative p-4 sm:p-6 lg:p-10
        ${(isCurrentUserAnApprover || activeDoc?.status !== ApprovalStatus.PENDING)
          ? "h-[calc(100vh-265px)]"
          : "h-[calc(100vh-200px)]"
        }
      `
    }
  `}
>



  {/* Edit / Read-only Button */}
<div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex items-center gap-2 ">
  {/* Fullscreen Toggle */}
  <Button
  variant="outline"
    onClick={() => setIsFullScreen(prev => !prev)}
    className="flex items-center justify-center px-3 py-2 rounded-lg
               bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900
               transition-colors"
    title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
  >
    {isFullScreen ? (
      <Minimize className="w-4 h-4" />
    ) : (
      <Maximize2 className="w-4 h-4" />
    )}
  </Button>

  {/* Cancel Button - Only shows when editing */}
  {isEditing && (
    <Button
  variant="outline"
      onClick={() => {
        setIsEditing(false);
        // Reset buffer to original content
        const initialContent = displayContent?.markdown || `# ${activeDoc?.content_title}\n${displayContent?.summary}`;
        setEditBuffer(initialContent);
      }}
      className="flex items-center gap-2 px-4 py-2 rounded-lg
                 bg-white border border-slate-200 text-slate-500 
                 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider hover:text-slate-900
                 transition-colors"
    >
      Cancel
    </Button>
  )}

  {/* Edit / Save Button */}
  {canEdit ? (
    <Button
  variant="outline"
      disabled={isSavingEdit}
      onClick={() => {
        if (isEditing) {
          handleSaveEdit(activeDoc.id);
        } else {
          setIsEditing(true);
        }
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg
                  font-bold text-xs uppercase tracking-wider
                  transition-colors
                  ${
                    isEditing
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }
                  ${isSavingEdit ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {isEditing ? (
        isSavingEdit ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Icons.Save className="w-4 h-4" />
            Save Changes
          </>
        )
      ) : (
        <>
          <Icons.Edit className="w-4 h-4" />
          Edit Content
        </>
      )}
    </Button>
  ) : (
    <div
      className="flex items-center gap-2 px-4 py-3 rounded-lg
                 bg-slate-50 text-slate-400
                 font-bold text-xs uppercase tracking-wider
                 cursor-not-allowed"
    >
      <Icons.FileText className="w-4 h-4" />
      Read Only
    </div>
  )}
</div>


  {/* Scrollable Content */}
  <div className="flex-1 overflow-y-auto overflow-x-hidden mt-10 min-h-0 show-scrollbar">
    {isEditing ? (
      <textarea
        className="w-full h-full
                   border-0 outline-none resize-none
                   bg-transparent font-mono
                   text-base leading-relaxed text-slate-800
                   break-words whitespace-pre-wrap "
        value={editBuffer}
        onChange={(e) => setEditBuffer(e.target.value)}
        placeholder="# Start typing your markdown..."
      />
    ) : (
<div className="prose prose-slate max-w-none break-words">
  <div className="prose prose-slate max-w-none">
    <ReactMarkdown remarkPlugins={[remarkGfm]}   components={markdownComponents}>
      {editBuffer ||
        displayContent.markdown ||
        displayContent.summary}
    </ReactMarkdown>
  </div>
</div>
    )}
  </div>
</section>


                  </div>
                </div>

                {/* Right Metadata Sidebar */}
                <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col gap-8 shrink-0 h-full overflow-y-auto">
                  
                  {/* Versions */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Version History</h4>
                 {/* Versions History Sidebar Section */}
<div className="space-y-3">
  {threadVersions.map((v) => (
    <button 
      key={v.id}
      onClick={() => setVersionPreviewId(v.id === selectedSummaryId ? null : v.id)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border relative ${
        activeDoc.id === v.id
          ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
          : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
      }`}
    >
       <div className={`p-2 rounded-lg ${activeDoc.id === v.id ? 'bg-white/10' : 'bg-slate-100'}`}>
          <Icons.FileText className="w-4 h-4" />
        </div>
       <div className="text-left">
         <p className="text-xs font-bold">{v.id === selectedSummaryId ? 'Main Record' : 'Historical Snapshot'}</p>
         <p className="text-[10px]">v{v.version}.0 • {v.status}</p>
       </div>
       {activeDoc.id === v.id && (
          <div className="absolute right-3 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
       )}
    </button>
  ))}
</div>



                  </div>

                   {/* Distribution */}
                   <div className="pt-8 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Distribution Logs</h4>
                    <div className="space-y-3">
                      {activeDoc.email_map?.length > 0 ? activeDoc.email_map.map((log, i) => (
                        <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                          <div>
                             <p className="text-[10px] font-bold text-slate-700">{log.email_id}</p>
                          </div>
                        </div>
                      )) : (
                         <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center">
                           <p className="text-xs text-slate-600">No logs available</p>
                         </div>
                      )}
                    </div>
                  </div>
{/* People Involved */}
<div className="space-y-3">
 {activeDoc.submitted_by && (
  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
    <p className="text-[10px] uppercase tracking-widest font-black text-slate-600 mb-1">
      Submitted By
    </p>
    <p className="text-sm font-semibold text-slate-700">
      {capitalizeFirst(activeDoc.submitted_by)}
      {activeDoc.submitted_at && (
        <span className="text-[10px] text-slate-600 font-normal ml-2">
          • {<ISTTime utcString={activeDoc.submitted_at} />}
        </span>
      )}
    </p>
  </div>
)}

{/* Reviewed By */}
{activeDoc.reviewed_by && (
  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
    <p className="text-[10px] uppercase tracking-widest font-black text-slate-600 mb-1">
      Reviewed By
    </p>
    <p className="text-sm font-semibold text-slate-700">
      {capitalizeFirst(activeDoc.reviewed_by)}
      {activeDoc.reviewed_at && (
        <span className="text-[10px] text-slate-600 font-normal ml-2">
                 • {<ISTTime utcString={activeDoc.reviewed_at} />}

        </span>
      )}
    </p>
  </div>
)}


 
</div>


                  {/* Sources */}
                <div>
  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">
    Source Materials
  </h4>

  <div className="space-y-2">
    {activeDoc.relevent_sources?.length > 0 ? (
      activeDoc.relevent_sources.map(source => (
        <div
          key={source.source_obj_id}
  //          onClick={() =>
  //   window.open(
  //     `https://brain.thunai.ai/view/${source.source_obj_id}`,
  //     "_blank",
  //     "noopener,noreferrer"
  //   )
  // }
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100 group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Icons.FileText className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-700 truncate">
              {source.content_title || "Untitled source"}
            </p>
          </div>
        </div>
      ))
    ) : (
      <p className="text-xs text-slate-600 italic px-2">
        No source materials available
      </p>
    )}
  </div>
</div>


                </div>
              </div>
            </div>

            {/* Action Footer */}
            {activeDoc.status === ApprovalStatus.PENDING &&   isCurrentUserAnApprover &&(
              <div className="px-12 py-3 bg-white border-t border-slate-200 flex items-center justify-end gap-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10 relative">
                <button
  disabled={isRejecting || isSavingEdit || isApproving}
  onClick={() => handleReject(activeDoc.id)}
  className={`flex items-center gap-2 px-6 py-3 rounded-xl
              font-bold text-xs uppercase tracking-widest
              transition-colors
              ${
                isRejecting || isSavingEdit || isApproving
                  ? "cursor-not-allowed text-slate-400 bg-slate-100"
                  : "text-slate-500 hover:text-red-600 hover:bg-red-50"
              }`}
>
  <span className="flex items-center justify-center w-4 h-4">
    {isRejecting ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <XCircle className="h-4 w-4" />
    )}
  </span>

  <span>
    {isRejecting ? "Rejecting..." : "Reject"}
  </span>
</button>

                 <button 
                 disabled={isApproving || isSavingEdit || isRejecting}
                   onClick={() => handleApprove(activeDoc.id)}
                   className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 uppercase tracking-widest flex items-center gap-2"
                 >
                   {isApproving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {isApproving ? "Approving..." :  "Confirm & Publish" }
                   
                 </button>
              </div>
            )}
            
            {(activeDoc.status !== ApprovalStatus.PENDING) && (
               <div className="px-12 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Read Only Mode ({activeDoc.status})</p>
               </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <div className="w-32 h-32 bg-white rounded-full border border-slate-100 shadow-sm flex items-center justify-center mb-6">
               <Icons.Brain className="w-12 h-12 text-slate-200" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">No Document Selected</h2>
            <p className="text-slate-500 text-sm mt-2">Choose a file from the sidebar to begin review</p>
          </div>
        )}
      </main>
    </div>
  );
};
