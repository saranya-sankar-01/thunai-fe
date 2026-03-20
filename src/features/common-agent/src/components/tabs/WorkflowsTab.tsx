import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Expand, X } from "lucide-react";
import { AgentData } from "../../types/agent";
import FlowEditor from "../workflow/flow/FlowEditor";
import { ReactFlowProvider } from '@xyflow/react';

interface WorkflowsTabProps {
  agentData: AgentData;
  onDataChange: (data: Partial<AgentData>) => void;
}

export function WorkflowsTab({ agentData, onDataChange }: WorkflowsTabProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleEscKey);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-thunai-text-primary">
            Workflow Settings
          </h2>
        </div>
        <div className="relative w-full h-[calc(100vh-300px)] z-50">
          {/* Toggle button */}
          <Button
            onClick={handleFullscreenToggle}
            className={`${
              isFullscreen
                ? "fixed top-4 right-4 z-[9999]"
                : "absolute top-2 right-2 z-50"
            } bg-white/90 hover:bg-white text-gray-700 border border-gray-300 shadow-sm`}
            size="sm"
          >
            {isFullscreen ? (
              <X className="h-4 w-4" />
            ) : (
              <Expand className="h-4 w-4" />
            )}
          </Button>
          <div
            className={`transition-all duration-300 ${
              isFullscreen
                ? "fixed inset-0 w-full h-full z-10 bg-black"
                : "w-full h-full rounded-lg shadow"
            }`}
          >
              <ReactFlowProvider>
          <FlowEditor />
        </ReactFlowProvider>
          </div>
        </div>
      </div>
    </>
  );
}
