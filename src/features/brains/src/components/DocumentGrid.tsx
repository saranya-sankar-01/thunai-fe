import { useEffect, useState } from 'react';
import { Search, FileText, Video, Link2, Globe, Calendar, Eye, MessageSquare, Copy, MoreHorizontal, Folder, Share, ExternalLink, Lock, Unlock, Settings, MoreVertical, Trash2, Link, File, Image, Text, RotateCw, RefreshCcw, Filter, RefreshCw, RefreshCwIcon, FileAudio } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AgentPagination } from './shared-components/pagination';
import { getTenantId, requestApi } from '@/services/authService';
import { Item } from '@radix-ui/react-select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { useToast } from "@/hooks/use-toast";
import DeletePopup from '@/components/shared-components/DeletePopup';
import {KnowledgeBaseItem} from '@/types/KnowledgeBaseItem'
import { useKnowledgeBaseStore } from '@/store/knowledgeBaseStore';
import ISTTime from './shared-components/ISTTime';
import ISTTimeWithMin from './shared-components/ISTTimeWithMin';
import { Input } from '@/components/ui/input';
import { format } from "date-fns";
import { ShareSlider } from './ShareSlider';
import usePermissions from '@/hooks/usePermissions';
interface DocumentGridProps {
  filter: string;
  searchTerm: string;
  viewMode?: 'grid' | 'list';
  sortBy?: 'date' | 'title' | 'views' | 'insights';
  sortOrder?: 'asc' | 'desc';
   appliedFilters?: any[]; 
   appliedFiltersCount: number; 
  onToggleAdvancedFilter: () => void;
  onClearFilters: () => void; 
  onRefresh: () => void;
  onSearchTermChange: (term: string) => void;
 onFilterTypeChange: (filterType: string) => void; 
}

const getTypeIcon = ( type: string) => {
  switch ( type) {
    case 'file':
      return <File className="w-5 h-5 text-yellow-500" />;
    case 'web-link':
      return <Link className="w-5 h-5 text-green-500" />;
    case 'video':
      return <Video className="w-5 h-5 text-green-500" />;
    case 'image':
      return <Image className="w-5 h-5 text-green-500" />;
    case 'text':
      return <Text className="w-5 h-5 text-green-500" />;
    case 'stream':
      return <Folder className="w-5 h-5 text-purple-500" />;
    case 'audio':
      return <FileAudio className="w-5 h-5 text-gray-500" />
    default:
      return <Folder className="w-5 h-5 text-gray-500" />;
  }
};

const formatFileSize = (sizeInKB: number): string => {
  if (sizeInKB < 1024) {
    return `${sizeInKB.toFixed(2)} KB`;
  } else if (sizeInKB < 1024 * 1024) {
    return `${(sizeInKB / 1024).toFixed(2)} MB`;
  } else {
    return `${(sizeInKB / (1024 * 1024)).toFixed(2)} GB`;
  }
};


const getDateGroup = (utcDate: string) => {
  const dateInUtc = new Date(utcDate.endsWith('Z') ? utcDate : utcDate + 'Z');
  const nowUtc = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const dateInIstMs = dateInUtc.getTime() + istOffsetMs;
  const nowInIstMs = nowUtc.getTime() + istOffsetMs;
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSinceEpochDoc = Math.floor(dateInIstMs / msPerDay);
  const daysSinceEpochNow = Math.floor(nowInIstMs / msPerDay);

  const diffDays = daysSinceEpochNow - daysSinceEpochDoc;

  if (diffDays === 0) return "Today";
  if (diffDays < 7) return "This Week"; 
  if (diffDays < 30) return "This Month"; 
  return "Older";
};

