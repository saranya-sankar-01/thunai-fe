import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCopilotStore } from "../../store/copilotStore";
import { useEffect, useState } from "react";
import DeleteConfirmationDialog from "../ui/delete-confirmation-dialog";

export const CopilotSidebar = () => {
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null);
  const { savedChats, getSavedChats, loading, handleSelectConversation, selectedConversation, deleteChat } = useCopilotStore();

  useEffect(() => {
    getSavedChats()
  }, [getSavedChats])

  return (
    <div className="w-64 border-r border-border bg-muted/20">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
          {/* Pipeline Overview */}
          {/* <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">My Pipeline</h3>
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
              >
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span>At Risk</span>
                <Badge variant="destructive" className="ml-auto">3</Badge>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
              >
                <TrendingUp className="h-4 w-4 text-warning" />
                <span>Slipping</span>
                <Badge variant="secondary" className="ml-auto">2</Badge>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
              >
                <DollarSign className="h-4 w-4 text-primary" />
                <span>High Value</span>
                <Badge variant="secondary" className="ml-auto">5</Badge>
              </Button>
            </div>
          </div>

          <Separator /> */}

          {/* Saved Conversations */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Saved Conversations</h3>
            <div className="space-y-1">
              {loading.loadingSavedChats && (
                <div
                  className="w-full h-12 bg-gray-300 rounded-md animate-pulse"
                  aria-hidden="true"
                ></div>
              )}
              {!loading.loadingSavedChats && savedChats.sessions.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-4">
                  No saved conversations yet. Start a conversation and save it to access it later.
                </p>
              ) : (
                (!loading.loadingSavedChats && savedChats.sessions.length > 0) && savedChats.sessions.map((conversation) => (
                  <div
                    key={conversation.unique_id}
                    className={`group relative rounded-md p-2 hover:bg-muted ${selectedConversation === conversation.unique_id ? "bg-muted" : ""
                      }`}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 p-0"
                      onClick={() => handleSelectConversation(conversation.unique_id)}
                    >
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 text-left truncate">
                        <div className="text-sm truncate">{conversation.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.updated), { addSuffix: true })}
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setDeleteChatId(conversation.unique_id)
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator />

          {/* Accounts */}
          {/* <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Recent Accounts</h3>
            <div className="space-y-1">
              {[
                { name: "Acme Corp", status: "active" },
                { name: "TechNova Inc", status: "idle" },
                { name: "Fynix Ltd", status: "risk" },
                { name: "NexPro Systems", status: "active" },
              ].map((account) => (
                <Button
                  key={account.name}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                >
                  <div className={`h-2 w-2 rounded-full ${account.status === "active" ? "bg-green-500" :
                    account.status === "idle" ? "bg-yellow-500" :
                      "bg-red-500"
                    }`} />
                  <span className="text-sm truncate">{account.name}</span>
                </Button>
              ))}
            </div>
          </div> */}
        </div>
      </ScrollArea>
      <DeleteConfirmationDialog
        title="Delete Chat"
        description="Are you sure you want to delete this chat?"
        keyword="DELETE"
        buttonText="Delete"
        loading={loading.deletingChat}
        openDeleteDialog={!!deleteChatId}
        handleCloseModal={() => setDeleteChatId(null)}
        handleDelete={() =>
          deleteChat(deleteChatId)
        }
      />
    </div>
  );
};
