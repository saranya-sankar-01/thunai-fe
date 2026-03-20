import React, { useState, useEffect } from "react";
import ReactDiffViewer from "react-diff-viewer-continued";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { X, FileText, Loader2, AlertCircle } from "lucide-react";
import { getTenantId, requestApi } from "@/services/authService";

interface UnifiedDocumentComparisonProps {
  fileIds: string[];
  viewMode: "cards" | "diff";
  onRemove: (id: string) => void;
}

export const UnifiedDocumentComparison = ({
  fileIds,
  viewMode,
  onRemove,
}: UnifiedDocumentComparisonProps) => {
  const [docsData, setDocsData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const tenantID = getTenantId();

  useEffect(() => {
    const fetchAllDocs = async () => {
      if (fileIds.length === 0) return;
      setLoading(true);
      setError(false);
      try {
        const results = await Promise.all(
          fileIds.map((id) =>
            requestApi(
              "GET",
              `brain/knowledge-base/${tenantID}/${id}/`,
              null,
              "brainService"
            )
          )
        );

        const newData: Record<string, any> = {};
        results.forEach((res, index) => {
          newData[fileIds[index]] = res.data;
        });
        setDocsData(newData);
        console.log("Fetched docs data:", newData);
      } catch (e) {
        console.error("Fetch error:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDocs();
  }, [fileIds, tenantID]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] w-full gap-4 bg-background border rounded-md">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] w-full gap-2 bg-background border rounded-md">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <p className="text-sm font-medium">Failed to load content for comparison.</p>
      </div>
    );
  }

  if (viewMode === "diff" && fileIds.length === 2) {
    const doc1 = docsData[fileIds[0]];
    const doc2 = docsData[fileIds[1]];

    return (
      <div className="w-full bg-white dark:bg-zinc-950 rounded-md border overflow-hidden shadow-inner ">
        <ReactDiffViewer
          oldValue={doc1?.extracted_text || ""}
          newValue={doc2?.extracted_text || ""}
          splitView={true}
          leftTitle={doc1?.file_name || "Document 1"}
          rightTitle={doc2?.file_name || "Document 2"}
          useDarkTheme={document.documentElement.classList.contains("dark")}
          styles={{
            variables: {
              light: {
                diffViewerBackground: "transparent",
                addedBackground: "#e6ffec",
                addedColor: "#24292e",
                removedBackground: "#ffeef0",
                removedColor: "#24292e",
                wordAddedBackground: "#acf2bd",
                wordRemovedBackground: "#fdb8c0",
              },
            },
            line: {
              fontSize: "12px",
              lineHeight: "1.5",
            },
          }}
        />
      </div>
    );
  }

  return (
 <div className="flex items-start gap-6 overflow-x-auto h-full pb-4 w-screen">
  {fileIds.map((id) => {
    const data = docsData[id];

    return (
      <div
        key={id}
        className="
          relative border rounded-md bg-background shadow-lg
          flex flex-col flex-none
          basis-[calc(50vw-3.0rem)]
          transition-all duration-300
        "
        style={{ height: "80vh" }}
      >
        <div className="flex items-center justify-between p-4 border-b bg-muted/30 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2 truncate">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <span className="font-bold text-sm truncate">
              {data?.file_name || "Document Detail"}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-950">
          <div className="p-6">
            {data ? (
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
                      {data.extracted_text || "No content available for this file."}
                    </ReactMarkdown>
                  </div>
                </section>
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground text-sm italic">
                No data available.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  })}
</div>

  );
};
