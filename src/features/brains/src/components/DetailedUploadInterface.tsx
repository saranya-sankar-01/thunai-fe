import { useState, useCallback,useEffect ,useMemo,useRef} from 'react';
import { useDropzone } from 'react-dropzone';
import "jsoneditor/dist/jsoneditor.css";
import JSONEditor from 'jsoneditor';
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import { Upload, FileText, Link2, Globe, Rss, Webhook, Clock, Database, Type, Copy, Info, X, ArrowRight, Trash, Search, ChevronDown, RefreshCcw, Code, MoreVertical, ChevronUp, Trash2, Folder } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getTenantId, requestApi, requestApiFromData } from '@/services/authService';
import { useKnowledgeBaseStore } from '@/store/knowledgeBaseStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import WorkInProgress from './shared-components/WorkInProgress';
import { Switch } from '@radix-ui/react-switch';
import { WebCrawl } from './shared-components/WebCrawl';
import { PeriodicSync } from './PeriodicSync';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ISTTime from './shared-components/ISTTime';
import { AgentPagination } from './shared-components/pagination';
import DeletePopup from './shared-components/DeletePopup';
import TooltipWrapper from './shared-components/TooltipWrapper';
import { DynamicPagination } from './shared-components/DynamicPagination';
import { usePeriodicSyncStore } from '@/store/usePeriodicSyncStore';
import { useNavigate } from 'react-router-dom';
import usePermissions from '@/hooks/usePermissions';

interface SourceConfigurationFieldsProps {
  name: string;
  setName: (name: string) => void;
  primaryKey: string;
  setPrimaryKey: (key: string) => void;
  schemaFields: string;
  setSchemaFields: (fields: string) => void;
  selectAction: string;
  setSelectAction: (action: string) => void;
  isWebhook?: boolean;
}

