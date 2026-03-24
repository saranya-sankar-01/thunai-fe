import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Loader2, X, RefreshCcw, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { DeleteResearch } from "../../api/research";
import type { ResearchItem } from "../../components/Research/ResearchTypes";
import { set } from "date-fns";
import { DeletePopup } from "../sharedComponents/DeletePopup";

interface ResearchHistoryProps {
  researches: ResearchItem[];
  onSelectResearch: (id: string) => void;
  onNewResearch: () => void;
  onUpdateResearches: (researches: ResearchItem[]) => void;
  onRefreshResearches: () => void;
  onToggleSidebar?: () => void;
  onRegenerate?: () => void;
  sidebarVisible?: boolean;
  loading?: boolean;
  onSearch?: (query: string) => void;
  searchQuery: string; // ✅ New prop
  onSearchQueryChange: (query: string) => void; // ✅ New prop
}

export const ResearchHistory = ({
  researches,
  onSelectResearch,
  onNewResearch,
  onRefreshResearches,
  loading,
  onToggleSidebar,
  onRegenerate,
  onSearch,
  searchQuery,
  onSearchQueryChange,
}: ResearchHistoryProps) => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
const [openDelete, setOpenDelete] = useState(false);

  // ✅ DEBOUNCE LOGIC: Wait 500ms after typing stops before calling API
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleDelete = async () => {
    try {
      // setDeletingId(uniqueId);
      const currentIndex = researches.findIndex((r) => r.id === deletingId);

      await DeleteResearch({ research_id: deletingId });

      toast({
        description: "Research deleted successfully",
        duration: 2000,
      });
      let nextId: string | null = null;

      if (researches.length > 1) {
        if (currentIndex > 0) {
          nextId = researches[currentIndex - 1].id;
        } else if (currentIndex < researches.length - 1) {
          nextId = researches[currentIndex + 1].id;
        }
      }
      await onRefreshResearches();

      if (nextId) {
        onSelectResearch(nextId);
      }
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast({
        description: error?.response?.data?.message || "Failed to delete",
        variant: "destructive",
        duration: 2000,
      });
      setOpenDelete(false);
    } finally {
      setDeletingId(null);
      setOpenDelete(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-secondary/30">
      {/* Header */}
      <div className="p-2 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold pl-2">Research Projects</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewResearch}
              className="hover:bg-accent/30 flex items-center gap-1 h-8 px-2"
              title="New research"
            >
              <Plus className="h-4 w-4" />
            </Button>
             <Button
              variant="ghost"
              size="sm"
              onClick={onRefreshResearches}
              className="hover:bg-accent/30 flex items-center gap-1 h-8 px-2"
              title="Refresh researches"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {/* Close button for mobile */}
            {onToggleSidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSidebar}
                className="md:hidden hover:bg-accent/10 h-8 w-8 p-0"
                title="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Research List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          <div className="relative border-b border-border bg-card">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search research..."
              className="w-full h-9 pl-10 pr-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {researches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No research yet</p>
              <p className="text-xs">Start a new research to begin</p>
            </div>
          ) : (
            researches.map((research) => (
              <div
                key={research.id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all hover:bg-accent/10 group",
                  research.isActive
                    ? "bg-accent/20 border border-accent/30"
                    : "hover:bg-gray-200",
                )}
                onClick={() => onSelectResearch(research.id)}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3
                      className={cn(
                        "font-medium text-sm truncate flex-1",
                        research.isActive
                          ? "text-foreground"
                          : "text-foreground/90",
                      )}
                    >
                      {research.ai_title || research.prompt}
                    </h3>
                    <div className="flex items-center gap-2">
                      {deletingId ===
                      (research.unique_id || research.object_id) ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 hover:bg-muted/40 rounded">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-28">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(research.id);
                              setOpenDelete(true);
                              // handleDelete(research.id);
                            }}
                            className="text-black-600 cursor-pointer"
                          >
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                               e.stopPropagation();
                            onRegenerate()  // e.stopPropagation();  
                            }}
                            className="text-black-600 cursor-pointer"
                          >
                            Run Research
                            {/* Regenerate */}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 group-hover:text-muted-foreground/80">
                    {research.lastMessage}
                  </p>
                  {research.timestamp && (
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {new Date(research.timestamp + "Z").toLocaleString(
                        "en-IN",
                        {
                          timeZone: "Asia/Kolkata",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        },
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      <DeletePopup 
              isOpen={openDelete} 
              onClose={() => setOpenDelete(false)} 
              onConfirm={handleDelete} 
            /> 
    </div>
  );
};