export const DocumentGrid = ({ 
  filter, 
  searchTerm,
  viewMode = 'grid',
  appliedFilters = [],
  sortBy = 'date',
  sortOrder = 'desc', appliedFiltersCount,onToggleAdvancedFilter,onSearchTermChange,onClearFilters,onRefresh,
  onFilterTypeChange // Destructure the new prop
}: DocumentGridProps) => {
  const tenantID = getTenantId()
  const navigate = useNavigate();
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
   const [deleting, setDeleting] = useState<{ id: string; name: string }[] | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [isShareSliderOpen, setIsShareSliderOpen] = useState(false);
const { knowledgeBaseItems, loading, loadFiles, currentPage, 
    totalPages, 
    totalItems,
    pageSize,
    setCurrentPage,  appliedFilters: storeAppliedFilters,setLastActiveTab} = useKnowledgeBaseStore();
 const categories = Array.from(
  new Set(
    knowledgeBaseItems
      .map(item => item.categories)
      .filter(category => category )
  )
);
  const { canViewModule, canModifyModule } = usePermissions();
  const canModifyShare = canModifyModule("share_knowledgebase");
  const canViewShare = canViewModule("share_knowledgebase");
  const canviewKnowledgeBase = canViewModule("knowledgebase");
  const canModifyKnowledgeBase = canModifyModule("knowledgebase");
  //  console.log(categories)
  
  const filteredAndSortedDocuments = knowledgeBaseItems

    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      
      switch (sortBy) {
       case 'date':
  return (new Date(a.updated).getTime() - new Date(b.updated).getTime()) * multiplier;
        case 'title':
          return a.title.localeCompare(b.title) * multiplier;
        case 'views':
          return (a.views - b.views) * multiplier;
        case 'insights':
          return (a.insights - b.insights) * multiplier;
        default:
          return 0;
      }
    });

  // Group documents by date
  const groupedDocuments = filteredAndSortedDocuments.reduce((groups, item) => {
    const group = getDateGroup(item.updated);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as Record<string,  typeof filteredAndSortedDocuments>);
 const groupOrder = ['Today', 'This Week', 'This Month', 'Older'];
  const orderedGroups = groupOrder.filter(group => groupedDocuments[group]?.length > 0);
  //  const currentFilters = appliedFilters.length > 0 ? appliedFilters : storeAppliedFilters;
  const currentFilters = storeAppliedFilters; 
  const handleViewDocument = (item: KnowledgeBaseItem) => {
    // setLastActiveTab(filter)
    navigate(`/brain/view/${item.id}`);
  };

  const handleCopy = (item: KnowledgeBaseItem) => {
    navigator.clipboard.writeText(item.publicUrl);
    toast("Link copied to clipboard!");
  };

  const handleSelectDocument = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedDocuments);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedDocuments(newSelected);
  };

  const handleSelectCategory = (category: string, checked: boolean) => {
    const newSelectedCategories = new Set(selectedCategories);
    const newSelectedDocuments = new Set(selectedDocuments);
    
    if (checked) {
      newSelectedCategories.add(category);
      // Add all documents in this category
      filteredAndSortedDocuments
        // .filter(item => item.category === category)
        .forEach(item => newSelectedDocuments.add(item.id));
    } else {
      newSelectedCategories.delete(category);
      // Remove all documents in this category
      filteredAndSortedDocuments
        // .filter(item => item.category === category)
        .forEach(item => newSelectedDocuments.delete(item.id));
    }
    
    setSelectedCategories(newSelectedCategories);
    setSelectedDocuments(newSelectedDocuments);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allItemIds = new Set(filteredAndSortedDocuments.map(item => item.id));
      const allCategories = new Set(categories);
      setSelectedDocuments(allItemIds);
      // setSelectedCategories(allCategories);
    } else {
      setSelectedDocuments(new Set());
      setSelectedCategories(new Set());
    }
  };
