import React, { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { X, FileText } from "lucide-react";
import { getTenantId, requestApi } from "@/services/authService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ResizableFileCardProps {
  fileId: string;
  onRemove: (id: string) => void;
  totalFiles: number; 
}

export const ResizableFileCard = ({
  fileId,
  onRemove,
  totalFiles,
}: ResizableFileCardProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [width, setWidth] = useState<number | null>(null);
  const tenantID =getTenantId()

  useEffect(() => {
    const fetchFileData = async () => {
      setLoading(true);
      try {
        const res = await requestApi(
          "GET",
          `brain/knowledge-base/${tenantID}/${fileId}/`,
          null,
          "brainService",
        );
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (fileId) fetchFileData();
  }, [fileId, tenantID]);



  return (
    <div
      className={`relative border rounded-md bg-background shadow-lg flex flex-col transition-[flex] duration-300 ${
        width ? "flex-none" : "flex-1"
      }`}
      style={{
        height: "80vh",
        width: width ?? "auto", 
        minWidth: totalFiles <= 2 ? 400 : 300, 
        maxWidth: "90vw",
      }}
    >
      {/* Fixed Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 truncate">
          <FileText className="w-4 h-4 text-primary shrink-0" />
          <span className="font-bold text-sm truncate">
            {loading ? "Loading..." : data?.file_name || "Document Detail"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
          onClick={() => onRemove(fileId)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-950">
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : data ? (
            <div className="space-y-6">
              <section>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                  Title
                </h4>
                <p className="text-sm font-semibold leading-tight">
                  {data.title || "Untitled Document"}
                </p>
              </section>

              <section>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                  Extracted Content
                </h4>
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-justify">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {data.extracted_text ||
                      "No content available for this file."}
                  </ReactMarkdown>
                </div>
              </section>
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground text-sm italic">
              Failed to load file data.
            </div>
          )}
        </div>
      </div>

    
    </div>
  );
};
