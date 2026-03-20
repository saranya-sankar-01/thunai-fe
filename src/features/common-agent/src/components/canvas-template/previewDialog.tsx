import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewContent: string;
}

const PreviewDialog: React.FC<PreviewDialogProps> = ({
  open,
  onOpenChange,
  previewContent,
}) => {
  const { contentWithoutImages, images } = useMemo(() => {
    const text = previewContent || "";
    const regex = /!\[(.*?)\]\((data:image\/[a-zA-Z0-9+]+;base64,[\s\S]+?)\)/g;

    const images: { placeholder: string; alt: string; src: string }[] = [];
    let cleanedText = text;
    let match;
    let index = 0;

    while ((match = regex.exec(text)) !== null) {
      const placeholder = `<<<BASE64_IMAGE_${index}>>>`;

      images.push({
        placeholder,
        alt: match[1],
        src: match[2],
      });

      cleanedText = cleanedText.replace(match[0], placeholder);
      index++;
    }

    return { contentWithoutImages: cleanedText, images };
  }, [previewContent]);

  /* ---------------- CUSTOM MARKDOWN RENDERERS ---------------- */

  const renderers = useMemo(
    () => ({
      p: ({ children }) => {
        const childrenArray = Array.isArray(children) ? children : [children];

        const processed = childrenArray.flatMap((child) => {
          if (typeof child === "string") {
            let parts: Array<string | JSX.Element> = [child];

            images.forEach((img) => {
              parts = parts.flatMap((segment) =>
                typeof segment === "string"
                  ? segment
                      .split(img.placeholder)
                      .flatMap((piece, idx, arr) => [
                        piece,
                        idx < arr.length - 1 && (
                          <img
                            key={`${img.placeholder}-${idx}`}
                            src={img.src}
                            alt={img.alt}
                            className="my-4 rounded-lg max-w-full mx-auto"
                          />
                        ),
                      ])
                  : segment,
              );
            });

            return parts.filter(Boolean);
          }
          return child;
        });

        return <p className=" text-sm leading-6 mb-4">{processed}</p>;
      },
      h1: ({ children }) => (
        <h1 className="text-lg font-bold mb-4 mt-6 first:mt-0">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-base font-bold mb-3 mt-5 first:mt-0">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="text-base font-bold mb-2 mt-4 first:mt-0">{children}</h3>
      ),

      ul: ({ children }) => (
        <ul className="mb-4 ml-5 list-disc space-y-1">{children}</ul>
      ),

      ol: ({ children }) => (
        <ol className="mb-4 ml-5 list-decimal space-y-1">{children}</ol>
      ),

      li: ({ children }) => (
        <li className="text-sm leading-medium">{children}</li>
      ),
      table: ({ children }) => (
        <div className=" text-sm overflow-x-auto my-2">
          <table className="min-w-full border-collapse border border-border">
            {children}
          </table>
        </div>
      ),
      th: ({ children }) => (
        <th className="border border-border bg-muted px-3 py-2 text-sm text-left font-semibold">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="border border-border px-2 py-1 text-sm whitespace-normal break-words sm:break-normal sm:whitespace-normal break-all">
          {children}
        </td>
      ),
    }),
    [images],
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Extracted Content</DialogTitle>
        </DialogHeader>

        <div
          className="flex-1 overflow-y-auto pr-2 space-y-4 
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-thumb]:bg-gray-300
          [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          <div className="bg-muted/40 rounded-lg p-6 text-sm break-words ">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={renderers}
            >
              {contentWithoutImages}
            </ReactMarkdown>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialog;