const getStatusColor = (status: string) => {
  switch (status) {
    case 'done':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'started':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'pending':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

  const handlePageSizeChange = (size: number) => {
    setCurrentPage(1); // Reset to first page when changing page size
    loadFiles(filter, 1, size, currentFilters, searchTerm);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadFiles(filter, page, pageSize,currentFilters,searchTerm);
  };

 const handleDelete = async (items: { id: string; name: string }[]) => {
    try {
      setIsDeletingItem(true);
      const id = items.map(item => item.id);
      console.log(id)
      const response = await requestApi("DELETE", `brain/knowledge-base/${tenantID}/`,{id},"brainService");
      setIsDeletingItem(false);
    setDeleting(null);
     await loadFiles(filter, currentPage, pageSize, currentFilters);
      toast.success(response.message || "Deleted successfully");
    } catch (error: any) {
    console.error("Delete error:", error);

    toast.error(
      error?.response?.data?.message || error?.response?.message ||
      "Something went wrong while deleting. Please try again."
    );

    // Keep the popup open so user can retry
  } finally {
      setIsDeletingItem(false);
      setDeleting(null);
    }
  };
  const handleBulkPrivacyChange = (makePublic: boolean) => {
    const selectedCount = selectedDocuments.size;
    if (selectedCount === 0) {
      toast("Please select documents to update");
      return;
    }
    
    // Here you would typically make an API call to update the documents
    toast(`${selectedCount} document${selectedCount > 1 ? 's' : ''} ${makePublic ? 'made public' : 'made private'}`);
    
    // Clear selections after action
    setSelectedDocuments(new Set());
    setSelectedCategories(new Set());
  };

  const isAllSelected = filteredAndSortedDocuments.length > 0 && 
    filteredAndSortedDocuments.every(item => selectedDocuments.has(item.id));
const handleRetrain = async (documentId) => {
  try {
    const updateData = {
      status: "retrain"
    };

    const response = await requestApi(
      "POST", 
      `brain/knowledge-base-retrain/${tenantID}/${documentId}`, 
      updateData, 
      "brainService"
    );
     await loadFiles(filter, currentPage, pageSize, currentFilters);
toast.success(response.message || "Retrain started")
  } catch (error) {
    console.error("Retrain failed:", error);
    toast.error(error?.response?.data?.message || error?.response?.message || "Failed to trigger retrain");
    return null;
  }
};

const handleBulkRetrain = async () => {
  const selectedCount = selectedDocuments.size;
  if (selectedCount === 0) {
    toast("Please select documents to retrain");
    return;
  }

  try {
    const documentIdsToRetrain = Array.from(selectedDocuments);
    const response = await requestApi(
      "POST",
      `brain/knowledge-base-retrain/${tenantID}/batch`,
      { document_ids: documentIdsToRetrain },
      "brainService"
    );
    await loadFiles(filter, currentPage, pageSize, currentFilters);
    toast.success(response.message || `${selectedCount} document${selectedCount > 1 ? 's' : ''} retrain started`);
    setSelectedDocuments(new Set());
    setSelectedCategories(new Set());
  } catch (error: any) {
    console.error("Bulk retrain failed:", error);
    toast.error(error?.response?.data?.message || error?.response?.message || "Failed to trigger bulk retrain");
  }
};

const handleShareComplete = () => {
  setSelectedDocuments(new Set());
  setSelectedCategories(new Set());
};
  return (
    <div className="space-y-0 h-[calc(100vh-295px)] pb-8">
      {/* Bulk Actions Toolbar - Show when items are selected */}
{selectedDocuments.size > 0 && (
  <div className="flex items-center justify-between py-4 sm:p-4 bg-muted/50 border-b border-border">
    {/* Left side — Selected count */}
    <span className="hidden sm:inline text-sm font-medium">
      {selectedDocuments.size} document{selectedDocuments.size > 1 ? 's' : ''} selected
    </span>

    {/* Right side — Delete and Clear buttons */}
    <div className="flex items-center gap-2">
    {canViewShare && canModifyShare && (
  <Button 
    variant="outline" 
    size="sm"
    onClick={() => setIsShareSliderOpen(true)}
    // className='disabled:pointer-events-auto'
    // disabled={Array.from(selectedDocuments).some(id => {
    //   const doc = knowledgeBaseItems.find(item => item.id === id);
    //   return doc?.status?.toLowerCase() === 'failed';
    // })}
    // title={Array.from(selectedDocuments).some(id => {
    //   const doc = knowledgeBaseItems.find(item => item.id === id);
    //   return doc?.status?.toLowerCase() === 'failed';
    // }) ? 'failed files can not be shared' : ''}
  >
    <Share className="w-4 h-4 mr-2" />
    Share
  </Button>
)}
{canModifyKnowledgeBase && (
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleBulkRetrain}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Retrain
      </Button> 
)}
{canModifyKnowledgeBase && (
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => {
          const selectedItems = Array.from(selectedDocuments).map(id => {
            const doc = knowledgeBaseItems.find(item => item.id === id);
            return {
              id,
              name: doc?.file_name || doc?.title || 'Untitled',
            };
          });
          // // Pass the actual selected items directly
          setDeleting(selectedItems);
        }}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </Button>
)}

      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => {
          setSelectedDocuments(new Set());
          setSelectedCategories(new Set());
        }}
      >
        Clear
      </Button>
    </div>
  </div>
)}



      {/* Header with Select All and Category Selection */}    
      
     <div className="flex items-center justify-between py-3 border-b border-border">
  {/* Left: Select All */}
  <div className="flex items-center space-x-0 sm:space-x-4 min-w-0 sm:min-w-[150px]">
    
    {!loading  ? (
      <>
      {(canModifyShare || canModifyKnowledgeBase) && filteredAndSortedDocuments.length > 0 && (
         <>
       <Checkbox 
          checked={isAllSelected}
          onCheckedChange={handleSelectAll}
        />
        <span className="text-sm text-muted-foreground hidden sm:inline">Select All</span>
        </>
      )
 }     
        
        {/* START OF NEW CODE: Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-2 w-32 text-left">
              Type: {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-md border border-gray-200 shadow-lg bg-white w-32 mr-8">
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onFilterTypeChange('all'); }}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 rounded-md transition-colors ${filter === 'all' ? 'font-bold' : ''}`}
            >
              All
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onFilterTypeChange('documents'); }}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 rounded-md transition-colors ${filter === 'documents' ? 'font-bold' : ''}`}
            >
              Documents
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onFilterTypeChange('links'); }}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 rounded-md transition-colors ${filter === 'links' ? 'font-bold' : ''}`}
            >
              Links
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onFilterTypeChange('videos'); }}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 rounded-md transition-colors ${filter === 'videos' ? 'font-bold' : ''}`}
            >
              Videos
            </DropdownMenuItem>
             <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onFilterTypeChange('images'); }}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 rounded-md transition-colors ${filter === 'images' ? 'font-bold' : ''}`}
            >
              Images
            </DropdownMenuItem>
             <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onFilterTypeChange('audios'); }}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 rounded-md transition-colors ${filter === 'audios' ? 'font-bold' : ''}`}
            >
              Audio
            </DropdownMenuItem>
              {/* <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onFilterTypeChange('streams'); }}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 rounded-md transition-colors ${filter === 'videos' ? 'font-bold' : ''}`}
            >
              Streams
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* END OF NEW CODE */}

      </>
    ) : (
      <div className="" />
    )}
  </div>

  {/* Right: Search + Filter + Refresh */}
  <div className="flex items-center space-x-1 sm:space-x-3">
    <div className="relative">

      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 hidden sm:block" />
      <Input
        placeholder="Search recent files..."
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        className=" pl-3 sm:pl-10  w-16 sm:w-64 border-gray-300"
      />
    </div>

    <Button
      variant="outline"
      size="sm"
      className="border-gray-300"
      onClick={onToggleAdvancedFilter}
    >
      <Filter className="w-4 h-4" />
      <span className="hidden sm:inline">Filters</span>
      {appliedFiltersCount > 0 && (
        <Badge variant="secondary" className="ml-2 text-xs">
          {appliedFiltersCount}
        </Badge>
      )}
    </Button>

    {appliedFiltersCount > 0 && (
      <Button
        variant="outline"
        size="sm"
        onClick={onClearFilters}
        className="text-gray-600 hover:text-gray-800"
      >
        Clear Filters
      </Button>
    )}

    <Button
      variant="outline"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onRefresh();
      }}
      className="flex items-center space-x-2"
    >
      <RefreshCcw className="w-4 h-4" />
      <span className="hidden sm:inline">Refresh</span>
    </Button>
  </div>
