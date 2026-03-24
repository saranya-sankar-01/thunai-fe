import { useState ,useEffect, useMemo, useRef} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ImageViewer } from './ImageViewer';
import rehypeRaw from "rehype-raw";
import {
  Copy,
  Share,
  HardDrive,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Check,
  Maximize2,
  FileText, RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Download} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { addToDrive,checkGoogleDrivePermissions } from '../../services/addToDrive';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { useSidebarContext } from '../../pages/Index';

// New interface for the raw image source structure from the clipboard
interface RawImageSource {
  base_64: string[];
  img_id: string; // This might be useful for keys, but not directly for inline tags
  img_tag: string[];
  // data?: any;
  // mimeType?: any;
   // e.g., ["[[IMAGE_16]]", "[[IMAGE_17]]"]
}

interface ChatBubbleProps {
  message: string;
  reasoning?: string;
  isUser: boolean;
  timestamp?: any;
  in_response_to?: string;
  onRegenerate?: () => void;
  driveEnabled: boolean;
  driveConnections: any[];
  isDriveLoading?: boolean;
  onOpenDocument?: () => void;
  images?: RawImageSource[]; // Updated to expect an array of RawImageSource objects
  files?: any[]; // Assuming files is simpler or already flattened
  socketRef?: any;
  uniqueid?: string;
  headerColor?: string;
  onFeedbackStart?: () => void;
  contentAgentConnected?: boolean;
  sendRawMessageToActiveSocket?: (payload: any) => boolean;
  sources?: any[]; // ✅ NEW
  canvasContent?: string;
  toolType?:string // ✅ NEW
  responseId?: string;
}


