import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConflictResolution } from "../components/ConflictResolution";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Network, 
  GitBranch, 
  History, 
  FileText, 
  Edit3, 
  ChevronRight, 
  FolderOpen, 
  Folder, 
  User, 
  Calendar, 
  Tag, 
  ArrowRight,
  AlertTriangle,
  Plus,
  Settings,
  Link,
  Eye,
  EyeOff,
  BookOpen,
  Shield,
  Zap,
  Trash2,
  Loader2,
  RefreshCcw,
  Loader,
  CheckCircle,
  CheckCheck,
  Circle,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Filter,
  LucideGitCompare
} from 'lucide-react';
import { getTenantId, requestApi } from '@/services/authService';
import { useToast } from "@/hooks/use-toast";
import { Contradiction } from '@/types/Contradiction';
import { ExplorerStream } from './ExplorerStream';
import { useKnowledgeBaseStore } from '@/store/knowledgeBaseStore';
// import { useProcessStatus } from '@/store/useProcessStream';
import { Checkbox } from "@/components/ui/checkbox";
import DeletePopup from './shared-components/DeletePopup';
import { Columns } from 'lucide-react';
import {  UnifiedDocumentComparison } from './UnifiedDocumentComparison';
import usePermissions from '@/hooks/usePermissions';
interface Category {
  id: string;
  name: string;
  color: string;
  doc_nos: number;
  related_categories: string[];
  description: string;
  ai_instructions?: string;
}

interface ExplorerDocument {
  id: string;
  file_name: string;
  title?: string;
  tags: string[];
  created: string;
  version?: string;
  user: string;
}

interface ExplorerCategoryData {
    categoryId: string;
  categoryName: string;
  documents: ExplorerDocument[];
 category_doc_nos: number;
 autoclassified?:boolean;
}

interface ExplorerResponse {
  status: string;
  message: string;
  data: {
    category_nos: {
      total_categories: number;
      user_defined: number;
      autoclassified: number;
    };
    category_data: {
      [categoryName: string]: {
        autoclassified: boolean;
        category_doc_nos: number;
        documents?: ExplorerDocument[];
      };
    };
  };
}
interface DocumentRelationship {
  id: string;
  name?: string;
  rel_title: string;
  rel_id?:string;
  summary?: string;
}
const getStatusUI = (status: string) => {
  switch (status) {
    case "pending":
      return {
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        badgeVariant: "default",
        icon: <Clock className="w-4 h-4 text-yellow-600" />,
      };

    case "active":
      return {
        color: "text-red-600",
        bg: "bg-red-50",
        badgeVariant: "secondary",
        icon: <ShieldAlert className="w-4 h-4 text-red-600" />,
      };
  case "ignored":
      return {
        color: "text-red-600",
        bg: "bg-red-50",
        badgeVariant: "secondary",
        icon: <ShieldAlert className="w-4 h-4 text-red-600" />,
      };

    case "resolved":
      return {
        color: "text-green-600",
        bg: "bg-green-50",
        badgeVariant: "success",
        icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
      };

    default:
      return {
        color: "text-gray-600",
        bg: "bg-gray-100",
        badgeVariant: "outline",
        icon: <Circle className="w-4 h-4 text-gray-600" />,
      };
  }
};


