// components/TooltipWrapper.tsx
import React, { ReactNode } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface TooltipWrapperProps {
  children: ReactNode;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
}

const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  content,
  side = "top",
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs bg-gray-800 text-white text-xs font-normal text-justify">
        {content}
      </TooltipContent>
    </Tooltip>
  );
};

export default TooltipWrapper;
