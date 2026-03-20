import { useState } from "react";
import { useRef, useEffect } from "react";
import {
  Dialog1,
  DialogContent1,
  DialogHeader1,
  DialogTitle1,
} from "@/components/ui/dialog-canvas";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  CheckCircle2,
  Clock,
  Hash,
  HardDrive,
  Loader2,
  Eye,
  Upload,
  X,
} from "lucide-react"; // adjust import path
import { CanvasCreate, CanvasLists, CanvasUpdate } from "../../api/canvas";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Pencil } from "lucide-react";
import { CanvasDelete } from "../../api/canvas"; // your delete API
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../../components/ui/alert-dialog";
import UploadDialog from "./uploadDialog";
import EditDialog from "./editDialog";
import PreviewDialog from "./previewDialog";
import { CanvasDialogProps, CanvasFile } from "./types";
import ISTTime from "../shared-components/ISTTime";

export const CanvasDialog = ({ widgetId }: CanvasDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [canvasData, setCanvasData] = useState<CanvasFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
const [isJustUploaded, setIsJustUploaded] = useState(false);

  // const fetchCanvasData = async () => {
  //   // try {
  //   //   setIsLoading(true);
  //   //   const tenantId = localStorage.getItem("tenant_id");
  //   //   const res = await CanvasLists("");
  //   //   if (res?.status === "success") {
  //   //     const data = res.data || [];
  //   //     setCanvasData(data);
  //   //     // If any file is in progress (0 <= percentage < 100), start polling
  //   //     if (data.some(item => typeof item.percentage === 'number' && item.percentage >= 0 && item.percentage < 100)) {
  //   //       startPolling();
  //   //     }
  //   //   }
  //     try {
  //   setIsLoading(true);
  //   const res = await CanvasLists("");
  //   if (res?.status === "success") {
  //     let data = res.data || [];

  //     // ✅ Inject percentage: 1 for the last added object only
  //     if (isJustUploaded) {
  //       // Find the newest item by sorting by created date
  //       const newestItem = [...data].sort((a, b) => 
  //         new Date(b.created).getTime() - new Date(a.created).getTime()
  //       )[0];

  //       data = data.map((item) =>
  //         item.id === newestItem.id ? { ...item, percentage: 1 } : item
  //       );
        
  //       // Reset the flag so future refreshes don't keep overriding the server value
  //       setIsJustUploaded(false);
  //     }

  //     setCanvasData(data);

  //     if (data.some(item => typeof item.percentage === 'number' && item.percentage >= 0 && item.percentage < 100)) {
  //       startPolling();
  //     }
  //   }
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description:
  //         error?.response?.data?.message || "Failed to fetch canvas data.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
const fetchCanvasData = async (isInitialAfterUpload = false) => {
  try {
    setIsLoading(true);
    const res = await CanvasLists("");
    if (res?.status === "success") {
      let data = res.data || [];

      // ✅ Use the parameter directly instead of state to avoid the closure bug
      if (isInitialAfterUpload && data.length > 0) {
        // Find the newest item by sorting by created date
        const newestItem = [...data].sort((a, b) => 
          new Date(b.created).getTime() - new Date(a.created).getTime()
        )[0];

        data = data.map((item) =>
          item.id === newestItem.id ? { ...item, percentage: 1 } : item
        );
        
        // Reset the state flag for consistency
        setIsJustUploaded(false);
      }

      setCanvasData(data);

      if (data.some(item => typeof item.percentage === 'number' && item.percentage >= 0 && item.percentage < 100)) {
        startPolling();
      }
    }
  } catch (error) {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to fetch canvas data.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleOpen = () => {
    setIsOpen(true);
    fetchCanvasData();
  };

  useEffect(() => {
    return () => {
      stopPolling(); // cleanup when component unmounts
    };
  }, []);
const handleUpload = async () => {
  if (!selectedFile) return;
  try {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    const res = await CanvasCreate(formData);

    if (res?.status === "success") {
      toast({
        title: "Success",
        description: "Template uploaded successfully.",
      });
      setIsUploadOpen(false);
      setSelectedFile(null);
      setIsJustUploaded(true); 
      
      // ✅ Pass true here to ensure the logic runs immediately
      fetchCanvasData(true); 
      startPolling();
    }
  } catch (error: any) {
    // ... error handling
  } finally {
    setIsUploading(false);
  }
};

  // const handleUpload = async () => {
  //   if (!selectedFile) return;

  //   try {
  //     setIsUploading(true);

  //     const formData = new FormData();
  //     formData.append("file", selectedFile); // ✅ Only file in payload

  //     const res = await CanvasCreate(formData);

  //     if (res?.status === "success") {
  //       toast({
  //         title: "Success",
  //         description: "Template uploaded successfully.",
  //       });

  //       setIsUploadOpen(false);
  //       setSelectedFile(null);
  //       setIsJustUploaded(true); 
  //       fetchCanvasData();
  //       startPolling();
  //     }
  //   } catch (error: any) {
  //     toast({
  //       title: "Error",
  //       description: error?.response?.data?.message || "Upload failed.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };
  const handleDelete = async (id: string) => {
    try {
      const payload = {
        ids: id,
      };
      const res = await CanvasDelete(payload);

      if (res?.status === "success") {
        toast({
          title: "Deleted",
          description: "Template deleted successfully.",
        });

        fetchCanvasData(); // refresh list
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to delete template.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      setIsUpdating(true);

      const payload = {
        id: editingId,
        data: {
          extracted_text: editedText,
        },
      };

      const res = await CanvasUpdate(payload);

      if (res?.status === "success") {
        toast({
          title: "Success",
          description: "Template updated successfully.",
        });

        setIsEditOpen(false);
        setEditingId(null);
        setEditedText("");
        fetchCanvasData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Update failed.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: "bg-green-100 text-green-700 border-green-200",
      processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
      failed: "bg-red-100 text-red-700 border-red-200",
      pending: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return statusMap[status] || "bg-blue-100 text-blue-700 border-blue-200";
  };

  const startPolling = () => {
    if (pollingRef.current) return; // prevent multiple intervals

    pollingRef.current = setInterval(async () => {
      try {
        const res = await CanvasLists("");

        if (res?.status === "success") {
          const updatedData = res.data || [];
          setCanvasData(updatedData);

          // check if all files reached 100%
          const isCompleted = updatedData.every(
            (item: CanvasFile) => item.percentage === 100,
          );

          if (isCompleted) {
            stopPolling();
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
        stopPolling();
      }
    }, 3000); // every 3 seconds
  };
  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <Button onClick={handleOpen} className="flex items-center gap-2">
        <Eye className="w-4 h-4" />
        Canvas
      </Button>

      {/* Dialog */}
      <Dialog1 open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent1 className="max-w-3xl overflow-hidden flex flex-col">
          <DialogHeader1>
            <DialogTitle1 className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="w-5 h-5 text-blue-600" />
              Canvas Files
            </DialogTitle1>
            <Button
              size="sm"
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2"
              disabled = {canvasData.length >= 1}
            >
              <Upload className="w-4 h-4" />
              {/* Create New Template */}
              Add Template
            </Button>
          </DialogHeader1>

          {/* Scrollable Content */}
          <div
            className="flex-1 overflow-y-auto space-y-4 pr-1
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-gray-200
            [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {/* Loading State */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Loading canvas data...
                </p>
              </div>
            ) : canvasData.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <FileText className="w-10 h-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No canvas files found
                </p>
              </div>
            ) : (
              /* File Cards */
              canvasData.map((item, index) => (
                <div
                  key={item.id || index}
                  className="border border-border rounded-xl p-4 bg-card space-y-4 hover:shadow-sm transition-shadow"
                >
                  {/* File Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div onClick={() => {
                          setPreviewContent(item.extracted_text);
                          setIsPreviewOpen(true);
                        }} className="flex items-center gap-3 min-w-0 cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {item.file_name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span><ISTTime utcString={item.created} /></span>
                          </div>
                        </p>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                      {/* Status Badge */}
                      {item.percentage === 100 && (
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize flex items-center gap-1 ${getStatusBadge(
                            item.status,
                          )}`}
                        >
                          {item.status}
                        </span>
                      )}

                      {/* Three Dot Menu */}
                      <DropdownMenu >
                        <DropdownMenuTrigger asChild>
                          <button  className="p-1 rounded-md hover:bg-muted" 
                          // disabled={item.percentage !== 100}
                          >
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem
                          // disabled={item.percentage !== 100}
                            onClick={() => {

                              setEditingId(item.id);
                              setEditedText(item.extracted_text || "");
                              setIsEditOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                          // disabled={item.percentage !== 100}
                            onClick={() => setDeleteId(item.id)}
                            className="text-red-600 focus:text-red-600 cursor-pointer hover:!text-white hover:!bg-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {item.percentage !== undefined && item.percentage < 100 && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Processing Progress</span>
                        <span>{item.percentage}%</span>
                      </div>

                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Meta Info Grid */}
                  {/* <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-start gap-2 text-xs">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">
                          {formatDate(item.created)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-muted-foreground">Updated</p>
                        <p className="font-medium text-foreground">
                          {formatDate(item.updated)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-xs col-span-2">
                      <HardDrive className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-muted-foreground">Storage Path</p>
                        <p
                          className="font-medium text-foreground truncate"
                          title={item.cloud_storage_file_path}
                        >
                          {item.cloud_storage_file_path?.split("/").pop()}
                        </p>
                      </div>
                    </div>
                  </div> */}

                  {/* File Hash */}
                  {/* <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                    <Hash className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs font-mono text-muted-foreground truncate">
                      {item.file_hash}
                    </p>
                  </div> */}

                  {/* Embeddings */}
                  {/* {item.embeddings_generated && (
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-700 font-medium capitalize">
                        Embeddings: {item.embeddings_generated}
                      </span>
                    </div>
                  )} */}

                  {/* Extracted Text Preview */}
                  {/* {item.extracted_text && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Extracted Content Preview
                      </p>
                      <div
                        className="bg-muted/40 rounded-lg p-3 max-h-28 overflow-y-auto
                        [&::-webkit-scrollbar]:w-1
                        [&::-webkit-scrollbar-track]:bg-transparent
                        [&::-webkit-scrollbar-thumb]:bg-gray-300
                        [&::-webkit-scrollbar-thumb]:rounded-full"
                      >
                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                          {item.extracted_text}
                        </p>
                      </div>
                    </div>
                  )} */}
                  {item.extracted_text && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Extracted Content Preview
                      </p>

                      <div
                        onClick={() => {
                          setPreviewContent(item.extracted_text);
                          setIsPreviewOpen(true);
                        }}
                        className="bg-muted/40 rounded-lg p-3 cursor-pointer hover:bg-muted/60 transition-colors"
                      >
                        <p
                          className="text-xs text-foreground break-words overflow-hidden"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 5,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                              h1: ({ children }) => (
                                <h1 className="text-lg font-bold mb-4 mt-6 first:mt-0">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-base font-bold mb-3 mt-5 first:mt-0">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-base font-bold mb-2 mt-4 first:mt-0">
                                  {children}
                                </h3>
                              ),
                              p: ({ children }) => (
                                <p className="text-sm leading-6 mb-4">
                                  {children}
                                </p>
                              ),
                              ul: ({ children }) => (
                                <ul className="mb-4 ml-5 list-disc space-y-2">
                                  {children}
                                </ul>
                              ),

                              ol: ({ children }) => (
                                <ol className="mb-4 ml-5 list-decimal space-y-2">
                                  {children}
                                </ol>
                              ),

                              li: ({ children }) => (
                                <li className="text-sm leading-6">
                                  {children}
                                </li>
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
                            }}
                          >
                            {item?.extracted_text}
                          </ReactMarkdown>
                        </p>

                        <span className="text-[11px] text-blue-600 mt-1 inline-block">
                          Click to view more
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Logs */}
                  {/* {item.logs && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
                      <span className="font-medium">Log:</span>
                      <span>{item.logs}</span>
                    </div>
                  )} */}
                </div>
              ))
            )}
          </div>
        </DialogContent1>
      </Dialog1>

      <UploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        isUploading={isUploading}
        onUpload={handleUpload}
      />

      <EditDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        editedText={editedText}
        setEditedText={setEditedText}
        isUpdating={isUpdating}
        onSave={handleUpdate}
      />

      <PreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        previewContent={previewContent}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        {/* <AlertDialogContent className="max-w-md"> */}
        <AlertDialogContent className="w-full max-w-lg sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete</AlertDialogTitle>
            <p className="text-gray-700 text-sm">
              Are you sure you want to delete this item?
            </p>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-sm px-3 py-1 min-h-0 min-w-0"
              onClick={() => {
                if (deleteId) {
                  handleDelete(deleteId);
                  setDeleteId(null);
                }
              }}
            >
              Yes
            </AlertDialogAction>
            <AlertDialogCancel className="text-sm px-3 py-1 min-h-0 min-w-0">Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};