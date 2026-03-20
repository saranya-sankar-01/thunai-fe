import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Video, Link2, ExternalLink, Calendar, User, Eye, MessageSquare, Star, Tag, Brain, Lightbulb, BookOpen, Zap, ArrowLeft, Edit3, AlertTriangle, GitBranch, History, Copy, Share2, Lock, Unlock, Loader2, View, Minimize2, Maximize2, Trash2, Plus, X, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {KnowledgeBaseItem} from '@/types/KnowledgeBaseItem'
import { getTenantId, getUrlIdentifier, requestApi } from '../services/authService';
import { useKnowledgeBaseStore } from '../store/knowledgeBaseStore';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from "remark-gfm";
import { useDocumentViewStore } from '../store/useDocumentViewStore';
import rehypeRaw from "rehype-raw";
import { DeleteConfirmationDialog } from '../components/shared-components/DeleteConfirmationDialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import ISTTime from '@/components/shared-components/ISTTime';
import usePermissions from '@/hooks/usePermissions';

const DocumentViewer = () => {
  const { id } = useParams<{ id: string }>();
  const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || window['env']['API_ENDPOINT'];
  const DOMAIN = import.meta.env.VITE_DOMAIN || window['env']['DOMAIN'];
  const tenantID = getTenantId();
  const Url_Identifier = getUrlIdentifier();
  const publicUrl= `${API_ENDPOINT}/brain-service/brain/view/public/${Url_Identifier}/${tenantID}/${id}/`
  const {loadFiles} = useKnowledgeBaseStore()
  const navigate = useNavigate();
  const [document, setDocument] = useState<KnowledgeBaseItem>(null);
  const [userInput, setUserInput] = useState('');
  const [showTeachThunai, setShowTeachThunai] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [updateInstructions, setUpdateInstructions] = useState('');
  const [impactedDocs, setImpactedDocs] = useState<KnowledgeBaseItem[]>([]);
  const [selectedImpactedDocs, setSelectedImpactedDocs] = useState<string[]>([]);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [isPublic, setIsPublic] = useState(document?.public_share ?? false);
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false);
  const [isTeaching, setIsTeaching] = useState(false);
const [editTitle, setEditTitle] = useState('');
const [isInlineEditing, setIsInlineEditing] = useState(false);
const [inlineContent, setInlineContent] = useState('');
const [publicSharingLoading, setPublicSharingLoading] = useState(false);
  const { loadingId, viewDocument } = useDocumentViewStore();
   const isViewing = loadingId === id;
  const [isFullScreen, setIsFullScreen] = useState(false); // New state for full screen
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting,setIsDeleting] = useState(false)
  const [categories, setCategories] = useState<string[]>([]);
const [newTag, setNewTag] = useState('');
const [isMetadataSaving, setIsMetadataSaving] = useState(false);
const [pendingCategory, setPendingCategory] = useState('');
const [pendingTags, setPendingTags] = useState<string[]>([]);
const [isVersionLoading, setIsVersionLoading] = useState(false);
const [revertingVersion, setRevertingVersion] = useState<number | null>(null);
//permissions

  const { canViewModule, canModifyModule } = usePermissions();
  const canView = canViewModule("knowledgebase_publicshare");
  const canModify = canModifyModule("knowledgebase_publicshare");
  const canModifyCategories = canModifyModule("knowledgegraph")
    const canviewKnowledgeBase = canViewModule("knowledgebase");
    const canModifyKnowledgeBase = canModifyModule("knowledgebase");
console.log('Can Modify:', canModify);

// Update the handleOpenEdit function
const handleOpenEdit = () => {
  if (!document) return;
   setImpactedDocs([]);
  setSelectedImpactedDocs([]);
  setUpdateInstructions(document.extracted_text || document.original_text || '');
  setEditTitle(document.title);
  setShowEditDialog(true);
};

useEffect(() => {
  if (document) {
    setPendingCategory((Array.isArray(document.category) ? document.category[0] : document.category) || "");
    setPendingTags(document.tags || []);
  }
}, [document]);

