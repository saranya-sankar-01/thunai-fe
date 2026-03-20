import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, FileText, User, Edit, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getLocalStorageItem , requestApi } from "../../../Service/MeetingService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Input } from "@/components/ui/input";
interface ApprovalDialogProps {
  approval: {
    id: string;
    content_title: string;
    meeting_obj_id: string;
    submitted_by: string;
    submitted_at: string;
    brain_content_format: string;
  };
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
  onEdit: () => void;
  canApproveReject: boolean; // New prop to control button visibility
}

const ApprovalDialog = ({ approval, onApprove, onReject, onClose,onEdit,canApproveReject }: ApprovalDialogProps) => {
  const { toast } = useToast();
  const [editedContent, setEditedContent] = useState(approval.brain_content_format);
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");
  const [isApproving, setIsApproving] = useState(false); // New state for approve loading
  const [isRejecting, setIsRejecting] = useState(false); // New state for reject loading
  const userInfo = getLocalStorageItem("user_info") || {};
  const tenant_id = userInfo?.default_tenant_id  || localStorage.getItem("tenant_id");
  const [editedTitle, setEditedTitle] = useState(approval.content_title);
const [isEditingTitle, setIsEditingTitle] = useState(false);
const [isSavingTitle, setIsSavingTitle] = useState(false);
const [isSaving, setIsSaving] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true); // Set loading to true
    try {
      const payload = {
        review_comments: "Good",
        brain_content_format: editedContent
      }
      const response:any = await requestApi('POST', `brain/meeting-agent-approvals/${tenant_id}/${approval.id}/approve/`, payload, 'brainService')
     if(response.status=== "error"){
      throw new Error(response.message || "Token expired");
    }
      onApprove();
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
      setIsApproving(false); // Set loading to false
    }
  };

const handleReject = async () => {
  setIsRejecting(true);

  try {
    const payload = { review_comments: "Bad",
        brain_content_format: editedContent
     };

    const response:any = await requestApi(
      "POST",
      `brain/meeting-agent-approvals/${tenant_id}/${approval.id}/reject/`,
      payload,
      "brainService"
    );

     if(response.status=== "error"){
      throw new Error(response.message || "Token expired");
    }
      onReject();

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

const handleSave = async () => {
  setIsSaving(true);

  try {
    const payload = {
      brain_content_format: editedContent,
    };

    const response: any = await requestApi(
      "PATCH",
      `brain/meeting-agent-approvals/${tenant_id}/${approval.id}/`,
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

    setActiveTab("preview");
  onEdit()

  } catch (error: any) {
    console.error("Save API error:", error);

    toast({
      title: "Save Failed",
      description:
        error?.message || "There was an error saving the content.",
      variant: "destructive",
    });
  } finally {
    setIsSaving(false);
  }
};

const saveTitle = async () => {
  if (!editedTitle.trim()) return;
  setIsSavingTitle(true);

  try {
    const payload = {
      content_title: editedTitle,
    };

    const response: any = await requestApi(
      "PATCH",
      `brain/meeting-agent-approvals/${tenant_id}/${approval.id}/`,
      payload,
      "brainService"
    );

    if (response.status === "error") {
      throw new Error(response.message || "Save failed");
    }

    toast({
      title: "Title Updated",
      description: "Title saved successfully.",
    });
  onEdit()
    setIsEditingTitle(false);

  } catch (error: any) {
    console.error("Title save error:", error);

    toast({
      title: "Update Failed",
      description: error?.message || "Unable to save title.",
      variant: "destructive",
    });
  } finally {
    setIsSavingTitle(false);
  }
};



  // Format content sections for better display
const markdownComponents = {
  h2: ({ children }: any) => (
    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
      <span className="h-1 w-1 rounded-full bg-primary" />
      {children}
    </h3>
  ),

  p: ({ children }: any) => (
    <p className="text-sm text-muted-foreground mb-2">
      {children}
    </p>
  ),

  li: ({ children }: any) => (
    <li className="flex items-start gap-2 text-sm text-muted-foreground">
      <span className="">•</span>
      <span>{children}</span>
    </li>
  ),

  ul: ({ children }: any) => (
    <ul className="ml-3 space-y-2 mb-4">
      {children}
    </ul>
  ),
};

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Review Meeting Content
          </DialogTitle>
          <DialogDescription>
            Review and edit the Brain-formatted content before approving
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
<div className="flex items-center gap-2 mb-3">
  {isEditingTitle ? (
    <>
      <Input
        value={editedTitle}
        autoFocus
        disabled={isSavingTitle}
        onChange={(e) => setEditedTitle(e.target.value)}
        className="text-lg font-semibold"
      />

      <Button
        size="icon"
        variant="ghost"
        onClick={saveTitle}
        disabled={isSavingTitle}
        title="Save"
        className="focus:outline-none focus:ring-0 hover:bg-transparent focus:bg-transparent"
      >
        {isSavingTitle ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="h-4 w-4 text-success" />
        )}
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => {
          setEditedTitle(approval.content_title);
          setIsEditingTitle(false);
        }}
        disabled={isSavingTitle}
        className="focus:outline-none focus:ring-0 hover:bg-transparent focus:bg-transparent"

      >
        <XCircle className="h-4 w-4 text-muted-foreground" />
      </Button>
    </>
  ) : (
    <>
      <h3 className="font-semibold text-lg text-foreground">
        {editedTitle}
      </h3>

      {canApproveReject && (
          <Edit 
          onClick={() => setIsEditingTitle(true)}
           className="h-4 w-4 cursor-pointer ml-4" />
       )} 
    </>
  )}
</div>


              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {/* <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {approval.meetingDate}
                </div> */}
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Submitted by {approval.submitted_by}
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "preview" | "edit")}>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base">Brain Content Format</Label>
                  <div className="flex items-center gap-3">
                <TabsList>
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                        {canApproveReject && (
                  <TabsTrigger value="edit" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </TabsTrigger>
                )} 
                </TabsList>
                   {activeTab == "edit" && (
                  <Button
      onClick={handleSave}
      disabled={isSaving}
      className="gap-2 "
    >
      {isSaving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle className="h-4 w-4" />
      )}
      {isSaving ? "Saving..." : "Save"}
    </Button>
                  )}
                  </div>
              </div>

  <TabsContent value="preview" className="mt-0">
  <div className="rounded-lg border border-border bg-card p-6 max-h-[50vh] overflow-y-auto">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={markdownComponents}
    >
      {editedContent}
    </ReactMarkdown>
  </div>
</TabsContent>


              <TabsContent value="edit" className="mt-0">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                  placeholder="Edit the Brain content format..."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Use Markdown formatting. Changes will be saved when you approve.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isApproving || isRejecting}>
            Cancel
          </Button>
          {canApproveReject && ( // Conditionally render buttons based on canApproveReject prop
            <>
          <Button
            variant="destructive"
            onClick={handleReject}
            className="gap-2"
            disabled={isRejecting || isApproving} // Disable if rejecting or approving
          >
            {isRejecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {isRejecting ? "Rejecting..." : "Reject"}
          </Button>
          <Button
            onClick={handleApprove}
            className="gap-2 bg-success hover:bg-success/90"
            disabled={isApproving || isRejecting} // Disable if approving or rejecting
          >
            {isApproving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {isApproving ? "Approving..." : "Approve & Publish to Brain"}
          </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDialog;
