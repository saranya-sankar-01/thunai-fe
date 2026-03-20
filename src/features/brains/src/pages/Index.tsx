import { useState,useEffect, act } from 'react';
import { Search, Plus, Filter, BarChart3, Loader2, Upload, FileText, Link2, Video, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DetailedUploadInterface } from "../components/DetailedUploadInterface";
import { StreamViewer } from "../components/StreamViewer";
import { KnowledgeGraph } from "../components/KnowledgeGraph";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AdvancedFilter } from "../components/AdvancedFilter";
import { useKnowledgeBaseStore } from '@/store/knowledgeBaseStore';
import ProcessingFilesSlider from '../components/ProcessingFilesSlider';
import EntitiesModal from '../components/EntitiesModal'; // Import the new component
import { usePeriodicSyncStore } from '@/store/usePeriodicSyncStore';
import { getTenantId, requestStreamApi } from '@/services/authService';
import { LearningSetsView } from '../components/learning-set/LearningSetsView'; // Import LearningSetsView
import { ExplorerStream } from '../components/ExplorerStream';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Safemind } from '../components/safe-mind/SafeMind';
import { useProcessStreamFile } from '@/store/useProcessStreamFile';
import { useProcessStream } from '@/store/useProcessStream';
import usePermissions from '@/hooks/usePermissions';
import { DocumentGrid } from '../components/DocumentGrid';
// import { DocumentTypeSelect } from '@/components/DocumentTypeSelect';


const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
    const [currentFilter, setCurrentFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'views' | 'insights'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showUploadInterface, setShowUploadInterface] = useState(false);
 const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any[]>([]);
  const { setAppliedFilters: setStoreFilters, appliedFilters: storeFilters, clearFilters,credits,loadFiles,pageSize ,currentPage, setCurrentPage,lastActiveTab, setLastActiveTab,processing, setKnowledgeGraphSubTab} = useKnowledgeBaseStore();
  
  // Permission management
  // const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  // const hasFullAccess = permissions.includes('*');
  // const canViewKnowledgeGraph = hasFullAccess || permissions.includes('knowledgegraph:ALL') || permissions.includes('knowledgegraph:READ');
  // const canViewLearningSets = hasFullAccess || permissions.includes('knowledgegraph_memory:ALL') || permissions.includes('knowledgegraph_memory:READ');
    const { canViewModule, canModifyModule } = usePermissions();
  const canViewKnowledgeGraph = canViewModule("knowledgegraph");
  const canViewLearningSets = canViewModule("knowledgegraph_memory");
  const canViewSafeMind = canViewModule("safemind");
  const canviewKnowledgeBase = canViewModule("knowledgebase");
  const canModifyKnowledgeBase = canModifyModule("knowledgebase");
  // Removed local activeTab state, using lastActiveTab from store directly
  // const [activeTab, setActiveTab] = useState(() => {
  //  // Initialize activeTab based on lastActiveTab from the store
  //   return lastActiveTab && lastActiveTab !== 'all' ? lastActiveTab : 'all';
  // });
  const [isUploading, setIsUploading] = useState(false);
const [uploadingFileCount, setUploadingFileCount] = useState(0); 
  const [showProcessingSlider, setShowProcessingSlider] = useState(false); // State to control slider visibility
  const [showEntitiesModal, setShowEntitiesModal] = useState(false); // Add state for entities modal
    const [open, setOpen] = useState(false);
//     const [processingFilesData, setProcessingFilesData] = useState([]);
// const [totalProcessingFiles, setTotalProcessingFiles] = useState(0);
const [isLoadingProcessing, setIsLoadingProcessing] = useState(false);
const tenantID = getTenantId();
const [showLiveConfig,setShowLiveConfig] = useState(false)
  const {processes} = useProcessStream();
 const { 
    processingFilesData, 
    totalProcessingFiles, 
    fetchStatus 
  } = useProcessStreamFile();
  
