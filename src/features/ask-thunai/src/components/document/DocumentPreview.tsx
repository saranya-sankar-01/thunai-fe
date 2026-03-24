import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";

interface DocumentPreviewProps {
  content: string;
  autoScroll?: boolean; // Added option to control auto-scrolling
}

export const DocumentPreview = ({
  content,
  autoScroll = true,
}: DocumentPreviewProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only scroll if autoScroll is enabled and content changes
    if (autoScroll && scrollAreaRef.current) {
      // Use setTimeout to ensure DOM is updated before scrolling
      setTimeout(() => {
        const scrollContainer = scrollAreaRef.current?.querySelector(
          "[data-radix-scroll-area-viewport]",
        );
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }, 0);
    }
  }, [content, autoScroll]);

  return (
    <ScrollArea ref={scrollAreaRef} className="h-full">
      <div className="p-6 max-w-none">
        <div className="prose prose-sm max-w-none dark:prose-invert text-sm">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mb-4 mt-0">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold mb-3 mt-0">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-bold mb-2 mt-0">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
              ),
              code: ({ className, children, ...props }: any) => {
                const isInline = !className?.includes("language-");
                return isInline ? (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ) : (
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto my-4">
                    <code className="text-sm font-mono">{children}</code>
                  </pre>
                );
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-accent pl-4 italic my-4 text-muted-foreground">
                  {children}
                </blockquote>
              ),

              ul: ({ children }) => (
                <ul className="mb-4 ml-5 list-disc space-y-1">{children}</ul>
              ),

              ol: ({ children }) => (
                <ol className="mb-4 ml-5 list-decimal space-y-1">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed ">{children}</li>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border-collapse border border-border">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-border px-4 py-2">{children}</td>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-accent underline hover:text-accent/80"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              hr: () => <hr className="border-border my-6" />,
            }}
          >
            {content ||
              "*Document is empty. Start by asking the AI to create content or edit manually.*"}
          </ReactMarkdown>
        </div>
      </div>
    </ScrollArea>
  );
};
