import { useState } from "react";
import { CopilotChat } from "../components/copilot/CopilotChat";
import { CopilotSidebar } from "../components/copilot/CopilotSidebar";
import { CopilotReasoning } from "../components/copilot/CopilotReasoning";
import { Session } from "../types/SavedChat";
import { CopilotActions } from "../components/copilot/CopilotActions";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  title?: string;
  confidence?: number;
  reasoning?: {
    evidence: Array<{
      id: string;
      type: "call" | "email" | "crm";
      title: string;
      timestamp: string;
      content: string;
    }>;
    factors: Array<{
      name: string;
      weight: number;
      rationale: string;
    }>;
    comparative?: {
      metric: string;
      current: number;
      mean: number;
      percentile: number;
    };
    counterfactual?: string;
    auditTrail: string;
  };
  actions?: Array<{
    id: string;
    label: string;
    impact: "high" | "medium" | "low";
    description?: string;
  }>;
};

export type SavedConversation = {
  id: string;
  name: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

const Copilot = () => {
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  return (
    <div className="flex h-full bg-background">
      {/* Left Rail - Context & Filters */}
      <CopilotSidebar />

      {/* Center - Chat Canvas */}
      <div className="flex-1 h-full">
        <CopilotChat
          onMessageSelect={setSelectedMessage}
        />
      </div>

      {/* Right Rail - Reasoning & Actions */}
      {selectedMessage && (
        <div className="w-96 border-l border-border bg-muted/20 flex flex-col">
          <CopilotReasoning message={selectedMessage} />
          <CopilotActions message={selectedMessage} />
        </div>
      )}
    </div>
  );
};

export default Copilot;
