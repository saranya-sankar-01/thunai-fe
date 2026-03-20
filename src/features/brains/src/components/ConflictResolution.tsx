import { useState, useCallback ,useEffect,useRef} from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import rehypeRaw from 'rehype-raw'; 

import { 
  AlertTriangle, 
  FileText, 
  Edit3, 
  CheckCircle, 
  ArrowRight,
  Brain,
  Lightbulb,
  AlertCircle,
  GitBranch,
  Eye,
  BookOpen,
  Zap,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ViewIcon,
  View,
  Sparkles
} from 'lucide-react';
import { Contradiction } from '@/types/Contradiction';
import { getTenantId, requestApi } from '@/services/authService';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from "remark-gfm";
import { marked } from 'marked';
import TurndownService from 'turndown';
import { useDocumentViewStore } from '@/store/useDocumentViewStore';
import { useNavigate } from 'react-router-dom';
import ReactDiffViewer from 'react-diff-viewer-continued';
import React from 'react';


interface Document {
  id: string;
  title: string;
  categories: string[];
  lastModified: string;
  version: string;
  uploader: string;
  tags: string[];
  url: string;
  content?: string;
  aiSummary?: string;
  extracted_text?: string;
}

interface ConflictResolutionProps {
  contradiction: Contradiction;
  onClose: () => void;
  onResolve: (contradictionId: string, resolution: any) => void;
  getContradictionAndRelationship: () => void;
  setLastActiveTab: (tab: string) => void; // Add setLastActiveTab to props
}

export const ConflictResolution = ({ contradiction, onClose, onResolve, getContradictionAndRelationship, setLastActiveTab }: ConflictResolutionProps) => {
  const tenantID =getTenantId() // Using the provided tenantID
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedResolutionTypes, setSelectedResolutionTypes] = useState<string[]>([]);
  const [editedLearning, setEditedLearning] = useState(contradiction.ai_instructions || '');
  const navigate = useNavigate(); 
  const turndownService = new TurndownService();
  const [showFullDocumentView, setShowFullDocumentView] = useState(false);
  const [document1FullContent, setDocument1FullContent] = useState<string>('');
  const [document2FullContent, setDocument2FullContent] = useState<string>('');
  const [loadingDocumentContent, setLoadingDocumentContent] = useState(false);
const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
const [editedContent1, setEditedContent1] = useState('');
const [editedContent2, setEditedContent2] = useState('');
const [isSaving, setIsSaving] = useState(false);
const [originalContent1, setOriginalContent1] = useState('');
const [originalContent2, setOriginalContent2] = useState('');
const editableRef1 = useRef<HTMLDivElement>(null);
const editableRef2 = useRef<HTMLDivElement>(null);
 const { loadingId, viewDocument } = useDocumentViewStore();
   const [showThunaiPopup, setShowThunaiPopup] = useState(false);
  const [thunaiPrompt, setThunaiPrompt] = useState('');
  const [thunaiLoading, setThunaiLoading] = useState(false);
  const [showThunaiComparison, setShowThunaiComparison] = useState(false);
  const [thunaiOldText, setThunaiOldText] = useState('');
  const [thunaiNewText, setThunaiNewText] = useState('');
  const [currentThunaiDoc, setCurrentThunaiDoc] = useState<{id: string, index: number} | null>(null);
  const [isIgnoring, setIsIgnoring] = useState(false);
  const [showIgnoreDialog, setShowIgnoreDialog] = useState(false);
const [ignoreReason, setIgnoreReason] = useState('');

console.log(contradiction)
//  ignoring the contradiction
const handleIgnore = async () => {
  try {
    setIsIgnoring(true);
    const response = await requestApi(
      'PATCH',
      `brain/knowledge-graph/relationships/${tenantID}/`,
      {
        relationships: [
          {
            id: contradiction.id,
            status: 'ignored',
            reason_to_ignore: ignoreReason 
          }
        ]
      },
      'brainService'
    );

    if (response) {
      await getContradictionAndRelationship();
      setShowIgnoreDialog(false); 
      onClose();
    }
  } catch (error) {
    console.error('Error ignoring contradiction:', error);
  } finally {
    setIsIgnoring(false);
  }
};