const hasMetadataChanges = useMemo(() => {
  if (!document) return false;
  const currentCategory = (Array.isArray(document.category) ? document.category[0] : document.category) || "";
  const categoryChanged = pendingCategory !== currentCategory;
  const tagsChanged = JSON.stringify([...pendingTags].sort()) !== JSON.stringify([...(document.tags || [])].sort());
  return categoryChanged || tagsChanged;
}, [document, pendingCategory, pendingTags]);

const processAddTag = () => {
  if (newTag.trim()) {
    if (!pendingTags.includes(newTag.trim())) {
      setPendingTags([...pendingTags, newTag.trim()]);
    }
    setNewTag('');
  }
};

const handleAddTag = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    processAddTag();
  }
};

const removeTag = (tagToRemove) => {
  setPendingTags(pendingTags.filter(t => t !== tagToRemove));
};

const handleSaveMetadata = async () => {
 setIsMetadataSaving(true); 
  await updateMetadata(pendingCategory, pendingTags);
  setIsMetadataSaving(false);
};

useEffect(() => {
  if (canModifyCategories){
  getCategory();
  }
},[])
  const getCategory = async () => {
  try {
    const response = await requestApi(
      "GET",
      `brain/knowledge-category/categories/${tenantID}/`,
      null,
      "brainService"
    );

    const result = response
    console.log(result);
    setCategories(result.data);
  } catch (error: any) {
    console.error("Error fetching categories:", error);

    toast(
        error.response?.data?.message || error.response?.data?.detail ||
        error.response?.data || error?.response?.message ||
        "Failed to fetch categories. Please try again.",
    );
  }
};
const updateMetadata = async (updatedCategory, updatedTags) => {
  try {
    const payload = {
      category: updatedCategory,
      tags: updatedTags
    };
    
    const response = await requestApi(
      "PUT", 
      `brain/knowledge-base/${tenantID}/${id}/`, 
      payload, 
      "brainService"
    );

    if (response) {
      await getFileDetail();
      toast.success("Updated successfully");
    }
  } catch (error) {
    console.error("Update error:", error);
    toast.error( error?.response?.data?.message || "Failed to update metadata");
  }
};