export const KnowledgeGraph = ({activeTabForGraph,setLastActiveTab,processes}) => {
  const tenantID = getTenantId()
  
  // Permission management
  // const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  // const hasFullAccess = permissions.includes('*') || permissions.includes('knowledgegraph:ALL');
  // const hasReadAccess = permissions.includes('knowledgegraph:READ');
  // const canModify = hasFullAccess;
  // const canView = hasFullAccess || hasReadAccess;
  const { canViewModule, canModifyModule } = usePermissions();
  const canModify = canModifyModule("knowledgegraph");
console.log('Can Modify:', canModify);
  
  const { knowledgeGraphSubTab, setKnowledgeGraphSubTab } = useKnowledgeBaseStore();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  // const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [editingDocument, setEditingDocument] = useState(null);
  // const [changeDescription, setChangeDescription] = useState('');
  // const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [updateInstructions, setUpdateInstructions] = useState('');
  // const [impactedDocs, setImpactedDocs] = useState<Document[]>([]);
  // const [selectedImpactedDocs, setSelectedImpactedDocs] = useState<string[]>([]);
  const [loading,setLoading] = useState(false)
const [explorerData, setExplorerData] =  useState<ExplorerCategoryData[]>([]); 
  // New state for additional features
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({
  name: '',
  description: '',
  ai_instructions: ''
});
 const [totalCategories, setTotalCategories] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
   const [deleting,setDeleting] = useState<Category | null>(null); 
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
const [isDeletingCategory, setIsDeletingCategory] = useState(false);
const [relationships,setRelationships] = useState<DocumentRelationship[]>([]);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [selectedContradiction, setSelectedContradiction] = useState<Contradiction>(null);
  const [filter,setFilter] = useState("active") // Initialized to "all"
  // const { processes,refetch } = useProcessStatus(tenantID);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [selectAll, setSelectAll] = useState(false);
 const [contradictionPendingDeletion, setContradictionPendingDeletion] = useState<string[] | null>(null); 
 const [isDeletingContradiction, setIsDeletingContradiction] = useState(false);

 // New states for Relationship deletion
 const [relationshipPendingDeletion, setRelationshipPendingDeletion] = useState<{id: string; name: string}[] | null>(null);
 const [isDeletingRelationship, setIsDeletingRelationship] = useState(false);

  // New state for relationship filters
  const [activeRelFilters, setActiveRelFilters] = useState<string | null>(null);
const RELATIONSHIP_FILTERS = [
  { key: "Supports", label: "Supports" },
  { key: "Helps", label: "Helps" },
  { key: "Duplicates", label: "Duplicates" },
];
// Inside KnowledgeGraph component:
const [compareMode, setCompareMode] = useState(false);
const [viewMode, setViewMode] = useState<'cards' | 'diff'>('cards');

const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
const [activeComparisonGroup, setActiveComparisonGroup] = useState<string | null>(null);


  const [isMergeMode, setIsMergeMode] = useState(false);
  const [selectedMergeCategories, setSelectedMergeCategories] = useState<string[]>([]);
  const [isMerging, setIsMerging] = useState(false);

const toggleMergeSelection = (categoryName: string) => {
  setSelectedMergeCategories(prev => {
    if (prev.includes(categoryName)) {
      return prev.filter(name => name !== categoryName);
    }
    return [...prev, categoryName];
  });
};

const handleCompleteMerge = async () => {
  if (!newCategory.name || !newCategory.description) return;
  if (selectedMergeCategories.length < 2) {
    toast({
      title: "Selection Required",
      description: "Please select at least 2 categories to merge.",
      variant: "destructive"
    });
    return;
  }
  setIsMerging(true);
  try {
     const sourceIds = selectedMergeCategories.map(name => 
      explorerData.find(c => c.categoryName === name)?.categoryId
    ).filter(Boolean);

    const payload = {
      source_category_ids: sourceIds,
      target_category_name: newCategory.name,
      description: newCategory.description,
      ai_instructions: newCategory.ai_instructions
    };

    const response = await requestApi(
      "POST", 
      `brain/knowledge-category/categories/${tenantID}/merge/`, 
      payload, 
      "brainService"
    );
    
    toast({ 
      title: "Success", 
      description: response?.message || "Categories merged successfully", 
      variant: "default" 
    });

    setShowCategoryDialog(false);
    setIsMergeMode(false);
    setSelectedMergeCategories([]);
    setNewCategory({ name: '', description: '', ai_instructions: '' });
    fetchCategories(); 
  } catch (error: any) {
    toast({ 
      title: "Merge Error", 
      description: error.response?.data?.message || "Failed to merge categories", 
      variant: "destructive" 
    });
  } finally {
    setIsMerging(false);
  }
};

const handlePrepareComparison = (mainId: string) => {
  // If clicking the same group again, we can toggle it off or just reset
  if (activeComparisonGroup === mainId) {
    setActiveComparisonGroup(null);
    setSelectedCompareIds([]);
  } else {
    setActiveComparisonGroup(mainId);
    setSelectedCompareIds([mainId]); // Pre-select the main file automatically
  }
};

// 3. Updated toggle logic for target files
const toggleCompareId = (id: string, parentId: string) => {
  // Prevent unselecting the main file while in its comparison mode
  if (id === parentId) return;

  setSelectedCompareIds(prev => {
    const isRemoving = prev.includes(id);
    if (isRemoving) return [parentId]; // Revert to only main file selected

    // Enforce 1 Main + 1 Target limit: Replace existing target if another is clicked
    return [parentId, id];
  });
};

const handleStartComparison = () => {
  if (selectedCompareIds.length < 2) {
    toast({
      title: "Selection required",
      description: "Please select at least two files to compare.",
      variant: "default",
    });
    return;
  }
  setCompareMode(true);
};

  const toggleRelFilter = async (filterType: string) => {
    const updatedFilter = activeRelFilters === filterType ? null : filterType;
    
    setActiveRelFilters(updatedFilter);
    
    if (updatedFilter === null) {
      // If unselecting, fetch all relationships
      setLoading(true);
      await getContradictionAndRelationship();
      setLoading(false);
    } else {
      // If selecting a filter, fetch filtered data
      await fetchFilteredData(updatedFilter);
    }
  };

  const fetchFilteredData = async (filter: string | null) => {
    setLoading(true);
    try {
      const payload = {
    "filter": [
        {
            "key_name": "relationship_type",
            "key_value": filter,
            "operator": "like"
        }
    ],
    "sortby": "created",
    "sort": "desc"
};
      const response = await requestApi(
        'POST',
        `brain/knowledge-graph/relationships/${tenantID}/filter/`,
        payload,
        "brainService"
      );

      if (response.data) {
        const filteredRels = response.data.filter((item: any) => item.realted_documents);
        setRelationships(filteredRels);
        // setContradictions(response.data);
      }
    } catch (error: any) {
      console.error("Error filtering relationships:", error);
      toast({
        title: "Filter Error",
        description: "Failed to apply filters. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

const toggleSelect = (id: string) => {
  setSelectedIds(prev =>
    prev.includes(id)
      ? prev.filter(x => x !== id)
      : [...prev, id]
  );
};

// Select all / unselect all
const handleSelectAll = () => {
  if (!selectAll) {
    const all = contradictions.map((c: any) => c.id);
    console.log(contradictions)
    setSelectedIds(all);
  } else {
    setSelectedIds([]);
  }
  setSelectAll(!selectAll);
};

// Delete selected
const deleteSelected = async (ids?: string[]) => {
  const idsToDelete = ids || selectedIds;
  if (!idsToDelete.length) return;

  const validIds = idsToDelete.filter((id) => {
    const item = contradictions.find((c: any) => c.id === id);
    if (!item) return false;

    // Accept only if affected_documents exists
    const hasAffectedDocs =
      item.affected_documents && item.affected_documents.length > 0;

    // Reject if realted_documents exists
    const hasRelatedDocs =
      item.related_documents && item.related_documents.length > 0;

    return hasAffectedDocs && !hasRelatedDocs;
  });

  if (validIds.length === 0) {
    console.log("No valid items to delete");
    return;
  }

  const payload:any = { ids: validIds };

  await requestApi(
    'DELETE',
    `brain/knowledge-graph/relationships/${tenantID}`,
    payload,
    "brainService"
  );

  await getContradictionAndRelationship();
  setSelectedIds([]);
  setSelectAll(false);
};

const deleteSingle = async (id: string) => {
  // await deleteSelected([id]);   // call common delete
   setContradictionPendingDeletion([id]);
};
const deleteSelectedWithConfirmation = () => {
  if (selectedIds.length > 0) {
    setContradictionPendingDeletion(selectedIds); // Set the array of selected IDs
  } else {
   toast({ title: "Info", description: "Please select contradictions to delete.", variant: "default" });
  }
};

  const handleDeleteContradiction = async (itemsToDelete: { id: string; name: string }[]) => { // RE-INTRODUCED AS SEPARATE FUNCTION
     if (!itemsToDelete || itemsToDelete.length === 0) return;
     setIsDeletingContradiction(true);
     try {
       const idsToPass = itemsToDelete.map(item => item.id);
     await deleteSelected(idsToPass); // Call the existing deletion logic

       toast({
         title: "Success",
         description: "Contradiction deleted successfully.",
         variant: "default",
       });
     } catch (error: any) {
       console.error("Error deleting contradiction:", error);
       toast({
         title: "Error",
         description: error.response?.data?.message || error.response?.data?.detail || "Failed to delete contradiction. Please try again.",
         variant: "destructive",
       });
     } finally {
   setIsDeletingContradiction(false);
    setContradictionPendingDeletion(null);
     }
 };

 // Handle Relationship Deletion (Target Files)
 const handleDeleteRelationshipLink = async (itemsToDelete: { id: string; name: string }[]) => {
    if (!itemsToDelete || itemsToDelete.length === 0) return;
    setIsDeletingRelationship(true);
    try {
      const idsToPass = itemsToDelete.map(item => item.id);
      await requestApi(
        'DELETE',
        `brain/knowledge-graph/relationships/${tenantID}`,
        { ids: idsToPass },
        "brainService"
      );
      await getContradictionAndRelationship();
      toast({
        title: "Success",
        description: "Relationship removed successfully.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error deleting relationship:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete relationship.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingRelationship(false);
      setRelationshipPendingDeletion(null);
    }
  };

  const handleResolveConflict = (contradictionId: string, resolution: any) => {
    // Update the contradiction with resolution details
    setContradictions(prev => 
      prev.map(c => c.id === contradictionId ? { ...c, resolved: true } : c)
    );
   console.log('Conflict resolved:', contradictionId, resolution);
  };

 const toggleCategory = useCallback((categoryName: string) => { // Changed from categoryId
  setExpandedCategories(prev =>
    prev.includes(categoryName) // Use categoryName for checking
      ? prev.filter(name => name !== categoryName) // Filter by name
      : [...prev, categoryName]
  );
}, []);

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
setCategories([...result.data].reverse());
  } catch (error: any) {
    console.error("Error fetching categories:", error);

    toast({
      title: "Error",
      description:
        error.response?.data?.message || error.response?.data?.detail ||
        error.response?.data || error?.response?.message ||
        "Failed to fetch categories. Please try again.",
      variant: "destructive",
    });
  }
};
 const fetchCategories = async () => {
  setActiveRelFilters(null)
    setLoading(true);
    try {
      await getCategory();
      await getContradictionAndRelationship()
      await getExplorer()
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  fetchCategories();
}, []);
const getContradictionAndRelationship = async () => {
  try {
    const response = await requestApi(
      "GET",
      // `brain/knowledge-graph/relationships/thunai1756813944616/`,
      `brain/knowledge-graph/relationships/${tenantID}/`,

      null,
      "brainService"
    );

    const result = response
     const relationships = result.data.filter((item: any) =>  item.realted_documents);
       console.log('rel',relationships)
    console.log(result);
    setContradictions(result.data);
    setRelationships(relationships.reverse());
  } catch (error: any) {
    console.error("Error fetching categories:", error);

    toast({
      title: "Error",
      description:
        error.response?.data?.message || error.response?.data?.detail ||
        error.response?.data || error?.response?.message ||
        "Failed to fetch categories. Please try again.",
      variant: "destructive",
    });
  }
};

 const getExplorer = async () => {
    try {
      const response = await requestApi(
        "GET",
        `brain/knowledge-graph/explorer/${tenantID}/`,
        null,
        "brainService"
      );

      const result: ExplorerResponse = response // Use the updated ExplorerResponse interface

      if (result.data && result.data.category_data) {
        const explorerArray: ExplorerCategoryData[] = Object.entries(result.data.category_data).map(
          ([categoryName, categoryDetails]: [string, any]) => ({
            categoryName,
               categoryId: categoryDetails?.category_id,
            documents: categoryDetails.documents || [],
            category_doc_nos: categoryDetails.category_doc_nos || 0,
            autoclassified: categoryDetails.autoclassified || false,
          })
        );
        console.log('explorerArray', explorerArray)
        setExplorerData(explorerArray);
        setTotalCategories(result.data.category_nos?.total_categories || 0);
      } else {
        setExplorerData([]); // Handle cases where category_data might be missing
        setTotalCategories(0);
      }
    } catch (error: any) {
      console.error("Error fetching explorer data:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || error.response?.data?.detail ||
          error.response?.data || error?.response?.message ||
          "Failed to fetch explorer data. Please try again.",
        variant: "destructive",
      });
    }
  };

const handleDocumentEdit = (doc: ExplorerDocument, categoryName: string) => {
console.log('Editing document:', doc);
  setEditingDocument(doc);
  setShowEditDialog(true);
  setUpdateInstructions('');
};
  const handleApplyDocumentChanges = async () => {
    if (!editingDocument || !updateInstructions.trim()) return;
    const updateData = {
      ai_instructions: updateInstructions.trim(),
      retrain:true
    }
    const response = await requestApi("POST", `brain/knowledge-base-retrain/${tenantID}/${editingDocument.id}`, updateData, "brainService");
    
    // Reset state
    setShowEditDialog(false);
    setEditingDocument(null);
    setUpdateInstructions('');
  };


  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) return; 
    setIsCreatingCategory(true);
    const payload = {
    categories: [
      {
        name: newCategory.name,
        description: newCategory.description,
        ai_instructions: newCategory.ai_instructions
      }
    ]
}
try{
const response = await requestApi("POST",`brain/knowledge-category/categories/${tenantID}/`,payload,"brainService")
const result = response
await getCategory()
   setNewCategory({
      name: "",
      description: "",
      ai_instructions: ""
    });
    setShowCategoryDialog(false);
     toast({
        title: "Success",
        description: `${ result.message}`,
        variant: "default",
      });
  }catch (error) {
    console.error("Error creating category:", error);
  toast({
        title: "Error",
        description: `${ error.response?.data?.message}` || error?.response?.message || "Something went wrong",
        variant: "destructive",
      });
  }
  finally {
    setIsCreatingCategory(false); 
  }
  };
const handleEditCategory = (category: Category) => {
  setNewCategory({
    name: category.name,
    description: category.description,
    ai_instructions: category.ai_instructions || ''
  });
  setEditingCategory(category);
  setShowCategoryDialog(true); 
};

const handleUpdateCategory = async () => {
  if (!newCategory.name.trim() || !editingCategory ||!newCategory.description.trim()) return;
  setIsUpdatingCategory(true);
  const payload = {
        "name": newCategory.name,
        "description": newCategory.description,
        "ai_instructions": newCategory.ai_instructions
      }
  try {
    const response = await requestApi("PUT", `brain/knowledge-category/categories/${tenantID}/${editingCategory.id}/`, payload, "brainService");
    const result = response
    await getCategory();
    
    setNewCategory({
      name: "",
      description: "",
      ai_instructions: ""
    });
    setEditingCategory(null);
    setShowCategoryDialog(false);
    toast({
      title: "Success",
      description: result.message,
      variant: "default",
    });
  } catch (error) {
    console.error("Error updating category:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || error.response?.data || "Something went wrong",
      variant: "destructive",
    });
  }
   finally {
    setIsUpdatingCategory(false);
  }
};
const handleDeleteCategory = async(category: Category) => {
   setIsDeletingCategory(true);
  try{
    const response = await requestApi("DELETE",`brain/knowledge-category/categories/${tenantID}/${category.id}/`,null,"brainService")
    await getCategory();
     await getExplorer(); 
    toast({
      title: "Success",
      description:response?.message || "Deleted Succesfully",
      variant: "default",
    });
    setDeleting(null)
  }
  
  catch(error){
     console.error("Error updating category:", error);
    toast({
      title: "Error",
      description: error?.response?.data?.message || error?.response?.data || error?.response?.message || "Something went wrong",
      variant: "destructive",
    });
  }finally{
     setIsDeletingCategory(false); 
    }
  
}

  const handleViewDocument = (id) => {
    setKnowledgeGraphSubTab(knowledgeGraphSubTab); // Save current sub-tab to store
    // Open in new tab with a flag indicating it came from knowledge graph
    window.open(`/view/${id}?from=knowledge-graph`, '_blank');
  };

const FilterDropdown = () => {
  const hasActiveFilter = activeRelFilters !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-32 flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>

          {hasActiveFilter && (
            <Badge
              variant="secondary"
              className="ml-1 px-1.5 h-5 min-w-5"
            >
              1
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="bg-white">
        {RELATIONSHIP_FILTERS.map(({ key, label }) => (
          <DropdownMenuCheckboxItem
            key={key}
            checked={activeRelFilters === key}
            onCheckedChange={() => toggleRelFilter(key)}
          >
            {label}
          </DropdownMenuCheckboxItem>
        ))}

        {hasActiveFilter && (
          <>
            <DropdownMenuSeparator />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start font-normal text-destructive hover:text-destructive"
              onClick={async() => {
                setActiveRelFilters(null);
setLoading(true)
                await getContradictionAndRelationship();
                setLoading(false)
              }}
            >
              Clear filter
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


  return (
    <div className="flex h-full pt-2">
      {/* Main Panel */}
      <div className="flex-1 space-y-4  overflow-auto h-[calc(100vh-200px)] pb-[20px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base md:text-2xl font-bold text-foreground">Knowledge Management</h2>
            <p className="text-xs md:text-base text-muted-foreground">Explore documents, manage contradictions, and analyze relationships</p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Badge variant="outline" className="flex items-center gap-1">
  <Folder className="w-3 h-3 hidden sm:inline" />
  {totalCategories} Categories
</Badge>
            {/* <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {mockDocuments.length} Documents
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {contradictions.filter(c => !c.resolved).length} Active Issues
            </Badge> */}
             <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchCategories}
              className="flex items-center gap-1"
            >
              <RefreshCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        <Tabs value={knowledgeGraphSubTab} onValueChange={setKnowledgeGraphSubTab} >
          <TabsList className="grid w-full grid-cols-4 sticky top-0 z-20">
            <TabsTrigger value="explorer" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className='hidden sm:inline'>Explorer</span>
            </TabsTrigger>
            <TabsTrigger value="contradictions" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className='hidden sm:inline'>Contradictions</span>
              {/* ({contradictions.filter(c => !c.resolved).length}) */}
            </TabsTrigger>
            <TabsTrigger value="relationships" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              <span className='hidden sm:inline'>Relationships</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className='hidden sm:inline'>Categories</span>
            </TabsTrigger>
          </TabsList>

<TabsContent value="explorer" className=" h-full">
  <div className="flex flex-col h-full">
    <div className="sticky top-10 z-10 bg-background border-b pt-[10px] pb-3 mb-4 px-1 flex items-center justify-between">
     
      <div className="flex items-center gap-2">
        {isMergeMode && (
          <div className="text-sm text-muted-foreground">
            {selectedMergeCategories.length === 0 
              ? "Select categories to merge" 
              : `${selectedMergeCategories.length} categor${selectedMergeCategories.length === 1 ? 'y' : 'ies'} selected`}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {canModify && 
        (isMergeMode ? (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { 
                setIsMergeMode(false); 
                setSelectedMergeCategories([]); 
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={selectedMergeCategories.length < 2}
              onClick={() => setShowCategoryDialog(true)}
            >
              <LucideGitCompare className="w-4 h-4 mr-2" />
              Confirm Merge ({selectedMergeCategories.length})
            </Button>
          </>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsMergeMode(true)}
            className="flex items-center gap-2"
          >
            <LucideGitCompare className="w-4 h-4" />
            Merge Categories
          </Button>
          )
        )}
      </div>
    </div>

    <div className="flex-1 min-w-0">
      <ScrollArea className="pr-4 h-full">
    {loading ? (
      Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border rounded-lg mb-2 p-4 animate-pulse bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-5 h-5 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-40 mb-1" />
                          <Skeleton className="h-3 w-60" />
                        </div>
                      </div>
                      <Skeleton className="w-4 h-4 rounded" />
                    </div>
                    
                  </div>
                ))
        ) : explorerData && explorerData.length > 0 ? (
          explorerData.map((explorerCategory) => {
      const isExpanded = expandedCategories.includes(explorerCategory.categoryName);
            const isSelected = selectedMergeCategories.includes(explorerCategory.categoryName);
            const documentCount = explorerCategory.category_doc_nos || 0;
            const isAutoclassified = explorerCategory.autoclassified || false;

            return (
              <div key={explorerCategory.categoryName} 
                className={`border rounded-lg mb-2 transition-all ${isSelected ? 'border-blue-500 bg-blue-50/30 shadow-sm' : ''}`}
              >
                <Collapsible open={isExpanded} onOpenChange={() => !isMergeMode && toggleCategory(explorerCategory.categoryName)}>
                  <div className="flex items-center p-4">
                    {isMergeMode && (
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => toggleMergeSelection(explorerCategory.categoryName)}
                        className="mr-4 h-5 w-5 data-[state=checked]:bg-blue-600"
                      />
                    )}
                    <div 
                      className="flex-1 flex items-center justify-between cursor-pointer"
                      onClick={() => {
                          toggleCategory(explorerCategory.categoryName);
                      }}
                    >
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <FolderOpen className="w-5 h-5 text-primary" />
                    ) : (
                      <Folder className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{explorerCategory.categoryName}</h3> {/* Display categoryName */}
                        <Badge variant="secondary" className="text-xs">
                          {documentCount} docs
                        </Badge>
                        {isAutoclassified && (
                          <Badge variant="outline" className="text-blue-600">
                            Autoclassified
                          </Badge>
                        )}
                      </div>
                      {/* Remove the description here if it's not needed for explorer view */}
                      {/* {explorerCategory.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {explorerCategory.description}
                        </p>
                      )} */}
                    </div>
                  </div>
                      {/* {!isMergeMode && ( */}
                      
                        <div className="flex items-center gap-2">
        {canModify && 
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      onClick={(e) => {
        e.stopPropagation();
        setDeleting({
          id: explorerCategory.categoryId,
          name: explorerCategory.categoryName
        } as Category);
      }}
    >
      <Trash2 className="w-4 h-4 text-red-600" />
    </Button>
          }
    <ChevronRight
      className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
    />
  </div>

                      {/* )} */}
                    </div>
                  </div>

              <CollapsibleContent>
                <div className="px-4 pb-4 border-t bg-muted/20">
                  {explorerCategory.documents && explorerCategory.documents.length > 0 ? ( // Access documents directly
                    <div className="space-y-2 mt-3">
                      {explorerCategory.documents.map((doc: any) => ( // Access documents directly
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-background rounded border hover:shadow-sm transition-shadow group"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-4 h-4 text-primary" />
                              <span className="font-medium text-foreground hover:underline" onClick={() => handleViewDocument(doc.id)} style={{ cursor: 'pointer' }}>
                                {doc.title || 'Untitled'} 
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {doc.user}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(doc.created).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <GitBranch className="w-3 h-3" />
                                {doc.version}
                              </span>
                            </div>
                            {doc.tags && doc.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {doc.tags.map((tag: string) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    <Tag className="w-2 h-2 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                           {canModify && 
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDocumentEdit(doc, explorerCategory.categoryName); // Pass categoryName
                              }}
                              className="flex items-center gap-1"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span className='hidden sm:inline'>Edit with Thunai</span>
                            </Button>
        }
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No documents found in this category</p>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        );
      })
    ) : (
      <div className="text-center py-12">
        <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Categories Found</h3>
        <p className="text-muted-foreground">Create a category to get started.</p>
      </div>
    )}
  </ScrollArea>
    </div>
    
    {/* Right side: ProcessMonitor */}
  {/* <div className="w-1/3 max-w-sm flex-shrink-0  flex flex-col"   style={{ height: 'calc(100vh - 360px)' }}>
  <ExplorerStream processes={processes}  />
</div> */}
  </div>
</TabsContent>




          {/* Contradictions Tab */}
          <TabsContent value="contradictions" className="mt-2">
            <div className="space-y-4">
             <div className="flex items-center justify-between mb-4">
  <h3 className="text-lg font-semibold flex items-center gap-2">
    <Shield className="w-5 h-5" />
    Knowledge Contradictions
  </h3>

  {/* Right-side buttons */}
  {canModify && (
  <div className="flex items-center gap-3">
   {!loading && contradictions?.length !== 0 && (
  <div className="flex items-center gap-2 cursor-pointer select-none">
    <Checkbox
      checked={selectAll}
      onCheckedChange={handleSelectAll}
      id="select-all-checkbox"
    />
    <label 
      htmlFor="select-all-checkbox" 
      className="text-sm text-muted-foreground cursor-pointer"
    >
      {selectAll ? "Unselect All" : "Select All"}
    </label>
  </div>
)}


    {selectedIds.length > 0 && (
      <Button
        size="sm"
        variant="destructive"
     onClick={deleteSelectedWithConfirmation}
      >
       <Trash2 className='w-2 h-2'/>
      </Button>
    )}
  </div>)}
</div>
<div className="flex items-center gap-3 mb-4">
    <div className="flex items-center gap-3">
      <button 
        className={`px-3 py-1 rounded-full text-sm ${
          filter === "all" ? "bg-black text-white" : "bg-gray-100"
        }`}
        onClick={() => setFilter("all")}
      >
  All ({contradictions.filter(
  (c) => (c.affected_documents?.length || 0) > 0
).length})

      </button>

      <button 
        className={`px-3 py-1 rounded-full text-sm ${
          filter === "active" ? "bg-black text-white" : "bg-gray-100"
        }`}
        onClick={() => setFilter("active")}
      >
        Active ({contradictions?.filter(c => c.status === "active").length || 0})
      </button>

      <button 
        className={`px-3 py-1 rounded-full text-sm ${
          filter === "pending" ? "bg-black text-white" : "bg-gray-100"
        }`}
        onClick={() => setFilter("pending")}
      >
        Pending ({contradictions?.filter(c => c.status === "pending").length || 0})
      </button>

      <button 
        className={`px-3 py-1 rounded-full text-sm ${
          filter === "resolved" ? "bg-black text-white" : "bg-gray-100"
        }`}
        onClick={() => setFilter("resolved")}
      >
        Resolved ({contradictions?.filter(c => c.status === "resolved").length || 0})
      </button>
       <button 
        className={`px-3 py-1 rounded-full text-sm ${
          filter === "ignored" ? "bg-black text-white" : "bg-gray-100"
        }`}
        onClick={() => setFilter("ignored")}
      >
        Ignored ({contradictions?.filter(c => c.status === "ignored").length || 0})
      </button>
    </div>
  </div>
              <ScrollArea className="h-full pr-4">
                  {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
    <div
      key={`contradiction-skeleton-${i}`}
      className="border rounded-lg mb-4 p-4 animate-pulse bg-white"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-5 h-5 rounded-full" />
          <div>
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
        <Skeleton className="w-10 h-5 rounded" />
      </div>

      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-3/4" />
      </div>

      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 w-24 rounded" />
        <Skeleton className="h-8 w-24 rounded" />
      </div>
    </div>
  ))
              ):(
              contradictions && contradictions.length > 0 && contradictions
                .filter((item: any) => item.title && item.summary)
                .filter((c: any) => filter === "all" || c.status === filter)
                .map((contradiction) =>(
                  <Card key={contradiction.id} 
                  className={`mb-4 `}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {canModify &&
                           <input
                      type="checkbox"
                      checked={selectedIds.includes(contradiction.id)}
                      onChange={() => toggleSelect(contradiction.id)}
                      className="w-4 h-4 mt-1 cursor-pointer"
                    />}

<div
  className={`
    w-7 h-7 rounded flex items-center justify-center
    border ${getStatusUI(contradiction.status).color} ${getStatusUI(contradiction.status).bg}
  `}
>
  {getStatusUI(contradiction.status).icon}
</div>

                          <div>
                            
                            <CardTitle className="text-lg">{contradiction.title}</CardTitle>
                            <CardDescription className="mt-1">{contradiction.summary}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={contradiction.severity === 'high' ? 'destructive' : 
                                        contradiction.severity === 'medium' ? 'default' : 'secondary'}>
                            {contradiction.severity}
                          </Badge>
                          {contradiction?.actions?.mark_resolved && (
                            <Badge variant="outline" className="text-green-600">
                              <Eye className="w-3 h-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                           {canModify && (
                           <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteSingle(contradiction.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-2 h-2" />
               
                    </Button>
                           )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Affected Documents:</h4>
                          <div className="flex flex-wrap gap-2">
                            {contradiction.affected_documents.map(doc => (
                              <Badge key={doc.id} variant="outline" className="text-xs">
                                <FileText className="w-3 h-3 mr-1" />
                                {doc.name || 'Untitled'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
    {(contradiction.contradiction1 || contradiction.contradiction2) && (
  <div className="flex flex-col sm:flex-row gap-3">
    {contradiction.contradiction1 && (
      <div className="flex-1 p-3 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
       <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">{contradiction.affected_documents?.[0]?.name}</p>
        <p className="text-xs text-red-700 dark:text-red-300">
          {contradiction.contradiction1}
        </p>
      </div>
    )}

    {contradiction.contradiction2 && (
      <div className="flex-1 p-3 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
            <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">{contradiction.affected_documents?.[1]?.name}</p>
        <p className="text-xs text-red-700 dark:text-red-300">
          {contradiction.contradiction2}
        </p>
      </div>
    )}
  </div>
)}
                        
 {canModify &&                    
(contradiction?.actions?.resolve == false || contradiction?.actions?.mark_resolved == false) && (
  
  <div className="flex gap-2 pt-2">
   {["active", "ignored"].includes(contradiction?.status) && (
      <Button 
        size="sm" 
        onClick={() => setSelectedContradiction(contradiction)}
        className="flex items-center gap-1"
      >
        <Edit3 className="w-4 h-4" />
        Resolve Conflict
      </Button>
    )}
    {/* {contradiction?.actions?.mark_resolved == false && (
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => handleResolveContradiction(contradiction.id)}
        className="flex items-center gap-1"
      >
        <EyeOff className="w-4 h-4" />
        Mark Resolved
      </Button>
    )} */}
  </div>
)
}

                      </div>
                    </CardContent>
                  </Card>
                )))}
                
             {!loading && contradictions && contradictions.filter((item: any) => item.title && item.summary).filter((c: any) => filter === "all" || c.status === filter).length === 0 && (
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    {filter === "pending" && (
                      <>
                        <p className="text-muted-foreground">No pending contradictions found.</p>
                      </>
                    )}
                    {filter === "resolved" && (
                      <>
                        <p className="text-muted-foreground">No resolved contradictions found.</p>
                      </>
                    )}
                    {filter === "ignored" && (
                      <>
                        <p className="text-muted-foreground">No ignored contradictions found.</p>
                      </>
                    )}
                    {filter !== "pending" && filter !== "resolved" && filter !== "ignored" && (
                      <>
                        <h3 className="text-lg font-medium text-green-600 mb-2">All Clear!</h3>
                        <p className="text-muted-foreground">No contradictions detected in your knowledge base.</p>
                      </>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Relationships Tab */}
        <TabsContent value="relationships" className="mt-2">
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-xs sm:text-lg font-semibold flex items-center gap-2">
        <Network className="w-5 h-5" />
        Document Relationships
      </h3>
       <div className="flex items-center gap-2">
    
    <Badge variant="outline">
      {relationships.length} Connections
    </Badge>
    <FilterDropdown />
  </div>
{compareMode && (
  <div className="fixed inset-0 z-[100] bg-background backdrop-blur-md flex flex-col animate-in fade-in duration-200">
    <div className="flex items-center justify-between px-6 py-4 border-b bg-background/95 sticky top-0">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            setCompareMode(false);
            setSelectedCompareIds([]);
             setActiveComparisonGroup(null);
    setViewMode('cards');  
          }}
          className="flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Exit Comparison
        </Button>
        <div>
          <h2 className="text-xl font-bold">Document Comparison</h2>
          <p className="text-sm text-muted-foreground">
            {selectedCompareIds.length === 2 ? "Detailed analysis" : `Comparing ${selectedCompareIds.length} files`}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {selectedCompareIds.length === 2 && (
          <div className="flex border rounded-md overflow-hidden mr-4 bg-muted/50 p-1 gap-1">
            <Button
              variant={viewMode === 'diff' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setViewMode('diff')}
            >
              <LucideGitCompare className="w-3.5 h-3.5 mr-2" />
              Diff View
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setViewMode('cards')}
            >
              <Columns className="w-3.5 h-3.5 mr-2" />
              Side-by-Side
            </Button>
          </div>
        )}
        <Badge variant="secondary" className="px-3 py-1">
          {selectedCompareIds.length} Files Selected
        </Badge>
        
      </div>
      
    </div>

    <div className="flex-1 overflow-auto p-8 bg-muted/10">
    <UnifiedDocumentComparison
        fileIds={selectedCompareIds}
        viewMode={viewMode}
        onRemove={(removedId) => {
          const updated = selectedCompareIds.filter(id => id !== removedId);
          setSelectedCompareIds(updated);
          if (updated.length < 1) setCompareMode(false);
        }}
      />
    </div>
  </div>
)}
    </div>
    
    <div className="pr-4 h-[calc(100vh-400px)] show-scrollbar overflow-auto mb-[100px]">
       {loading ? (
        
                  <div>
    {Array.from({ length: 3 }).map((_, i) => (
  <Card key={`skeleton-${i}`} className="mb-4 animate-pulse">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base sm:text-lg flex-wrap">
        <Skeleton className="w-5 h-5 rounded-full" />
        <Skeleton className="h-5 w-32 sm:w-40" />
      </CardTitle>
      <CardDescription>
        <Skeleton className="h-3 w-40 sm:w-48 mt-2" />
      </CardDescription>
    </CardHeader>

    <CardContent>
      <div className="space-y-2">
        {/* Only 2 skeleton rows for variation */}
        {Array.from({ length: 2 }).map((_, j) => (
          <div
            key={`skeleton-row-${i}-${j}`}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded"
          >
            {/* Left content */}
            <div className="flex items-start sm:items-center gap-3 flex-1">
              <Skeleton className="w-2 h-2 rounded-full mt-1 sm:mt-0" />
              <div>
                <Skeleton className="h-4 w-28 sm:w-32 mb-1" />
                <Skeleton className="h-3 w-40 sm:w-48" />
              </div>
            </div>

            {/* Right-side actions */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Skeleton className="h-4 w-10 rounded" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
))}
    </div>
              
              ) : relationships.length > 0 ? (
 
relationships.map((relationshipItem: any) => {
  const isCurrentGroupActive = activeComparisonGroup === relationshipItem.id;
  const hasTargetSelected = selectedCompareIds.length === 2 && isCurrentGroupActive;

  return (
    <Card key={relationshipItem.id} className={`mb-4 transition-all ${isCurrentGroupActive ? 'shadow-md' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg flex-wrap cursor-pointer" onClick={() => handleViewDocument(relationshipItem.id)}>
            {/* Main Checkbox: Only visible when this group is active */}
            {isCurrentGroupActive && (
              <Checkbox 
                checked={true}
                disabled={true}
                className="h-4 w-4"
              />
            )}
            <FileText className="w-5 h-5 text-primary" />
            <span className="truncate max-w-[220px] sm:max-w-[500px]">
              {relationshipItem.file_name || "Untitled"}
            </span>
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* Start Comparison Button: Always visible */}
            <Button 
              size="sm" 
              variant={isCurrentGroupActive ? "outline" : "secondary"}
              onClick={(e) => {
                e.stopPropagation();
                handlePrepareComparison(relationshipItem.id);
              }}
            >
            {!isCurrentGroupActive &&  <LucideGitCompare/>}
              {isCurrentGroupActive ? "Cancel" : "Compare"}
            </Button>

            {/* Launch Comparison Button: Only visible when a target is picked */}
            {hasTargetSelected && (
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 animate-in zoom-in duration-200"
                onClick={handleStartComparison}
              >
                <BookOpen />
                Go Side-by-Side
              </Button>
            )}
          </div>
        </div>
      <CardDescription className="text-sm sm:text-sm">
        Connected to {relationshipItem.realted_documents?.length || 0} document
        {relationshipItem.realted_documents?.length !== 1 ? "s" : ""}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
     {/* Inside Relationships Tab -> ScrollArea -> relationships.map */}
{relationshipItem.realted_documents?.map((relDoc: any) => (
  <div
    key={relDoc.id}
              className={`flex items-center justify-between p-3 border rounded transition-all ${
                selectedCompareIds.includes(relDoc.id) ? 'bg-blue-50/50 border-blue-200' : 'hover:bg-muted/50 cursor-pointer'
              }`}
              onClick={() => isCurrentGroupActive ? toggleCompareId(relDoc.id, relationshipItem.id) : handleViewDocument(relDoc.id)}
            >
              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                {isCurrentGroupActive && (
                  <Checkbox 
                    checked={selectedCompareIds.includes(relDoc.id)}
                    onCheckedChange={() => toggleCompareId(relDoc.id, relationshipItem.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4"
                  />
                )}
                
      <div
    className={`w-2 h-2 rounded-full shrink-0 mt-2 sm:mt-0 ${
                  relDoc.rel_title?.toLowerCase() === "supports"
                    ? "bg-green-500"
                    : relDoc.rel_title?.toLowerCase() === "helps"
                    ? "bg-blue-500"
                    : relDoc.rel_title?.toLowerCase() === "duplicates"
                    ? "bg-purple-500"
                    : relDoc.rel_title?.toLowerCase() === "conflicts_with"
                    ? "bg-red-500"
                    : "bg-gray-500"
                }`}
              />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate sm:whitespace-normal  max-w-[220px] sm:max-w-[500px] md:max-w-full">
                  {relDoc.name}
                </p>
                <p className="text-xs text-muted-foreground  truncate sm:whitespace-normal max-w-[220px] sm:max-w-[500px] md:max-w-full">
                  {relDoc.summary}
                </p>
              </div>
            </div>

            {/* Right section: badge + link */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Badge variant="outline" className="text-xs">
                {relDoc.rel_title}
              </Badge>
              {/* <Link className="w-4 h-4 text-blue-500 shrink-0" /> */}
              {canModify &&
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setRelationshipPendingDeletion([{ id: relDoc?.rel_id, name: relDoc.name }]);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
  );
})
      
       ) : ( 
                <div className="text-center py-12">
                  <Network className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Relationships Found</h3>
                  <p className="text-muted-foreground">Documents will appear here as relationships are detected.</p>
                </div>
              )} 
    </div>
  </div>
</TabsContent>


          {/* Categories Tab */}
          <TabsContent value="categories" className="mt-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Category Management
                </h3>
                {canModify && (
                <Button onClick={() => setShowCategoryDialog(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                   <span className="hidden sm:inline">Create Category</span>
                </Button>
                )}
              </div>
              
              <ScrollArea className="pr-4">
 {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
  <div
    key={i}
    className="border rounded-lg mb-4 p-4 animate-pulse"
  >
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      {/* Left side: title & subtitle */}
      <div className="flex-1">
        <Skeleton className="h-5 w-40 sm:w-48 mb-2" />
        <Skeleton className="h-3 w-3/4 sm:w-2/3" />
      </div>

      {/* Right side: button placeholders */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        <Skeleton className="h-6 w-14 sm:w-16 rounded" />
        <Skeleton className="h-8 w-20 sm:w-24 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>

    {/* Bottom section */}
    <div className="mt-4 space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  </div>
))

               ) : categories && categories.length > 0 ? (
                categories.map((category) => (
                  <Card key={category.id} className="mb-4">
                    <CardHeader>
                      <div className="flex items-center">
                        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                          {category.name}
                        </CardTitle>
                         <div className="flex items-center ml-auto gap-4">
                        <Badge variant="secondary">
                          {category.doc_nos} docs
                        </Badge>
                       
    {canModify && (
      <>
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleEditCategory(category)}
      className="flex items-center gap-1"
    >
      <Edit3 className="w-4 h-4" />
     <span className="hidden sm:inline">Edit Category</span>
    </Button>
  
      <Button
      variant="outline"
      size="sm"
      // onClick={() => handleDeleteCategory(category)}
      onClick={() => setDeleting(category)} 
      className="flex items-center gap-1"
    >
      
    <Trash2 className="w-4 h-4" />   
    </Button>
      </>
    )}
  </div>
                      </div>
                      
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {category.ai_instructions && (
                        <div className="mb-4 p-3 bg-muted/20 rounded border">
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Category Instructions
                          </h4>
                          <p className="text-sm text-muted-foreground">{category.ai_instructions}</p>
                        </div>
                      )}
                      
                      {category.related_categories.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Related Categories:</h4>
                          <div className="flex flex-wrap gap-2">
                            {category.related_categories.map(relatedId => {
                              const relatedCategory = categories.find(c => c.id === relatedId);
                              return relatedCategory ? (
                                <Badge key={relatedId} variant="outline" className="text-xs">
                                  {relatedCategory.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
                  ) : (
      <div className="text-center py-12">
        <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Categories Found</h3>
        <p className="text-muted-foreground">Create a category to get started.</p>
      </div>
  
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Document Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Edit Document: {editingDocument?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
        
            {/* Update Instructions */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Update Instructions for Thunai
              </label>
              <Textarea
                placeholder="Describe what changes you want to make to this document..."
                value={updateInstructions}
                onChange={(e) => setUpdateInstructions(e.target.value)}
                className="h-24"
              />
            </div>

            
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApplyDocumentChanges}
              disabled={!updateInstructions.trim()}
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Apply Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
<Dialog open={showCategoryDialog} onOpenChange={(open) => {
  setShowCategoryDialog(open);
  if (!open) {
    setEditingCategory(null);
    setIsMergeMode(false);
    setSelectedMergeCategories([]);
    setNewCategory({ name: "", description: "", ai_instructions: "" });
  }
}}>
  <DialogContent className="max-w-3xl">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        {isMergeMode ? <LucideGitCompare className="w-5 h-5 text-blue-600" /> : editingCategory ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        {isMergeMode ? 'Finalize Merge' : editingCategory ? 'Edit Category' : 'Create New Category'}
      </DialogTitle>
    </DialogHeader>
    
    <div className="space-y-4">
     {isMergeMode && (
  <div>
    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      Merging Source Categories:
    </Label>

    <div className="flex flex-wrap gap-2 mt-2">
      {selectedMergeCategories.map(name => (
        <Badge
          key={name}
          variant="outline"
          className=" px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 flex items-center"
        >
          <Folder className="w-3 h-3 mr-2" />
          {name}
        </Badge>
      ))}
    </div>
  </div>
)}

  <div className="space-y-1">
    <Label htmlFor="category-name" className="after:content-['*'] after:text-red-500">
      {isMergeMode ? 'New Category Name' : 'Category Name'}
    </Label>

    <Input
      id="category-name"
      placeholder="e.g. Financial Reports"
      value={newCategory.name}
      onChange={(e) =>
        setNewCategory((prev) => ({
          ...prev,
          name: e.target.value,
        }))
      }
    />
 
</div>

      
      <div className="space-y-1">
        <Label htmlFor="category-description"  className="after:content-['*'] after:text-red-500">Description</Label>
        <Textarea
          id="category-description"
          placeholder="Brief description of this category..."
          value={newCategory.description}
          onChange={(e) => setNewCategory((prev) => ({
            ...prev,
            description: e.target.value
          }))}
          className="h-20"
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="category-instructions">AI Instructions (Optional)</Label>
        <Textarea
          id="category-instructions"
          placeholder="Instructions for AI when processing documents in this category..."
          value={newCategory.ai_instructions}
          onChange={(e) => setNewCategory((prev) => ({
            ...prev,
            ai_instructions: e.target.value
          }))}
          className="h-24"
        />
        {isMergeMode && (
          <p className="text-[10px] text-muted-foreground italic mt-1">
            Source-specific instructions will be migrated but prioritized by these new rules.
          </p>
        )}
      </div>
    </div>

    <div className="flex justify-between pt-4 border-t">
      <Button variant="outline" onClick={() => {
        setShowCategoryDialog(false);
        setEditingCategory(null);
        setIsMergeMode(false);
        setSelectedMergeCategories([]);
        setNewCategory({ name: "", description: "", ai_instructions: "" });
      }}>
        Cancel
      </Button>
     <Button 
      onClick={isMergeMode ? handleCompleteMerge : editingCategory ? handleUpdateCategory : handleCreateCategory}
      disabled={!newCategory.name.trim() || !newCategory.description.trim() || isCreatingCategory || isUpdatingCategory || isMerging}
      className={`flex items-center gap-2 ${isMergeMode ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
    >
      {(isCreatingCategory || isUpdatingCategory || isMerging) ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isMergeMode ? (
        <CheckCheck className="w-4 h-4" />
      ) : editingCategory ? (
        <Edit3 className="w-4 h-4" />
      ) : (
        <Plus className="w-4 h-4" />
      )}
      
      {isMergeMode ? (isMerging ? 'Merging...' : 'Complete Merge') : 
      editingCategory 
    ? (isUpdatingCategory ? 'Updating...' : 'Update Category')
    : (isCreatingCategory ? 'Creating...' : 'Create Category')
  }
</Button>
    </div>
  </DialogContent>
</Dialog>
      {/* Conflict Resolution Dialog */}
      {selectedContradiction && (
        <ConflictResolution
          contradiction={selectedContradiction}
          // documents={mockDocuments}
          onClose={() => setSelectedContradiction(null)}
          onResolve={handleResolveConflict}
          getContradictionAndRelationship={getContradictionAndRelationship}
          setLastActiveTab={setLastActiveTab}

        />
      )}
      {/* Delete Confirmation Dialog */}
<AlertDialog open={!!deleting}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle className="flex items-center gap-2">
        Delete Category
      </AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to delete the category <strong>"{deleting?.name}"</strong>? 
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
     
      <AlertDialogAction
        onClick={() => deleting && handleDeleteCategory(deleting)}
        disabled={isDeletingCategory}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        {isDeletingCategory ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </>
        )}
      </AlertDialogAction>
       <AlertDialogCancel 
        onClick={() => setDeleting(null)}
        disabled={isDeletingCategory} // Prevent closing during deletion
      >
        Cancel
      </AlertDialogCancel>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
 <DeletePopup
       deleting={contradictionPendingDeletion ?
           (() => {
            return contradictionPendingDeletion.map(id => {
              const contradiction = contradictions.find(c => c.id === id);
              return contradiction ?
                { id: contradiction.id, name: contradiction.title || 'Untitled Contradiction' } :
               { id: id, name: 'Unknown Contradiction' }; // Fallback if contradiction not found
            });
           })()
           : null}   
          isDeletingCategory={isDeletingContradiction} 
       handleDeleteCategory={handleDeleteContradiction}
        setDeleting={() => setContradictionPendingDeletion(null)} 
      />

<DeletePopup
       deleting={relationshipPendingDeletion}   
       isDeletingCategory={isDeletingRelationship} 
       handleDeleteCategory={handleDeleteRelationshipLink}
       setDeleting={() => setRelationshipPendingDeletion(null)} 
      />
    </div>
  );
};