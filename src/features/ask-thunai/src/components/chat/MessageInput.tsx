import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Plus, X, StopCircle } from "lucide-react";
import { ToolsDropdown } from "./ToolsDropdown";

interface MessageInputProps {
  onSendMessage: (message: string, imagePayloads?: any[]) => void;
  isLoading?: boolean;
  isConnected?: boolean;

  placeholder?: string;
  onToolSelect?: (tool: string) => void;
  onCanvasClick?: () => void;
  onMcpClick?: () => void;
  onWebsearchClick?: () => void;
  isCanvasMode?: boolean;
  onContentAgentFeedback?: (feedback: string) => void;
  onCancelLoading?: () => void;
  isCanvasLoading?: boolean;
  onCancelCanvas?: () => void;
  onCancelMcp?: () => void;
  onCancelWebsearch?: () => void;
  contentAgentConnected?: boolean;
  activeTab?: string;
  handleTabChange: (tab: string) => void;
  onAnalyticsClick?: () => void;
  isAnalyticsLoading?: boolean;
  isMcpLoading?: boolean;
  isWebsearchLoading?: boolean;
  onCancelAnalytics?: () => void;
  analyticsAgentConnected?: boolean;
   webSearchAgentConnected?:boolean;
   mcpAgentConnected?:boolean;
   isUserTyping?: boolean;
}