const handleRetrain = async () => {
  setIsSaving(true);
  try {
    const updateData = {
      extracted_text: inlineContent,
      status: "retrain",
    };

    const response = await requestApi(
      "POST",
      `brain/knowledge-base-retrain/${tenantID}/${id}`,
      updateData,
      "brainService"
    );

    if (response) {
  await getFileDetail();
    setIsInlineEditing(false);
  toast("Document updated successfully!", { icon: "✅" });
} else {
  toast.error(response?.data?.message || response.message || "Something went wrong.");
}
  } catch (err) {
    console.error("Retrain error:", err);
    toast.error(err?.message || "Something went wrong.");
  } finally {
    setIsSaving(false);
  }
};
const handleRetrainForTeachThunai = async () => {
      setIsTeaching(true)
  try {
    const updateData = {
      ai_instructions: userInput,
      status: "retrain",
    };

    const response = await requestApi(
      "POST",
      `brain/knowledge-base-retrain/${tenantID}/${id}`,
      updateData,
      "brainService"
    );

    if (response) {
toast.success(response?.data?.message ||  response.message || "Thunai has been taught successfully!");
} else {
  toast.error(response?.data?.message || response.message || "Something went wrong.");
}
  } catch (err) {
    console.error("Retrain error:", err);
    toast.error(err?.message || err?.response?.message || "Something went wrong.");
  } finally {
         setIsTeaching(false)
  }
};
// Update the handleApplyDocumentChanges function
const handleApplyDocumentChanges = async (updateType = 'inline') => {
  if (!document) return;
    
  try {
     let updateData;
  if (updateType === 'inline') {
    setIsSaving(true);
      updateData = {
        content: inlineContent,
      };
    } else if (updateType === 'instruction') {
    if (!userInput.trim()) return;

      setIsTeaching(true)
      updateData = {
        ai_instructions: userInput
      };
    } else {
      setIsSaving(true);
      updateData = {
        title: editTitle,
      };
    }
    const response = await requestApi("PUT", `brain/knowledge-base/${tenantID}/${document.id}/`, updateData, "brainService");
    
    // if (response.status === 200) {
      await getFileDetail()
      toast("Document updated successfully!", { icon: "✅" });
    if (updateType === 'inline') {
        setIsInlineEditing(false);
      }
    // }
  } catch (error: any) {
    console.error("Update document error:", error);
    toast.error(error?.response?.data?.message || error?.response?.message || "Failed to update document. Please try again.");
  }finally {
    setIsSaving(false); 
      setIsTeaching(false)

  }
  
  setShowEditDialog(false);
  setUpdateInstructions('');
  setEditTitle('');
  setSelectedImpactedDocs([]);
  setImpactedDocs([]);
};
  useEffect(() => {
      const fetchData = async () => {
    try {
      setLoading(true);
      await getFileDetail();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchData()
  }, [id]);

const getFileDetail = async (versionNumber?: number) => {
  try {
  setLoading(true)

    const url = versionNumber 
      ? `brain/knowledge-base/${tenantID}/${id}/?version=${versionNumber}`
      : `brain/knowledge-base/${tenantID}/${id}/`;
      
    let response = await requestApi("GET", url, null, "brainService");

    setDocument(response.data as unknown as KnowledgeBaseItem);
  } catch (error: any) {
    console.error("Load files error:", error);
    toast.error(error?.response?.data?.message || "Failed to load version details.");
  } finally {
    setLoading(false);
    setIsVersionLoading(false);
  }
};

const handleRevert = async (versionNumber: number) => {
  setRevertingVersion(versionNumber);
  try {
    const payload = {
      version: versionNumber,
      status: "revert"
    };
    
    const response = await requestApi(
      "PUT", 
      `brain/knowledge-base/${tenantID}/${id}/`, 
      payload, 
      "brainService"
    );

    if (response) {
      toast.success(`Successfully reverted to Version ${versionNumber}`);
      setShowHistoryDialog(false);
      await getFileDetail(); // Refresh to latest
    }
  } catch (error: any) {
    console.error("Revert error:", error);
    toast.error(error?.response?.data?.message || "Failed to revert version");
  } finally {
    setRevertingVersion(null);
  }
};

  const toggleImpactedDoc = (docId: string) => {
    setSelectedImpactedDocs(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };


  const copyPublicUrl = async () => {
    // if (!document?.publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast("Public URL copied to clipboard!", { icon: "📋" });
    } catch (err) {
      toast("Failed to copy URL", { icon: "❌" });
    }
  };

const formatContentForMarkdown = (text) => {
  if (!text) return '';

  // Detect if text has delimiters
  const hasDelimiters = text.includes(' ⸻ ') || text.includes(' • ');
  if (!hasDelimiters) {
    // Plain text – return as-is
    return text.trim();
  }

  const sectionDelimiter = ' ⸻ ';
  const subDelimiter = ' • ';
  const sections = text.split(sectionDelimiter);
  const formattedOutput = [];

  sections.forEach(section => {
    const trimmedSection = section.trim();
    if (!trimmedSection) return;

    const [mainTitle, ...rest] = trimmedSection.split(subDelimiter);
    formattedOutput.push(`## ${mainTitle.trim()}`);

    if (rest.length > 0) {
      const subItems = rest.join(subDelimiter).split(subDelimiter);
      let inSubSection = false;

      subItems.forEach(item => {
        const trimmedItem = item.trim();
        if (!trimmedItem) return;

        if (/:$/.test(trimmedItem) || trimmedItem.includes(':')) {
          formattedOutput.push(`* ${trimmedItem}`);
          inSubSection = true;
        } 
        else if (inSubSection) {
          formattedOutput.push(`  * ${trimmedItem}`);
        } 
        else {
          formattedOutput.push(`* ${trimmedItem}`);
        }
      });
    }

    formattedOutput.push('');
  });

  return formattedOutput.join('\n').trim();
};



// Add useEffect to sync isPublic with document state
useEffect(() => {
  if (document) {
    setIsPublic(document.public_share || false);
    // setInlineContent(document.extracted_text || document.original_text || '');
     const contentToFormat = document.extracted_text || document.original_text || '';
    // Format the content here before setting it to inlineContent
    setInlineContent(formatContentForMarkdown(contentToFormat));
  }
}, [document]);

const handleTogglePublic = async (checked: boolean) => {
  setPublicSharingLoading(true);
  try {
  const updateData = {
      public_share: checked
    };
    const response = await requestApi("PUT", `brain/knowledge-base/${tenantID}/${id}/`, updateData, "brainService");
    setIsPublic(checked);
    if (document) {
      setDocument({ ...document, public_share: checked });
    }
    
    toast(
      checked ? "Document made public - accessible via public URL" : "Document made private - public URL disabled",
    );
  } catch (error) {
    console.error("Error toggling public sharing:", error);
    toast.error(error?.response?.data?.message || `Failed to ${checked ? 'enable' : 'disable'} public sharing. Please try again.`);
  } finally {
    setPublicSharingLoading(false);
  }
};

  const handleView = () => {
    viewDocument(tenantID, id);
  };

  const getTypeIcon = () => {
    switch (document.type) {
      case 'file':
        return <FileText className="w-6 h-6" />;
      case 'web-link':
        return <Link2 className="w-6 h-6" />;
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'stream':
        return <Zap className="w-6 h-6" />;
    }
  };

  const getOverviewTitle = () => {
    switch (document.type) {
      case 'file':
        return 'Document Overview';
      case 'web-link':
        return 'Link Overview';
      case 'video':
        return 'Video Overview';
      case 'text':
        return 'Text Overview';
         case 'image':
        return 'image Overview'
      case 'stream':
        return 'Stream Overview';
      default:
        return 'Overview'
    }
  };

const { contentWithoutImages, images } = useMemo(() => {
  const text = inlineContent;
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
}, [inlineContent]);
const ConfirmDelete = () => {
  setIsDeleteDialogOpen(true)
}

 const handleDelete = async () => {
  setIsDeleting(true)
    try {
      const response = await requestApi("DELETE", `brain/knowledge-base/${tenantID}/`,   { id: [id] },"brainService");
    navigate("/brain")
      toast.success(response.message || "Deleted successfully");
    } 
    catch (error: any) {
    console.error("Delete error:", error);
    toast.error(
      error?.response?.data?.message || error?.response?.message ||
      "Something went wrong while deleting. Please try again."
    );
  } finally {
      setIsDeleting(false)
    }
  };

  // Common function to process images in children
  const processImagesInChildren = (children) => {
    const childrenArray = Array.isArray(children) ? children : [children];

    return childrenArray.flatMap((child) => {
      if (typeof child === "string") {
        let parts: Array<string | JSX.Element> = [child];

        images.forEach((img, idx) => {
          parts = parts.flatMap((segment) =>
            typeof segment === "string"
              ? segment.split(img.placeholder).flatMap((piece, pIndex) => [
                  piece,
                  pIndex < segment.split(img.placeholder).length - 1 && (
                    <img
                      key={`${img.placeholder}-${pIndex}`}
                      src={img.src}
                      alt={img.alt}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "75vh",
                        objectFit: "contain",
                      }}
                    />
                  ),
                ])
              : segment
          );
        });

        return parts.filter(Boolean);
      }

      return child;
    });
  };

  // Custom renderer for ReactMarkdown