export const SourceConfigurationFields: React.FC<SourceConfigurationFieldsProps> = ({
  name,
  setName,
  primaryKey,
  setPrimaryKey,
  schemaFields,
  setSchemaFields,
  selectAction,
  setSelectAction,
  isWebhook = false,
}) => {
  const schemaFieldsLabel = isWebhook ? "Webhook Fields" : "Schema Fields";
  const primaryKeyTooltip = isWebhook
    ? "A primary key is used to retrieve specific webhook data in the chat."
    : "A primary key is used to retrieve specific streaming data in the chat.";
  const schemaFieldsTooltip = "Primary key is required in webhook_fields. Ensure it exists at the top level and is not nested within another object.";
  const selectActionTooltip = 'Choose "Append" to add new data to existing data, or "Overwrite" to replace existing data.';

  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<JSONEditor | null>(null);

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      editorRef.current = new JSONEditor(containerRef.current, {
        mode: 'code',
        mainMenuBar: false,
        navigationBar: false,
        statusBar: false,
        onChange: () => {
          try {
            const json = editorRef.current?.get();
            setSchemaFields(JSON.stringify(json, null, 2));
          } catch (e) {
            // Invalid JSON while typing
          }
        },
      });
      
      try {
        editorRef.current.set(JSON.parse(schemaFields || "{}"));
      } catch (e) {
        editorRef.current.set({});
      }
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  // Sync external changes (e.g. when editing an existing schema)
  useEffect(() => {
    if (editorRef.current) {
      try {
        const currentJson = JSON.stringify(editorRef.current.get(), null, 2);
        if (currentJson !== schemaFields) {
          editorRef.current.update(JSON.parse(schemaFields || "{}"));
        }
      } catch (e) {
        // Ignore parsing errors during sync
      }
    }
  }, [schemaFields]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`${isWebhook ? 'webhook' : 'streaming'}-name`}>
          <span className="relative after:content-['*'] after:text-red-500 after:ml-1">Name</span>
        </Label>
        <Input
          id={`${isWebhook ? 'webhook' : 'streaming'}-name`}
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor={`${isWebhook ? 'webhook' : 'streaming'}-primary-key`} className="flex items-center space-x-1">
          <span className="relative after:content-['*'] after:text-red-500 after:ml-1">Primary Key</span>
          <TooltipWrapper content={primaryKeyTooltip}>
            <Info className="w-3 h-3 text-gray-400 cursor-pointer" />
          </TooltipWrapper>
        </Label>
        <Input
          id={`${isWebhook ? 'webhook' : 'streaming'}-primary-key`}
          placeholder="Enter Primary Key"
          value={primaryKey}
          onChange={(e) => setPrimaryKey(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label
          htmlFor={`${isWebhook ? 'webhook' : 'streaming'}-schema-fields`}
          className="flex items-center space-x-1"
        >
          <span className="relative after:content-['*'] after:text-red-500 after:ml-1">{schemaFieldsLabel}</span>
          <TooltipWrapper content={schemaFieldsTooltip}>
            <Info className="w-3 h-3 text-gray-400 cursor-pointer" />
          </TooltipWrapper>
        </Label>
        <div className="mt-1 bg-white overflow-hidden p-3 rounded-lg">
          <div ref={containerRef} style={{ height: "300px" }} />
        </div>
      </div>
      <div>
        <Label htmlFor={`${isWebhook ? 'webhook' : 'streaming'}-select-action`} className="flex items-center space-x-1">
          <span className="relative after:content-['*'] after:text-red-500 after:ml-1">Select Action</span>
          <TooltipWrapper content={selectActionTooltip}>
            <Info className="w-3 h-3 text-gray-400 cursor-pointer" />
          </TooltipWrapper>
        </Label>
        <Select value={selectAction} onValueChange={setSelectAction}>
          <SelectTrigger className="mt-1 mb-4 ">
            <SelectValue placeholder="Select an action" />
          </SelectTrigger>
          <SelectContent className='bg-white'>
                <SelectItem value="append">Append</SelectItem>
                <SelectItem value="overwrite">Overwrite</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
interface DetailedUploadInterfaceProps {
  onUpload?: (files: File[]) => void;
  onSourceAdd?: (source: any) => void;
  onClose?: () => void;
   currentFilter?: string;
    onUploadStatusChange?: (isUploading: boolean, fileCount: number) => void;
}

export const DetailedUploadInterface = ({ onUploadStatusChange, onUpload, onSourceAdd, onClose ,currentFilter = 'all'}: DetailedUploadInterfaceProps) => {
  const tenant_ID =getTenantId()
  const { loadFiles } = useKnowledgeBaseStore();
  const { canViewModule, canModifyModule } = usePermissions();
  const canViewWebhook = canViewModule("knowledgebase");
  const canViewStreams = canViewModule("streams");
  const canModifyWebhook = canModifyModule("knowledgebase");
  const canModifyStreams = canModifyModule("streams");
  
  const [activeTab, setActiveTab] = useState('file');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [primaryKey, setPrimaryKey] = useState('');
  const [schemaFields, setSchemaFields] = useState(''); 
  const [sourceUrl, setSourceUrl] = useState('');
  const [webhookFields, setWebhookFields] = useState('');
  const [selectAction, setSelectAction] = useState('');
  const [scheduleType, setScheduleType] = useState('');
  const [frequency, setFrequency] = useState('');
  const [enableNotifications, setEnableNotifications] = useState(false);
const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
const [urls, setUrls] = useState<string[]>([]);
const [newUrl, setNewUrl] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [enableCrawl, setEnableCrawl] = useState(false);
const [selectedCrawlLevel, setSelectedCrawlLevel] = useState(1); 
ace.config.set('basePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.4.12/src-noconflict/');

 // Streaming specific states
  const [streamingSubTab, setStreamingSubTab] = useState('configure');
  const [recentSchemas, setRecentSchemas] = useState<any[]>([]);
  const [loadingSchemas, setLoadingSchemas] = useState(false);
  const [expandedSchemaId, setExpandedSchemaId] = useState<string | null>(null); // To show/hide producer code
  const [searchSchemaQuery, setSearchSchemaQuery] = useState('');
const [schemaDiscoveryData, setSchemaDiscoveryData] = useState({
  api_key: '',
  api_secret: '',
  bootstrap_server: '',
  kafka_topic: ''
});
const [selectedProducerCodeLanguage, setSelectedProducerCodeLanguage] = useState('python'); // Default to Python
const [editingSchemaId, setEditingSchemaId] = useState<string | null>(null); // Add this line
 const [selectedSchemaIds, setSelectedSchemaIds] = useState<string[]>([]);
  const [deletingSchemas, setDeletingSchemas] = useState<{ id: string; name: string }[] | null>(null);
  const [isDeletingSchemas, setIsDeletingSchemas] = useState(false);
const [kafkaEnabled,setKafkaEnabled] = useState(false)
  const kafkaFetchRef = useRef(false); 

  const [webhookSubTab, setWebhookSubTab] = useState('configure');
  const [webhookData, setWebhookData] = useState<any[]>([]);
  const [loadingWebhooks, setLoadingWebhooks] = useState(false);
  const [webhookSearchQuery, setWebhookSearchQuery] = useState('');
  const [webhookCurrentPage, setWebhookCurrentPage] = useState(1); // For webhooks
  const [webhookTotalPages, setWebhookTotalPages] = useState(1); // For webhooks
  const [selectedWebhookIds, setSelectedWebhookIds] = useState<string[]>([]);
  const [deletingWebhooks, setDeletingWebhooks] = useState<{ id: string; name: string }[] | null>(null);
  const [isDeletingWebhooks, setIsDeletingWebhooks] = useState(false);
  const [editingWebhookId, setEditingWebhookId] = useState<string | null>(null); 
const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || window['env']['API_ENDPOINT'];

const navigate = useNavigate()
  const {resetState} = usePeriodicSyncStore()
  useEffect(()=>{
resetState()
  },[activeTab])

  const resetFormFields = useCallback(() => {
    setName('');
    setDescription('');
    setPrimaryKey('');
    setSchemaFields('');
    setWebhookFields('');
    setSelectAction('');
    setWebhookSearchQuery('')
    setSearchSchemaQuery('')
  }, []); 

 
  useEffect(() => {
    resetFormFields();
    // Set default subtab based on permissions
    if (activeTab === 'webhook') {
      setWebhookSubTab(canModifyWebhook ? 'configure' : 'recent-webhook');
    } else if (activeTab === 'streaming') {
      setStreamingSubTab(canModifyStreams ? 'configure' : 'recent-schema');
    } else {
      setStreamingSubTab('configure');
      setWebhookSubTab('configure');
    }
    setEditingSchemaId(null);
    setEditingWebhookId(null);
  }, [activeTab, canModifyWebhook, canModifyStreams]);

 
  useEffect(() => {
    // if (activeTab === 'streaming') {
      resetFormFields();
      setEditingSchemaId(null); 
    // }
  }, [ activeTab, resetFormFields]);

  // Effect to clear form fields and editing state when webhookSubTab changes
  useEffect(() => {
    // if (activeTab === 'webhook') {
      resetFormFields();
      setEditingWebhookId(null); 
    // }
  }, [ activeTab, resetFormFields]);

  const onDrop = (acceptedFiles: File[]) => {
  setDroppedFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
};
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
     accept: {
    // Documents
    'text/plain': ['.txt'],
    'text/csv': ['.csv'],
    'text/markdown': ['.md'],
    'application/json': ['.json'],
    'text/xml': ['.xml'],
    'application/xml': ['.xml'],
    'text/yaml': ['.yaml', '.yml'],
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    
    // Video
    'video/mp4': ['.mp4'],
    'video/x-msvideo': ['.avi'],
    'video/quicktime': ['.mov'],
    'video/x-ms-wmv': ['.wmv'],
    'video/webm': ['.webm'],
    'video/x-matroska': ['.mkv'],
    
    // Audio
    'audio/mpeg': ['.mp3'],
    'audio/wav': ['.wav'],
    'audio/ogg': ['.ogg'],
    'audio/flac': ['.flac'],
    'audio/aac': ['.aac'],
    'audio/x-m4a': ['.m4a'],
    'audio/aiff': ['.aiff', '.aif'],
    
    // Images
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'image/bmp': ['.bmp'],
  },
    multiple: true,
  });
  const removeFile = (fileName: string) => {
  setDroppedFiles(prevFiles => prevFiles.filter(f => f.name !== fileName));
};

const handleUpload = useCallback(async (acceptedFiles?: File[]) => {
  
    let countToReport = 0;
    if (activeTab === 'file') {
      countToReport = (acceptedFiles || droppedFiles).length;
    } else if (activeTab === 'url') {
      countToReport = urls.filter(url => url.trim() !== '').length > 0 ? 1 : 0;
    } else if (activeTab === 'text') {
      countToReport = sourceUrl.trim() !== '' ? 1 : 0;
    }
     if (onUploadStatusChange && countToReport > 0) {
      onUploadStatusChange(true, countToReport);
    }

 setIsLoading(true);
  setUploadProgress(0);
            onClose?.();

  try {
    const formData = new FormData();

    formData.append("tenant_id", `${tenant_ID}`);
    formData.append("platform","web")
    
    // if (name) formData.append("title", name);
    // formData.append("primary_key", primaryKey);
    if (description) formData.append("ai_instructions", description);

    // Tab-specific data
    if (activeTab === "file" && acceptedFiles?.length) {
      acceptedFiles.forEach((file) => formData.append("files", file));
    } else if (activeTab === "url") {
      if (enableCrawl) {
        formData.append("crawl", "true"); 
        formData.append("crawl_level", selectedCrawlLevel.toString());
      }
    const validUrls = urls.filter(url => url.trim() !== '');
      formData.append("links", JSON.stringify(validUrls));
    }
    else if (activeTab === "text") {
      formData.append("text_data", sourceUrl);
    }

    // Send request
    const response = await requestApiFromData(
      "POST",
      `brain/knowledge-base/${tenant_ID}/`,
      formData,
      "brainService"
    );
  toast.success(response?.message || "Source uploaded and configured successfully!");
  if (response?.data?.existing_document_ids?.length > 0) {
  const existingId = response.data.existing_document_ids[0];
  navigate(`/brain/view/${existingId}`);
  return; 
}
                 const { appliedFilters } = useKnowledgeBaseStore.getState();
      await loadFiles(currentFilter, 1, 10, appliedFilters);
    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(async() => {
            setUploadProgress(null);
          
            onClose?.();
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    console.log("Upload response:", response);
    onUpload?.(acceptedFiles || []);
  } catch (error: any) {
    console.error("Upload error:", error);
    setUploadProgress(null);
    const message = error?.response?.data?.message || error?.response?.message || "Upload failed. Please try again."
    toast.error(message);
  //   if (message.includes("Content already exists") && message.includes("content_id")){
  //       const contentId = message.split("content_id=")[1];
  // navigate(`/view/${contentId}`);
  //   }
  }
  finally{
     setIsLoading(false);
      setUploadProgress(null);
      if (onUploadStatusChange) {
        onUploadStatusChange(false, 0); 
      }
  }
}, [activeTab, sourceUrl, name, primaryKey, description,urls, onUpload, onClose]);
  const getProgressWidth = () => {
    if (selectedCrawlLevel === 1) return '0%';
    if (selectedCrawlLevel === 2) return '42.5%';
    return '85%'; 
  };

 const handleSourceSubmit = async () => {
  if (activeTab === "streaming" && streamingSubTab === "configure") {
    if (!name.trim() || !primaryKey.trim() || !schemaFields.trim() || !selectAction.trim()) {
      toast.error(
        "Please fill in all required fields: Name, Primary Key, Schema Fields, and Select Action."
      );
      return;
    }

    setIsLoading(true);
    try {
      let parsedSchemaFields = {};
      try {
        parsedSchemaFields = JSON.parse(schemaFields);
      } catch (e) {
        toast.error("Schema Fields must be valid JSON.");
        setIsLoading(false);
        return;
      }

      const payload: any = {
        name,
        description,
        unique_key: primaryKey,
        operation: selectAction,
        schema_fields: parsedSchemaFields,
      };


      if (!tenant_ID) {
        toast.error("Tenant ID not found. Cannot save configuration.");
        setIsLoading(false);
        return;
      }

      let httpMethod: "POST" | "PATCH";
      let apiPath: string;

      if (editingSchemaId) {
        httpMethod = "PATCH";
        apiPath = `${tenant_ID}/kafka/knowledgebase/${editingSchemaId}/`;
      } else {
        httpMethod = "POST";
        apiPath = `${tenant_ID}/kafka/knowledgebase/`;
      }

      // ✅ Await API and capture the response
      const response = await requestApi(httpMethod, apiPath, payload, "webhookService");

      // ✅ Show success message from API (fallback if not provided)
      const successMsg =
        response?.data?.message ||
        response?.message ||
        `Streaming configuration ${editingSchemaId ? "updated" : "saved"} successfully!`;
      toast.success(successMsg);

      // ✅ Clear only after success
      setEditingSchemaId(null);
      setName("");
      setDescription("");
      setPrimaryKey("");
      setSchemaFields("");
      setSelectAction("");

      // Refresh list and stay in configure tab
      fetchRecentSchemas();
      setStreamingSubTab("recent-schema");
    } catch (error: any) {
      console.error("Save configuration error:", error);
      toast.error(
        error?.response?.data?.message || error?.response?.message || 
          `Failed to ${editingSchemaId ? "update" : "save"} configuration. Please try again.`
      );
      // Keep form data intact on error
    } finally {
      setIsLoading(false);
    }
  } 
else if (activeTab === "webhook" && webhookSubTab === "configure") {
    if (!name.trim() || !primaryKey.trim() || !webhookFields.trim() || !selectAction.trim()) {
      toast.error("Please fill in required fields: Name, Primary Key, Webhook Fields, and Select Action for Webhook.");
      return;
    }

    setIsLoading(true);
    try {
      let parsedWebhookFields = {};
      try {
        parsedWebhookFields = JSON.parse(webhookFields);
      } catch (e) {
        toast.error("Webhook Fields must be valid JSON.");
        setIsLoading(false);
        return;
      }

      const payload = {
        name,
        description,
        unique_key: primaryKey,
        operation: selectAction,
        webhook_fields: parsedWebhookFields,
      };

      if (!tenant_ID) {
        toast.error("Tenant ID not found. Cannot save webhook configuration.");
        setIsLoading(false);
        return;
      }

      let httpMethod: "POST" | "PATCH";
      let apiPath: string;
      let service;

      if (editingWebhookId) {
        httpMethod = "PATCH";
        apiPath = `${tenant_ID}/knowledgebase/webhook/${editingWebhookId}/`;
        service ='webhookService'
      } else {
        httpMethod = "POST";
        apiPath = `${tenant_ID}/knowledgebase/webhook/`,
          service ='webhookService'
      }

      const response = await requestApi(httpMethod, apiPath, payload, service);

      toast.success(
        response?.data?.message || response?.message || "Webhook configuration saved successfully!"
      );
      
      setEditingWebhookId(null);
      setName("");
      setDescription("");
      setPrimaryKey("");
      setWebhookFields("");
      setSelectAction("");

      fetchWebhooks(); // Refresh webhook list
      setWebhookSubTab("recent-webhook"); // Switch to recent webhooks tab
    } catch (error: any) {
      console.error("Save webhook configuration error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to save webhook configuration. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  } else {
    console.warn("handleSourceSubmit called for an unexpected activeTab:", activeTab);
    toast.error("Invalid save operation.");
  }
};


  const copyWebhookUrl = () => {
    const webhookUrl = `https://api.thunai.com/webhooks/${primaryKey || 'your-key'}`;
    navigator.clipboard.writeText(webhookUrl);
    toast.success("Webhook URL copied to clipboard!");
  };
  
const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    fetchRecentSchemas(pageNumber);
  };
 const handleWebhookPageChange = (pageNumber: number) => { // For webhooks
    setWebhookCurrentPage(pageNumber);
    fetchWebhooks(pageNumber);
  };

  const fetckKafka = async ()=>{
    const response = await requestApi("GET",`enable/kafka/streaming/brain/`,null,'authService')
    const result= response.data
    setKafkaEnabled(result.enable)
    console.log(result.enable)
  }
  useEffect(() => {
    if (!kafkaFetchRef.current) {
      fetckKafka();
      kafkaFetchRef.current = true; // Mark the effect as run
    }
  }, []);
   const fetchRecentSchemas = useCallback(async (pageNumber: number = 1) => {
    setLoadingSchemas(true);
    try {
      const payload = {
        "page": {
          "size": 10,
          "page_number": 1
        },
        "sort": "desc",
        "sortby": "created",
             "filter": [] as { key_name: string; key_value: string; operator: string }[]
       };

      if (searchSchemaQuery.trim() !== '') { // Only add filter if search query is not empty
        payload.filter.push({
          "key_name": "name", // Assuming search is by schema name
          "key_value": searchSchemaQuery.trim(),
          "operator": "like"
        });
      }
      const response = await requestApi(
        "POST",
        `${tenant_ID}/filter/kafka/knowledgebase/`,
        payload,
        "authService" // Assuming 'thunaiApi' is the service name for the provided API endpoint
      );
      if (response.data ) {
        setRecentSchemas(response.data.data);
         setSchemaDiscoveryData({
        api_key: response.data?.api_key || '',
        api_secret: response.data?.api_secret || '',
        bootstrap_server: response.data?.bootstrap_server || '',
        kafka_topic: response.data?.kafka_topic || ''
      });
                const totalItems = response.data?.total || 0;
          setTotalPages(Math.ceil(totalItems / itemsPerPage)); // Calculate total pages
          setCurrentPage(pageNumber); 
      }
    } catch (error) {
      console.error("Failed to fetch recent schemas:", error);
        toast.error(
        error?.response?.data?.message || error?.response?.message ||
          `Failed to fetch. Please try again.`
      );
    } finally {
      setLoadingSchemas(false);
    }
  }, [searchSchemaQuery]);
useEffect(() => {
  if (activeTab !== "streaming") return;

  // when search is empty → instant fetch
  if (searchSchemaQuery.trim() === "") {
    fetchRecentSchemas(currentPage);
  }
}, [activeTab, currentPage, searchSchemaQuery]);
useEffect(() => {
  if (activeTab !== "streaming") return;
  if (searchSchemaQuery.trim() === "") return;

  const handler = setTimeout(() => {
    fetchRecentSchemas(1);
    setCurrentPage(1);
  }, 1000);

  return () => clearTimeout(handler);
}, [searchSchemaQuery]);

  const fetchWebhooks = useCallback(async (pageNumber: number = 1) => {
    setLoadingWebhooks(true);
    try {
      const payload = {
        "page": {
          "size": itemsPerPage,
          "page_number": pageNumber
        },
        "sort": "desc",
        "sortby": "created",
        "filter": [] as { key_name: string; key_value: string; operator: string }[]
      };

      if (webhookSearchQuery.trim() !== '') { 
        payload.filter.push({
          "key_name": "name", 
          "key_value": webhookSearchQuery.trim(),
          "operator": "like"
        });
      }

      const res = await requestApi("POST",`${tenant_ID}/filter/knowledgebase/webhook/`, payload,"authService");
      if (res.data ) {
        setWebhookData(res.data.data);
        const totalItems = res.data.total || 0;
        setWebhookTotalPages(Math.ceil(totalItems / itemsPerPage));
        setWebhookCurrentPage(pageNumber);
      }
    } catch (error: any) {
      console.error("Failed to fetch webhooks:", error);
      toast.error(
        error?.response?.data?.message || error?.response?.message || `Failed to fetch webhooks. Please try again.`
      );
    } finally {
      setLoadingWebhooks(false);
    }
  }, [webhookSearchQuery]);
useEffect(() => {
  if (activeTab !== "webhook") return;

  // run when search is empty (initial load OR cleared search)
  if (webhookSearchQuery.trim() === "") {
    fetchWebhooks(webhookCurrentPage);
  }
}, [activeTab, webhookCurrentPage, webhookSearchQuery]);
useEffect(() => {
  if (activeTab !== "webhook") return;
  if (webhookSearchQuery.trim() === "") return;

  const handler = setTimeout(() => {
    fetchWebhooks(1);
    setWebhookCurrentPage(1);
  }, 1000);

  return () => clearTimeout(handler);
}, [webhookSearchQuery]);

  const copyProducerCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Producer code copied to clipboard!");
  };
   const handleSchemaDiscoveryCopy = (label: string, value: string) => {
    if (!value) return toast.warning(`No ${label} to copy.`);
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied!`);
  };

 const handleEditSchema = (schema: any) => {
  setName(schema.name || '');
  setDescription(schema.description || '');
  setPrimaryKey(schema.unique_key || '');

  try {
    const excludedKeys = ['tenant_id', 'streaming_id', 'user_id'];

    if (schema.schema_fields && typeof schema.schema_fields === 'object') {
      // Filter out excluded keys
      const filteredFields = Object.keys(schema.schema_fields)
        .filter((key) => !excludedKeys.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = schema.schema_fields[key];
          return obj;
        }, {});

      // Stringify and set filtered schema fields
      setSchemaFields(JSON.stringify(filteredFields, null, 2));
    } else {
      setSchemaFields('{}');
    }
  } catch (e) {
    console.error('Error parsing schema_fields for editing:', e);
    setSchemaFields('{}');
  }

  setSelectAction(schema.operation || '');
  setEditingSchemaId(schema.id);
  setStreamingSubTab('configure');
};



  const schemaDiscovery = (label: string, key: keyof typeof schemaDiscoveryData) => (
    <div key={key}>
      <Label className="text-xs text-gray-500">{label}</Label>
      <div className="flex items-center space-x-2 mt-1">
        <Input value={schemaDiscoveryData[key]} readOnly className="text-sm" />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleSchemaDiscoveryCopy(label, schemaDiscoveryData[key])}
        >
          <Copy className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

const handleEditWebhook = (webhook: any) => {
  setName(webhook.name || '');
  setDescription(webhook.description || '');
  setPrimaryKey(webhook.unique_key || '');

  try {
    const excludedKeys = ['tenant_id', 'streaming_id', 'user_id'];

    if (webhook.webhook_fields && typeof webhook.webhook_fields === 'object') {
      // Filter out unwanted keys
      const filteredFields = Object.keys(webhook.webhook_fields)
        .filter((key) => !excludedKeys.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = webhook.webhook_fields[key];
          return obj;
        }, {});

      // Stringify filtered object for editor
      setWebhookFields(JSON.stringify(filteredFields, null, 2));
    } else {
      setWebhookFields('{}');
    }
  } catch (e) {
    console.error('Error parsing webhook_fields for editing:', e);
    setWebhookFields('{}');
  }

  setSelectAction(webhook.operation || '');
  setEditingWebhookId(webhook.id);
  setWebhookSubTab('configure');
};

  const handleToggleSchema = (schemaId: string) => {
    setSelectedSchemaIds((prev) =>
      prev.includes(schemaId)
        ? prev.filter((id) => id !== schemaId)
        : [...prev, schemaId]
    );
  };

  const allSchemasSelected = useMemo(() => {
    if (recentSchemas.length === 0) return false;
    return recentSchemas.every((schema) => selectedSchemaIds.includes(schema.id));
  }, [recentSchemas, selectedSchemaIds]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = recentSchemas.map((schema) => schema.id);
      setSelectedSchemaIds(allIds);
    } else {
      setSelectedSchemaIds([]);
    }
  };
 const handleToggleWebhook = (webhookId: string) => { // For webhooks
    setSelectedWebhookIds((prev) =>
      prev.includes(webhookId)
        ? prev.filter((id) => id !== webhookId)
        : [...prev, webhookId]
    );
  };

  const allWebhooksSelected = useMemo(() => { // For webhooks
    if (webhookData.length === 0) return false;
    return webhookData.every((webhook) => selectedWebhookIds.includes(webhook.id));
  }, [webhookData, selectedWebhookIds]);
  const handleSelectAllWebhooks = (checked: boolean) => { // For webhooks
    if (checked) {
      const allIds = webhookData.map((webhook) => webhook.id);
      setSelectedWebhookIds(allIds);
    } else {
      setSelectedWebhookIds([]);
    }
  };
  
  const handleDeleteSelectedWebhooks = async (webhooksToDelete: { id: string; name: string }[]) => { // For webhooks
    setIsDeletingWebhooks(true);
    try {
      if (!tenant_ID) {
        toast.error("Tenant ID not found. Cannot delete webhooks.");
        return;
      }

      const idsToDelete = webhooksToDelete.map(s => s.id);

      await requestApi(
        "DELETE",
        `${tenant_ID}/knowledgebase/webhook/`, 
        { ids: idsToDelete }, 
        "webhookService"
      );

      toast.success("Selected webhooks deleted successfully!");
      setDeletingWebhooks(null); 
      setSelectedWebhookIds([]); 
      fetchWebhooks(webhookCurrentPage); 
    } catch (error: any) {
      console.error("Error deleting webhooks:", error);
      toast.error(error?.response?.data?.message || error?.response?.message || "Failed to delete webhooks. Please try again.");
    } finally {
      setIsDeletingWebhooks(false);
    }
  };
   const handleIndividualDeleteWebhook = (webhook: any) => { 
    setDeletingWebhooks([{ id: webhook.id, name: webhook.name }]); 
  };

  const handleDeleteSelectedSchemas = async (schemasToDelete: { id: string; name: string }[]) => {
    setIsDeletingSchemas(true);
    try {
      if (!tenant_ID) {
        toast.error("Tenant ID not found. Cannot delete schemas.");
        return;
      }

      const idsToDelete = schemasToDelete.map(s => s.id);
      await requestApi(
        "DELETE",
        `${tenant_ID}/kafka/knowledgebase/`, // API endpoint for bulk deletion
        { ids: idsToDelete }, // Payload as specified
        "webhookService"
      );

      toast.success("Selected schemas deleted successfully!");
      setDeletingSchemas(null);
      setSelectedSchemaIds([]); // Clear selections
      fetchRecentSchemas(currentPage); // Refresh the schema list
    } catch (error: any) {
      console.error("Error deleting schemas:", error);
      toast.error(error?.response?.data?.message || error?.response?.message || "Failed to delete schemas. Please try again.");
    } finally {
      setIsDeletingSchemas(false);
    }
  };

  const handleIndividualDelete = (schema: any) => {
    setDeletingSchemas([{ id: schema.id, name: schema.name }]); // Set for individual delete confirmation
  };

const tabCount =
  4 + (canViewWebhook ? 1 : 0) + (canViewStreams ? 1 : 0);
const gridColsMap = {
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

const gridClass = gridColsMap[tabCount];

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="max-w-6xl w-full h-[90vh] bg-white rounded-lg shadow-xl flex ">
        {/* Left Panel - Configuration */}
        <div    className={`w-2/3 p-6 flex flex-col h-full ${
    (activeTab === "streaming" && streamingSubTab === "recent-schema") ||
    (activeTab === "webhook" && webhookSubTab === "recent-webhook") || (activeTab === "periodic")
      ? "pb-0"
      : ""
  }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Configure Data Source</h2>
              <p className="text-gray-600 mt-1">Set up your knowledge source with detailed configuration</p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
 <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
       <TabsList className={`grid w-full ${gridClass} mb-6`}>
              <TabsTrigger value="file" className="flex items-center space-x-1">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">File Upload</span>
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center space-x-1">
                <Link2 className="w-4 h-4" />
                <span className="hidden sm:inline">URL</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center space-x-1">
                <Type className="w-4 h-4" />
                <span className="hidden sm:inline">Text</span>
              </TabsTrigger>
              <TabsTrigger value="periodic" className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Periodic</span>
              </TabsTrigger>
              {canViewWebhook && (
              <TabsTrigger value="webhook" className="flex items-center space-x-1">
                <Webhook className="w-4 h-4" />
                <span className="hidden sm:inline">Webhook</span>
              </TabsTrigger>
              )}
              {canViewStreams && (
              <TabsTrigger value="streaming" className="flex items-center space-x-1">
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">Streaming</span>
              </TabsTrigger>
              )}
            </TabsList>

            {/* File Upload Tab */}
            <TabsContent value="file" className="space-y-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                
                {uploadProgress !== null ? (
                  <div className="space-y-2">
                    <p className="text-blue-600 font-medium">Uploading... {uploadProgress}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-lg font-medium mb-2">
                      {isDragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
                    </p>
                      <p className="text-gray-500 text-sm">Maximum file size: 100MB</p>
                   
                    <div className="flex items-center justify-center space-x-2 mb-4">
                    
                    <p className="text-gray-500 text-sm">
                      Supported formats
                    </p>
                    <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-default" />
      </TooltipTrigger>
      <TooltipContent className="max-w-md  bg-black">
        <div className="">
          <div>
            <span className="text-[12px] font-semibold text-blue-600">Documents: </span>
            <span className="text-[12px] font-thin text-white">txt, csv, md, json, xml, yaml, yml, pdf, docx, pptx, xlsx</span>
          </div>
          <div>
            <span className="text-[12px] font-semibold text-blue-600 ">Video: </span>
            <span className="text-[12px] font-thin text-white">mp4, mkv, avi, mov, wmv, webm</span>
          </div>
          <div>
            <span className="text-[12px] font-semibold text-blue-600">Audio: </span>
            <span className="text-[12px] font-thin text-white">mp3, wav, ogg, flac, aac, m4a, aiff, aif</span>
          </div>
          <div>
            <span className="text-[12px] font-semibold text-blue-600 ">Images: </span>
            <span className="text-[12px] font-thin text-white">jpg, jpeg, png, gif, webp, bmp</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
  </div>
                  </>
                )}
              </div>
              {droppedFiles.length > 0 && (
  <div className="mt-4 space-y-2">
    <h4 className="font-medium text-gray-700">Ready to upload: {droppedFiles.length} files</h4>
    <ul className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50">
      {droppedFiles.map(file => (
        <li key={file.name} className="flex justify-between items-center bg-white rounded px-2 py-1 shadow-sm">
          <span className="truncate">{file.name}</span>
          <Button size="icon" variant="ghost" onClick={() => removeFile(file.name)}>
            <X className="w-4 h-4 text-red-500" />
          </Button>
        </li>
      ))}
    </ul>
  </div>
)}

            </TabsContent>

     <TabsContent value="url" className="space-y-6">
 <WebCrawl
   enableCrawl = {enableCrawl}
                setEnableCrawl={setEnableCrawl}
                setSelectedCrawlLevel={setSelectedCrawlLevel}
                selectedCrawlLevel={selectedCrawlLevel}
 />


  <div className="space-y-4">
    {/* URL Input Field */}
    <Label htmlFor="url-input">Website URL *</Label>
    <div className="flex items-center space-x-2">
      <Input
        id="url-input"
        placeholder="Enter URL"
        value={newUrl}
        onChange={(e) => setNewUrl(e.target.value)}
        className="flex-1"
      />
      <Button
        type="button"
        onClick={() => {
    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl) return; // ignore empty
    try {
      new URL(trimmedUrl); 
      setUrls([...urls, trimmedUrl]);
      setNewUrl(""); 
    } catch {
      toast.error("Please enter a valid URL");
    }
  }}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>

    {/* Added URLs Section */}
    {urls.length > 0 && (
      <div className="space-y-2">
        <Label className="font-medium">Added URLs:</Label>
        {urls.map((url, index) => (
          <div
            key={index}
            className="flex items-center justify-between border rounded-md px-3  bg-gray-50"
          >
            <span className="text-sm truncate">{url}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                setUrls(urls.filter((_, i) => i !== index))
              }
            >
              <Trash className="w-4 h-4 text-gray-600 hover:text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    )}

    {/* Crawl Subpages Checkbox */}
    {/* <div className="flex items-center space-x-2">
      <Checkbox
        id="crawl-subpages"
        checked={enableNotifications}
        onCheckedChange={(checked) => setEnableNotifications(!!checked)}
      />
      <Label htmlFor="crawl-subpages" className="text-sm">
        Crawl subpages automatically
      </Label>
    </div> */}
  </div>
</TabsContent>


            {/* Text Tab */}
            <TabsContent value="text" className="space-y-6">
              <div>
                <Label htmlFor="text-content">Text Content *</Label>
                <Textarea
                  id="text-content"
                  placeholder="Paste your text content here..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  rows={8}
                  className="mt-1"
                />
              </div>
            </TabsContent>

            {/* Periodic Tab */}
            <TabsContent value="periodic" className="space-y-6">
                <PeriodicSync/>
              {/* <WorkInProgress height='50vh'/> */}

            </TabsContent>

            {/* Webhook Tab */}
           {canViewWebhook && (
           <TabsContent value="webhook" className="space-y-6 flex flex-col h-full">
              <Tabs value={webhookSubTab} onValueChange={setWebhookSubTab} className="w-full">
                    <TabsList className={`grid w-full ${canModifyWebhook ? 'grid-cols-2' : 'grid-cols-1'} mb-6`}>
                      {canModifyWebhook && (
                      <TabsTrigger value="configure" className="flex items-center space-x-1">
                        <Database className="w-4 h-4" />
                        <span className="hidden sm:inline">Configure</span>
                      </TabsTrigger>
                      )}
                      <TabsTrigger value="recent-webhook" className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span className="hidden sm:inline">Recent Webhooks ({webhookData.length})</span>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="configure" className="space-y-6 flex-1 overflow-y-auto">
                      <SourceConfigurationFields
                        name={name}
                        setName={setName}
                        primaryKey={primaryKey}
                        setPrimaryKey={setPrimaryKey}
                        schemaFields={webhookFields} 
                        setSchemaFields={setWebhookFields} 
                        selectAction={selectAction}
                        setSelectAction={setSelectAction}
                        isWebhook={true}
                      />
                    </TabsContent>
                    <TabsContent
                      value="recent-webhook"
                      className="flex flex-col h-full relative transform translateZ(0) z-[1]"
                    >
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="Search Webhook by name.."
                            className="pl-8"
                            value={webhookSearchQuery}
                            onChange={(e) => setWebhookSearchQuery(e.target.value)}
                          />
                        </div>

                        {canModifyWebhook && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="select-all-webhooks"
                            checked={allWebhooksSelected}
                            onCheckedChange={handleSelectAllWebhooks}
                            disabled={loadingWebhooks || webhookData.length === 0}
                          />
                          <Label htmlFor="select-all-webhooks">Select All</Label>
                        </div>
                        )}

                        {canModifyWebhook && selectedWebhookIds.length > 0 && (
                          <Button
                            variant="destructive"
                            onClick={() => {
                              const webhooksToDelete = webhookData
                                .filter((webhook) => selectedWebhookIds.includes(webhook.id))
                                .map((s) => ({ id: s.id, name: s.name }));
                              setDeletingWebhooks(webhooksToDelete);
                            }}
                            disabled={isDeletingWebhooks || loadingWebhooks}
                          >
                            <Trash2 className="w-4 h-4" /> ({selectedWebhookIds.length})
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => fetchWebhooks(webhookCurrentPage)}
                          disabled={loadingWebhooks}
                        >
                          <RefreshCcw className={`w-4 h-4 ${loadingWebhooks ? "animate-spin" : ""}`} />
                        </Button>
                      </div>

                      <div className="flex-1 overflow-y-auto  space-y-4 min-h-[calc(100vh-312px)]">
                        {loadingWebhooks ? (
                          <div className="text-center text-gray-500 py-8 flex items-center justify-center">Loading Webhooks...</div>
                        ) : webhookData.length === 0 ? (
                          <div className="text-center text-gray-500 py-8">
                            {webhookSearchQuery.trim() !== ''
                              ? "No results found for your search."
                              : "No webhooks available. Start by configuring a new webhook source."}
                          </div>
                        ) : (
                          <div className="space-y-4 w-full">
                            {webhookData.map((webhook) => (
                              <Card key={webhook.id} className="shadow-sm overflow-x-auto">
                                <CardHeader className="flex flex-row items-center justify-between p-4 pb-0 pt-2">
                                  <div className="flex items-center space-x-2 py-2">
                                    {canModifyWebhook && (
                                    <Checkbox
                                      id={`webhook-${webhook.id}`}
                                      checked={selectedWebhookIds.includes(webhook.id)}
                                      onCheckedChange={() => handleToggleWebhook(webhook.id)}
                                    />
                                    )}
                                    <Label
                                      htmlFor={`webhook-${webhook.id}`}
                                      className="font-semibold text-gray-900"
                                    >
                                      {webhook.name}
                                    </Label>
                                    <Badge variant="secondary">{webhook.operation}</Badge>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                      {canModifyWebhook && (
                                    <Button
                                      variant="ghost"
                                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                                      onClick={() =>
                                        setExpandedSchemaId( 
                                          expandedSchemaId === webhook.id ? null : webhook.id
                                        )
                                      }
                                    >
                                      <span>Show Curl</span>
                                      {expandedSchemaId === webhook.id ? (
                                        <ChevronUp className="w-4 h-4" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4" />
                                      )}
                                    </Button>
                                      )}
                                    <DropdownMenu>
                                      {canModifyWebhook && (
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <span className="sr-only">Open menu</span>
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      )}
                                      <DropdownMenuContent align="end" className="bg-white">
                                        <DropdownMenuItem onSelect={() => handleEditWebhook(webhook)}>
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="text-red-600"
                                          onSelect={() => handleIndividualDeleteWebhook(webhook)}
                                        >
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </CardHeader>

                                <CardContent className="p-4 pt-0">
                                  <p className="text-xs text-gray-500 font-normal">
                                    {webhook.uploaded_by} | {" "}
                                    {<ISTTime utcString={webhook.created} showDate={true} />}
                                  </p>
{expandedSchemaId === webhook.id && (
  <div className="bg-gray-100 p-3 rounded-md mt-2 space-y-2">
    <div className="flex items-center justify-between">
      <span className="font-semibold text-gray-800">
        Curl Endpoint
      </span>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          const curlCommand = `curl --request POST \
--url ${API_ENDPOINT}/webhook-service/v1/knowledgebase/webhook/${tenant_ID}/${webhook.id}/ \
--header 'Accept: application/json' \
--header 'Authorization: <Authorization>' \
--header 'Content-Type: application/json' \
--data '${JSON.stringify(webhook.webhook_fields, null, 2)}'`;

          navigator.clipboard.writeText(curlCommand);
        }}
      >
        <Copy className="w-3 h-3 mr-1" /> Copy
      </Button>
    </div>

    <div className="relative bg-gray-200 p-3 rounded-md text-sm overflow-x-auto max-h-44">
      <pre>
        <code>
          {`curl --request POST \\
--url ${API_ENDPOINT}/webhook-service/v1/knowledgebase/webhook/${tenant_ID}/${webhook.id}/ \\
--header 'Accept: application/json' \\
--header 'Authorization: <Authorization>' \\
--header 'Content-Type: application/json' \\
--data '${JSON.stringify(webhook.webhook_fields, null, 2)}'`}
        </code>
      </pre>
    </div>
  </div>
)}

                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 sticky bottom-0 bg-white z-10 border-t border-gray-200">
                        <DynamicPagination
                          currentPage={webhookCurrentPage}
                          totalPages={webhookTotalPages}
                          onPageChange={handleWebhookPageChange}
                        />
                      </div>
                    </TabsContent>
              </Tabs>
            </TabsContent>
           )}

            {/* Streaming Tab */}
           {canViewStreams && (
           <TabsContent value="streaming" className="space-y-6 flex flex-col h-full">
                              {!kafkaEnabled? (
  <div className="space-y-5">
      <div className="border rounded-xl p-6 mt-10 flex flex-col items-center text-center space-y-4 bg-gray-50 shadow-sm">
  <div className="rounded-full bg-blue-100 p-3">
    <Folder className="w-8 h-8 text-blue-600" />
  </div>

  <h3 className="text-lg font-semibold text-gray-700">
    No streaming topic available yet
  </h3>
  <p className="text-gray-500">Do you want to generate a topic?</p>

  <p className="text-gray-600 leading-relaxed">
    Go to{" "}
    <span className="inline-flex items-center gap-1 font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
      Settings → Configuration → Streaming
    </span>{" "}
    and create a new topic.
  </p>
</div>

    </div>
    ):(
      <>
                <Tabs value={streamingSubTab} onValueChange={setStreamingSubTab} className="w-full">
                  <TabsList className={`grid w-full ${canModifyStreams ? 'grid-cols-2' : 'grid-cols-1'} mb-6`}>
                    {canModifyStreams && (
                    <TabsTrigger value="configure" className="flex items-center space-x-1">
                      <Database className="w-4 h-4" />
                      <span className="hidden sm:inline">Configure</span>
                    </TabsTrigger>
                    )}
                    <TabsTrigger value="recent-schema" className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span className="hidden sm:inline">Recent Schemas ({recentSchemas.length})</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Streaming - Configure Sub-tab */}
                  <TabsContent value="configure" className="space-y-6 flex-1 overflow-y-auto">
                    {/* <div className="space-y-4">
                      <div>
                        <Label htmlFor="streaming-name">
                            <span className="relative after:content-['*'] after:text-red-500 after:ml-1">Name</span>
                        </Label>
                        <Input
                          id="streaming-name"
                          placeholder="Enter Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="streaming-primary-key" className="flex items-center space-x-1">
                          <span className="relative after:content-['*'] after:text-red-500 after:ml-1">Primary Key</span>
                          <TooltipWrapper content="A primary key is used to retrieve specific webhook data in the chat.">
      <Info className="w-3 h-3 text-gray-400 cursor-pointer" />
    </TooltipWrapper>
                        </Label>
                        <Input
                          id="streaming-primary-key"
                          placeholder="Enter Primary Key"
                          value={primaryKey}
                          onChange={(e) => setPrimaryKey(e.target.value)}
                          className="mt-1"
                        />
                      </div>
<div>
      <Label
        htmlFor="streaming-schema-fields"
        className="flex items-center space-x-1"
      >
        <span className="relative after:content-['*'] after:text-red-500 after:ml-1">Schema Fields</span>
        <TooltipWrapper content="Primary key is required in webhook_fields. Ensure it exists at the top level and is not nested within another object.">
      <Info className="w-3 h-3 text-gray-400 cursor-pointer" />
    </TooltipWrapper>
      </Label>

      <div className="mt-1 bg-white  overflow-hidden p-3">
<Editor
  value={JSON.parse(schemaFields || "{}")}
  mode="code"
  // ace={ace}
  // mainMenuBar={true}
  // statusBar={true}
  navigationBar={false}
  indentation={2}
  htmlElementProps={{
    style: { height: "300px" },
  }}
  onChange={(value) => {
    try {
      setSchemaFields(JSON.stringify(value, null, 2));
    } catch {
    }
  }}
 
/>

      </div>
    </div>

                      <div>
                        <Label htmlFor="streaming-select-action" className="flex items-center space-x-1">
                         <span className="relative after:content-['*'] after:text-red-500 after:ml-1">
  Select Action
</span>
                         <TooltipWrapper content='Choose "Append" to add new data to existing data, or "Overwrite" to replace existing data.'>
      <Info className="w-3 h-3 text-gray-400 cursor-pointer" />
    </TooltipWrapper> 
                        </Label>
                        <Select value={selectAction} onValueChange={setSelectAction}>
                          <SelectTrigger className="mt-1 ">
                            <SelectValue placeholder="Select an action" />
                          </SelectTrigger>
                          <SelectContent className='bg-white'>
                            <SelectItem value="append">Append</SelectItem>
                            <SelectItem value="overwrite">Overwrite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div> */}
                      <SourceConfigurationFields
                      name={name}
                      setName={setName}
                      primaryKey={primaryKey}
                      setPrimaryKey={setPrimaryKey}
                      schemaFields={schemaFields} // Use schemaFields for streaming
                      setSchemaFields={setSchemaFields} // Set schemaFields for streaming
                      selectAction={selectAction}
                      setSelectAction={setSelectAction}
                      isWebhook={false}
                    />
                  </TabsContent>

                  {/* Streaming - Recent Schemas Sub-tab */}
<TabsContent
  value="recent-schema"
  className="flex flex-col h-full relative transform translateZ(0) z-[1]"
>
  {/* Header: Search, Schema Discovery, Refresh, Select All, Delete Button */}
  <div className="flex items-center space-x-2 mb-4">
    <div className="relative flex-1">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        placeholder="Search Schema by name.."
        className="pl-8"
        value={searchSchemaQuery}
        onChange={(e) => setSearchSchemaQuery(e.target.value)}
      />
    </div>

    {/* Select All Checkbox */}
    {canModifyStreams && (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="select-all-schemas"
        checked={allSchemasSelected}
        onCheckedChange={handleSelectAll}
        disabled={loadingSchemas || recentSchemas.length === 0}
      />
      <Label htmlFor="select-all-schemas">Select All</Label>
    </div>
    )}

    {/* Delete Selected Button */}
    {canModifyStreams && selectedSchemaIds.length > 0 && (
      <Button
        variant="destructive"
        onClick={() => {
          const schemasToDelete = recentSchemas
            .filter((schema) => selectedSchemaIds.includes(schema.id))
            .map((s) => ({ id: s.id, name: s.name }));
          setDeletingSchemas(schemasToDelete);
        }}
        disabled={isDeletingSchemas || loadingSchemas}
      >
        <Trash2 className="w-4 h-4" /> ({selectedSchemaIds.length})
      </Button>
    )}

    {canModifyStreams && (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <span>{loadingSchemas ? "Loading..." : "Schema Discovery"}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white p-4 w-96 space-y-3">
        {["Api Key", "Api Secret", "Bootstrap Server", "Kafka Topic"].map(
          (label) => {
            const key = label
              .toLowerCase()
              .replace(" ", "_") as keyof typeof schemaDiscoveryData;
            return schemaDiscovery(label, key);
          }
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    )}

    <Button
      variant="outline"
      size="icon"
      onClick={() => fetchRecentSchemas(currentPage)}
      disabled={loadingSchemas}
    >
      <RefreshCcw className={`w-4 h-4 ${loadingSchemas ? "animate-spin" : ""}`} />
    </Button>
  </div>

  {/* Scrollable Schema List */}
  <div className="flex-1 overflow-y-auto  space-y-4 min-h-[calc(100vh-312px)]">
    {loadingSchemas ? (
      <div className="text-center text-gray-500 py-8 flex items-center justify-center">Loading recent schemas...</div>
  ) : recentSchemas.length === 0 ? (
     <div className="text-center text-gray-500 py-8">
       {searchSchemaQuery.trim() !== ''
        ? "No results found for your search."
        : "No schemas available. Start by configuring a new streaming source."}
    </div>
   ) : (
      <div className="space-y-4 w-full">
        {recentSchemas.map((schema) => (
          <Card key={schema.id} className="shadow-sm overflow-x-auto pt-2">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-0 pt-0">
              <div className="flex items-center space-x-2 py-2">
                {canModifyStreams && (
                <Checkbox
                  id={`schema-${schema.id}`}
                  checked={selectedSchemaIds.includes(schema.id)}
                  onCheckedChange={() => handleToggleSchema(schema.id)}
                />
                )}
                <Label
                  htmlFor={`schema-${schema.id}`}
                  className="font-semibold text-gray-900"
                >
                  {schema.name}
                </Label>
                <Badge variant="secondary">{schema.operation}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                   {canModifyStreams && (
                <Button
                  variant="ghost"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                  onClick={() =>
                    setExpandedSchemaId(
                      expandedSchemaId === schema.id ? null : schema.id
                    )
                  }
                >
                  <span>Show Producer Code</span>
                  {expandedSchemaId === schema.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
                )}
                <DropdownMenu>
                  {canModifyStreams && (
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  )}
                  <DropdownMenuContent align="end" className="bg-white">
                    <DropdownMenuItem onSelect={() => handleEditSchema(schema)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onSelect={() => handleIndividualDelete(schema)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <p className="text-xs text-gray-500 font-normal py-1">
                {schema.uploaded_by} | {" "}
                {<ISTTime utcString={schema.created} showDate={true} />}
              </p>

              {expandedSchemaId === schema.id && (
                <div className="bg-gray-100 p-3 rounded-md mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-800">
                        Producer Code:
                      </span>
                      <Select
                        value={selectedProducerCodeLanguage}
                        onValueChange={setSelectedProducerCodeLanguage}
                      >
                        <SelectTrigger className="w-[120px] bg-white">
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="node">Node.js</SelectItem>
                          <SelectItem value="dotnet">.NET</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyProducerCode(schema[selectedProducerCodeLanguage])
                      }
                    >
                      <Copy className="w-3 h-3 mr-1" /> Copy
                    </Button>
                  </div>
                  <div className="relative bg-gray-200 p-3 rounded-md text-sm overflow-x-auto max-h-44">
                    <pre>
                      <code>{schema[selectedProducerCodeLanguage]}</code>
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </div>

  {/* Fixed Pagination */}
<div className="mt-2 sticky bottom-0 bg-white z-10 border-t border-gray-200">
    <DynamicPagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  </div>
</TabsContent>
       </Tabs>
                </>
)
}
              </TabsContent>
           )}
          </Tabs>
</div>
{(activeTab !== 'periodic' && activeTab !== 'streaming' && activeTab !== 'webhook' &&
          <div className="bg-white mt-6 pt-6 border-t">
            {activeTab !== 'webhook' && activeTab !== 'periodic' && activeTab !== 'streaming' && (
            <Button 
              // onClick={activeTab === 'file' ? () => {} : handleSourceSubmit}
                // onClick={() => handleUpload()}
                 onClick={()=>activeTab === 'file' ? handleUpload(droppedFiles) : handleUpload()}
              className="w-full bg-blue-600 hover:bg-blue-700"
              // disabled={!name.trim() || !primaryKey.trim() || (activeTab !== 'file' && !sourceUrl.trim())}
          disabled={
      isLoading || 
      (activeTab === 'file' && droppedFiles.length === 0) || 
      (activeTab === 'url' && urls.length === 0) || 
      (activeTab === 'text' && !sourceUrl.trim())
    }
            >
               {isLoading ? (
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      <span>Processing...</span>
    </div>
  ) : (
    activeTab === 'file' ? 'Upload Files Above' : 'Save Configuration'
  )}
            </Button>)}
          </div>)}
          {((activeTab === 'webhook' && webhookSubTab === 'configure' && canModifyWebhook) || (activeTab === 'streaming' && streamingSubTab === 'configure' && kafkaEnabled && canModifyStreams)) && (
            <div className="bg-white mt-6 pt-6 border-t">
              <Button
                onClick={handleSourceSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={
                  isLoading ||
                  !name.trim() ||
                  !primaryKey.trim() ||
                  (activeTab === 'streaming' && !schemaFields.trim()) || 
                  (activeTab === 'webhook' && !webhookFields.trim()) || 
                  !selectAction.trim()
                }
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : "Save Configuration"}
              </Button>
            </div>
          )}
        </div>

        {/* Right Panel - Form */}
        <div   className={`w-1/3 bg-gray-50 p-6 border-l border-gray-200 overflow-y-auto ${
    activeTab === "periodic" ? "cursor-not-allowed opacity-60 pointer-events-none" : ""
  }`}>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="outline">Configure</Badge>
                {/* <Badge variant="secondary">Recent Webhooks (0)</Badge> */}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="config-description">Instructions</Label>
                <Textarea
                  id="config-description"
                  placeholder="Enter your instruction here..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
       <DeletePopup
        deleting={deletingSchemas}
        isDeletingCategory={isDeletingSchemas}
        handleDeleteCategory={handleDeleteSelectedSchemas}
        setDeleting={setDeletingSchemas}
      />
 <DeletePopup
        deleting={deletingWebhooks}
        isDeletingCategory={isDeletingWebhooks}
        handleDeleteCategory={handleDeleteSelectedWebhooks}
        setDeleting={setDeletingWebhooks}
      />
    </div>
  );
};
