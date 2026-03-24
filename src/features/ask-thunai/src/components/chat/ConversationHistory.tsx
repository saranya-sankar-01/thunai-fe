import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import thunaiLogoIcon from "@/assets/thunai-logo-icon.png";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteConversationHistory } from "../../services/chatService/likeAndDislike";
import { useToast } from "@/hooks/use-toast";
import { loadChatConversations } from "../../services/chatHistoryFilter";
import { useEffect, useRef, useState } from "react";
import { DeletePopup } from "../sharedComponents/DeletePopup";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  isActive?: boolean;
  chatBotType?: string;
  unique_id?: string;
  object_id?: string;
}

interface ConversationHistoryProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onUpdateConversations: (conversations: Conversation[]) => void;
  onRefreshConversations: () => void;
  onToggleSidebar?: () => void;
   onLoadMore: () => void; // New prop
  hasMore: boolean;      // New prop
  isLoadingMore: boolean; // New prop
  sidebarVisible?: boolean; 
}

export const ConversationHistory = ({
  conversations,
  onSelectConversation,
  onNewConversation,
  onUpdateConversations,
  onRefreshConversations,
  onLoadMore,
  hasMore,
  isLoadingMore,
  onToggleSidebar,
  sidebarVisible
}: ConversationHistoryProps) => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const handleDelete = async () => {
    try {
      setDeletingId(deleteTargetId);
      const res = await deleteConversationHistory({ unique_id: deleteTargetId });
      console.log("Conversation deleted:", res);
      onRefreshConversations();
      toast({
        description: "Conversation deleted successfully",
        duration: 2000,
      });
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        description: error || "Failed to delete",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setDeletingId(null);
      setOpenDelete(false);
      setDeleteTargetId(null);
    }
  };
 const observerTarget = useRef(null);


  useEffect(() => {
    // Only observe if there is more data to load
    if (!hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log("Sentinel intersected, loading more...");
          onLoadMore();
        }
      },
      { 
        threshold: 0.1, // Trigger when even 10% is visible
        rootMargin: "100px" // Trigger 100px before the user reaches the bottom for smoother UX
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [hasMore, isLoadingMore, onLoadMore]);


  return (
    <div className="h-full flex flex-col bg-secondary/30">
      {/* Header */}
      <div className="p-2 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
           
            <h2 className="text-lg font-semibold pl-2">Chats</h2>
          </div>
            <div className="flex items-center gap-1">
        <Button
        variant="ghost"
        size="sm"
        onClick={onNewConversation}
        className="hover:bg-accent/30 flex items-center gap-1 h-8 px-2 border md:border-0"
        title="New chat"
      >
        <Plus className="h-4 w-4" />
        <span className="md:hidden">New chat</span>
      </Button>
           {/* Close button for mobile - only show when sidebar is open on mobile */}
          {onToggleSidebar && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onToggleSidebar}
                      className="md:hidden hover:bg-accent/10 h-8 w-8 p-0"
                      title="Close sidebar"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
</div>
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs">Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.object_id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all hover:bg-accent/10 group",
                  conversation.isActive
                    ? "bg-accent/20 border border-accent/30"
                    : "hover:bg-gray-200"
                )}
                onClick={() => onSelectConversation(conversation.object_id)}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3
                      className={cn(
                        "font-medium text-sm truncate flex-1",
                        conversation.isActive
                          ? "text-foreground"
                          : "text-foreground/90"
                      )}
                    >
                      {conversation.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {deletingId ===
                      (conversation.unique_id || conversation.object_id) ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        ""
                      )}
                      {/* {conversation.chatBotType && (
                        <span
                          className={`text-xs text-muted-foreground  px-2 py-1  rounded-md shadow-md inline-block ${
                            conversation.chatBotType === "kb_chat"
                              ? "bg-blue-100"
                              : "bg-orange-100"
                          }`}
                        >
                          {conversation.chatBotType === "kb_chat"
                            ? "General"
                            : "Meeting"}
                        </span>
                      )} */}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 hover:bg-muted/40 rounded">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-28">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTargetId(conversation.unique_id || conversation.object_id || conversation.id);
                              setOpenDelete(true);
                            }}
                            className="text-black-600 cursor-pointer"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                      {conversation.timestamp}
                    </span> */}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 group-hover:text-muted-foreground/80">
                    {conversation.lastMessage}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
         <div ref={observerTarget} className="h-4 w-full flex justify-center py-4">
            {isLoadingMore && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>
          
          {!hasMore && conversations.length > 0 && (
            <p className="text-[10px] text-center text-muted-foreground opacity-50 py-2">
              End of history
            </p>
          )}
      </ScrollArea>
      <DeletePopup 
        isOpen={openDelete} 
        onClose={() => setOpenDelete(false)} 
        onConfirm={handleDelete} 
      /> 
    </div>
  );
};
