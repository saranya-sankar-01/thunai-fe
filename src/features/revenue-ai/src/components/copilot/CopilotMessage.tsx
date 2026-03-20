import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

type CopilotMessageProps = {
  message: any;
  onReasoningClick: () => void;
  compact?: boolean;
};

export const CopilotMessage = ({ message, onReasoningClick, compact = false }: CopilotMessageProps) => {
  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = (data: string) => {
    navigator.clipboard.writeText(data).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000)
    })
  }

  if (message.role === "user") {
    return (
      <div className="flex gap-3 justify-end">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
          <p className={compact ? "text-sm" : ""}>{message.content}</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
          <User size={14} className="text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
        <Bot size={14} className="text-white" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        {message.title && (
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold text-foreground ${compact ? "text-sm" : ""}`}>{message.title}</h3>
            {message.confidence && (
              <Badge variant="secondary" className="font-mono text-xs">
                {message.confidence}%
              </Badge>
            )}
          </div>
        )}

        <div className="bg-muted/60 rounded-2xl rounded-tl-sm p-4 space-y-3">
          <div className={`prose prose-sm dark:prose-invert max-w-none ${compact ? "text-sm" : ""} [&>*:first-child]:mt-0 [&>*:last-child]:mb-0`}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
            <div className="flex justify-end">
              <Button variant="ghost" className="p-2" onClick={() => copyToClipboard(message.content)}>
                {copied ? <Check /> : <Copy />}
              </Button>
            </div>
          </div>

          {message.reasoning && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReasoningClick}
              className="gap-1 text-muted-foreground hover:text-foreground -ml-2"
            >
              See reasoning ({message.reasoning.evidence.length})
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {message.actions && message.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 border-t border-border/50">
              {message.actions.map((action) => (
                <Button key={action.id} variant="outline" size="sm" className="gap-1 h-7 text-xs rounded-full">
                  {action.label}
                  {action.impact === "high" && (
                    <Badge variant="destructive" className="ml-1 text-[10px] px-1 py-0">!</Badge>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