export const MessageInput = ({
  isUserTyping,
  onSendMessage,
  isLoading = false,
  isConnected,
  placeholder = "Type your message...",
  onToolSelect = () => {},
  onCanvasClick = () => {},
  onMcpClick = () => {},
  onWebsearchClick = () => {},
  onCancelLoading = () => {},
  isCanvasLoading = false,
  isMcpLoading = false,
  isWebsearchLoading = false,
  onCancelCanvas = () => {},
  onCancelMcp = () => {},
  onCancelWebsearch = () => {},
  contentAgentConnected = false,
  analyticsAgentConnected = false,
  mcpAgentConnected = false,
  webSearchAgentConnected = false,
  activeTab,
  handleTabChange,
  onAnalyticsClick = () => {},
  isAnalyticsLoading,
  onCancelAnalytics = () => {},
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    // Set focus back to textarea after loading completes or message is sent
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);
const anyToolConnecting = isCanvasLoading || isMcpLoading || isWebsearchLoading || isAnalyticsLoading;
const anyToolConnected = contentAgentConnected || analyticsAgentConnected || webSearchAgentConnected || mcpAgentConnected;
const handleSend = () => {
  console.log(message);
  if ((!message.trim() && imagePreviews.length === 0) || isLoading) return;
  
  if (imagePreviews.length > 0) {
    // Extract both base64 data and MIME type
    const imagePayloads = imagePreviews.map((src) => {
      const [mimeTypePart, base64Data] = src.split(",");
      // Extract MIME type from "data:image/jpeg;base64" format
      const mimeType = mimeTypePart.replace("data:", "").replace(";base64", "");
      
      return {
        data: base64Data,      // just base64 string
        mimeType: mimeType     // e.g., "image/jpeg", "image/png"
      };
    });
    
    // Send message with images (now includes MIME type)
    onSendMessage(message.trim(), imagePayloads);
  } else {
    if (textareaRef.current) {
      textareaRef.current.style.height = "92px";
    }
    onSendMessage(message.trim());
  }

  // Reset state
  setMessage("");
  setImagePreviews([]);
  setTimeout(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, 0);
};
  // const handleSend = () => {
  //   console.log(message)
  //   if ((!message.trim() && imagePreviews.length === 0) || isLoading) return;
  //   if (imagePreviews.length > 0) {
  //     const imagePayloads = imagePreviews.map((src) => src.split(",")[1]); // just base64 strings

  //     // onSendMessage(message.trim(), imagePayloads);
  //     // Send message with images
  //     onSendMessage(message.trim(), imagePayloads);
  //   } else {
  //     if (textareaRef.current) {
  //       textareaRef.current.style.height = "92px";
  //     }
  //     onSendMessage(message.trim());
  //   }

  //   // Reset state
  //   setMessage("");
  //   setImagePreviews([]);
  //   setTimeout(() => {
  //     if (textareaRef.current) {
  //       textareaRef.current.focus();
  //     }
  //   }, 0);
  // };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleButtonClick = () => {
    if (isLoading) {
      // If loading, call the cancel function
      onCancelLoading();
    } else {
      // Otherwise send the message
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
if (!selectedFile.type.startsWith("image/")) {
    setToast("Only image files are allowed.");
    e.target.value = "";
    setTimeout(() => setToast(null), 3000);
    return;
  }
    const reader = new FileReader();
    reader.onloadend = () => {
  setImagePreviews((prev) => [...prev, reader.result as string]); // append
  if (fileInputRef.current) fileInputRef.current.value = "";
};

    // reader.onloadend = () => {
    //   setImagePreviews([reader.result as string]);

    //   // Reset input so the same image can be re-selected
    //   if (fileInputRef.current) {
    //     fileInputRef.current.value = "";
    //   }
    // };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <div className="bg-card">
      {imagePreviews.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {imagePreviews.map((src, index) => (
            <div key={index} className="relative w-fit">
              <img
                src={src}
                alt={`Preview ${index}`}
                className="max-h-32 rounded border"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-0 right-0 p-1 bg-black/70 hover:bg-black text-white rounded-full"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              // Auto-resize logic
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 min-h-[60px] resize-none pb-11 custom-scrollbar focus:outline-none focus:ring-0 focus:border-none"
            disabled={!isUserTyping || isLoading || anyToolConnecting}
            style={{ maxHeight: "180px", overflowY: "auto" }}
          />

          <div className=" absolute bottom-[1px] left-[0.5px] flex items-center gap-1 bg-white w-[98%] p-1 rounded-sm ml-[4px]">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                disabled={!isUserTyping}
                className="h-6 w-6 p-0 hover:bg-accent/50"
                onClick={() => setShowOptions((prev) => !prev)}
              >
                <Plus className="h-3 w-3" />
              </Button>

              {showOptions && (
                <div className="absolute bottom-8 left-0 w-40 bg-white border rounded-xl shadow-md z-50">
                  <button
                    onClick={() => {
                      setShowOptions(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-muted cursor-pointer"
                  >
                    Upload Image
                  </button>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                multiple={false}
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            <ToolsDropdown
              isUserTyping={isUserTyping}
              onToolSelect={onToolSelect}
              onCanvasClick={onCanvasClick}
              onAnalyticsClick={onAnalyticsClick}
              isCanvasLoading={isCanvasLoading}
              isMcpLoading={isMcpLoading}
              isAnalyticsLoading={isAnalyticsLoading}
              isWebSearchLoading={isWebsearchLoading}
              onMcpClick={onMcpClick}
              onWebSearchClick={onWebsearchClick}
              onCancelCanvas={onCancelCanvas}
              onCancelMcp={onCancelMcp}
              onCancelWebSearch={onCancelWebsearch}
              contentAgentConnected={contentAgentConnected}
              mcpAgentConnected={mcpAgentConnected}
              webSearchAgentConnected={webSearchAgentConnected}
              analyticsAgentConnected={analyticsAgentConnected}
              onCancelAnalytics={onCancelAnalytics}
            />
          </div>
          
{toast && (
  <div
    style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      backgroundColor: "#ef4444",
      color: "white",
      padding: "10px 16px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      fontSize: "12px",
      zIndex: 9999,
    }}
  >
    {toast}
  </div>
)}
        </div>
        <Button
          onClick={handleButtonClick}
          // disabled={!message.trim() && !isLoading}
          disabled={!message.trim() && imagePreviews.length === 0 && !isLoading}
          className="px-4 py-2 bg-primary hover:bg-primary/90 h-[50px] w-[50px] "
          size="sm"
        >
          {isLoading ? (
            <div className="w-4 h-4 bg-white" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 hidden md:block text-center">
        Thunai may generate responses that are incomplete, outdated, or inaccurate. Please verify critical information independently before making decisions.
      </p>
    </div>
  );
};
