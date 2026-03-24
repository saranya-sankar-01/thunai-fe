import { useState,useEffect,useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentPreview } from './DocumentPreview';
import { Document } from '../../hooks/useDocument';
import debounce from 'lodash/debounce'; 
import removeMarkdown from 'remove-markdown';
import { marked } from "marked";
import remarkGfm from 'remark-gfm';
import html2pdf from "html2pdf.js";
import ReactMarkdown from 'react-markdown';
import { renderToString } from 'react-dom/server';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
// import { renderToString } from 'react-dom/server';
import { convertMarkdownToDocx, downloadDocx } from "@mohtasham/md-to-docx";

import { 
  FileText, 
  Eye, 
  Edit, 
  X, 
  Download,
  Copy,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
interface DocumentEditorProps {
  document: Document;
  onUpdateContent: (content: string) => void;
  onUpdateTitle: (title: string) => void;
  onClose: () => void;
}

export const DocumentEditor = ({ 
  document, 
  onUpdateContent, 
  onUpdateTitle, 
  onClose 
}: DocumentEditorProps) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('preview');
  const [localTitle, setLocalTitle] = useState(document.title);
  const [localContent, setLocalContent] = useState(document.content);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleTitleSave = () => {
    if (localTitle !== document.title) {
      onUpdateTitle(localTitle);
      toast({
        description: "Document title updated",
        duration: 2000
      });
    }
  };

  const handleContentSave = () => {
    if (localContent !== document.content) {
      onUpdateContent(localContent);
      toast({
        description: "Document content saved",
        duration: 2000
      });
    }
  };
 useEffect(() => {
  setLocalContent((document.content));
}, [document.content]);
const debouncedSave = useCallback(
  debounce((content) => {
    if (content !== document.content) {
      onUpdateContent(content);
      toast({
        description: "Document content auto-saved",
        duration: 2000
      });
    }
  }, 1000),
  [document.content, onUpdateContent]
);
const handleContentChange = (e) => {
  const newContent = e.target.value;
  setLocalContent(newContent);
  debouncedSave(newContent);
};
const handleDownloadDocx = async () => {
    try {
      const blob = await convertMarkdownToDocx(document.content);
      downloadDocx(
        blob,
        `${document.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.docx`
      );
    } catch (error) {
      console.error("DOCX generation failed:", error);
    }
  };
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(document.content);
      setCopied(true);
      toast({
        description: "Document copied to clipboard",
        duration: 2000
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        description: "Failed to copy document",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([document.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      description: "Document downloaded",
      duration: 2000
    });
  };



// const handleDownloadPdf = () => {
//   const doc = new jsPDF();
//   const pageWidth = doc.internal.pageSize.width;
//   const pageHeight = doc.internal.pageSize.height;
//   const margin = 20;
//   const contentWidth = pageWidth - (margin * 2);
//   let currentY = margin;

//   // Add title with proper centering
//   doc.setFontSize(18);
//   doc.setFont(undefined, 'bold');
//   // Calculate the center of the page for proper title alignment
//   const titleX = pageWidth / 2;
//   doc.text(document.title, titleX, currentY, { 
//     align: 'center',
//     maxWidth: contentWidth 
//   });
//   currentY += 15;

//   // Reset to normal text for content
//   doc.setFontSize(12);
//   doc.setFont(undefined, 'normal');

//   // Process content with proper paragraph breaks
//   const strippedContent = (document.content);
//   const paragraphs = strippedContent.split('\n\n');
  
//   paragraphs.forEach(paragraph => {
//     if (paragraph.trim() === '') return;
    
//     // Split paragraph into lines that fit the page width
//     const lines = doc.splitTextToSize(paragraph.trim(), contentWidth);
    
//     // Check if we need a new page
//     if (currentY + (lines.length * 7) > pageHeight - margin) {
//       doc.addPage();
//       currentY = margin;
//     }
    
//     // Add the paragraph text with justification
//     doc.text(lines, margin, currentY, { 
//       align: 'justify',
//       maxWidth: contentWidth
//     });
    
//     // Move to next paragraph position with spacing
//     currentY += (lines.length * 5) + 5;
//   });

//   doc.save(`${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);

//   toast({
//     description: "Document downloaded as PDF",
//     duration: 2000
//   });
// };




const handleDownloadPdf = async () => {
  // Use window.document explicitly to avoid confusion with the document prop
  const container: HTMLDivElement = window.document.createElement('div') as HTMLDivElement;
  container.style.padding = '20px';
  container.style.fontFamily = 'Arial, sans-serif';
  
  // Add title
  const titleElement: HTMLHeadingElement = window.document.createElement('h1') as HTMLHeadingElement;
  titleElement.textContent = document.title;
  titleElement.style.textAlign = 'center';
  titleElement.style.marginBottom = '20px';
  container.appendChild(titleElement);
  
  // Render markdown to HTML
  const contentElement: HTMLDivElement = window.document.createElement('div') as HTMLDivElement;
  contentElement.innerHTML = renderToString(
    <ReactMarkdown>{document.content}</ReactMarkdown>
  );
  contentElement.style.lineHeight = '1.6';
  contentElement.style.textAlign = 'justify';
  container.appendChild(contentElement);
  
  // Temporarily add to document for conversion
  window.document.body.appendChild(container);
  
  // Configure PDF options
  const options = {
    margin: 10,
    filename: `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  try {
    // Generate PDF
    await html2pdf().from(container).set(options).save();
    
    toast({
      description: "Document downloaded as PDF with formatting",
      duration: 2000
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    toast({
      description: "Failed to generate PDF",
      variant: "destructive",
      duration: 2000
    });
  } finally {
    // Clean up
    window.document.body.removeChild(container);
  }
};

// const handleDownloadPdf = async () => {
//   // Create a container for the rendered markdown
//   const container = window.document.createElement('div');
//   container.style.padding = '20px';
//   container.style.fontFamily = 'Arial, sans-serif';
  
//   // Add title
//   const titleElement = window.document.createElement('h1');
//   titleElement.textContent = localTitle; // Use localTitle instead of document.title
//   titleElement.style.textAlign = 'center';
//   titleElement.style.marginBottom = '20px';
//   container.appendChild(titleElement);
  
//   // Add custom CSS to ensure proper heading styles
//   const styleElement = window.document.createElement('style');
//   styleElement.textContent = `
//     h1 { font-size: 24px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
//     h2 { font-size: 20px; font-weight: bold; margin-top: 18px; margin-bottom: 9px; }
//     h3 { font-size: 16px; font-weight: bold; margin-top: 16px; margin-bottom: 8px; }
//     h4 { font-size: 14px; font-weight: bold; margin-top: 14px; margin-bottom: 7px; }
//     p { margin-bottom: 10px; line-height: 1.6; }
//     ul, ol { margin-left: 20px; margin-bottom: 10px; }
//     li { margin-bottom: 5px; }
//     code { background-color: #f0f0f0; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
//     pre { background-color: #f0f0f0; padding: 10px; border-radius: 4px; overflow-x: auto; margin-bottom: 10px; }
//     blockquote { border-left: 4px solid #ccc; padding-left: 10px; margin-left: 0; font-style: italic; }
//     table { border-collapse: collapse; width: 100%; margin-bottom: 10px; }
//     th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//     th { background-color: #f2f2f2; }
//   `;
//   container.appendChild(styleElement);
  
//   // Create content element
//   const contentElement = window.document.createElement('div');
//   container.appendChild(contentElement);
  
//   // Convert markdown to HTML (handle both sync and async cases)
//   try {
//     // Use the current content (localContent) instead of document.content
//     const markdownContent = localContent || '';
    
//     // Use the synchronous version of marked
//     const htmlContent = marked.parse(markdownContent, {
//       async: false,
//       gfm: true,
//       breaks: true
//     });
    
//     // Set HTML content (this will be a string now)
//     contentElement.innerHTML = htmlContent as string;
    
//     // Temporarily add to document for conversion
//     window.document.body.appendChild(container);
    
//     // Configure PDF options
//     const options = {
//       margin: 15,
//       filename: `${localTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
//       image: { type: 'jpeg', quality: 0.98 },
//       html2canvas: { 
//         scale: 2,
//         useCORS: true,
//         logging: false
//       },
//       jsPDF: { 
//         unit: 'mm', 
//         format: 'a4', 
//         orientation: 'portrait',
//         compress: true
//       }
//     };
    
//     // Generate PDF
//     await html2pdf().from(container).set(options).save();
    
//     toast({
//       description: "Document downloaded as PDF with formatting",
//       duration: 2000
//     });
//   } catch (error) {
//     console.error("PDF generation failed:", error);
//     toast({
//       description: "Failed to generate PDF",
//       variant: "destructive",
//       duration: 2000
//     });
//   } finally {
//     // Clean up
//     if (container.parentNode) {
//       container.parentNode.removeChild(container);
//     }
//   }
// };




  return (
    <div className="h-full flex flex-col border-l border-border bg-background">
      {/* Document Header */}
      <div className="border-b border-border p-4 bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Document Editor</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-accent/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Document Title */}
        <div className="flex gap-2">
          <Input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
            className="font-medium"
            placeholder="Document title..."
          />
        </div>
        
        {/* Document Actions */}
        <div className="flex items-center justify-between mt-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}>
            <TabsList className="grid w-32 grid-cols-2">
              <TabsTrigger value="preview" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                View
              </TabsTrigger>
              <TabsTrigger value="edit" className="text-xs">
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-xs hover:bg-accent/10"
            >
              {copied ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-7 px-2 text-xs hover:bg-accent/10"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            <Button
  variant="ghost"
  size="sm"
  onClick={handleDownloadPdf}
  className="h-7 px-2 text-xs hover:bg-accent/10"
>
  <Download className="h-3 w-3 mr-1" />
  Export PDF
</Button> */}
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs hover:bg-accent/10"
    >
      <Download className="h-3 w-3 mr-1" />
      Export
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start" className="w-28">
    <DropdownMenuItem onClick={handleDownloadDocx}>
      Export .docx
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDownloadPdf}>
      Export .pdf
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 min-h-0">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="preview" className="h-full m-0">
            <DocumentPreview content={document.content} />
          </TabsContent>
          
          <TabsContent value="edit" className="h-full m-0 p-4">
            <div className="h-full flex flex-col gap-3">
              <Textarea
                value={localContent}
                onChange={handleContentChange}
                onBlur={handleContentSave}
                placeholder="Start writing your document in Markdown..."
                className="flex-1 resize-none font-mono text-sm"
                style={{ minHeight: '400px' }}
                
              />
              <div className="text-xs text-muted-foreground">
                Supports Markdown formatting. Changes are saved automatically.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};