const renderers = useMemo(() => ({
  p: ({ children }) => <p>{processImagesInChildren(children)}</p>,
   ul: ({ children }) => <ul className="list-disc list-outside pl-6 break-words">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal  pl-6 break-words">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{processImagesInChildren(children)}</li>,
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
}), [images]);



// if (loading) {
//   return (
//     <div className="container mx-auto px-6 py-12 text-center">
//       <h1 className="text-2xl font-bold text-muted-foreground">Loading...</h1>
//     </div>
//   );
// }
  const handleBackNavigation = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromKnowledgeGraph = urlParams.get('from') === 'knowledge-graph';
    
    if (fromKnowledgeGraph) {
      window.location.href = `${DOMAIN}/knowledgebase/brain`;
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
    <div className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 p-2 z-50">
  <Button
    variant="ghost"
    onClick={handleBackNavigation}
    className="hover:bg-muted bg-white justify-start"
  >
    <ArrowLeft className="w-4 h-4 mr-2" />
    Back to Documents
  </Button>
</div>

    <div className="container mx-auto px-6 pt-16">
        {/* Back Button */}
    {loading ? (
                <div className="flex items-center justify-center h-screen">
  <Loader2 className="h-14 w-14 animate-spin text-primary" />
</div>
                ) : document ? (
        <div className={`grid grid-cols-1 gap-8 mb-18 ${isFullScreen ? 'h-full' : 'lg:grid-cols-3'}`}>
          {/* Left Pane - Original Content */}

          <div className={`space-y-6 ${isFullScreen ? 'lg:col-span-3 h-full' : 'lg:col-span-2'}`}>
             {/* <ScrollArea className="h-[calc(100vh-110px)] " > */}

            <Card className={isFullScreen ? 'h-full flex flex-col' : ''}>
              <CardHeader className={isFullScreen ? 'hidden' : ''}>
                <div className="flex items-center space-x-3">
                  <div>
                    {/* <CardTitle className="text-xl">{document?.title || document?.file_name}<Edit3 className="w-4 h-4" onClick={handleOpenEdit} /></CardTitle> */}
                    <CardTitle className="text-xl flex items-center gap-2">
  <span>{document?.title || document?.file_name}</span>
  {canModifyKnowledgeBase && (
  <Edit3 
    className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-primary transition"
    onClick={handleOpenEdit} 
  />
  )}
</CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-2">
                  {getTypeIcon()}
                  {document.file_name && (
                      <span className="flex items-center space-x-1">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>{document?.file_name}</span>
                      </span>)}
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>{<ISTTime utcString={document.updated}/>}</span>
                      </span>
                      {/* <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{document.views} views</span>
                      </span> */}
                    </CardDescription>
                    <div className="mt-3 flex gap-2">
                      {/* <Button size="sm" onClick={handleOpenEdit} className="flex items-center gap-1">
                        <Edit3 className="w-4 h-4" />
                        Edit with Thunai
                      </Button> */}
                      <Button variant="outline" size="sm" onClick={() => setShowHistoryDialog(true)} className="flex items-center gap-1">
                        <History className="w-4 h-4" />
                        History
                      </Button>
 {canModifyKnowledgeBase && document && !document.is_active && (
    <Button 
      variant="default" 
      size="sm" 
      onClick={() => handleRevert(document.version)}
      disabled={isSaving}
      className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white"
    >
      {isSaving ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <History className="w-4 h-4" />
      )}
      Revert to Version {document.version}
    </Button>
  )}

                      {/* <Button variant="outline" size="sm" onClick={() => handleViewDocument()} className="flex items-center gap-1">
                        <View className="w-4 h-4" />
                        View Document
                      </Button> */}
                            <Button variant="outline" size="sm"  onClick={handleView} disabled={isViewing}  className="flex items-center gap-1">
        {isViewing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Opening...
          </>
        ) : (
          <>
            <Eye className="w-4 h-4" />
          View Document</>
        )}
      </Button>

                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className={isFullScreen ? 'flex-1 overflow-auto p-0' : ''}> {/* Adjusted padding for fullscreen */}
                {document.type === 'stream' ? (
                  <div className="space-y-4">
                    <div className="bg-muted/30 rounded-lg p-6 text-center">
                      <div className="mb-4">
                        {getTypeIcon()}
                      </div>
                      <h3 className="font-medium mb-2">Stream Data Preview</h3>
                      <p className="text-sm text-muted-foreground">
                        Real-time stream: {document.title || document.file_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Visit the Streams section to view full stream analytics
                      </p>
                    </div>
                  </div>
                ) : (

<div className={`space-y-4 ${isFullScreen ? 'h-screen flex flex-col' : ''}`}>
  <div className={`bg-muted/30 rounded-lg p-3 ${isFullScreen ? 'flex-1 flex flex-col h-full' : ''}`}> {/* Adjusted height for fullscreen */}
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-medium">{isInlineEditing? "Edit Original Content" : "Original Content Preview"}</h3>
      <div className="flex items-end gap-2">
       {canModifyKnowledgeBase && (
        <Button
        size = "sm"
          variant="outline"
       onClick={() => ConfirmDelete()}
        >
<Trash2/>
        </Button>
          )}
        <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="flex items-center gap-1"
        >
            {/* <View className="w-4 h-4" /> */}
            {/* {isFullScreen ? 'Exit Full Screen' : 'Full Screen'} */}
             {isFullScreen ? (
    <Minimize2 className="h-4 w-4" />
  ) : (
    <Maximize2 className="h-4 w-4" />
  )}
        </Button>
        {isInlineEditing && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsInlineEditing(false);
              setInlineContent(document?.extracted_text || document.original_text || '');
            }}
          >
            Cancel
          </Button>
        )}
       {canModifyKnowledgeBase && (
      <Button
        size="sm"
        variant={isInlineEditing ? "default" : "outline"}
        onClick={() => {
          if (isInlineEditing) {
            // Save changes
            handleRetrain()
          } else {
            setIsInlineEditing(true);
          }
        }}
        className="flex items-center gap-1"
      >
        {isSaving ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      Saving...
    </>
  ) : (
    <>
      <Edit3 className="w-4 h-4" />
      {isInlineEditing ? 'Save Changes' : 'Edit Content'}
    </>
  )}
      </Button>
       )}
      </div>
    </div>
             <div  className={`show-scrollbar h-[600px] overflow-y-auto ${
    isFullScreen 
    ? 'flex-1 h-full' // Full height for fullscreen
    : (document.type === 'web-link' && !isInlineEditing ? 'h-[calc(100vh-390px)]' : 'h-[calc(100vh-340px)]') 
  }`}>

    {/* Content Editing */}
    {isInlineEditing ? (
      <div className="space-y-2 ">
        <Textarea
          value={inlineContent}
          onChange={(e) => setInlineContent(e.target.value)}
          rows={isFullScreen ? 40 : 18} // Adjust rows for full screen
          className="w-full text-sm font-mono h-[300px] sm:h-[400px] lg:h-[500px] show-scrollbar"
          placeholder="Edit the document content..."
        />
        
      </div>
    ) : (
<div className="prose prose-sm max-w-none overflow-auto 
  break-words pb-12 text-justify pr-4">
    
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkBreaks]}  
        rehypePlugins={[rehypeRaw]}
        components={renderers} // Use the custom renderers         
      >
        {contentWithoutImages || 'No content available'}
      </ReactMarkdown>
     
      </div>
    )}
