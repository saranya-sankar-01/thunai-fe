import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ResearchHistory } from "../../components/Research/ResearchHistory";
import { useCallback, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import {
  createResearch,
  RegenerateResearch,
  ResearchDetails,
  ResearchList,
  ResearchStatus,
  SearchResearch,
  updateResearch,
} from "../../api/research";
import { NewResearchForm } from "../../components/Research/NewResearchForm";
import { ResearchContent } from "./ResearchContent";
import { useSidebarContext } from "../../pages/Index";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCcwDotIcon,
  LucideRefreshCcw,
} from "lucide-react";
import { SchedulerModal } from "./SchedularModel";
import { cn } from "@/lib/utils";
import type {
  ResearchItem,
  ResearchVersion,
  ViewMode,
  ScheduleType,
} from "../../components/Research/ResearchTypes";
import { toast } from "@/components/ui/use-toast";
import { set } from "date-fns";
import { use } from "marked";

const convertISTtoUTC = (istTime: string): string => {
  const [hours, minutes] = istTime.split(":").map(Number);
  let totalMinutes = hours * 60 + minutes;

  totalMinutes -= 330;

  if (totalMinutes < 0) {
    totalMinutes += 24 * 60; // Add 24 hours
  }

  const utcHours = Math.floor(totalMinutes / 60);
  const utcMinutes = totalMinutes % 60;

  return `${String(utcHours).padStart(2, "0")}:${String(utcMinutes).padStart(2, "0")}`;
};
const convertUTCtoIST = (utcTime: string): string => {
  const [hours, minutes] = utcTime.split(":").map(Number);

  let totalMinutes = hours * 60 + minutes;
  totalMinutes += 330;

  if (totalMinutes >= 24 * 60) {
    totalMinutes -= 24 * 60; // Subtract 24 hours
  }

  const istHours = Math.floor(totalMinutes / 60);
  const istMinutes = totalMinutes % 60;

  return `${String(istHours).padStart(2, "0")}:${String(istMinutes).padStart(2, "0")}`;
};

