import { getLogs } from "../../services/suggestions";
import { set } from "date-fns";
import React, { useEffect, useState } from "react";
import { Toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Dialog1, DialogContent1, DialogHeader1, DialogTitle1, DialogTrigger1  } from "@/components/ui/dialog-copilot";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, ArrowBigLeft, ArrowDownLeft, ArrowDownRight, ArrowUpLeft, ArrowUpRight, CheckCircle, ChevronLeft, ChevronRight, Code, Copy, Loader2, XCircle } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
function CodeBlock({ data }: { data: any }) {
  return (
    <pre className="bg-muted text-xs rounded-md p-3 overflow-x-auto whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function LogsDialog() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
const [pageSize,setPageSize] = useState(20);
const [total, setTotal] = useState(1);

// Filters
const [statusFilter, setStatusFilter] = useState<"all" | "success" | "error">("all");
const [search, setSearch] = useState("");

  const { toast } = useToast();
// const buildPayload = () => {
//   const filters: any[] = [];

//   // 🔍 Search filter
//   if (search.trim()) {
//     filters.push({
//       key_name: "payload.summary",
//       key_value: search.trim(),
//       operator: "like",
//     });
//   }

//   // ✅ Status filter
//   if (statusFilter !== "all") {
//     filters.push({
//       key_name: "status_code",
//       key_value: statusFilter === "success" ? 200 : 400,
//       operator: statusFilter === "success" ? ">=" : "<",
//     });
//   }

//   return {
//     page: {
//       size: pageSize,
//       page_number: page,
//     },
//     sort: "desc",
//     sortby: "created",
//     filter: filters,
//     type: "is_omni",
//   };
// };
const totalPages = Math.ceil(total / pageSize);

  // 🔹 Payload builder
  const buildPayload = () => {
    const filters: any[] = [];

    if (search.trim()) {
      filters.push({
        key_name: "payload.summary",
        key_value: debouncedSearch.trim(),
        operator: "like",
      });
    }

    if (statusFilter !== "all") {
      filters.push({
        key_name: "status_code",
        key_value: statusFilter === "success" ? 200 : 400,
        operator: statusFilter === "success" ? "=" : "=",
      });
    }

    return {
      page: {
        size: pageSize,
        page_number: page,
      },
      sort: "desc",
      sortby: "created",
      filter: filters,
      type: "is_askthunai",
    };
  };

  // 🔹 Fetch logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await getLogs(buildPayload());

      if (response?.status) {
        setLogs(response.data || []);
        setPageSize(response.page.size);
        setTotal(response.page.total);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
const [debouncedSearch, setDebouncedSearch] = useState(search);
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 400); // ⏱ 400ms delay

  return () => clearTimeout(timer);
}, [search]);

  useEffect(() => {
    if (open) fetchLogs();
  }, [open, page, statusFilter,debouncedSearch]);
  const copyToClipboard = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };
  const handleDialogChange = (isOpen: boolean) => {
  setOpen(isOpen);

  // 🔄 Reset filters when dialog closes
  if (!isOpen) {
    setSearch("");
    setStatusFilter("all");
    setPage(1);
  }
};

  return (
    <Dialog1 open={open} onOpenChange={handleDialogChange }>
      <DialogTrigger1 asChild>
        <Button>View Logs</Button>
      </DialogTrigger1>

      <DialogContent1 className="max-w-4xl h-[100%] p-0">
        <DialogHeader1 className="p-4">
          <DialogTitle1>MCP Logs</DialogTitle1>
          <div className="flex flex-wrap items-center gap-2 p-4 border-b bg-background">
  {/* Search */}
  <Input
    placeholder="Search summary..."
    value={search}
    onChange={(e) => {
      setPage(1);
      setSearch(e.target.value);
    }}
    className="h-9 w-[220px] text-sm"
  />

  {/* Status Filter */}
  <Select
    value={statusFilter}
    onValueChange={(value) => {
      setPage(1);
      setStatusFilter(value as "all" | "success" | "error");
    }}
  >
    <SelectTrigger className="h-9 w-[140px] text-sm">
      <SelectValue placeholder="Filter status" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="all">All</SelectItem>
      <SelectItem value="success">Success</SelectItem>
      <SelectItem value="error">Error</SelectItem>
    </SelectContent>
  </Select>
</div>
        </DialogHeader1>



        <ScrollArea className="h-[100%] p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-2 ">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-2">
                <AlertCircle className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No logs found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {logs.map((log) =>{
                const isSuccess = log.status_code >= 200 && log.status_code < 300;

              return (
                <Card key={log._id} className="rounded-lg border p-4 shadow-sm">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="space-y-1">
                        <div className=" flex">
                      <p className="font-medium">
                        {log?.purpose} <span className="text-xs text-muted-foreground ml-2"> {format(new Date(log.created), "dd MMM yyyy, HH:mm")}</span>
                      </p>
                     
                      </div>
                      <p className="text-xs">
                        {log.url}
                      </p>
                    </div>

                 <Badge
  variant="outline"
  className={`flex items-center gap-1 border ${
    isSuccess
      ? "border-green-500 text-green-600"
      : "border-red-500 text-red-600"
  }`}
>
  {isSuccess ? (
    <>
      <CheckCircle className="w-3 h-3 text-green-600" />
      Success
    </>
  ) : (
    <>
      <XCircle className="w-3 h-3 text-red-600" />
      Error
    </>
  )}
</Badge>

                  </div>

                  <Separator className="my-3" />

                  {/* Accordion */}
  <div className="rounded-xl border bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b text-sm font-medium">
        <Code className="w-4 h-4 text-blue-600" />
        <span>Tool:</span>
        <span className="font-semibold">{log?.purpose}</span>
      </div>

      {/* Request / Response */}
      <div className="grid grid-cols-2 divide-x">
        {/* Request */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-blue-600" />
              Request
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(log.payload)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="rounded-md border bg-muted/40 p-3 max-h-[200px] overflow-auto text-xs font-mono">
            <pre>{JSON.stringify(log.payload, null, 2)}</pre>
          </div>
        </div>

        {/* Response */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4 text-green-600" />
              Response
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(log.response)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="rounded-md border bg-muted/40 p-3 max-h-[200px] overflow-auto text-xs font-mono">
            <pre>{JSON.stringify(log.response, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>

                </Card>
              )})}
            </div>
          )}
        </ScrollArea>
        {/* Fixed Bottom Pagination */}
<div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border py-1.5 flex justify-center items-center gap-1.5 z-50 shadow-sm">
  <Button
    onClick={() => setPage((p) => p - 1)}
    disabled={page === 1}
    variant="outline"
    size="sm"
    className="h-7 px-2 text-xs rounded-md"
  >
    &lt; Prev
  </Button>

  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
    <Button
      key={p}
      onClick={() => setPage(p)}
      size="sm"
      className={`h-7 w-7 text-xs font-medium rounded-md ${
        p === page
          ? "bg-primary text-white"
          : "bg-white border border-border text-foreground hover:bg-accent"
      }`}
    >
      {p}
    </Button>
  ))}

  <Button
    onClick={() => setPage((p) => p + 1)}
    disabled={page === totalPages}
    variant="outline"
    size="sm"
    className="h-7 px-2 text-xs rounded-md"
  >
    Next &gt;
  </Button>
</div>
      </DialogContent1>
    </Dialog1>
  );
}
