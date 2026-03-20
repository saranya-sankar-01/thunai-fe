import { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Bot, Plus, Save, Maximize2, Minimize2, Sparkles, Eraser, } from 'lucide-react';
import { SaveConversationDialog } from '../copilot/SaveConversationDialog';
import { useCopilotStore } from '../../store/copilotStore';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { CopilotMessage } from '../copilot/CopilotMessage';

interface RevenueSidekickProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const quickPrompts = [
  { icon: '📊', text: 'Show me my open deals this quarter' },
  { icon: '⚠️', text: 'Which deals are likely to slip?' },
  { icon: '📈', text: 'What changed in my pipeline this week?' },
  { icon: '👥', text: 'Summarize activity for my team' },
];

export const RevenueSidekick = ({ open, onOpenChange }: RevenueSidekickProps) => {
  const { connect, loading, sendUserMessage, messages: aiMessages, startNewChat, reconnectSocket, connection } = useCopilotStore();
  const [input, setInput] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const SOCKET_ENDPOINT = import.meta.env.VITE_SOCKET_ENDPOINT || window.env?.['SOCKET_ENDPOINT'];

  useEffect(() => {
    connect(`wss://${SOCKET_ENDPOINT}/rev-service/ai/ws/rev-copilot-agent`);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    sendUserMessage(input);
    setInput("")
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewConversation = () => {
    if (aiMessages.length > 0) {
      setSaveDialogOpen(true);
    }
    startNewChat();
  };

  const handleExpandToggle = () => {
    onOpenChange(false);
    navigate('/companion/revai/copilot');
    // if (!isFullscreen) {
    //   onOpenChange(false);
    //   setTimeout(() => setIsFullscreen(true), 150);
    // } else {
    //   setIsFullscreen(false);
    //   setTimeout(() => onOpenChange(true), 150);
    // }
  };

  const handleClose = () => {
    setIsFullscreen(false);
    onOpenChange(false);
  };

  const chatContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn("border-b border-border px-5 py-3 flex items-center justify-between flex-shrink-0 bg-background", isFullscreen && "sticky top-0 z-10")}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles className="text-white" size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground leading-tight">Revenue Sidekick</h2>
            <p className="text-[11px] text-muted-foreground">AI-powered pipeline intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNewConversation} title="New conversation">
            <Plus className="h-4 w-4" />
          </Button>
          {aiMessages.length > 0 && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSaveDialogOpen(true)} title="Save conversation">
              <Save className="h-4 w-4" />
            </Button>
          )}
          {aiMessages.length > 0 && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={startNewChat} title="Clear Chat">
              <Eraser className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExpandToggle} title={isFullscreen ? 'Minimize' : 'Expand'}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
        <div className={`p-4 space-y-5 ${isFullscreen ? 'max-w-3xl mx-auto h-full' : ''}`}>
          {!aiMessages.length ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Sparkles className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">How can I help?</h3>
              <p className="text-sm text-muted-foreground mb-6 text-center">
                Ask me about your pipeline, deals, team activity, or revenue forecasts.
              </p>
              <div className="grid gap-2 w-full max-w-md">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt.text}
                    onClick={() => handleQuickPrompt(prompt.text)}
                    className="flex items-center gap-3 text-left px-4 py-3 rounded-xl border border-border bg-background hover:bg-muted/60 transition-colors text-sm group"
                  >
                    <span className="text-lg">{prompt.icon}</span>
                    <span className="text-foreground group-hover:text-foreground/90">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            aiMessages.map((message) => (
              <CopilotMessage
                key={message.id}
                message={message}
                onReasoningClick={() => setSelectedMessage(message)}
                compact={!isFullscreen}
              />
            ))
          )}
          {loading.sendingMessage && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-white animate-pulse" />
              </div>
              <div className="flex items-center gap-2 bg-muted/60 rounded-2xl rounded-tl-sm px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Reasoning peek */}
      {selectedMessage?.reasoning && (
        <div className="border-t border-border bg-muted/30 px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Evidence & Reasoning</span>
          </div>
          <div className={`flex gap-2 overflow-x-auto pb-1 ${isFullscreen ? 'max-w-3xl mx-auto' : ''}`}>
            {selectedMessage.reasoning.evidence.slice(0, 4).map((e) => (
              <div key={e.id} className="text-xs bg-background rounded-lg p-2.5 border border-border flex-shrink-0 min-w-[160px] max-w-[200px]">
                <div className="font-medium text-foreground truncate">{e.title}</div>
                <div className="text-muted-foreground mt-0.5">{e.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className={cn("border-t border-border p-3 flex-shrink-0 bg-background", isFullscreen && "sticky bottom-0 z-10")}>
        <div className={`flex items-center gap-2 ${isFullscreen ? 'max-w-3xl mx-auto' : ''}`}>
          <div className="flex-1 relative">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your pipeline, deals, or revenue..."
              className="min-h-[48px] max-h-[120px] resize-none text-sm pr-12 rounded-xl"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading.sendingMessage}
              size="icon"
              className="absolute right-1.5 bottom-1.5 h-8 w-8 rounded-lg"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
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

  // Fullscreen mode
  if (isFullscreen) {
    return (
      <Dialog open={isFullscreen} onOpenChange={(o) => { if (!o) handleClose(); }}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 overflow-y-auto" aria-describedby=''>
          <DialogTitle />
          {chatContent}
        </DialogContent>
      </Dialog>
    );
  }

  // Sheet mode
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col [&>button]:hidden">
        {chatContent}
      </SheetContent>
    </Sheet>
  );
};