</div>


     {loading  ? (
        <div className="text-center py-12 h-[calc(100vh-390px)]">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground animate-pulse" />
          </div>
          <h3 className="text-lg font-medium mb-2">Loading files...</h3>
          <p className="text-muted-foreground">Please wait while we fetch your documents.</p>
        </div>
      ) : filteredAndSortedDocuments.length === 0 ? (
        <div className="text-center py-12 h-[calc(100vh-390px)]">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No content found</h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? `No results for "${searchTerm}". Try adjusting your search.`
              : 'Upload your first document or add a source to get started.'
            }
          </p>
        </div>
      ) : (
      <div className="space-y-0  overflow-auto h-full show-scrollbar">
        {orderedGroups.map((groupName) => (
          <div key={groupName}>
            {/* Group Header */}
            <div className="px-4 py-2 bg-muted/30 border-b border-border">
              <h4 className="text-sm font-medium text-foreground">
                {groupName}
                <span className="ml-2 text-xs text-muted-foreground">
                  ({groupedDocuments[groupName].length} {groupedDocuments[groupName].length === 1 ? 'item' : 'items'})
                </span>
              </h4>
            </div>
            
            {/* Group Files */}
            {groupedDocuments[groupName].map((doc) => (
              <div 
                key={doc.id} 
                className="flex items-center py-4 sm:p-4 hover:bg-muted/50 border-b border-border/50 cursor-pointer smooth-transition"
                onClick={() => handleViewDocument(doc)}
              >
       {(canModifyKnowledgeBase || canModifyShare )&& (
                <Checkbox 
                  className="mr-4" 
                  checked={selectedDocuments.has(doc.id)}
                  onCheckedChange={(checked) => {
                    handleSelectDocument(doc.id, checked as boolean);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
       )}
                {getTypeIcon(doc. type)}
                
                <div className="flex-1 min-w-0 ml-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                       
<div className="flex flex-col min-w-0">
  {/* Title */}
                        <h3
  className="
    text-primary font-medium hover:underline
    truncate
    text-xs sm:text-sm md:text-base lg:text-base
    max-w-[100px] sm:max-w-[180px] md:max-w-[700px]
  "
>
  {doc.title || doc.file_name  || "Untitled"}
</h3>

  {/* File Name (only if different from title) */}
  {doc.file_name  &&(
    <p
      className="
        text-[10px] sm:text-xs md:text-sm
        text-muted-foreground
        truncate
        max-w-[100px] sm:max-w-[180px] md:max-w-[700px]
      "
    >
      {doc.file_name}
    </p>
  )}
</div>
                          {doc?.public_share && (
                        doc.public_share ? (
                          <Unlock className="w-4 h-4 text-green-500" />
                        ) : (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        ))}
                        {doc.categories&&(
                        <Badge variant="outline" className="text-xs">
                          {doc.categories}
                        </Badge>)}

 
{doc.status !== "done" && (
  <Badge
    className={`
      text-[8px] sm:text-xs md:text-xs lg:text-xs
      ${getStatusColor(doc.status)}
    `}
  >
    {doc.status}
  </Badge>
)}

                      </div>
                      <div className="flex items-center space-x-4 text-[10px] sm:text-xs md:text-xs lg:text-xs
    text-muted-foreground mt-1">
                        <span>Uploaded by: {doc.uploaded_by}</span>
                        {doc.size && <span>| {formatFileSize(doc.size)}</span>}
                        {doc?.public_share && (
  <span className="hidden sm:inline">
    | {doc.public_share ? "Public" : "Private"}
  </span>
)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 ml-4 text-[10px] sm:text-xs md:text-sm lg:text-sm">
                      <div className="text-right">
                        <div className=" text-muted-foreground">
                          {/* {new Date(doc.created).toLocaleDateString()} */}
                          <ISTTimeWithMin utcString={doc?.updated} />

                        </div>
                        {/* <div className=" text-primary">
                          Credits: {(doc.insights * 0.5).toFixed(2)}
                        </div> */}
                      </div>
                      
                     <DropdownMenu>
                    <DropdownMenuTrigger asChild>
              {canModifyKnowledgeBase && (       
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
            )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent  className="rounded-md border border-gray-200 shadow-lg bg-white">
                       {/* Retrain Button */}
    <DropdownMenuItem
      onClick={(e) => {
        e.stopPropagation();
        handleRetrain(doc.id);
      }}
     className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-gray-100  rounded-md transition-colors"
     >
      <RefreshCw className="h-4 w-4 mr-2" /> Retrain
    </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                        setDeleting([
  {
    id: doc.id,
    name: doc.file_name || doc.title || 'Untitled',
  },
]);

                        }}
                          className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm text-red-600 hover:bg-gray-100  rounded-md transition-colors"
           >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                       
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>)}

      {/* Pagination */}
          <div className="-mx-12">
  <AgentPagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={handlePageChange}
    pageSize={pageSize}
    totalItems={totalItems}
    onPageSizeChange={handlePageSizeChange}
  />
</div> 
<DeletePopup
  deleting={deleting}
  isDeletingCategory={isDeletingItem}
  handleDeleteCategory={() => {
    if (Array.isArray(deleting)) {
      handleDelete(deleting);
    } else if (deleting) {
      handleDelete([deleting]);
    }
    setSelectedDocuments(new Set());
    setSelectedCategories(new Set());
  }}
  setDeleting={setDeleting}
/>
<ShareSlider
  isOpen={isShareSliderOpen}
  onClose={() => setIsShareSliderOpen(false)}
  selectedFileIds={Array.from(selectedDocuments)}
   onClearSelection={handleShareComplete}
/>
    </div>
  );
};