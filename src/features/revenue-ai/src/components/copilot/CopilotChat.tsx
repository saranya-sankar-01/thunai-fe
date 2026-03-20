import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Plus, Save, Eraser } from "lucide-react";
import { CopilotMessage } from "./CopilotMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SaveConversationDialog } from "./SaveConversationDialog";
import { useCopilotStore } from "../../store/copilotStore";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

type CopilotChatProps = {
  onMessageSelect: (message: any) => void;
};

export const CopilotChat = ({
  onMessageSelect,
}: CopilotChatProps) => {
  const [input, setInput] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { connect, sendUserMessage, messages: aiMessages, loading, selectedConversation, getSavedChatConversation, startNewChat, savedChats, connection, reconnectSocket } = useCopilotStore();
  // const { connect, sendUserMessage, messages: aiMessages, loading, selectedConversation, getSavedChatConversation, startNewChat, savedChats } = useCopilotStore();
  const SOCKET_ENDPOINT = import.meta.env.VITE_SOCKET_ENDPOINT || window.env?.['SOCKET_ENDPOINT'];

  useEffect(() => {
    connect(`wss://${SOCKET_ENDPOINT}/rev-service/ai/ws/rev-copilot-agent`);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      getSavedChatConversation(selectedConversation);
    }
  }, [selectedConversation, getSavedChatConversation]);

  const handleSend = () => {
    if (!input.trim()) return;

    sendUserMessage(input);
    setInput("");
  };

  const handleNewConversation = () => {
    console.log(aiMessages)
    const isSaved = savedChats.sessions.some(session => session.unique_id === selectedConversation);
    if (aiMessages.length > 0 && !isSaved) {
      setSaveDialogOpen(true);
      return;
    }
    startNewChat();
  };

  const handleInputPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Revenue Co-Pilot</h1>
          <p className="text-sm text-muted-foreground">Ask anything about your pipeline, deals, and revenue</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New
          </Button>
          {(aiMessages.length > 0 && selectedConversation === null) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSaveDialogOpen(true)}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          )}
          {(aiMessages.length > 0 && selectedConversation === null) && (
            <Button
              variant="outline"
              size="sm"
              onClick={startNewChat}
              className="gap-2"
            >
              <Eraser className="h-4 w-4" />
              Clear Chat
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {(loading.loadingConversation) && (<div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading History...</span>
          </div>)}
          {!loading.loadingConversation && aiMessages.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to your Revenue Co-Pilot</h2>
              <p className="text-muted-foreground mb-6">Try asking:</p>
              <div className="grid gap-2 max-w-2xl mx-auto">
                {[
                  "Show me my open deals this quarter",
                  "Which deals are likely to slip?",
                  "What changed in my pipeline this week?",
                  "Summarize my last call with TechNova",
                ].map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    className="text-left justify-start h-auto py-3"
                    onClick={() => handleInputPrompt(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            aiMessages.map((message) => (
              <CopilotMessage
                key={message.id}
                message={message}
                onReasoningClick={() => onMessageSelect(message)}
              />
            ))
          )}
          {loading.sendingMessage && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your pipeline, deals, or revenue..."
            className="min-h-[60px] resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading.sendingMessage}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <SaveConversationDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
      />
      <Dialog open={connection.showReconnectModal}>
        <DialogContent aria-describedby=''>
          <DialogHeader>
            <DialogTitle>Connection Lost</DialogTitle>
            <DialogDescription>
              Please click reconnect to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => reconnectSocket('wss://dev-api.thunai.ai/rev-service/ai/ws/rev-copilot-agent')}>Reconnect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