const CREDITS =  import.meta.env.VITE_CREDITS || ((window as any)?.env?.CREDITS ?? true)

  const filterList = [
    { key_name: 'title', label: 'Title', inputtype: 'textbox' as const },
    { key_name: 'file_name', label: 'File Name', inputtype: 'textbox' as const },
    { key_name: 'type', label: 'Type', inputtype: 'multiselect' as const, rowData: [
      { value: 'file', label: 'File' },
      { value: 'web-link', label: 'Web Link' },
      { value: 'video', label: 'Video' },
      { value: 'stream', label: 'Stream' },
      { value: 'image', label: 'Image'},
      { value: 'text', label: 'Text'},
      {value: 'audio',label:'Audio'}

    ]},
    { key_name: 'status', label: 'Status', inputtype: 'multiselect' as const, rowData: [
      { value: 'done', label: 'Done' },
      { value: 'failed', label: 'Failed' },
      { value: 'processing', label: 'Processing' },
      { value: 'pending', label: 'Pending' }
    ]},
    { key_name: 'created', label: 'Created On', inputtype: 'date' as const },
    { key_name: 'added_type', label: 'Added Type', inputtype: 'multiselect' as const, rowData: [
    { value: 'user', label: 'User' },
    { value: 'periodic_sync', label: 'Periodic Sync' }
  ]}
  ];
  const {resetState} = usePeriodicSyncStore()
//   const fetchProcessingStatus = async () => {
//   try {
//     const payload = {
//       filter: [],
//       page: {
//         size: 1000,
//         page_number: 1,
//       },
//       sort: "desc",
//       sortby: "updated",
//     };

//     await requestStreamApi(
//       "POST",
//       `brain/knowledge-base-alerts/stream/${tenantID}/`,
//       payload,
//       "brainService",
//       (data) => {
//         setProcessingFilesData(data.data || []);
//         setTotalProcessingFiles(data.is_processing || 0);
//       }
//     );
//   } catch (error) {
//     console.error("Error fetching processing status:", error);
//   }
// };
// useEffect(() =>{
//   fetchProcessingStatus()
// },[])
  useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement; // 👈 Cast to HTMLElement
    if (target && !target.closest(".dropdown-container")) {
      setOpen(false);
    }
  };

  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);

// useEffect(() => {
//   const currentFilters = appliedFilters.length > 0 ? appliedFilters : storeFilters;
//   loadFiles(activeTab, 1, pageSize, currentFilters);
// }, [activeTab, appliedFilters, storeFilters]);
// useEffect(() => {
//   if (activeTab === 'streams' || activeTab ==='knowledge' || activeTab === 'learning-sets') return;
//   const filterToApply = activeTab === 'all' ? currentFilter : activeTab;
//   if (searchTerm === '') {

//     const currentFilters = appliedFilters.length > 0 ? appliedFilters : storeFilters;
//     loadFiles(activeTab, currentPage, pageSize, currentFilters);
//     return;
//   }
//   const timeoutId = setTimeout(() => {
//     const currentFilters = appliedFilters.length > 0 ? appliedFilters : storeFilters;
//     loadFiles(activeTab, currentPage, pageSize, currentFilters, searchTerm);
//   }, 1000); 

//   return () => clearTimeout(timeoutId);
// }, [searchTerm, activeTab, appliedFilters, storeFilters,currentFilter]);
useEffect(() => {
  if (lastActiveTab === 'streams' || lastActiveTab ==='knowledge' || lastActiveTab === 'learning-sets') return;
  const filterToApply = currentFilter

  if (searchTerm === '') {
    const filters = appliedFilters.length > 0 ? appliedFilters : storeFilters;
    loadFiles(filterToApply, currentPage, pageSize, filters);
    return;
  }
  const timeoutId = setTimeout(() => {
    const filters = appliedFilters.length > 0 ? appliedFilters : storeFilters;
    loadFiles(filterToApply, currentPage, pageSize, filters, searchTerm);
  }, 1000); 

  return () => clearTimeout(timeoutId);
}, [searchTerm, lastActiveTab, currentFilter, appliedFilters, storeFilters,appliedFilters ]); // Add currentFilter to dependencies

// Removed this problematic useEffect
// useEffect(() => {
//    if (lastActiveTab && lastActiveTab !== 'all') {
//      setLastActiveTab('all');
//      }
//   }, [lastActiveTab, setLastActiveTab]);

   const handleApplyFilters = (filters: any[]) => {
    setAppliedFilters(filters);
    setStoreFilters(filters);
    setShowAdvancedFilter(false);
    console.log('Applied filters:', filters);
  };
    const handleClearFilters = () => {
    setAppliedFilters([]);
    clearFilters();
  };
  const handleUpload = (files: File[]) => {
    console.log('Files uploaded:', files);
  };
const handleUploadStatusChange = (uploading: boolean, fileCount: number) => {
  setIsUploading(uploading);
  setUploadingFileCount(fileCount);
};
  const handleSourceAdd = (source: { type: string; url: string; title?: string }) => {
    console.log('Source added:', source);
  };
