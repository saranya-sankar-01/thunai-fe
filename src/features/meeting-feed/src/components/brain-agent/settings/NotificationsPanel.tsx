import { useState, useEffect } from "react";
import { Card, CardContent,  CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, FileText, User, History, Loader2, UserCheck, Search, RefreshCw } from "lucide-react"; // Import Loader2 for loading spinner
import ApprovalDialog from "./ApprovalDialog";
import {getLocalStorageItem, requestApi } from "../../../Service/MeetingService";
import ISTTime from "@/components/shared-components/ISTTime";
import { AgentPagination } from "@/components/shared-components/pagination";
import { Input } from "@/components/ui/input";


interface PendingApproval {
  id: string;
  agent_id?:string
  content_title: string;
  meeting_obj_id: string;
  submitted_by: string;
  submitted_at: string;
  brain_content_format: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by?: string;
  reviewed_at?: string;
  review_comments?: string;
}

interface MeetingAgent {
  id: string;
  tenant_id: string;
  user_id: string;
  name: string;
  description: string;
  meeting_criteria: string;
  content_template: string;
  approval_workflow: {
    human_in_loop_enabled: boolean;
    approvers: { [email: string]: string } | string[]; // Can be an object mapping email to user ID, or an array of emails/user IDs
  };
  status: string;
  created: string;
  updated: string;
}

// Helper function to determine if the current user is an approver for a given agent
const isCurrentUserApprover = (currentUserId: string, agentId: string | undefined, meetingAgents: MeetingAgent[]): boolean => {
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




const NotificationsPanel = () => {
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  // const [reviewedApprovals, setReviewedApprovals] = useState<PendingApproval[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  // const [isAuditLoading, setIsAuditLoading] = useState(false);
  const [meetingAgents, setMeetingAgents] = useState<MeetingAgent[]>([]); // New state for meeting agents
  const [isCurrentUserAnApprover, setIsCurrentUserAnApprover] = useState(false); // New state to control button visibility
  const userInfo = getLocalStorageItem("user_info") || {};
  const tenant_id = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");
  const currentUserId = userInfo?.user_id; // Get current user ID once
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
   const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 10;

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
        const fetchedApprovals: PendingApproval[] = result.data;
        setPendingApprovals(fetchedApprovals);
      }
       if (result.total) {
            setTotalPages(Math.ceil(result.total / pageSize));
        }
    } catch (error) {
      console.error("Failed to fetch pending approvals:", error);
    }
  };
 useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true)
     await fetchPendingApprovals();
      setIsLoading(false)

    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);
  // const fetchAuditLogs = async () => {
  //   try {
  //     const response = await requestApi("GET",`brain/meeting-agent-approvals/${tenant_id}/audit/`,null,'brainService');
  //     const result = response.data;
  //     if (response.data) {
  //       const fetchedAuditLogs: PendingApproval[] = result.data;
  //       setReviewedApprovals(fetchedAuditLogs);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch audit logs:", error);
  //   }
  // };

  const fetchMeetingAgents = async () => {
    try {
      const response = await requestApi("GET", `brain/meeting-agents/${tenant_id}/`, null, 'brainService');
      const result = response;
      if (result.data) {
        setMeetingAgents(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch meeting agents:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true); 
      await Promise.all([fetchPendingApprovals(), fetchMeetingAgents()]);
      setIsLoading(false); 
    };
    loadData();
  }, [currentPage]);

  const handleApprove = (id: string) => {
    console.log(id)
    setSelectedApproval(null);
    // fetchAuditLogs();
    fetchPendingApprovals();
  };

  const handleReject = (id: string) => {
    console.log(id)
    setSelectedApproval(null);
    // fetchAuditLogs();
    fetchPendingApprovals();
  };