</div>
    {document.type === 'web-link' && !isInlineEditing && (
      <Button variant="outline" className="mt-4" asChild>
        <a href={document?.links_data} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="w-4 h-4 mr-2" />
          Open Original Link
        </a>
      </Button>
    )}
  </div>
</div>

                )}
              </CardContent>
            </Card>
{/* </ScrollArea> */}

          </div>
          {/* Right Pane - Thunai Learnings */}
             {!isFullScreen && ( // Hide right pane in full screen mode
             <ScrollArea className="h-[calc(100vh-80px)]">

          <div className="space-y-6">
            {/* Teach Thunai - Moved to top */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-blue-700">
                  <Brain className="w-5 h-5 mr-2" />
                  Teach Thunai
                </CardTitle>
                <CardDescription>
                  Help Thunai learn more about this {document.type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showTeachThunai ? (
                  <Button 
                    onClick={() => setShowTeachThunai(true)}
                    disabled = {!canModifyKnowledgeBase}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Your Knowledge
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Share what you know about this content. What context, insights, or connections should Thunai understand?"
                        value={userInput ?? document?.ai_instructions ?? ""}
                      onChange={(e) => setUserInput(e.target.value)}
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      
                      <Button onClick={()=>handleRetrainForTeachThunai()} className="bg-blue-600 hover:bg-blue-700">
                                     {isTeaching ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      Saving...
    </>
  ) : (
   
  
                        "Teach Thunai")}
                      </Button>
                      <Button variant="outline" onClick={() => setShowTeachThunai(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  {getOverviewTitle()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{document.theme || "No content available"}</p>
              </CardContent>
            </Card>

            {/* Public URL */}
            {canView && 
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Share2 className="w-5 h-5 mr-2" />
                  Public Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Public/Private Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    {isPublic ? (
                      <Unlock className="w-5 h-5 text-success" />
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">
                        {isPublic ? "Public Document" : "Private Document"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isPublic 
                          ? "Anyone with the link can view this document"
                          : "Only you and authorized users can access this document"
                        }
                      </p>
                    </div>
                  </div>
                  {canModify &&
                  <div className="flex items-center space-x-2">
                  {
                    publicSharingLoading&&(
                      <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                    )
                  }
                  <Switch
                    checked={isPublic}
                    onCheckedChange={handleTogglePublic}
                    disabled={publicSharingLoading}
                  />
                  </div> 
}
                </div>

                {/* Public URL Section */}
                {isPublic && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Public URL
                    </label>
                    <div className="flex items-center space-x-2 p-3 bg-muted/20 rounded-lg border">
                      <code className="flex-1 text-sm font-mono text-muted-foreground truncate   w-[150px] sm:w-[150px] md:w-[120px] ">
                       {publicUrl}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyPublicUrl}
                        // className="flex-shrink-0"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Share this URL with anyone to give them view access to this {document.type}
                    </p>
                  </div>
                )}

                {!isPublic && (
                  <div className="p-3 bg-muted/10 rounded-lg border border-muted text-center">
                    <p className="text-sm text-muted-foreground">
                      Enable public access to generate a shareable URL
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            }
            {/* Categories & Tags */}

<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0">
    <CardTitle className="flex items-center text-lg">
      <Tag className="w-5 h-5 mr-2" />
    {canModifyCategories ? "Categories & Tags" : "Tags"}
    </CardTitle>
    {hasMetadataChanges && (
      <Button 
        size="sm" 
        onClick={handleSaveMetadata}
        disabled={isMetadataSaving}
      >
        {isMetadataSaving  ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3" />}
        Save
      </Button>
    )}
  </CardHeader>
  <CardContent className="space-y-6">
    {/* Category Dropdown */}
    {canModifyCategories && (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Categories</h4>
      <Select
        value={pendingCategory} 
        onValueChange={setPendingCategory}
      >
        <SelectTrigger className="w-full border-2  rounded-xl h-11 focus:ring-0">
         <SelectValue
  placeholder={
    categories?.length > 0
      ? "Select Category"
      : "No categories available"
  }
/>
        </SelectTrigger>
       <SelectContent className="z-[10000] bg-white shadow-lg border border-slate-200">
  {categories?.length > 0 ? (
    categories.map((cat: any) => (
      <SelectItem
        key={cat.id}
        value={cat.name}
        className="bg-white"
      >
        {cat.name}
      </SelectItem>
    ))
  ) : (
    <div className="px-3 py-2 text-sm text-slate-400 text-center">
      No categories found
    </div>
  )}
</SelectContent>
      </Select>
    </div>
    )}
    {/* Tags UI */}
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tags</h4>
      <div className="flex flex-wrap gap-2 mb-3">
        {pendingTags.map((tag, index) => (
          <Badge 
            key={index} 
            variant="secondary" 
            className="bg-slate-50 text-slate-600 border border-slate-100 px-3 py-1 rounded-full flex items-center gap-1 group"
          >
            {tag}
           { canModifyKnowledgeBase && (
            <X 
              className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors" 
              onClick={() => removeTag(tag)}
            />
           )}
          </Badge>
        ))}
      </div>
           {canModifyKnowledgeBase && (
      <div className="relative flex items-center">
        <Input
          placeholder="Add tag"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleAddTag}
          className="border-0 border-b border-slate-200 rounded-none px-0 focus-visible:ring-0 placeholder:text-slate-400"
        />
    <Button
  variant="outline"
  size="icon"
  onClick={processAddTag}
  
>
  <Plus className="w-4 h-4 text-slate-500 hover:text-primary transition-colors" />
</Button>

    
      </div>
           )}
    </div>
  </CardContent>
</Card>

         
          </div>
            </ScrollArea>
)}
        </div>):(
          <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold text-muted-foreground">Document not found</h1>
        <p className="text-muted-foreground mt-2">The requested document could not be found.</p>
      </div>
        )}
      {/* Edit Document Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Edit Title: {document?.title || document?.file_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
 <div>
        <label className="text-sm font-medium mb-2 block">Document Title</label>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          placeholder="Enter document title..."
        />
      </div>
            <div>
            </div>

            {impactedDocs.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Related Documents
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {impactedDocs.length} may be affected
                  </Badge>
                </div>
                <ScrollArea className="max-h-48 border rounded p-2">
                  {impactedDocs.map((d) => {
                    const isSelected = selectedImpactedDocs.includes(d.id);
                    // const shared = d.categories.filter((cat) => document.categories.includes(cat)).join(', ');
                    return (
                      <div
                        key={d.id}
                        className={`p-2 rounded mb-2 flex items-center gap-2 cursor-pointer ${
                          isSelected ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30 hover:bg-muted/50'
                        }`}
                        onClick={() =>
                          setSelectedImpactedDocs((prev) => (prev.includes(d.id) ? prev.filter((x) => x !== d.id) : [...prev, d.id]))
                        }
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            setSelectedImpactedDocs((prev) => (prev.includes(d.id) ? prev.filter((x) => x !== d.id) : [...prev, d.id]))
                          }
                          className="rounded"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{d.title}</div>
                          {/* <div className="text-xs text-muted-foreground">Shared categories: {shared}</div> */}
                        </div>
                      </div>
                    );
                  })}
                </ScrollArea>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={()=>handleApplyDocumentChanges('dialog')}  className="flex items-center gap-2">
            
               {isSaving ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      Saving...
    </>
  ) : (
    <>
      <Edit3 className="w-4 h-4" />
              Apply Changes
     
    </>
  )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
    <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Version History</DialogTitle>
    </DialogHeader>
    <ScrollArea className="max-h-96 pr-4">
  <div className="space-y-3">
    {[...new Set([...(document?.available_versions || []).map(ver => ver.version), document?.version])]
      .sort((a, b) => (b as number) - (a as number))
      .map((v) => {
        const versionInfo = document?.available_versions?.find(ver => ver.version === v);

        return (
          <div 
            key={v} 
            className={`flex items-center justify-between p-4 border rounded-lg transition-colors cursor-pointer 
              ${document?.version === v ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}
              ${isVersionLoading ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => {
              getFileDetail(v);
              setShowHistoryDialog(false);
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-full">
                {isVersionLoading && document.version === v ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <GitBranch className="w-4 h-4 text-primary" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Version {v}</span>
                  
                  {v === document?.version && document?.is_active && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      LATEST
                    </Badge>
                  )}
                  
                  {document?.version === v && (
                    <Badge variant="outline" className="text-xs">Viewing</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {versionInfo?.created ? <> <ISTTime utcString={versionInfo?.created}/></> : "Click to preview content"}
                </p>
              </div>
            </div>
           { canModifyKnowledgeBase && (
            <Button 
              size="sm" 
              variant="default"
              disabled={revertingVersion !== null || isVersionLoading || v === document?.version} 
              onClick={(e) => {
                e.stopPropagation();
                handleRevert(v);
              }}
            >
              {revertingVersion === v ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Revert"
              )}
            </Button>
           )}
          </div>
        );
      })}
  </div>
</ScrollArea>

  </DialogContent>
</Dialog>
      </div>
       <DeleteConfirmationDialog
      isOpen={isDeleteDialogOpen}
      onClose={() => setIsDeleteDialogOpen(false)}
      onConfirm={handleDelete}
      title={`Delete`}
      description={`Are you sure you want to delete? This action cannot be undone.`}
      isDeleting={isDeleting}
    />
    </div>
  );
};

export default DocumentViewer;