const highlightTextInHtml = (htmlContent: string, phraseToHighlight: string | undefined) => {
  if (!htmlContent || !phraseToHighlight) return htmlContent;

  // Create a temporary DOM element
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Get plain text and find the phrase
  const plainText = tempDiv.textContent || '';
  const lowerText = plainText.toLowerCase();
  const lowerPhrase = phraseToHighlight.toLowerCase().trim();
  const phraseIndex = lowerText.indexOf(lowerPhrase);
  
  if (phraseIndex === -1) {
    console.log('❌ Phrase not found:', phraseToHighlight);
    return htmlContent;
  }

  console.log('✅ Found phrase at plain text index:', phraseIndex);

  // Walk through text nodes and find the exact position
  const walker = document.createTreeWalker(
    tempDiv,
    NodeFilter.SHOW_TEXT,
    null
  );

  let currentPos = 0;
  let startNode: Text | null = null;
  let startOffset = 0;
  let endNode: Text | null = null;
  let endOffset = 0;
  let found = false;

  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    nodes.push(node as Text);
  }

  // Find start and end nodes
  for (const textNode of nodes) {
    const nodeText = textNode.textContent || '';
    const nodeLength = nodeText.length;
    const nodeEnd = currentPos + nodeLength;

    // Check if phrase starts in this node
    if (!startNode && phraseIndex >= currentPos && phraseIndex < nodeEnd) {
      startNode = textNode;
      startOffset = phraseIndex - currentPos;
    }

    // Check if phrase ends in this node
    const phraseEnd = phraseIndex + phraseToHighlight.length;
    if (startNode && phraseEnd > currentPos && phraseEnd <= nodeEnd) {
      endNode = textNode;
      endOffset = phraseEnd - currentPos;
      found = true;
      break;
    }

    currentPos = nodeEnd;
  }

  if (!found || !startNode || !endNode) {
    console.log('❌ Could not locate text nodes');
    return htmlContent;
  }

  try {
    // If start and end are in the same node
    if (startNode === endNode) {
      const text = startNode.textContent || '';
      const before = text.substring(0, startOffset);
      const highlighted = text.substring(startOffset, endOffset);
      const after = text.substring(endOffset);
      
      const mark = document.createElement('mark');
      mark.style.cssText = 'background-color: rgb(254 240 138); color: rgb(185 28 28); font-weight: 600; padding: 2px 0;';
      mark.textContent = highlighted;
      
      const parent = startNode.parentNode;
      if (parent) {
        // Create text nodes for before and after
        if (before) parent.insertBefore(document.createTextNode(before), startNode);
        parent.insertBefore(mark, startNode);
        if (after) parent.insertBefore(document.createTextNode(after), startNode);
        parent.removeChild(startNode);
      }
    } else {
      // Phrase spans multiple nodes - wrap each part
      const startIdx = nodes.indexOf(startNode);
      const endIdx = nodes.indexOf(endNode);
      
      for (let i = startIdx; i <= endIdx; i++) {
        const textNode = nodes[i];
        const parent = textNode.parentNode;
        if (!parent) continue;
        
        let textToHighlight = textNode.textContent || '';
        
        if (i === startIdx) {
          // First node - highlight from startOffset to end
          const before = textToHighlight.substring(0, startOffset);
          const highlighted = textToHighlight.substring(startOffset);
          
          if (before) parent.insertBefore(document.createTextNode(before), textNode);
          
          const mark = document.createElement('mark');
          mark.style.cssText = 'background-color: rgb(254 240 138); color: rgb(185 28 28); font-weight: 600; padding: 2px 0;';
          mark.textContent = highlighted;
          parent.insertBefore(mark, textNode);
        } else if (i === endIdx) {
          // Last node - highlight from start to endOffset
          const highlighted = textToHighlight.substring(0, endOffset);
          const after = textToHighlight.substring(endOffset);
          
          const mark = document.createElement('mark');
          mark.style.cssText = 'background-color: rgb(254 240 138); color: rgb(185 28 28); font-weight: 600; padding: 2px 0;';
          mark.textContent = highlighted;
          parent.insertBefore(mark, textNode);
          
          if (after) parent.insertBefore(document.createTextNode(after), textNode);
        } else {
          // Middle nodes - highlight entire text
          const mark = document.createElement('mark');
          mark.style.cssText = 'background-color: rgb(254 240 138); color: rgb(185 28 28); font-weight: 600; padding: 2px 0;';
          mark.textContent = textToHighlight;
          parent.insertBefore(mark, textNode);
        }
        
        parent.removeChild(textNode);
      }
    }

    console.log('✅ Applied DOM-based highlighting');
    return tempDiv.innerHTML;
  } catch (error) {
    console.error('Error applying highlight:', error);
    return htmlContent;
  }
};