export const ChatBubble = ({onOpenDocument,toolType,files, canvasContent,message, reasoning, isUser, timestamp, in_response_to,driveEnabled,sources, sendRawMessageToActiveSocket,
  driveConnections, images, socketRef,
  uniqueid, responseId,
  onFeedbackStart,
  isDriveLoading = false,onRegenerate,contentAgentConnected }: ChatBubbleProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'up' | 'down' | null>(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);

  const [showNegativePopup,setShowNegativePopup] = useState<boolean>(false);
  const NegativeInputRef = useRef<HTMLTextAreaElement | null>(null);

  const { toast } = useToast();

  // Create a map for quick lookup of base64 data by image tag or img_id (ONLY for AI responses)
  const imageMap = useMemo(() => {
    const map = new Map<string, string>();
    // Only process imageMap for AI responses
    if (!isUser && images) {
      images.forEach(rawSource => {
        // Check if this is AI format (has img_tag and img_id)
        if (rawSource.img_tag && Array.isArray(rawSource.img_tag)) {
          rawSource.img_tag.forEach((tag, index) => {
            if (rawSource.base_64[index]) {
              map.set(tag, rawSource.base_64[index]);
            }
          });
        }
        if (rawSource.img_id && rawSource.base_64 && rawSource.base_64.length > 0) {
          map.set(rawSource.img_id, rawSource.base_64[0]);
        }
      });
    }
    return map;
  }, [images, isUser]);

  console.log("Canvas Content in ChatBubble:", toolType);
  const isCanvasMessage = !isUser && (message.startsWith('# ') || !!canvasContent);
  console.log("Raw timestamp in ChatBubble:", timestamp);
  console.log("files in ChatBubble:", files);

  let displayTimestamp = "";
  if (timestamp) {
    const date = new Date(timestamp);
    displayTimestamp = format(date, "HH:mm");
  }

  const extractTitle = () => {
    if (isCanvasMessage) {
      if (canvasContent) {
        const lines = canvasContent.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('# ')) {
            return trimmed.replace('# ', '');
          }
        }
      }

      if (message.startsWith('# ')) {
        const firstLine = message.split('\n')[0];
        return firstLine.replace('# ', '');
      }

      return 'Generated Document';
    }
    return '';
  };

  const extractFullContent = () => {
    if (isCanvasMessage && canvasContent) {
      let content = canvasContent;

      if (content.startsWith("```markdown\n")) {
        content = content.replace("```markdown\n", "").replace(/\n```\$/, "");
      } else if (content.startsWith("```\n")) {
        content = content.replace("```\n", "").replace(/\n```$/, "");
      }

      let cleanMessage = message
        ?.replace(/^```(?:markdown)?\n/, "")
        .replace(/\n```$/, "");

      let finalContent = cleanMessage || content;

      const lines = finalContent.split("\n");

      const minIndent = Math.min(
        ...lines
          .filter(line => line.trim().length > 0)
          .map(line => line.match(/^\s*/)?.[0].length ?? 0)
      );

      finalContent = lines
        .map(line => line.slice(minIndent))
        .join("\n")
        .trim();

      return finalContent;
    }

    return message;
  };

  const title = extractTitle();
  const fullContent = extractFullContent();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast({
        description: "Message copied to clipboard",
        duration: 2000
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        description: "Failed to copy message",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Thunai Chat Message',
          text: message,
        });
      } catch (err) {

      }
    } else {
      handleCopy();
    }
  };

  const handleSelectDriveUser = (connectionId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setShowUserSelector(false);
    setTimeout(() => {
      handleAddToDrive(connectionId);
    }, 0);
  };

  const handleAddToDrive = async (connectionId?: string) => {
    try {
      if (driveEnabled) {
        if (driveConnections.length > 1 && !connectionId) {
          setShowUserSelector(true);
          return;
        }

        const idToUse = connectionId || driveConnections[0]?.id;

        if (!idToUse) throw new Error("No Google account selected");

        // Start with the base content
        let contentToSave = isCanvasMessage ? fullContent : message;

        // Replace IDs and [[IMAGE_N]] tags with base64 data
        if (!isUser && images) {
          // Flatten the images array to handle nested [Array(N)] structures
          images.flat().forEach(imgSource => {
            const imageSrc = (imgSource.base_64?.[0] ? `data:image/png;base64,${imgSource.base_64[0]}` : null);

            if (!imageSrc) return;

            // 1. Replace <img src='any_id'/> with the actual base64 image source
            if (imgSource.img_id) {
              // Using a more flexible regex that handles both ' and " around the ID
              const idRegex = new RegExp(`<img\\s+src=['"]${imgSource.img_id}['"]\\s*\\/?>`, 'g');
              contentToSave = contentToSave.replace(idRegex, `<img src="${imageSrc}" />`);
            }

            // 2. Replace Markdown ![]([[IMAGE_N]]) placeholders
            if (imgSource.img_tag && Array.isArray(imgSource.img_tag)) {
              imgSource.img_tag.forEach((tag, idx) => {
                const currentSrc = (imgSource.base_64?.[idx] ? `data:image/png;base64,${imgSource.base_64[idx]}` : null);
                if (currentSrc) {
                  const escapedTag = tag.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
                  const markdownRegex = new RegExp(`!\\[(.*?)\\]\\(${escapedTag}\\)`, 'g');
                  contentToSave = contentToSave.replace(markdownRegex, `![$1](${currentSrc})`);
                }
              });
            }
          });
        }

        await addToDrive(contentToSave, idToUse);

        toast({
          description: "Message added to Drive.",
          duration: 3000,
        });
        setShowUserSelector(false);
      } else {
        throw new Error("Google Drive write access is not enabled");
      }
    } catch (error) {
      toast({
        description: (error as Error)?.message || "Failed to add message to Drive",
        variant: "destructive",
      });
    }
  };

  const handleThumbsDown = () => {
    setShowNegativePopup(false)
    // if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
    if (onFeedbackStart) onFeedbackStart();

    //  Get the negative feedback text from the ref
    const negativeText = NegativeInputRef.current?.value || "";

    const payload = {
      type: "feedback",
      is_response_satisfy: false,
      response_id: responseId,
      feedback: {
        is_feedback_text: true,
        text: negativeText,
      }
    };
    sendRawMessageToActiveSocket?.(payload);

    // console.log("Sending feedback payload:", payload);

    //  Just send payload - ChatLayout will handle the response
    // socketRef.current.send(JSON.stringify(payload));


    // Clear the input field after sending
    if (NegativeInputRef.current) {
      NegativeInputRef.current.value = "";
    }

    setFeedbackType("down");
    // }
  };

  const handleThumbsUp = () => {
    // if (socketRef?.current && socketRef.current.readyState === WebSocket.OPEN) {
    if (onFeedbackStart) onFeedbackStart();

    const payload = {
      type: "feedback",
      is_response_satisfy: true,
      response_id: responseId,
    };
    sendRawMessageToActiveSocket?.(payload);

    // Just send payload - ChatLayout will handle the response
    // socketRef.current.send(JSON.stringify(payload));
    setFeedbackType("up");
    // }
  };

  const handleImageClick = (imageData: any) => {
    setSelectedImage(imageData);
  };

  const handleCloseViewer = () => {
    setSelectedImage(null);
  };
  const { sidebarVisible, toggleSidebar } = useSidebarContext();
  const handleOpenDocument = () => {
    if (onOpenDocument) {
      if(sidebarVisible){ toggleSidebar();
      }
      onOpenDocument();
    }
  };

  // Step 1: Extract inline images and replace with placeholders (ONLY for AI responses)
  const { contentWithoutInlineImages, inlineImages } = useMemo(() => {
    // Skip inline image processing for user messages
    if (isUser) {
      return { contentWithoutInlineImages: message, inlineImages: [] };
    }

    const textToProcess = message;

    console.log("Message:", textToProcess);
    console.log("Images prop:", images);

    const markdownImageRegex = /!\[(.*?)\]\(\[\[IMAGE_(\d+)\]\]\)/g;
    // New pattern: <img src='image_id'/> ![]([[IMAGE_N]]) - with exclamation mark and flexible spacing (including newlines)
    const combinedImageRegex = /<img\s+src=['"](image_[a-f0-9]+)['"]\s*\/>\s*!\[\]\(\[\[IMAGE_(\d+)\]\]\)/g;
    // Simple HTML img tag pattern - only match if NOT followed by ![]([[IMAGE_N]])
    const htmlImageRegex = /<img\s+src=['"](image_[a-f0-9]+)['"]\s*\/>/g;

    const extractedImages: { placeholder: string; alt: string; src: string }[] = [];
    let cleanedText = textToProcess;
    let match;
    let index = 0;

    // Track positions of combined matches to skip them in simple HTML pattern
    const combinedMatchPositions: Array<{ start: number; end: number }> = [];

    // Handle combined pattern first (img tag with IMAGE_N reference)
    const combinedMatches: { match: RegExpExecArray, originalMatch: string }[] = [];
    while ((match = combinedImageRegex.exec(textToProcess)) !== null) {
      combinedMatches.push({ match: match, originalMatch: match[0] });
      combinedMatchPositions.push({ start: match.index, end: match.index + match[0].length });
    }

    console.log("Combined matches found:", combinedMatches.length);

    combinedMatches.forEach(({ match: m, originalMatch }) => {
      const placeholder = `<<<INLINE_IMAGE_PLACEHOLDER_${index}>>>`;
      const imgId = m[1]; // e.g., "image_69454f5599147137fa2426d0"
      const imageNumber = parseInt(m[2], 10); // e.g., 18 from [[IMAGE_18]]
      const imageTag = `[[IMAGE_${imageNumber}]]`; // e.g., "[[IMAGE_18]]"

      console.log(`Processing combined match - imgId: ${imgId}, imageNumber: ${imageNumber}, tag: ${imageTag}`);

      // Find the image source with matching img_id
      const imageSource = images?.find(src => src.img_id === imgId);

      console.log("Found imageSource:", imageSource?.img_id, "img_tag array:", imageSource?.img_tag, "base_64 length:", imageSource?.base_64?.length);

      if (imageSource && imageSource.base_64) {
        let base64 = null;

        // Handle single base64 string (not an array)
        if (typeof imageSource.base_64 === 'string') {
          console.log("Single base64 string detected");
          base64 = imageSource.base_64;
        }
        // Handle array with single item or multiple items with img_tag
        else if (Array.isArray(imageSource.base_64)) {
          if (imageSource.base_64.length === 1) {
            // Only one image, use it regardless of tag
            console.log("Single item array detected, using index 0");
            base64 = imageSource.base_64[0];
          } else if (imageSource.img_tag && Array.isArray(imageSource.img_tag)) {
            // Multiple images with tags - find the correct one
            const tagIndex = imageSource.img_tag.indexOf(imageTag);
            console.log(`Tag ${imageTag} found at index ${tagIndex} in img_tag array`);
            if (tagIndex !== -1 && imageSource.base_64[tagIndex]) {
              base64 = imageSource.base_64[tagIndex];
            }
          }
        }

        if (base64) {
          console.log(`✓ Using image (${imageTag}) from ${imgId}, base64 length: ${base64?.length}`);
          extractedImages.push({
            placeholder,
            alt: `Image ${imageNumber} from ${imgId}`,
            src: `data:image/png;base64,${base64}`,
          });
          cleanedText = cleanedText.replace(originalMatch, placeholder);
          index++;
        } else {
          cleanedText = cleanedText.replace(originalMatch, '');
        }
      } else {
        console.log(`✗ Failed to find imageSource with id ${imgId}`);
      }
    });

    // Handle markdown image pattern
    const markdownMatches: { match: RegExpExecArray, originalMatch: string }[] = [];
    while ((match = markdownImageRegex.exec(textToProcess)) !== null) {
      markdownMatches.push({ match: match, originalMatch: match[0] });
    }

    markdownMatches.forEach(({ match: m, originalMatch }) => {
      const placeholder = `<<<INLINE_IMAGE_PLACEHOLDER_${index}>>>`;
      const tag = `[[IMAGE_${m[2]}]]`;
      const base64 = imageMap.get(tag);
      if (base64) {
        extractedImages.push({
          placeholder,
          alt: m[1],
          src: `data:image/png;base64,${base64}`,
        });
        cleanedText = cleanedText.replace(originalMatch, placeholder);
        index++;
      }
    });

    // Handle simple HTML img tag pattern - but skip if part of combined pattern
    const htmlMatches: { match: RegExpExecArray, originalMatch: string }[] = [];
    while ((match = htmlImageRegex.exec(textToProcess)) !== null) {
      // Check if this match is part of a combined pattern
      const isPartOfCombined = combinedMatchPositions.some(
        pos => match.index >= pos.start && match.index < pos.end
      );

      if (!isPartOfCombined) {
        htmlMatches.push({ match: match, originalMatch: match[0] });
      }
    }

    htmlMatches.forEach(({ match: m, originalMatch }) => {
      const placeholder = `<<<INLINE_IMAGE_PLACEHOLDER_${index}>>>`;
      const imgId = m[1];
      const base64 = imageMap.get(imgId);
      if (base64) {
        extractedImages.push({
          placeholder,
          alt: imgId,
          src: `data:image/png;base64,${base64}`,
        });
        cleanedText = cleanedText.replace(originalMatch, placeholder);
        index++;
      }
    });

    return { contentWithoutInlineImages: cleanedText, inlineImages: extractedImages };
  }, [message, imageMap, isUser, images]);

  // Debug extracted images
  // console.log("Extracted inline images:", inlineImages);
  // console.log("Content with placeholders:", contentWithoutInlineImages);

  // Helper function to process placeholders in text
  const processTextWithPlaceholders = (text: string) => {
    let parts: Array<string | JSX.Element> = [text];

    inlineImages.forEach((img) => {
      parts = parts.flatMap((segment) =>
        typeof segment === "string"
          ? segment.split(img.placeholder).flatMap((piece, pIndex, array) => [
            piece,
            pIndex < array.length - 1 && (
              //             <div key={`${img.placeholder}-${pIndex}`} style={{ position: 'relative', display: 'inline-block', margin: '0.5em auto' }}>
              //               {loadingImages.has(img.placeholder) && (
              //                 <div 
              //                   style={{
              //                     position: 'absolute',
              //                     top: '50%',
              //                     left: '50%',
              //                     transform: 'translate(-50%, -50%)',
              //                     zIndex: 10
              //                   }}
              //                 >
              //                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              //                 </div>
              //               )}
              //               <img
              //                 src={img.src}
              //                 alt={img.alt}
              //                 className='cursor-pointer hover:shadow transition-shadow duration-300 p-5'
              //                 style={{
              //                   maxWidth: "100%",
              //                   maxHeight: "100%",
              //                   objectFit: "contain",
              //                   display: "block",
              //                   opacity: loadingImages.has(img.placeholder) ? 0.3 : 1,
              //                   transition: 'opacity 0.3s'
              //                 }}
              //                 onLoadStart={() => {
              //                   setLoadingImages(prev => new Set(prev).add(img.placeholder));
              //                 }}
              //                 onLoad={() => {
              //                   setLoadingImages(prev => {
              //                     const newSet = new Set(prev);
              //                     newSet.delete(img.placeholder);
              //                     return newSet;
              //                   });
              //                 }}
              //                 onError={() => {
              //                   setLoadingImages(prev => {
              //                     const newSet = new Set(prev);
              //                     newSet.delete(img.placeholder);
              //                     return newSet;
              //                   });
              //                 }}
              //                 onClick={() => handleImageClick(img.src)} 
              //               />
              //             </div>
              //           ),
              //         ])
              //       : segment
              //   );
              // });
              <img
                key={`${img.placeholder}-${pIndex}`}
                src={img.src}
                alt={img.alt}
                className='cursor-pointer hover:shadow transition-shadow duration-300 p-5'
                style={{
                  maxWidth: "100%",
                  maxHeight: "350px",
                  objectFit: "contain",
                  display: "block",
                  margin: "0.5em auto",
                }}
                onClick={() => handleImageClick(img.src)}

              />
            ),
          ])
          : segment
      );
    });
    return parts.filter(Boolean);
  };

  // Step 2: Create a custom p tag renderer
  const customRenderers = useMemo(() => ({
    p: ({ children }) => {
      const childrenArray = Array.isArray(children) ? children : [children];

      const processedChildren = childrenArray.flatMap((child) => {
        if (typeof child === "string") {
          return processTextWithPlaceholders(child);
        }
        return child;
      });

      return <p className="mb-2 last:mb-0">{processedChildren}</p>;
    },
    h1: ({ children }) => {
      const processed = typeof children === "string" ? processTextWithPlaceholders(children) : children;
      return <h1 className="text-lg font-bold mb-2 mt-0">{processed}</h1>;
    },
    h2: ({ children }) => {
      const processed = typeof children === "string" ? processTextWithPlaceholders(children) : children;
      return <h2 className="text-base font-bold mb-2 mt-0">{processed}</h2>;
    },
    h3: ({ children }) => {
      const processed = typeof children === "string" ? processTextWithPlaceholders(children) : children;
      return <h3 className="text-base font-bold mb-1 mt-0">{processed}</h3>;
    },
    code: ({ className, children, ...props }: any) => {
      const isInline = !className?.includes('language-');
      return isInline ? (
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono whitespace-pre-wrap break-words ">
          {children}
        </code>
      ) : (
        <pre className="bg-muted p-3 rounded-md overflow-x-auto">
          <code className="text-xs font-mono">{children}</code>
        </pre>
      );
    },
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-accent pl-4 italic my-2">
        {children}
      </blockquote>
    ),

    ul: ({ children }) => <ul className="list-disc list-outside pl-6 mb-2 break-words">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-outside pl-6 mb-2 break-words">{children}</ol>,
    li: ({ children }) => {
      const childrenArray = Array.isArray(children) ? children : [children];
      const processedChildren = childrenArray.flatMap((child) => {
        if (typeof child === "string") {
          return processTextWithPlaceholders(child);
        }
        return child;
      });
      return <li className="mb-1">{processedChildren}</li>;
    },
    table: ({ children }) => (
      <div className="overflow-x-auto my-2">
        <table className="min-w-full border-collapse border border-border">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-border px-2 py-1 whitespace-normal break-words sm:break-normal sm:whitespace-normal break-all">
        {children}
      </td>
    ),
    a: ({ href, children }) => {
      const isEmail = href?.startsWith("mailto:");
      const emailColor = isUser ? '#ffffff' : '#000000';

      return (
        <a
          href={href}
          className={`underline ${isEmail ? emailColor : "text-accent hover:text-accent/80"}`}
          target={isEmail ? undefined : "_blank"}
          rel={isEmail ? undefined : "noopener noreferrer"}
        >
          {children}
        </a>
      );
    },
    img: ({ src, alt }) => {
      return null;
    },
    hr: () => <hr className="border-border my-4" />
  }), [inlineImages, isUser]);


  return (
    <div
      className={cn(
        "flex w-full mb-6 group ",
        isUser ? "justify-end" : "justify-start"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='flex flex-col max-w-[85%]'>
        <div className={cn(
          " rounded-xl px-4 py-2 shadow-sm relative",
          isUser
            ? "bg-primary text-primary-foreground ml-auto"
            : "bg-card border border-border"
        )}>
          {/* User Images - Simple display without preprocessing */}
          {isUser && images && images.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {images.map((image: any, index: number) => {
                const imageData = image.data || image;
                const mimeType = image.mimeType || 'image/png';
                const imageSrc = typeof imageData === 'string' && imageData.startsWith("data:image")
                  ? imageData
                  : `data:${mimeType};base64,${imageData}`;

                return (
                  <img
                    key={index}
                    src={imageSrc}
                    alt={`User image ${index + 1}`}
                    className="rounded-md max-w-full max-h-64 object-contain cursor-pointer hover:shadow-2xl transition-shadow duration-300"
                    onClick={() => handleImageClick(imageSrc)}
                  />
                );
              })}
            </div>
          )}

          {/* Reasoning Section - Only for AI responses */}
          {/* Reasoning Section - Only for AI responses */}
          {!isUser && reasoning && (
            <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Reasoning
                </span>
              </div>

              {/* Reasoning blocks */}
              <div
                className={`flex flex-col gap-2 relative overflow-hidden ${expanded ? "max-h-none" : "max-h-[100px]"
                  }`}
              >
                {reasoning
                  .split("[SEP]")
                  .filter((block) => block.trim() !== "")
                  .map((reasoningBlock, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3 bg-white rounded-md border border-blue-100 shadow-sm text-justify"
                    >
                      {/* Dot */}
                      <div className="w-2 h-2 min-w-2 bg-blue-500 rounded-full mt-1.5 animate-pulse" />

                      <div className="flex-1">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => (
                              <h1 className="text-lg font-bold mb-2 mt-0">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-base font-bold mb-2 mt-0">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-base font-bold mb-1 mt-0">
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="text-sm leading-6 m-0">
                                {children}
                              </p>
                            ),
                            li: ({ children }) => (
                              <li className="ml-4 text-sm list-disc">
                                {children}
                              </li>
                            ),
                          }}
                        >
                          {reasoningBlock}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
              </div>

              {/* See more / less */}
              {reasoning.replace(/\[SEP\]/g, "").length > 100 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
                >
                  {expanded ? "See less" : "See more"}
                </button>
              )}
            </div>
          )}



          {/* AI Images - Complex preprocessing (only for non-inline images) */}
          {/* {!isUser && images && images.length > 0 && inlineImages.length === 0 && (
           message.includes('[[IMAGE_') && (
          <div className=" flex flex-wrap gap-2">
            {images.flatMap(rawSource => 
              rawSource.base_64?.map((base64String, index) => {
                const tag = rawSource.img_tag?.[index]; 
                return (
                  <img
                    key={`${rawSource.img_id}-${index}`} 
                    src={`data:image/png;base64,${base64String}`} 
                    alt={tag || `Image ${index + 1}`} 
                    className="rounded-md max-w-full max-h-64 object-contain cursor-pointer hover:shadow-2xl transition-shadow duration-300"
                    onClick={() => handleImageClick(`data:image/png;base64,${base64String}`)}
                  />
                );
              }) || []
            )}
          </div>)
        )} */}

          {/* Canvas Message Title Card */}
          {!isUser && isCanvasMessage ? (
            <>
              <div className="bg-muted/30 rounded-lg border border-border p-4 mb-3 cursor-pointer" onClick={handleOpenDocument}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-8 w-8 text-primary" />
                    <h3 className="font-medium text-md">{title}</h3>
                  </div>
                  <button
                    // variant="ghost" 
                    // size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={handleOpenDocument}
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {Array.isArray(toolType) && toolType.includes("canvas") && (
                <div className="prose prose-sm max-w-none dark:prose-invert overflow-hidden">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={customRenderers}
                  >
                    {contentWithoutInlineImages}
                  </ReactMarkdown>

                  {!isUser && sources && sources.length > 0 && (
                  <div className="mt-2 leading-relaxed" style={{wordBreak:"break-word"}}>
                      <div className="font-bold mb-1" style={{ fontWeight: "bold", marginBottom: 4 }}>
                        Referred sources:
                      </div>
                      <ul style={{ marginLeft: 20, listStyleType: "disc" }}>
                        {sources.map((src, index) => (
                          <li key={index}>
                            {src.startsWith("http") ? (
                              <a
                                href={src}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                {src}
                              </a>
                            ) : (
                              <span>{src}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Main Response - Non-canvas messages */
            <div className="prose prose-sm max-w-[600px] dark:prose-invert overflow-hidden ">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={customRenderers}
              >
                {contentWithoutInlineImages}
              </ReactMarkdown>
              {!isUser && sources && sources.length > 0 && (
              <div className="mt-2 leading-relaxed" style={{wordBreak:"break-word"}}>
                  <div className="font-bold mb-1" style={{ fontWeight: "bold", marginBottom: 4 }}>
                    Referred sources:
                  </div>
                  <ul style={{ marginLeft: 20, listStyleType: "disc" }}>
                    {sources.map((src, index) => (
                      <li key={index}>
                        {src.startsWith("http") ? (
                          <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {src}
                          </a>
                        ) : (
                          <span>{src}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Files Section */}
          {files && (
            <div className=" flex flex-wrap gap-2">
              {!isUser && images && (
                Array.isArray(images)
                  ? images.length > 0
                  : ""
              ) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="w-full">
                      <h1 className="text-md font-bold mb-2">Image Source</h1>
                    </div>

                    {(Array.isArray(images) ? images : [images]).map((image: any, index: number) => {
                      const imageData = typeof image === 'string' ? image : image?.data;

                      return (
                        <img
                          key={index}
                          src={imageData.startsWith("data:image") ? imageData : `data:image/jpeg;base64,${imageData}`}
                          className="rounded-md max-w-full max-h-64 object-contain cursor-pointer hover:shadow-2xl transition-shadow duration-300"
                          onClick={() =>
                            handleImageClick(
                              imageData.startsWith("data:image") ? imageData : `data:image/jpeg;base64,${imageData}`
                            )
                          }
                        />
                      );
                    })}
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between space-x-2 mt-1">
          <div className={cn(
            "flex items-center gap-1 transition-opacity duration-200",
            "opacity-100 md:opacity-0 md:group-hover:opacity-100",
          )}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className={cn(
                "h-7 px-2 text-xs",
                "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {copied ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              <span className="hidden sm:inline">
                {copied ? "Copied" : "Copy"}
              </span>
            </Button>

            {!isUser && (
              <>
                {!isCanvasMessage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRegenerate}
                    className="h-7 px-2 text-xs hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Retry</span>
                  </Button>
                )}

                <div className="flex items-center gap-0.5">
                  {/* {!contentAgentConnected && (
                  <> */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleThumbsUp()}
                    className="h-7 w-7 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                    style={feedbackType === "up" ? { color: "blue" } : {}}
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNegativePopup(!showNegativePopup)}
                    className="h-7 w-7 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                    style={feedbackType === "down" ? { color: "red" } : {}}
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                  {/* </>
                )} */}
                </div>
                {driveEnabled && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-7 w-7 p-0",
                          isUser
                            ? "hover:bg-primary-foreground/20 text-primary-foreground/70 hover:text-primary-foreground"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48">
                      {driveEnabled && (
                        <DropdownMenuItem>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center w-full">
                              <HardDrive className="h-4 w-4 mr-2" />
                              Add to Drive
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              side="right"
                              align="start"
                              className="w-48 mb-10 mr-2"
                              onCloseAutoFocus={(e) => e.preventDefault()}
                            >
                              {driveConnections?.map(conn => (
                                <DropdownMenuItem
                                  key={conn.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectDriveUser(conn.id, e);

                                    const closeEvent = new KeyboardEvent('keydown', {
                                      key: 'Escape',
                                      bubbles: true
                                    });
                                    document.dispatchEvent(closeEvent);
                                  }}
                                  onSelect={(e) => {
                                    e.preventDefault();
                                  }}
                                >
                                  {conn.userinfo}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>

          {displayTimestamp && (
            <div
              className={cn(
                "text-xs opacity-70 ml-auto mt-1 text-muted-foreground"
              )}
            >
              {displayTimestamp}
            </div>
          )}
        </div>

        {selectedImage && (
          <ImageViewer
            image={selectedImage}
            onClose={handleCloseViewer}
          />
        )}
      </div>
      {showNegativePopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-[420px] max-w-[90vw]">
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">Feedback</h2>
            <label className="block text-sm font-medium mb-2 text-gray-700">Why did you dislike the response?</label>
            <textarea
              ref={NegativeInputRef}
              className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition mb-4 text-base resize-none outline-none"
              rows={5}
              placeholder="Please share your reason..."
            ></textarea>
            <div className="flex justify-end gap-3 mt-2">
              <button
                className="px-5 py-2 bg-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-300 transition"
                onClick={() => setShowNegativePopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition shadow"
                onClick={handleThumbsDown}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};