const formatUTCDateTimeToIST = (utcDateTimeStr: string): string => {
  const utcDate = new Date(utcDateTimeStr);
  const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000);

  return istDate.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const ResearchLayout = () => {
  const [researches, setResearches] = useState<ResearchItem[]>([]);
  const [activeResearchId, setActiveResearchId] = useState<string | null>(null);
  const { sidebarVisible: showResearchSidebar } = useSidebarContext();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editInitialValues, setEditInitialValues] = useState<any>(null);
  const [versions, setVersions] = useState<ResearchVersion[]>([]);
  const [selectedversions, setSelectedVersions] =
    useState<ResearchVersion | null>(null);
  const [activeContent, setActiveContent] = useState<string>("");
  const [sources, setSources] = useState<string[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null,
  );
  const [isPeriodicOpen, setIsPeriodicOpen] = useState(false);
  const [periodicSchedule, setPeriodicSchedule] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fetchResearchList = async (autoSelect: boolean = true) => {
    try {
      setLoading(true);
      setSearchQuery("");
      const res = await ResearchList({});
      const data = res.data || [];
      let researchList = data.research_configs || [];
      researchList = researchList
        .map((item: any) => ({
          ...item,
          timestamp: item.created || item.timestamp || new Date().toISOString(),
        }))
        .sort((a: any, b: any) => {
          const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return dateB - dateA; // Descending order
        });

      setResearches(researchList);
      console.log("Fetched researches:", researchList);
      setLoading(false);

      if (autoSelect && researchList.length > 0) {
        const firstResearch = researchList[0];
        setTimeout(() => {
          handleSelectResearch(firstResearch.id);
        }, 0);
        fetchResearchDetails(firstResearch.id);
      }
    } catch (err) {
      console.error("Failed to fetch research list", err);
      setLoading(false);
    }
  };

  const fetchResearchDetails = async (objId: string) => {
    setIsLoadingDetails(true);
    try {
      const res = await ResearchDetails({ research_id: objId });
      const data = res.data || [];
      console.log("Fetched research details:", data.data);
      setVersions(data);

      if (data.length) {
        setActiveContent(data[0]?.summary_without_sources || data[0]?.results);
        setSources(data[0]?.final_sources_gathered || data[0]?.sources || []);
        setSelectedVersions(data[0]);
        setSelectedVersionId(data[0].id);
      } else {
        setActiveContent("");
        setSources([]);
        setSelectedVersionId(null);
      }
    } catch (err) {
      setIsLoadingDetails(false);
      toast({
        description:
          err.response?.data?.message || "Failed to fetch research details",
        duration: 2000,
        variant: "destructive",
      });

      console.error("Failed to fetch research details", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const fetchResearchStatus = async (research_id: string) => {
    try {
      const res = await ResearchStatus({ research_id });
      const data = res.data || [];
      console.log("Fetched research status:", data);
      return data;
    } catch (err) {
      console.error("Failed to fetch research status", err);
      return [];
    }
  };

  useEffect(() => {
    fetchResearchList();
  }, []);

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;

    const pollStatus = async () => {
      if (!activeResearchId) return;
      if (selectedversions?.status === "done") {
        console.log("Overall research is done, skipping polling");
        return;
      }
      try {
        const statusData = await fetchResearchStatus(activeResearchId);

        // Update status
        setVersions((prev) =>
          prev.map((v) => {
            const statusItem = statusData.find((s: any) => s.id === v.id);
            return statusItem ? { ...v, status: statusItem.status } : v;
          }),
        );

        if (!selectedVersionId) return;

        const selectedStatus = statusData.find(
          (s: any) => s.id === selectedVersionId,
        );
        setVersions((prev) => {
          const updatedVersions = prev.map((v) => {
            const statusItem = statusData.find((s: any) => s.id === v.id);
            return statusItem ? { ...v, status: statusItem.status } : v;
          });

          // 2. ✅ CRITICAL FIX: Update the active selection state so status passes to ResearchContent
          const currentlySelected = updatedVersions.find(
            (v) => v.id === selectedVersionId,
          );
          if (
            currentlySelected &&
            currentlySelected.status !== selectedversions?.status
          ) {
            setSelectedVersions(currentlySelected);
          }

          return updatedVersions;
        });
        // ✅ Stop polling when done
        if (selectedStatus?.status === "done") {
          console.log("DONE → stop polling");

          clearInterval(pollingInterval);

          const detailsResponse = await ResearchDetails({
            research_id: activeResearchId,
          });

          if (detailsResponse?.data) {
            setVersions((prev) =>
              detailsResponse.data.map((v: any) => {
                const statusItem = statusData.find((s: any) => s.id === v.id);
                return {
                  ...v,
                  status: statusItem?.status || v.status,
                };
              }),
            );

            const selectedResult = detailsResponse.data.find(
              (r: any) => r.id === selectedVersionId,
            );

            if (
              selectedResult.summary_without_sources ||
              selectedResult?.results
            ) {
              setActiveContent(
                selectedResult.summary_without_sources ||
                  selectedResult.results,
              );
              setSources(
                selectedResult?.final_sources_gathered ||
                  selectedResult?.sources ||
                  [],
              );
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (activeResearchId && viewMode === "existing") {
      pollStatus(); // initial call

      pollingInterval = setInterval(pollStatus, 10000);
    }

    return () => clearInterval(pollingInterval);
  }, [activeResearchId, viewMode, selectedVersionId]);

  const handleEditPeriodic = () => {
    console.log("Opening edit scheduler for:", versions[0]);

    if (versions[0] && versions[0].periodic) {
      const timeString = convertUTCtoIST(versions[0].periodic.schedule_time);

      const initialValues = {
        frequency: versions[0].periodic.schedule_type,
        time: timeString,
        days: versions[0].periodic.days,
        dates: versions[0].periodic.dates,
      };

      console.log("Setting initial values:", initialValues);
      setEditInitialValues(initialValues);
    }
    setTimeout(() => {
      setEditMode(true);
    }, 0);
  };
  const handleSelectResearch = (id: string) => {
    setActiveResearchId(id);

    const selectedResearch = researches.find((r) => r.id === id);
    const isNewResearch =
      selectedResearch && selectedResearch.object_id === "temp";

    setViewMode(isNewResearch ? "new" : "existing");

    setResearches((prev) =>
      prev.map((r) => ({
        ...r,
        isActive: r.id === id,
      })),
    );

    if (selectedResearch && selectedResearch.object_id !== "temp") {
      // Clear previous data immediately when switching
      setVersions([]);
      setActiveContent("");
      setSources([]);
      setSelectedVersionId(null);

      fetchResearchDetails(id);
    } else {
      setVersions([]);
      setActiveContent("");
      setSources([]);
      setSelectedVersionId(null);
    }
  };

  const handleSearch = useCallback(
    async (query: string) => {
      // If query is empty, reset to original list
      if (query.trim() === "") {
        fetchResearchList(true);
        return;
      }

      try {
        setIsSearching(true);
        const res = await SearchResearch(query);
        const searchData = res.data?.data || [];

        // Patch the data into the researches state
        const formattedResults = searchData
          .map((item: any) => ({
            ...item,
            timestamp:
              item.created || item.timestamp || new Date().toISOString(),
          }))
          .sort((a: any, b: any) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return dateB - dateA;
          });
        if (formattedResults.length === 0) {
          setResearches([]);
          setActiveResearchId(null);
          setViewMode("list");
        } else {
          setResearches(formattedResults);
          const firstResearch = formattedResults[0];
          setTimeout(() => {
            handleSelectResearch(firstResearch.id);
          }, 0);
          fetchResearchDetails(firstResearch.id);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    },
    [searchQuery],
  );

  const Regenerate = async () => {
    try {
      const payload = { research_id: activeResearchId, regenerate: true };
      const response = await RegenerateResearch(payload);

      if (response.data) {
        toast({
          title: "Success",
          description: "Research regeneration initiated",
          duration: 2000,
        });
      }

      // Show loading state
      setIsLoadingDetails(true);
      // Wait 5 seconds before calling handleSelectResearch
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await handleSelectResearch(activeResearchId!);

      // Hide loading state
      setIsLoadingDetails(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to regenerate research",
        duration: 2000,
        variant: "destructive",
      });
      setIsLoadingDetails(false);
    }
  };

  const handleNewResearch = () => {
    const filteredResearches = researches.filter((r) => r.object_id !== "temp");

    const newId = `temp-${Date.now()}`;

    const newResearch: ResearchItem = {
      id: newId,
      prompt: "New Research",
      lastMessage: "Start a new research project",
      isActive: true,
      object_id: "temp",
    };

    setResearches([
      newResearch,
      ...filteredResearches.map((r) => ({ ...r, isActive: false })),
    ]);

    setActiveResearchId(newId);
    setViewMode("new");
    setVersions([]);
    setActiveContent("");
    setSources([]);
    setSelectedVersionId(null);
  };

  const handleSubmitNewResearch = async (query: string, schedule: any) => {
    const payload = {
      topic: query,
      schedule_type: schedule.type,
      time: convertISTtoUTC(schedule.time),
      // time: schedule.time,
      ...(schedule.days && { days: schedule.days }),
      ...(schedule.dates && { dates: schedule.dates }),
    };
    try {
      const response = await createResearch(payload);
      await fetchResearchList(false);
      setResearches((prev) => prev.filter((r) => r.object_id !== "temp"));
      return response;
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create research",
        duration: 2000,
        variant: "destructive",
      });
      console.error("Failed to create research:", error);
      throw error;
    }
  };

  const handleUpdateSchedule = async (config: {
    frequency: string;
    selectedDates?: Date[];
    time: string;
  }) => {
    const scheduleType = config.frequency
      .toLowerCase()
      .replace("-", "") as ScheduleType;

    const payload: any = {
      research_id: activeResearchId,
      schedule_type: scheduleType,
      schedule_time: convertISTtoUTC(config.time),
    };

    if (config.selectedDates && config.selectedDates.length > 0) {
      if (config.frequency === "WEEKLY") {
        const daysOfWeek = [
          ...new Set(config.selectedDates.map((d) => d.getDay())),
        ];
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        payload.days = daysOfWeek.map((day) => dayNames[day]);
      } else if (config.frequency === "MONTHLY") {
        const datesOfMonth = [
          ...new Set(config.selectedDates.map((d) => d.getDate())),
        ];
        payload.dates = datesOfMonth.sort((a, b) => a - b);
      }
    }

    console.log("Updating research schedule with payload:", payload);

    try {
      await updateResearch(payload);
      if (activeResearchId) {
        await fetchResearchDetails(activeResearchId);
      }

      setEditMode(false);
    } catch (error) {
      console.error("Failed to update schedule:", error);
      alert("Failed to update schedule. Please try again.");
    }
  };

  const activeResearch = researches.find((r) => r.isActive);
  const researchTitle = activeResearch?.prompt;
  const researchTimestamp =
    activeResearch?.timestamp || new Date().toLocaleDateString();

  return (
    <div className="h-[90vh] flex bg-background relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* LEFT SIDEBAR */}
      <div
        className={`
          border-r border-border flex flex-col bg-white
          transition-all duration-300 ease-in-out overflow-hidden
          ${showResearchSidebar ? "w-80 opacity-100" : "w-0 opacity-0"}
        `}
      >
        <ResearchHistory
          researches={researches}
          loading={loading || isSearching}
          onSelectResearch={handleSelectResearch}
          onNewResearch={handleNewResearch}
          onUpdateResearches={setResearches}
          onRefreshResearches={() => fetchResearchList(true)}
          sidebarVisible={showResearchSidebar}
          onRegenerate={Regenerate}
          onSearch={handleSearch}
          searchQuery={searchQuery} // ✅ Pass state
          onSearchQueryChange={setSearchQuery} // ✅ Pass setter
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto">
        {viewMode === "new" ? (
          <div className="p-8">
            <NewResearchForm
              key={activeResearchId}
              onSubmit={handleSubmitNewResearch}
              initialSchedule={periodicSchedule}
              onCancel={() => {
                setViewMode("list");
                setActiveResearchId(null);
                setPeriodicSchedule(null);
                setResearches((prev) =>
                  prev.filter((r) => r.object_id !== "temp"),
                );
              }}
            />
          </div>
        ) : viewMode === "existing" ? (
          <ResearchContent
            activeResearch={activeResearch}
            activeContent={activeContent}
            sources={sources}
            loading={isLoadingDetails}
            versions={versions}
            onVersionChange={setActiveContent}
            status={selectedversions?.status}
            // researchTitle={researchTitle}
            // session_id={activeResearch?.session_id || ""}
            timestamp={researchTimestamp}
          />
        ) : (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center text-muted-foreground flex flex-col items-center gap-4">
              <div className="bg-blue-100 rounded-full p-4 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                No research selected
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR - VERSIONS */}
      {viewMode === "existing" && (
        <div className="w-72 border-l p-4 bg-white flex flex-col h-full">
          {/* Fixed Header Section */}
          <div className="flex-shrink-0 space-y-4">
            <Button
              onClick={() => {
                Regenerate();
              }}
              className="bg-blue-700 w-full py-2 text-sm"
            >
              Run Research
              <LucideRefreshCcw
                className={`w-2 h-2 ${isLoadingDetails ? "animate-spin" : ""}`}
              />
            </Button>

            <div className="flex justify-between">
              <h3 className="text-sm font-semibold text-gray-500">
                Run History
              </h3>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-auto mt-4 space-y-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-100">
            {isLoadingDetails ? (
              // Loading state
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500">Loading versions...</p>
              </div>
            ) : versions.length > 0 ? (
              <>
                {/* Periodic Schedule Section */}
                <Collapsible
                  open={isPeriodicOpen}
                  onOpenChange={setIsPeriodicOpen}
                >
                  <Card className="mb-4">
                    <CollapsibleTrigger className="w-full">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <h4 className="text-sm font-semibold text-gray-700">
                              Periodic Schedule
                            </h4>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              isPeriodicOpen ? "transform rotate-180" : ""
                            }`}
                          />
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="px-4 pb-4 pt-0 space-y-2">
                        {versions[0] && versions[0].periodic && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">
                                Schedule Type:
                              </span>
                              <span className="font-medium text-gray-700">
                                {versions[0].periodic.schedule_type || ""}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Time:</span>
                              <span className="font-medium text-gray-700">
                                {convertUTCtoIST(
                                  versions[0].periodic.schedule_time,
                                )}
                              </span>
                            </div>
                            {versions[0].periodic.days &&
                              versions[0].periodic.days.length > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Day:</span>
                                  <span className="font-medium text-gray-700">
                                    {versions[0].periodic.days.join(", ")}
                                  </span>
                                </div>
                              )}
                            {versions[0].periodic.dates &&
                              versions[0].periodic.dates.length > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Date:</span>
                                  <span className="font-medium text-gray-700">
                                    {versions[0].periodic.dates.join(", ")}
                                  </span>
                                </div>
                              )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2"
                              onClick={handleEditPeriodic}
                            >
                              Edit Schedule
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Version History */}
                {versions.map((v) => (
                  <Card
                    key={v.id}
                    className={`cursor-pointer hover:shadow-md transition ${
                      selectedVersionId === v.id
                        ? "border-2 bg-primary/4 border-blue-600"
                        : "border"
                    }`}
                    onClick={() => {
                      setActiveContent(
                        v?.summary_without_sources || v?.results,
                      );
                      setSelectedVersions(v);
                      setSelectedVersionId(v.id);
                      setSources(v?.final_sources_gathered || v?.sources || []);
                    }}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span
                          className={
                            selectedVersionId === v.id
                              ? "font-semibold text-blue-600"
                              : ""
                          }
                        >
                          Version {v.version}
                        </span>
                        {v.status && (
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                              v.status === "done" &&
                                "bg-green-100 text-green-700",
                              v.status === "failed" &&
                                "bg-red-100 text-red-700",
                              v.status === "processing" &&
                                "bg-yellow-100 text-yellow-700",
                              v.status === "pending" &&
                                "bg-gray-100 text-gray-700",
                              ![
                                "done",
                                "failed",
                                "processing",
                                "pending",
                              ].includes(v.status) &&
                                "bg-blue-100 text-blue-700",
                            )}
                          >
                            {v.status.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2">
                        {v.results
                          ? v.results.replace(/[#*\n]/g, "").slice(0, 80)
                          : "No content"}
                        ...
                      </p>

                      {v.last_run && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          <span className="font-medium">Last Run:</span>
                          <span>{formatUTCDateTimeToIST(v.last_run)}</span>
                        </div>
                      )}

                      {v.next_run && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-blue-600" />
                          <span className="font-medium">Next Run:</span>
                          <span>{formatUTCDateTimeToIST(v.next_run)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <p className="text-sm text-gray-400">
                No versions Available For This research
              </p>
            )}
          </div>
        </div>
      )}
      {/* Edit Schedule Modal */}
      <SchedulerModal
        open={editMode}
        onClose={() => {
          setEditMode(false);
          setEditInitialValues(null);
        }}
        onConfirm={handleUpdateSchedule}
        initialValues={editInitialValues}
      />
    </div>
  );
};