// Add this helper function to save and restore cursor position
const saveCursorPosition = (element: HTMLDivElement | null) => {
  if (!element) return null;
  
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  
  const range = selection.getRangeAt(0);
  const preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(element);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  
  return preSelectionRange.toString().length;
};

const restoreCursorPosition = (element: HTMLDivElement | null, position: number) => {
  if (!element || position === null) return;
  
  const selection = window.getSelection();
  const range = document.createRange();
  
  let charCount = 0;
  let nodeStack = [element];
  let node: Node | undefined;
  let foundStart = false;
  
  while (!foundStart && (node = nodeStack.pop())) {
    if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text;
      const nextCharCount = charCount + textNode.length;
      if (position <= nextCharCount) {
        range.setStart(textNode, position - charCount);
        range.setEnd(textNode, position - charCount);
        foundStart = true;
      }
      charCount = nextCharCount;
    } else {
      const children = node.childNodes;
      for (let i = children.length - 1; i >= 0; i--) {
        nodeStack.push(children[i]);
      }
    }
  }
  
  if (foundStart && selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

// Add save handler
const handleSaveDocument = async (documentId: string, content: string, docIndex: number) => {
  try {
    setIsSaving(true);
    const markdownContent = turndownService.turndown(content);

    const updateData = {
      edited_obj_id:documentId,
      instruction:thunaiPrompt,
      contradiction_id:contradiction.id,
      extracted_text: markdownContent, 
      status: "retrain"
    };

    const response = await requestApi(
      "POST", 
      `brain/knowledge-base-retrain/${tenantID}/${documentId}`, 
      updateData, 
      "brainService"
    );

    if (response) {
      setThunaiPrompt('');
      navigate("/brain"); // Navigate to the root path (where the tabs are)
      setLastActiveTab('all'); // Set the active tab to "all" in the store
      if (docIndex === 0) {
        await getFileContent(
          contradiction.affected_documents[0]?.id,
          contradiction.affected_documents[0]?.name,
          setDocument1FullContent
        );
      } else if (docIndex === 1) {
        await getFileContent(
          contradiction.affected_documents[1]?.id,
          contradiction.affected_documents[1]?.name,
          setDocument2FullContent
        );
      }
      await getContradictionAndRelationship();
      setEditingDocumentId(null);
    }
  } catch (error: any) {
    console.error('Update document error:', error);
  } finally {
    setIsSaving(false);
  }
};

  const getFileContent = useCallback(async (documentId: string, documentName: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    try {
      setLoadingDocumentContent(true);
      const response = await requestApi("GET", `brain/knowledge-base/${tenantID}/${documentId}/`, null, "brainService");
      setter(response.data?.extracted_text || 'Extracted text not available.');
    } catch (error: any) {
      console.error(`Load file content error for ${documentName}:`, error);
      // toast.error(error?.response?.data?.message || `Failed to load content for ${documentName}. Please try again.`);
      setter('Failed to load content.');
    } finally {
      setLoadingDocumentContent(false);
    }
  }, [tenantID]);

useEffect(() => {
  if (showFullDocumentView && contradiction.affected_documents.length >= 2) {
    const doc1 = contradiction.affected_documents[0];
    const doc2 = contradiction.affected_documents[1];
    
    getFileContent(doc1.id, doc1.name, setDocument1FullContent);
    getFileContent(doc2.id, doc2.name, setDocument2FullContent);
  }
}, [showFullDocumentView, contradiction.affected_documents, getFileContent]);

useEffect(() => {
  if (document1FullContent) {
    setEditedContent1(document1FullContent);
    // Store original only once
    if (!originalContent1) {
      setOriginalContent1(document1FullContent);
    }
  }
  if (document2FullContent) {
    setEditedContent2(document2FullContent);
    // Store original only once
    if (!originalContent2) {
      setOriginalContent2(document2FullContent);
    }
  }
}, [document1FullContent, document2FullContent]);
// Helper function to get contradicting text for a document
const getContradictingText = (docName: string) => {
  if (!contradiction.contradicting_text) return undefined;
  
  // Try direct match first
  if (contradiction.contradicting_text[docName]) {
    return contradiction.contradicting_text[docName];
  }
  
  // Try with "from_" prefix
  if (contradiction.contradicting_text[`from_${docName}`]) {
    return contradiction.contradicting_text[`from_${docName}`];
  }
  
  return undefined;
};


const highlightText = (fullText: string, phraseToHighlight: string | undefined) => {
  if (!fullText) return '';
  if (!phraseToHighlight) return fullText;

  const normalize = (text: string) => {
    return text
      .replace(/\*\*|__|_|`|~/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const normalizedPhrase = normalize(phraseToHighlight);
  if (!normalizedPhrase) return fullText;

  console.log('=== HIGHLIGHT DEBUG ===');
  console.log('Phrase to find:', normalizedPhrase);

  const positionMap: number[] = [];
  let normalizedText = '';
  let lastWasSpace = true;

  for (let i = 0; i < fullText.length; i++) {
    const char = fullText[i];
    const isMarkdown = /[\*_`~]/.test(char);
    const isSpace = /\s/.test(char);

    if (isMarkdown) continue;

    if (isSpace) {
      if (!lastWasSpace) {
        positionMap.push(i);
        normalizedText += ' ';
        lastWasSpace = true;
      }
    } else {
      positionMap.push(i);
      normalizedText += char;
      lastWasSpace = false;
    }
  }

  console.log('Normalized text:', normalizedText);

  const startIndex = normalizedText.toLowerCase().indexOf(normalizedPhrase.toLowerCase());
  
  if (startIndex === -1) {
    console.log('❌ Not found');
    return fullText;
  }

  const endIndexNormalized = startIndex + normalizedPhrase.length - 1;
  console.log('Found at normalized positions:', startIndex, 'to', endIndexNormalized);

  let originalStart = positionMap[startIndex];
  const lastCharOriginal = positionMap[endIndexNormalized];
  
  // Move originalStart BACKWARD to include any leading markdown
  while (originalStart > 0 && /[\*_`~]/.test(fullText[originalStart - 1])) {
    originalStart--;
  }

  console.log('Original start (with leading markdown):', originalStart);
  console.log('Last char at original:', lastCharOriginal);

  let originalEnd = lastCharOriginal + 1;
  
  // Include trailing markdown
  while (originalEnd < fullText.length && /[\*_`~]/.test(fullText[originalEnd])) {
    originalEnd++;
  }

  console.log('Original end (with trailing markdown):', originalEnd);

  const before = fullText.substring(0, originalStart);
  const match = fullText.substring(originalStart, originalEnd);
  const after = fullText.substring(originalEnd);

  console.log('✅ Match:', JSON.stringify(match));
  console.log('======================');

  return `${before}<span class="bg-yellow-200 dark:bg-yellow-700 text-red-700 dark:text-red-300 font-semibold">${match}</span>${after}`;
};

  const handleView = (id) => {
    viewDocument(tenantID, id);
  };
   const handleThunaiRewrite = async () => {
    if (!thunaiPrompt.trim() || !currentThunaiDoc) return;
    
    try {
      setThunaiLoading(true);
      
      const currentContent = currentThunaiDoc.index === 0 ? editedContent1 : editedContent2;
      const markdownContent = turndownService.turndown(currentContent);
      
      // const response = await fetch('https://api.thunai.ai/brain-service/brain/text-rewrite/rewrite/thunai1756813944616/691c51b1388e299f7ff33a88/', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
        // body: JSON.stringify({
        //   instruction: thunaiPrompt,
      //     text: markdownContent
      //   })

      // });
const response= await requestApi('POST',`brain/text-rewrite/rewrite/${tenantID}/${currentThunaiDoc.id}/`,{
          instruction: thunaiPrompt},"brainService")
      const data =response.data
      
      if (data.old_text && data.new_text) {
        setThunaiOldText(data.old_text);
        setThunaiNewText(data.new_text);
        setShowThunaiPopup(false);
        setShowThunaiComparison(true);
      }
    } catch (error) {
      console.error('Thunai rewrite error:', error);
    } finally {
      setThunaiLoading(false);
    }
  };
// Update the applyThunaiChanges function
// Update the applyThunaiChanges function
const [showHighlights, setShowHighlights] = useState(true);

const applyThunaiChanges = async () => {
  // Convert markdown to HTML using marked
    setShowHighlights(false);

  const htmlContent = await marked.parse(thunaiNewText);
  
  if (currentThunaiDoc?.index === 0) {
    // First exit editing mode
    setEditingDocumentId(null);
    // Update the full content with markdown
    setDocument1FullContent(thunaiNewText);
    
    // Then after a brief delay, re-enter editing mode with the new HTML content
    setTimeout(() => {
      setEditedContent1(htmlContent);
      setEditingDocumentId(contradiction.affected_documents[0]?.id);
    }, 50);
    
  } else if (currentThunaiDoc?.index === 1) {
    // First exit editing mode
    setEditingDocumentId(null);
    // Update the full content with markdown
    setDocument2FullContent(thunaiNewText);
    
    // Then after a brief delay, re-enter editing mode with the new HTML content
    setTimeout(() => {
      setEditedContent2(htmlContent);
      setEditingDocumentId(contradiction.affected_documents[1]?.id);
    }, 50);
  }
  
  setShowThunaiComparison(false);
  // setThunaiPrompt('');
  setCurrentThunaiDoc(null);
};


// Update applyThunaiChanges to disable highlights

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden"  onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${
                contradiction.severity === 'high' ? 'text-red-500' :
                contradiction.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
              }`} />
              Resolve Conflict: {contradiction.title}
            </div>
            {/* <div className="flex items-center gap-2 text-sm text-muted-foreground mr-8">
              Step {currentStep} of 3
            </div> */}
          </DialogTitle>
        </DialogHeader>

        

        {/* Step 1: Conflict Overview */}
        {currentStep === 1 && (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              {/* Conflict Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="w-5 h-5" />
                    Conflict Overview
                  </CardTitle>
                  <CardDescription>{contradiction.summary}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Badge variant={contradiction.severity === 'high' ? 'destructive' :
                                  contradiction.severity === 'medium' ? 'default' : 'secondary'}>
                      {contradiction.severity}
                    </Badge>
                    <Badge variant="outline">
                      {contradiction.affected_documents.length} documents affected
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Conflicting Points */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Conflicting Information
                </h3>
                {/* {contradiction.affected_documents.length >= 2 && (
                    <Button onClick={() => setShowFullDocumentView(true)}>View Source</Button>
                )} */}


                {contradiction.affected_documents && (
  <Card key={contradiction.id}>
    <CardHeader>
      <CardTitle className="text-base">{contradiction.title}</CardTitle>
    </CardHeader>

 <CardContent>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {[0, 1].map((i) => {
      const doc = contradiction.affected_documents[i];
      const contradictionText =
        i === 0 ? contradiction.contradiction1 : contradiction.contradiction2;

      return (
        <div className="space-y-3" key={i}>
          <div className="flex items-center gap-2 justify-between w-full">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 shrink-0" />
              <span className="font-medium truncate block max-w-[12rem] sm:max-w-[16rem] lg:max-w-[20rem]" title={doc?.name || 'Untitled'}>{doc?.name || "Untitled"}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleView(doc?.id)}
              disabled={loadingId === doc?.id}
              className="flex items-center gap-1 shrink-0"
            >
              {loadingId === doc?.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  View Document
                </>
              )}
            </Button>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800 h-20 overflow-y-auto">
            <p className="text-sm text-red-700 dark:text-red-300 mb-2">
              "{contradictionText}"
            </p>
          </div>
        </div>
      );
    })}
  </div>
</CardContent>

  </Card>
)}

              </div>

              {/* Suggested Resolution */}
              {contradiction.suggestion && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Thunai's Suggested Resolution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-justify">{contradiction.suggestion}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        )}


        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {currentStep > 1 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-2">
             <Button 
                  variant="outline" 
                  onClick={() => setShowIgnoreDialog(true)} 
                  disabled={isIgnoring}
                >
                 Ignore
                </Button>
         {contradiction.affected_documents.length >= 2 && (
                    <Button onClick={() => setShowFullDocumentView(true)}>Review & Resolve</Button>
                )}
          </div>
        </div>
      </DialogContent>

      {/* Full Document View Dialog */}
   {showFullDocumentView && (
  <Dialog open={showFullDocumentView} onOpenChange={setShowFullDocumentView}>
    <DialogContent className="max-w-7xl max-h-[95vh] overflow-auto lg:overflow-hidden"  onInteractOutside={(e) => e.preventDefault()}>
      <DialogHeader>
        <DialogTitle>Full Document Comparison</DialogTitle>
      </DialogHeader>
      {loadingDocumentContent && !document1FullContent ? (
        <div className="flex items-center justify-center h-[calc(95vh-120px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading document content...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(95vh-120px)] mb-2">
          {/* Document 1 */}
          <div className="flex flex-col h-full border rounded-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h4 className="font-semibold text-lg">{contradiction.affected_documents[0]?.name}</h4>
              {editingDocumentId === contradiction.affected_documents[0]?.id ? (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setEditingDocumentId(null);
                      setEditedContent1(document1FullContent);
                       setShowHighlights(true);
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleSaveDocument(contradiction.affected_documents[0]?.id, editedContent1, 0)}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save and Retrain'}
                  </Button>
                </div>
              ) : (
                 <div className="flex gap-2 ml-auto">
                <Button 
                  size="sm" 
                  variant="outline"

// onClick={() => {
//   setEditingDocumentId(contradiction.affected_documents[0]?.id);
//   const htmlContent = marked(document1FullContent);
//     const contradictingPhrase = getContradictingText(contradiction.affected_documents[0]?.name);
//   const highlightedHtml = highlightTextInHtml(htmlContent, contradictingPhrase);
//   console.log('Setting highlighted content for doc 1');
//   setEditedContent1(highlightedHtml);
// }}
onClick={() => {
  setEditingDocumentId(contradiction.affected_documents[0]?.id);
  const contradictingPhrase = getContradictingText(contradiction.affected_documents[0]?.name);
  
  // Highlight in MARKDOWN first
  const highlightedMarkdown = highlightText(document1FullContent, contradictingPhrase);
  
  // Then convert to HTML
  const htmlContent = marked(highlightedMarkdown);
  
  console.log('Setting highlighted content for doc 1');
  setEditedContent1(htmlContent);
}}

                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button> 
                <Button 
        size="sm"
        variant="outline"
        onClick={() => {
          setCurrentThunaiDoc({ id: contradiction.affected_documents[0]?.id, index: 0 });
          setShowThunaiPopup(true);
        }}
      >
        <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
        Edit With Thunai
      </Button>
      </div>
              )}
            </div>
            <ScrollArea className="flex-1 p-4 max-h-[calc(95vh-160px)]">
              {editingDocumentId === contradiction.affected_documents[0]?.id ? (
                <div className="relative">
  
<div
  ref={editableRef1}
  contentEditable
  suppressContentEditableWarning
  className="min-h-[600px] text-sm p-3 border rounded bg-white dark:bg-gray-900 prose prose-sm max-w-none"
  onInput={(e) => {
    const cursorPos = saveCursorPosition(editableRef1.current);
    const newContent = (e.target as HTMLDivElement).innerHTML;
    setEditedContent1(newContent);
    
    // Restore cursor position after React re-renders
    setTimeout(() => {
      if (cursorPos !== null) {
        restoreCursorPosition(editableRef1.current, cursorPos);
      }
    }, 0);
  }}
  dangerouslySetInnerHTML={{ __html: editedContent1 }} // ✅ Use editedContent1 directly (already highlighted)
/>
  </div>
               
              ) : (
                <div className="text-sm text-muted-foreground text-justify prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      p: ({node, ...props}) => <p {...props} style={{display: 'inline'}} />
                    }}
                  >
                   {showHighlights ? highlightText(
    document1FullContent,
    contradiction.contradicting_text?.[contradiction.affected_documents[0]?.name] || 
    contradiction.contradicting_text?.[`from_${contradiction.affected_documents[0]?.name}`]
  ) : document1FullContent}

                  </ReactMarkdown>
                </div>
              )}
            </ScrollArea>
          </div>

    {/* Document 2 */}
<div className="flex flex-col h-full border rounded-lg">
  <div className="flex items-center justify-between p-4 border-b">
    <h4 className="font-semibold text-lg">{contradiction.affected_documents[1]?.name}</h4>
    {editingDocumentId === contradiction.affected_documents[1]?.id ? (
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => {
            setEditingDocumentId(null);
            setEditedContent2(document2FullContent); 
            setShowHighlights(true);
          }}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button 
          size="sm"
          onClick={() => handleSaveDocument(contradiction.affected_documents[1]?.id, editedContent2, 1)}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save and Retrain'}
        </Button>
      </div>
    ) : (
                 <div className="flex gap-2 ml-auto">

      <Button 
        size="sm" 
        variant="outline"
//        onClick={() => {
//   setEditingDocumentId(contradiction.affected_documents[1]?.id);
//   const htmlContent = marked(document2FullContent);
//   const contradictingPhrase = getContradictingText(contradiction.affected_documents[1]?.name);
//   const highlightedHtml = highlightTextInHtml(htmlContent, contradictingPhrase);
//   console.log('Setting highlighted content for doc 2');
//   setEditedContent2(highlightedHtml);
// }}
onClick={() => {
  setEditingDocumentId(contradiction.affected_documents[1]?.id);
  const contradictingPhrase = getContradictingText(contradiction.affected_documents[1]?.name);
  
  // Highlight in MARKDOWN first
  const highlightedMarkdown = highlightText(document2FullContent, contradictingPhrase);
  
  // Then convert to HTML
  const htmlContent = marked(highlightedMarkdown);
  
  console.log('Setting highlighted content for doc 2');
  setEditedContent2(htmlContent);
}}
      >
        <Edit3 className="w-4 h-4 mr-2" />
        Edit
      </Button>
             <Button 
        size="sm"
        variant="outline"
        onClick={() => {
          setCurrentThunaiDoc({ id: contradiction.affected_documents[1]?.id, index: 1 });
          setShowThunaiPopup(true);
        }}
      >
        <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
        Edit With Thunai
      </Button>
      </div>
    )}
  </div>
  <ScrollArea className="flex-1 p-4 max-h-[calc(95vh-160px)]">
    {editingDocumentId === contradiction.affected_documents[1]?.id ? (
      <div className="relative">
        <div
          ref={editableRef2}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[600px] text-sm p-3 border rounded bg-white dark:bg-gray-900 prose prose-sm max-w-none"
          onInput={(e) => {
            const cursorPos = saveCursorPosition(editableRef2.current);
            const newContent = (e.target as HTMLDivElement).innerHTML;
            setEditedContent2(newContent);
            
            setTimeout(() => {
              if (cursorPos !== null) {
                restoreCursorPosition(editableRef2.current, cursorPos);
              }
            }, 0);
          }}
          dangerouslySetInnerHTML={{ __html: editedContent2 }}
        />
      </div>
    ) : (
      <div className="text-sm text-muted-foreground text-justify prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw]}
          components={{
            p: ({node, ...props}) => <p {...props} style={{display: 'inline'}} />
          }}
        >
         {showHighlights ? highlightText(
    document2FullContent,
    contradiction.contradicting_text?.[`from_${contradiction.affected_documents[1]?.name}`] ||
    contradiction.contradicting_text?.[contradiction.affected_documents[1]?.name]
  ) : document2FullContent}
        </ReactMarkdown>
      </div>
    )}
  </ScrollArea>
</div>

        </div>
      )}
      {/* <div className="flex justify-end pt-4 border-t">
        <Button variant="outline" onClick={() => setShowFullDocumentView(false)}>
          Close View
        </Button>
      </div> */}
    </DialogContent>
  </Dialog>
)}

{/* Thunai AI Prompt Popup */}
{showThunaiPopup && (
  <Dialog open={showThunaiPopup} onOpenChange={setShowThunaiPopup}>
    <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Thunai AI Rewrite
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Enter your instruction
          </label>
          <Textarea
            placeholder="e.g., Change the occurrence of search to serch"
            value={thunaiPrompt}
            onChange={(e) => setThunaiPrompt(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setShowThunaiPopup(false);
              setThunaiPrompt('');
              setCurrentThunaiDoc(null);
            }}
            disabled={thunaiLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleThunaiRewrite}
            disabled={!thunaiPrompt.trim() || thunaiLoading}
          >
            {thunaiLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Rewrite
              </>
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)}

{/* Thunai AI Comparison Dialog */}

{showThunaiComparison && (
  <Dialog open={showThunaiComparison} onOpenChange={setShowThunaiComparison}>
    <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden" onInteractOutside={(e) => e.preventDefault()}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Compare Changes
        </DialogTitle>
      </DialogHeader>      
      <ScrollArea className="h-[calc(90vh-150px)] border rounded-md">
        <ReactDiffViewer
          oldValue={thunaiOldText || ''}
          newValue={thunaiNewText || ''}
          splitView={true}
          useDarkTheme={false}
          leftTitle="Original Text"
          rightTitle="Rewritten Text"
          styles={{
            variables: {
              light: {
                diffViewerBackground: '#fff',
                addedBackground: '#e6ffed',
                addedColor: '#24292e',
                removedBackground: '#ffeef0',
                removedColor: '#24292e',
                wordAddedBackground: '#acf2bd',
                wordRemovedBackground: '#fdb8c0',
                addedGutterBackground: '#cdffd8',
                removedGutterBackground: '#ffdce0',
                gutterBackground: '#f6f8fa',
                gutterBackgroundDark: '#f3f4f6',
                highlightBackground: '#fffbdd',
                highlightGutterBackground: '#fff5b1',
              },
            },
            contentText: {
              fontSize: '14px',
              lineHeight: '20px',
            },
          }}
        />
      </ScrollArea>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={() => {
            setShowThunaiComparison(false);
            setThunaiPrompt('');
            setCurrentThunaiDoc(null);
          }}
        >
          Discard
        </Button>
        <Button onClick={applyThunaiChanges}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Accept Changes
        </Button>
      </div>
    </DialogContent>
  </Dialog>
)}
{showIgnoreDialog && (
  <Dialog open={showIgnoreDialog} onOpenChange={setShowIgnoreDialog}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Reason for Ignoring</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <Textarea
          placeholder="Please provide a reason for ignoring this contradiction..."
          value={ignoreReason}
          onChange={(e) => setIgnoreReason(e.target.value)}
          rows={4}
          className="resize-none"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowIgnoreDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleIgnore}
            disabled={!ignoreReason.trim() || isIgnoring}
          >
            {isIgnoring ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Ignoring...</>
            ) : (
              'Confirm Ignore'
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)}

    </Dialog>
    
  );
};