const handleEdit = () =>{
  //  fetchAuditLogs();
    fetchPendingApprovals();
}
const handleRefresh = async () => {  
    setIsLoading(true);     
  await fetchPendingApprovals();
    setIsLoading(false); 
};

  const handleReviewClick = (approval: PendingApproval) => {
    setSelectedApproval(approval);
 
    if (currentUserId && approval.agent_id) {
      const isApprover = isCurrentUserApprover(currentUserId, approval.agent_id, meetingAgents);
      setIsCurrentUserAnApprover(isApprover);
    } else {
      setIsCurrentUserAnApprover(false);
    }
  };

  const ApprovalCard = ({ approval, isCurrentUserAnApproverForThisItem }: { approval: PendingApproval, isCurrentUserAnApproverForThisItem: boolean }) => (
    <Card
      className={`border transition-all hover:shadow-md ${
        approval.status === "approved"
          ? "border-success/30 bg-success/5"
          : approval.status === "rejected"
          ? "border-destructive/30 bg-destructive/5"
          : "border-border hover:border-primary/30"
      }`}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground flex-1">{approval.content_title}</h3>            
{isCurrentUserAnApproverForThisItem && ( 
  <div title="You are an approver">
    <UserCheck className="h-4 w-4 text-blue-500 ml-1" />
  </div>
)}

              {approval.status === "pending" && (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              )}
              {approval.status === "approved" && (
                <Badge className="bg-success text-white hover:bg-success/90">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approved
                </Badge>
              )}
              {approval.status === "rejected" && (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Rejected
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {approval.submitted_by}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
             <ISTTime utcString={approval.submitted_at}/>
              </div>
            </div>

            {approval.reviewed_by && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 w-fit">
                <History className="h-3 w-3" />
                Reviewed by {approval.reviewed_by} at <ISTTime utcString={approval.reviewed_at || ""}/>
                {approval.review_comments && ` - "${approval.review_comments}"`}
              </div>
            )}
          </div>

          {approval.status === "pending" && (
            <Button
              size="sm"
              onClick={() => handleReviewClick(approval)}
              className="whitespace-nowrap"
            >
              Review
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 mt-36">
<div className="fixed top-[72px] left-0 right-0 z-20 bg-background">
  <div className="container mx-auto px-4 py-4 pt-7">
    <div className="flex items-center gap-3">
      
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Refresh Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleRefresh}
        disabled={isLoading}
        className="h-12 w-12"
      >
        <RefreshCw
          className={`h-5 w-5 ${
            isLoading ? "animate-spin" : ""
          }`}
        />
      </Button>

    </div>
  </div>
</div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {/* <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Review and approve content before adding to the Brain</CardDescription> */}
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {pendingApprovals.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? ( // Show loading indicator
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 text-primary mx-auto mb-3 animate-spin" />
              <p className="text-muted-foreground">Loading approvals...</p>
            </div>
          ) : pendingApprovals.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No Data Found</p>
            </div>
          ) : (
            <>
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  isCurrentUserAnApproverForThisItem={currentUserId ? isCurrentUserApprover(currentUserId, approval.agent_id, meetingAgents) : false}
                />
              ))}
            </div>
             <div className="flex justify-center mt-6">
    <AgentPagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  </div></>
          )}

        </CardContent>
      </Card>
 
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Audit Log
            </CardTitle>
            <CardDescription>History of reviewed approvals</CardDescription>
          </CardHeader>
          <CardContent>
            {isAuditLoading ? (
      // SHOW LOADER
      <div className="text-center py-12">
        <Loader2 className="h-12 w-12 text-primary mx-auto mb-3 animate-spin" />
        <p className="text-muted-foreground">Loading audit logs...</p>
      </div>
    ) : reviewedApprovals.length === 0 ? (
      // SHOW NO DATA
      <div className="text-center py-12">
        <History className="h-12 w-12 text-muted mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground">No audit logs available</p>
      </div>
    ) : (
      // SHOW LIST
      <div className="space-y-4">
        {reviewedApprovals.map((approval) => (
          <ApprovalCard
            key={approval.id}
            approval={approval}
            isCurrentUserAnApproverForThisItem={currentUserId ? isCurrentUserApprover(currentUserId, approval.agent_id, meetingAgents) : false}
          />
        ))}
      </div>
    )}

          </CardContent>
        </Card> */}
     

      {selectedApproval && (
        <ApprovalDialog
          approval={selectedApproval}
          onApprove={() => handleApprove(selectedApproval.id)}
          onReject={() => handleReject(selectedApproval.id)}
          onClose={() => setSelectedApproval(null)}
          canApproveReject={isCurrentUserAnApprover} // Pass the determined approval status
          onEdit={() => handleEdit()}
        />
      )}
    </div >
  );
};

export default NotificationsPanel;