const handleRefreshDocumentGrid = () => {
   const filterToApply = lastActiveTab === 'all' ? currentFilter : lastActiveTab;
  loadFiles(filterToApply, currentPage, pageSize, appliedFilters.length > 0 ? appliedFilters : storeFilters, searchTerm);
}

const handleCreateLearningSet = () => {
  console.log("Create new learning set clicked!");
  // Add navigation or modal logic here
};

const handleViewLearningSetHistory = (id: string) => {
  console.log(`View history for learning set: ${id}`);
  // Add navigation or modal logic here
};
  const handleFilterTypeChange = (filterType: string) => {
    setCurrentFilter(filterType);
    setCurrentPage(1);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-b">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold">Brain</h1>
              {CREDITS && (
                <>
                 <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                 {credits.toLocaleString()} AI Credits
              </Badge>
              {/* <Button variant="ghost" className="text-white hover:bg-white/10 text-xs h-7 px-2">
                Why?
              </Button> */}
              <TooltipProvider  delayDuration={0}>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button 
        // variant="ghost" 
        className="text-white text-xs h-7 px-2 bg-transparent hover:bg-transparent"
      >
        Why?
      </Button>
    </TooltipTrigger>
    <TooltipContent side="right" className="max-w-xs text-sm bg-gray-700 border-none">
      <p className='text-white text-xs'>
        AI Credits are used when consuming Thunai LLM Tokens, Meeting Summarization, Voice Calling, etc.
      </p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
                </>
              )}
             
            </div>
            <a href="https://docs.thunai.ai/article/19-brain-setup-in-thunai" target="_blank" rel="noopener noreferrer">
  <Button
    size="sm"
    className="bg-white text-blue-600 hover:bg-blue-50 text-xs h-7"
  >
    Setup guide →
  </Button>
</a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-4">
         {/* {showAdvancedFilter && (
          <AdvancedFilter
            filterList={filterList}
            onClose={() => setShowAdvancedFilter(false)}
            onApplyFilters={handleApplyFilters}
            existingFilters={appliedFilters}
          />
        )} */}
         <div
  className={`
    fixed inset-y-0 right-0 z-50 
    w-full sm:w-[550px] 
    bg-white shadow-xl 
    transform transition-transform duration-300 ease-in-out 
    ${showAdvancedFilter ? 'translate-x-0' : 'translate-x-full'}
  `}
>

          {showAdvancedFilter && (
            <AdvancedFilter
              filterList={filterList}
              onClose={() => setShowAdvancedFilter(false)}
              onApplyFilters={handleApplyFilters}
              existingFilters={appliedFilters}
               currentTab={lastActiveTab} 
            />
          )}
        </div>

        {/* Backdrop */}
        {showAdvancedFilter && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowAdvancedFilter(false)}
          />
        )}
        {/* Upload Interface Modal */}
        {showUploadInterface && (
          <DetailedUploadInterface 
            onUpload={handleUpload}
            onSourceAdd={handleSourceAdd}
            onClose={() => {setShowUploadInterface(false)
              resetState()
            }}
                currentFilter={lastActiveTab} 
              onUploadStatusChange={handleUploadStatusChange}
          />
        )}
{/* Add Entities Modal */}
{showEntitiesModal && (
  <EntitiesModal onClose={() => setShowEntitiesModal(false)} />
)}
        {/* Recent Files Section */}
        <div className="h-full max-h-[calc(100vh-100px)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-2 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-semibold text-gray-900">Recent Files</h2>
              <div className="flex items-center space-x-3">
               
                 {isUploading && ( 
             <Button
               variant="outline" 
                    size="sm" 
                    className="p-4"
             >   
     <Upload className="w-5 h-5 text-blue-500 animate-pulse" />
      <span>{uploadingFileCount} </span>
    </Button> 
  )}
   {/* {processing > 0 && (
                  <Button
                    onClick={() => setShowProcessingSlider(true)}
                     variant="outline" 
                    size="sm" 
                    className="p-4"
                  >
                    <Loader2 className='animate-spin h-4 w-4'/>
                     {processing} files
                  </Button>
                )} */}
    {/* <ProcessingFilesSlider
          show={showProcessingSlider}
          onClose={() => setShowProcessingSlider(false)}
             processingFilesData={processingFilesData}
  totalProcessingFiles={totalProcessingFiles}
  isLoading={isLoadingProcessing}
  onRefresh={() => fetchStatus(tenantID)} 
        /> */}

                {/* <div className="relative ">

                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by Recent Files"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-44 sm:w-64 border-gray-300"
                  />
                </div> */}
                {/* <Button variant="outline" size="sm" className="border-gray-300">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button> */}
                {/* <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-300"
                  onClick={() => setShowAdvancedFilter(true)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                   <span className="hidden sm:inline">Filters</span>
                  {appliedFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {appliedFilters.length}
                    </Badge>
                  )}
                </Button>
 {(appliedFilters.length > 0 || storeFilters.length > 0) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearFilters}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Clear Filters
                  </Button>
                )} */}
                {/* <Button 
                  onClick={() => setShowUploadInterface(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Add</span>

                </Button> */}
                {/* Modified Add Button with Dropdown */}
                {canModifyKnowledgeBase && (
 <div className="relative dropdown-container">
      {/* Button */}
      <Button
        className="bg-blue-600 hover:bg-blue-700"
        onClick={() => setOpen(!open)}
      >
        <Plus className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Add</span>
      </Button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 transition-all duration-200 z-50">
          <button
            onClick={() => {
              setShowUploadInterface(true);
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </button>

          <button
            onClick={() => {
              setShowEntitiesModal(true);
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Entities
          </button>
        </div>
      )}
    </div>
                )}
              </div >
            </div >
          </div >
<div className="flex gap-3 pr-6">
          <div className={` ${showLiveConfig ? "w-2/3" : "w-full"} transition-all duration-300 pl-6 flex-1`}>
            {/* Enhanced Tabs */}
            <Tabs value={lastActiveTab}  onValueChange={(newTab) => { // Use lastActiveTab directly
  if (appliedFilters.length > 0 || storeFilters.length > 0) {
    handleClearFilters();
  }
  setLastActiveTab(newTab); // Update the store's lastActiveTab
  setKnowledgeGraphSubTab('explorer'); // Reset sub-tab to default when switching parent tabs
  setSearchTerm(''); // Clear search when switching tabs
  setCurrentPage(1);
}} className="w-full mb-16">
           
<TabsList className="sticky top-0 z-10 bg-background p-1 h-auto justify-start rounded-none border-b border-border w-full overflow-x-auto md:overflow-x-visible">
  <div className="flex space-x-0 min-w-max md:min-w-0 md:w-full md:justify-start">
    <TabsTrigger 
      value="all" 
      className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 md:px-4 py-3 font-medium text-muted-foreground hover:text-foreground whitespace-nowrap flex-shrink-0 text-xs md:text-sm"
    >
      <span className="sm:hidden">All</span>
      <span className="hidden sm:inline">All Content</span>
    </TabsTrigger>
    {/* <TabsTrigger 
      value="documents" 
      className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 md:px-4 py-3 font-medium text-muted-foreground hover:text-foreground whitespace-nowrap flex-shrink-0 text-xs md:text-sm"
    >
      <span className="sm:hidden">Docs</span>
      <span className="hidden sm:inline">Documents</span>
    </TabsTrigger>
    <TabsTrigger 
      value="links" 
      className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 md:px-4 py-3 font-medium text-muted-foreground hover:text-foreground whitespace-nowrap flex-shrink-0 text-xs md:text-sm"
    >
      Links
    </TabsTrigger>
    <TabsTrigger 
      value="videos" 
      className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 md:px-4 py-3 font-medium text-muted-foreground hover:text-foreground whitespace-nowrap flex-shrink-0 text-xs md:text-sm"
    >
      Videos
    </TabsTrigger> */}
    {canViewKnowledgeGraph && (
    <TabsTrigger 
      value="knowledge" 
      className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 md:px-4 py-3 font-medium text-muted-foreground hover:text-foreground whitespace-nowrap flex-shrink-0 text-xs md:text-sm"
    >
      <span className="sm:hidden">Graph</span>
      <span className="hidden sm:inline">Knowledge Graph</span>
    </TabsTrigger>
    )}
    {canViewLearningSets && (
    <TabsTrigger 
      value="learning-sets" 
      className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 md:px-4 py-3 font-medium text-muted-foreground hover:text-foreground whitespace-nowrap flex-shrink-0 text-xs md:text-sm"
    >
      <span className="sm:hidden">Sets</span>
      <span className="hidden sm:inline">Learning Sets</span>
    </TabsTrigger>
    )}
     {/* <TabsTrigger 
      value="streams" 
      className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 md:px-4 py-3 font-medium text-muted-foreground hover:text-foreground whitespace-nowrap flex-shrink-0 text-xs md:text-sm"
    >
      Streams
    </TabsTrigger> */}
    {canViewSafeMind && (
       <TabsTrigger 
      value="safe-mind" 
      className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 md:px-4 py-3 font-medium text-muted-foreground hover:text-foreground whitespace-nowrap flex-shrink-0 text-xs md:text-sm"
    >
      Safe Mind
    </TabsTrigger>
    )} 
    <div className="flex items-center justify-end w-full">
    <button
      onClick={(e) => {
        e.stopPropagation();
        setShowLiveConfig(!showLiveConfig);
      }}
  className={` py-3 border-b-2 ${
  showLiveConfig 
    ? 'border-blue-600 text-blue-600' 
    : 'border-transparent text-gray-500 hover:text-gray-700'
} flex items-center gap-2 text-sm font-medium`}
>
     <div className="flex items-center gap-2">
          <Activity className="text-blue-600" size={20} />
          <h2 className="font-semibold text-gray-900">Live Activity</h2>
           <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
          {processes.length}
        </span>
        </div>
    </button>
  </div>
  </div>
</TabsList>

              <TabsContent value="all">
                <DocumentGrid 
                  filter={currentFilter}
                  searchTerm={searchTerm}
                  viewMode={viewMode}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSearchTermChange={setSearchTerm} 
                   appliedFiltersCount={appliedFilters.length} // Pass count
 onToggleAdvancedFilter={() => setShowAdvancedFilter(true)} // Pass handler
  onClearFilters={handleClearFilters} // Pass handler
    onRefresh={handleRefreshDocumentGrid} // Pass handler
     onFilterTypeChange={handleFilterTypeChange} 
                />
              </TabsContent>
{/* 

              <TabsContent value="documents">
                <DocumentGrid 
                  filter="documents" 
                  searchTerm={searchTerm}
                  viewMode={viewMode}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                   onSearchTermChange={setSearchTerm} 
                   appliedFiltersCount={appliedFilters.length} // Pass count
 onToggleAdvancedFilter={() => setShowAdvancedFilter(true)} // Pass handler
  onClearFilters={handleClearFilters} // Pass handler
    onRefresh={handleRefreshDocumentGrid} // Pass handler
                />
              </TabsContent>

              <TabsContent value="links">
                <DocumentGrid 
                  filter="links" 
                  searchTerm={searchTerm}
                  viewMode={viewMode}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                   onSearchTermChange={setSearchTerm} 
                   appliedFiltersCount={appliedFilters.length} // Pass count
 onToggleAdvancedFilter={() => setShowAdvancedFilter(true)} // Pass handler
  onClearFilters={handleClearFilters} // Pass handler
    onRefresh={handleRefreshDocumentGrid} // Pass handler
                />
              </TabsContent>

              <TabsContent value="videos">
                <DocumentGrid 
                  filter="videos" 
                  searchTerm={searchTerm}
                  viewMode={viewMode}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                   onSearchTermChange={setSearchTerm} 
                   appliedFiltersCount={appliedFilters.length} // Pass count
 onToggleAdvancedFilter={() => setShowAdvancedFilter(true)} // Pass handler
  onClearFilters={handleClearFilters} // Pass handler
    onRefresh={handleRefreshDocumentGrid} // Pass handler
                />
              </TabsContent> */}

              <TabsContent value="streams">
                <StreamViewer />
              </TabsContent>

              {canViewKnowledgeGraph && (
              <TabsContent value="knowledge">
                <KnowledgeGraph 
                activeTabForGraph={lastActiveTab}
                 setLastActiveTab={setLastActiveTab}
                 processes = {processes}        
                 />  
                             
              </TabsContent>
              )}

              {canViewLearningSets && (
              <TabsContent value="learning-sets">
                <LearningSetsView 
                  onCreate={handleCreateLearningSet}
                  onViewHistory={handleViewLearningSetHistory}
                 setLastActiveTab={setLastActiveTab}   
                 processes = {processes}        

                />
              </TabsContent>
              )}
              {canViewSafeMind && (
                   <TabsContent value="safe-mind">
               <Safemind/>
              </TabsContent>
              )}
            </Tabs>

          </div>

  {showLiveConfig && (
    <div
      className="w-1/3 max-w-sm flex-shrink-0 flex flex-col transition-transform duration-500 py-3 "
      style={{ height: "calc(100vh - 160px)" }}
    >
      <ExplorerStream processes={processes}   onClose={() => setShowLiveConfig(false)} />
    </div>
  )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
