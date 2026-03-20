import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Radio,
  RefreshCw,
  Settings,
  ChevronDown,
  Activity,
  ArrowRight,
  CheckCircle2,
  MoreVertical,
  Layers,
  Download,
  Filter,
  Database,
  Clock,
  Search,
  Plus,
  Save,
  Trash2,
  Sliders,
  Shield,
  Zap,
  Globe,
  Terminal,
  Layout,
  BarChart3,
  AlertCircle,
  ArrowLeft,
  Cpu,
  Cloud,
  Settings2,
  Eye,
  EyeOff,
  Hash,
  Timer,
  FileText,
  X,
  Loader2,
  Code,
  Edit3,
  Lock,
  ZapOff,
  Box,
  Settings2 as AdvancedIcon,
  Maximize2,
  Share2,
  Info,
  Fingerprint,
  Key,
  UserIcon,
  ShieldEllipsis,
  ExternalLink,
  BrainCircuit,
  Pencil,
} from "lucide-react";

interface CaseDetails {
  case_id: string;
  case_number: string;
  status: string;
  priority?: string;
  origin?: string;
  owner_name?: string;
  owner_id?: string;
  uploaded_by?: string;
  source_platform?: string;
}

interface ConversationMessage {
  timestamp: string;
  sender: string;
  type: string;
  content: string;
}


interface StreamConfigType {
  pod_name?: string;
  app_id?: string;
  application_name?: string;
  topic_name?: string;
  unique_id_field?: string;
  api_version?: string;
  grpc_port?: string;
  grpc_host?: string;
  widget_id?: string;
  query_field?: string;
  target_destinations?: string[];
  schema?: string | object;
}
interface ProcessedData {
  conversation?: ConversationMessage[];
}

interface RawData {
  platform: string;
  event_type: string;
  payload?: Record<string, unknown>;
  notes?: string;
}
export interface StreamEvent {
  id: string;
  tenant_id: string;
  user_id: string;
  application_name: string;
  topic_name: string;
  agent_type: string;
  unique_id: string;
  event_timestamp: number;
  message_count: number;
  created: string;
  updated_at: string;
  case_details: CaseDetails;
  processed_data: ProcessedData | null;
  raw_data: RawData;
  status: "completed" | "processing" | "failed" | "queued";
}

import { useStreamLiveStore } from "../store/useProcessStream";
import { Button } from "@/components/ui/button";
import { getTenantId, getUrlIdentifier, getUserId, requestApi } from "@/services/authService";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { DeleteConfirmationDialog } from "./shared-components/DeleteConfirmationDialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import usePermissions from "@/hooks/usePermissions";


type StreamSubTab = "topics" | "history" | "aggregation" | "configure";

interface LocalEvent {
  id: string;
  unique_id: string;
  status: "queued" | "processing" | "completed" | "failed" | "retrying";
  timestamp: string;
  received_at: number;
  payload: string;
}
interface Stream {
  id?: string;
  pod_name?: string;
  event_type?: string;
  topic_name?: string;
  application_name?: string;
  unique_id_field?: string;
}
export const StreamViewer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<StreamSubTab>("topics");
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(false);
  const tenantID = getTenantId()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [podToDelete, setPodToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  //permissions Management


  const { canViewModule, canModifyModule } = usePermissions();
  const canModify = canModifyModule("streams");
  const fetchStreams = useCallback(async () => {
    setLoading(true);
    try {
      const response = await requestApi(
        "GET",
        `brain/streams/${tenantID}/config/`,
        null,
        "brainService",
      );
//        const response = [
//   {
//     pod_name: "omni-sf-event-pod",
//     topic_name: "/event/Thunai_HDS_Chat_Conversation_Event__e",
//     unique_id_field: "MessagingSession_Id__c",
//     app_id: "699c2406a7c912096ba057f2",
//     query_field: "messages",
//     widget_id: "thunai-hds-699d38373daa5d6f0d014379",
//     application_name: "salesforce",
//     event_type: null,
//     target_destinations: ["omni"],
//     auth_method: null,
//     schema: {
//       Case_Id__c: "",
//       Case_Number__c: "",
//       Case_Status__c: "",
//       Case_Subject__c: "",
//       Contact_Email__c: "",
//       Contact_Name__c: "",
//       Event_Timestamp__c: "",
//       Message_Count__c: "",
//       MessagingSession_Id__c: "",
//       messages: "",
//       caseDetails: "",
//       Oauth_Email__c: "",
//       Session_Id__c: ""
//     },
//     grpc_host: "api.pubsub.salesforce.com",
//     grpc_port: "7443",
//     api_version: "v60.0"
//   },
//   {
//     pod_name: "omni-mail-sf",
//     topic_name: "/event/Thunai_HDS_Email_Conversation_Event__e",
//     unique_id_field: "Case_Number__c",
//     app_id: "",
//     query_field: "Email_Data__c",
//     widget_id: "699ef17dcc5ffde46d352a89",
//     application_name: "Salesforce",
//     event_type: null,
//     target_destinations: ["omni"],
//     auth_method: null,
//     schema: {
//       Event_Timestamp__c: "",
//       Case_Subject__c: "",
//       Email_Data__c: "",
//       CreatedById: "",
//       Case_Status__c: "",
//       Contact_Name__c: "",
//       Contact_Email__c: "",
//       Case_Id__c: "",
//       Email_Count__c: "",
//       Case_Number__c: "",
//       Session_Id__c: "",
//       Oauth_Email__c: ""
//     },
//     grpc_host: "api.pubsub.salesforce.com",
//     grpc_port: "7443",
//     api_version: "v60.0"
//   }
// ];
     
      if (response && response.data) {
        setStreams(response.data || []);
      }else {
        setStreams([]);
      }
    } catch (error) {
      console.error("Failed to fetch streams:", error);
      setStreams([]);
    } finally {
      setLoading(false);
    }
  }, []);
  const handleDeleteClick = (pod_name: string) => {
    setPodToDelete(pod_name);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!podToDelete) return;

    setIsDeleting(true);
    try {
      await requestApi(
        "DELETE",
        `brain/streams/${tenantID}/config/${podToDelete}`,
        null,
        "brainService",
      );
      toast.success("Stream deleted successfully");
      await fetchStreams();
      setDeleteDialogOpen(false);
    } catch (error: unknown) {
      console.error("Failed to delete stream:", error);
      const errMsg = (error as any)?.response?.data?.message;
      toast.error(errMsg || "Failed to delete stream");
    } finally {
      setIsDeleting(false);
      setPodToDelete(null);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);
  const { streamsData, fetchLiveStream } = useStreamLiveStore();

  useEffect(() => {
    fetchLiveStream(tenantID);
  }, [tenantID]);
  if (selectedStreamId) {
    return (
      <StreamDetailView
        streamId={selectedStreamId}
        onBack={() => setSelectedStreamId(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden p-5 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex-shrink-0 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 bg-blue-600 rounded"></div>
              <h1 className="text-3xl font-bold">Thunai Streams</h1>
            </div>
            <p className="text-sm text-gray-700">
              Monitor live event clusters with intelligent neural aggregation
              and real-time observability.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchStreams}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />{" "}
              Refresh
            </button>
            {canModify && (
              <button
                onClick={() => setActiveSubTab("configure")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm  transition-all shadow-sm ${activeSubTab === "configure"
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "bg-blue-600 text-white hover:bg-blue-700 border border-transparent"
                  }`}
              >
                <Settings size={16} /> Configure
              </button>
            )}
          </div>
        </div>
        {/* Sub-Tab Navigation */}
        {/* {activeSubTab !== "configure" && (
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSubTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )} */}
      </div>

      {/* Dynamic Tab Content */}
      {/* CONFIGURE SCREEN */}
      {activeSubTab === "configure" ? (
        <div className="flex-1 overflow-y-auto mt-6 pr-2">
          <StreamConfigureView
            onBack={() => {
              setActiveSubTab("topics");
              fetchStreams();
            }}
          />
        </div>
      ) : (
        <Tabs
          value={activeSubTab}
          onValueChange={(val) => setActiveSubTab(val as StreamSubTab)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* 🔵 FIXED TABS HEADER */}
          <div className=" flex flex-col lg:flex-row justify-start items-start gap-1 md:gap-5">
            <div className="flex-shrink-0 mt-6">
              <TabsList className="bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="topics">Stream Topics</TabsTrigger>
                <TabsTrigger value="history">Event History</TabsTrigger>
                <TabsTrigger value="aggregation">Event Aggregation</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-stretch w-[calc(100vw-100px)] md:w-[calc(80vw-100px)]  lg:w-[calc(70vw-400px)] xl:w-[calc(60vw-500px)] mt-1 lg:mt-6">
              <div className="flex gap-3">
                {/* {stats.map((stat, idx) => (
  <Card
    key={idx}
    className="min-w-[120px] shadow-sm hover:shadow-md transition-shadow"
  >
    <CardContent className="px-4 py-3 flex flex-col justify-center">
      <h4 className=" text-muted-foreground text-sm font-medium text-gray-600  mb-1">
        {stat.label}
      </h4>

      <div className={`text-lg font-black leading-none ${stat.color}`}>
        {stat.value}
      </div>
    </CardContent>
  </Card>
))} */}
              </div>
              {streamsData && Object.keys(streamsData).length > 0 ? (
                <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 p-2 flex items-center gap-4 overflow-hidden group w-48">
                  <div className="flex items-center gap-2 px-2 border-r border-slate-700 h-full">
                    <Zap size={12} className="text-amber-400 animate-pulse" />
                    <span className="text-[8px] font-black text-slate-500 uppercase whitespace-nowrap">
                      Live Payload
                    </span>
                  </div>

                  <div className="flex-1 overflow-hidden relative">
                    <div className="flex gap-6 animate-marquee whitespace-nowrap">
                      <span className="text-[10px] text-emerald-400 opacity-80">
                        {JSON.stringify(streamsData)}
                      </span>

                      <span className="text-[10px] text-emerald-400 opacity-80">
                        {JSON.stringify(streamsData)}
                      </span>

                      {/* 
              {livePayloads.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="text-[10px]  text-emerald-400 opacity-80">
                    {p.text}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500">
                    {p.time}
                  </span>
                </div>
              ))}
              {livePayloads.map((p) => (
                <div key={`dup-${p.id}`} className="flex items-center gap-2">
                  <span className="text-[10px]  text-emerald-400 opacity-80">
                    {p.text}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500">
                    {p.time}
                  </span>
                </div>
              ))} */}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 p-3 flex items-center gap-4 overflow-hidden w-full">
                  <div className="flex items-center gap-2 px-2 border-r border-slate-700 h-full">
                    <Zap size={12} className="text-amber-400 animate-pulse" />
                    <span className="text-[8px] font-black text-slate-500 uppercase whitespace-nowrap">
                      Live Payload
                    </span>
                  </div>

                  <div className="flex-1 overflow-hidden relative">
                    <div className="flex gap-6 animate-marquees whitespace-nowrap">
                      {/* Duplicate Content */}
                      <span className="text-[10px] text-emerald-400 opacity-80">
                        No Event live Data Detected
                      </span>
                      <span className="text-[10px] text-emerald-400 opacity-80">
                        No Event live Data Detected
                      </span>
                      <span className="text-[10px] text-emerald-400 opacity-80">
                        No Event live Data Detected
                      </span>
                      <span className="text-[10px] text-emerald-400 opacity-80">
                        No Event live Data Detected
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* 🔵 SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto mt-6 pr-2">
            <TabsContent value="topics">
              <StreamTopicsView
                onSelectStream={setSelectedStreamId}
                streams={streams}
                loading={loading}
                onDeleteClick={handleDeleteClick}
                canModify={canModify}
              />
            </TabsContent>

            <TabsContent value="history">
              <EventHistoryView />
            </TabsContent>

            <TabsContent value="aggregation">
              <EventAggregationView />
            </TabsContent>
          </div>
        </Tabs>
      )}

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Stream"
        description={`Are you sure you want to delete the stream? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
};

const StreamTopicsView: React.FC<{
  onSelectStream: (id: string) => void;
  onDeleteClick: (pod_name: string) => void;
  streams: any[];
  loading: boolean;
  canModify: boolean;
}> = ({ onSelectStream, onDeleteClick, streams, loading, canModify }) => {


  const [view, setView] = useState<boolean>(false);
  const [selectedStream, setSelectedStream] = useState<any | null>(null);

  const stats = [
    {
      label: "Active Streams",
      value: streams.length.toString(),
      color: "text-emerald-600",
    },
    { label: "Total Events", value: "23.4k", color: "text-gray-900" },
    { label: "Event Types", value: "12", color: "text-blue-600" },
  ];

  const livePayloads = [
    {
      id: 1,
      text: '{"event": "chunk_ingested", "size": "24kb", "id": "tx_8819"}',
      time: "1s",
    },
    {
      id: 2,
      text: '{"event": "vector_sync", "status": "200 OK", "node": "eu-west"}',
      time: "4s",
    },
    {
      id: 3,
      text: '{"event": "pii_redacted", "rule": "credit_card", "matches": 1}',
      time: "12s",
    },
  ];
  const getAppLogo = (application_name?: string) => {
    const name = application_name?.toLowerCase();
    if (name === "servicenow")
      return "https://storage.googleapis.com/thunai-media/integration-app-logo/sn.svg";
    if (name === "salesforce")
      return "https://storage.googleapis.com/thunai-media/integration-app-logo/salesforce.svg";
    return null;
  };
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="text-xs font-bold text-gray-400 uppercase ">
          Synchronizing Streams...
        </span>
      </div>
    );
  }


  if (view === true) {
    return <StreamConfigureView
      view={view}
      selectedStream={selectedStream}
      onBack={() => {
        setView(false)
      }}
    />
  }
  // console.log("streamsData==>",streamsData);

  return (

    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 ">
      {/* <div className="flex gap-3">
        <div className="relative">
   <Select defaultValue="all">
  <SelectTrigger className="min-w-[160px] text-xs font-bold">
    <SelectValue placeholder="All Cluster Types" />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="all">All Cluster Types</SelectItem>
    <SelectItem value="managed">Managed Pipeline</SelectItem>
    <SelectItem value="insight">Insight Cluster</SelectItem>
    <SelectItem value="external">External Sink</SelectItem>
  </SelectContent>
</Select>

        </div>
      </div> */}

      <div className="space-y-3">
        {streams.length > 0 ? (
          streams.map((stream) => {
            const logoUrl = getAppLogo(stream.application_name);
            return (
              <div
                key={stream?.unique_id_field || stream?.user_id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={stream.application_name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : stream.isLive ? (
                        <Radio size={16} />
                      ) : (
                        <Activity size={16} />
                      )}

                      <h3 className="text-sm  text-gray-900 group-hover:text-blue-600 transition-colors">
                        {stream.pod_name || "NA"}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px]   ${stream.isLive ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
                      >
                        {stream.topic_name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {/* Event Type: {stream.event_type || "NA"} |  */}
                      App: {stream.application_name || "NA"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        onSelectStream(stream.unique_id_field || stream.id || "")
                      }
                      className="py-0.5 bg-blue-600 text-white  rounded-lg hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"
                    >
                      View Events
                      <ArrowRight size={12} />
                    </Button>
                    {canModify && (
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClick(stream.pod_name);
                        }}
                        className="p-3   hover:bg-red-50 hover:text-red-700 transition-all"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex flex-col sm:items-start sm:justify-start md:flex-row md:items-center md:justify-between gap-4">
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">
                          Total Events
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {stream.total_events || "NA"}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-400 mb-1">
                          Success Rate
                        </div>
                        <div className="text-sm font-semibold text-emerald-600">
                          {stream.success_rate || "NA"}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-400 mb-1">
                          Last Sync
                        </div>
                        <div className="text-sm font-medium text-gray-600 truncate">
                          {stream.last_event || "NA"}
                        </div>
                      </div>
                    </div>
                    <span className="p-2 pr-1 w-10 h-10 border border-gray-200 hover:bg-green-100 rounded-sm outline-none"
                      onClick={(e) => {
                        setSelectedStream(stream);
                        setView(true);
                      }}>
                      <Pencil size={16} className="hover:text-green-90000" />
                    </span>

                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-200 rounded-xl">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <Box size={32} className="text-gray-300" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
              No Streams Found
            </h3>
            <p className="text-xs text-gray-500 mt-1 uppercase  font-medium">
              Configure a new stream to begin live monitoring.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
        }
        .animate-marquees {
          animation: marquee 10s linear infinite;
        }
        .animate-marquee:hover,
          .animate-marquees:hover {
        animation-play-state: paused;
         }

      `}</style>

    </div>
  );
};

const StreamDetailView: React.FC<{ streamId: string; onBack: () => void }> = ({
  streamId,
  onBack,
}) => {
  console.log("streamId", streamId);

  const [events, setEvents] = useState<LocalEvent[]>([
    {
      id: "evt-1",
      unique_id: "doc_6926d01f",
      status: "completed",
      timestamp: "1/15/2024, 4:10:05 PM",
      received_at: Date.now() - 300000,
      payload:
        '{"source": "web_upload", "type": "pdf", "chunks": 24, "ocr_confidence": 0.98}',
    },
    {
      id: "evt-2",
      unique_id: "doc_6926d01f",
      status: "processing",
      timestamp: "1/15/2024, 4:11:20 PM",
      received_at: Date.now() - 120000,
      payload:
        '{"step": "vectorization", "dimensions": 1536, "provider": "openai-ada-002"}',
    },
    {
      id: "evt-3",
      unique_id: "doc_44ad51d0",
      status: "queued",
      timestamp: "1/15/2024, 4:12:15 PM",
      received_at: Date.now() - 45000,
      payload:
        '{"priority": "high", "cluster_id": "finance_v2", "retry_count": 0}',
    },
    {
      id: "evt-4",
      unique_id: "doc_88bc42d0",
      status: "failed",
      timestamp: "1/15/2024, 4:13:00 PM",
      received_at: Date.now() - 10000,
      payload:
        '{"error": "MALFORMED_HEADER", "retry_policy": "backoff", "attempts": 3}',
    },
    {
      id: "evt-5",
      unique_id: "doc_44ad51d0",
      status: "processing",
      timestamp: "1/15/2024, 4:14:15 PM",
      received_at: Date.now() - 5000,
      payload: '{"step": "malware_scan", "engine": "safe_mind_v1"}',
    },
    {
      id: "evt-6",
      unique_id: "doc_6926d01f",
      status: "processing",
      timestamp: "1/15/2024, 4:16:00 PM",
      received_at: Date.now() - 2000,
      payload: '{"step": "embedding", "status": "active"}',
    },
  ]);
  const [eventData, setEventData] = useState<StreamEvent[]>([]);
  const [Eventloading, setEventLoading] = useState<boolean>(false);
  const tenantID = getTenantId()

  // const mockEventData: StreamEvent[] = [
  //   {
  //     id: "699d4d513f43f8282a8cdf23",
  //     tenant_id: "thunai1769495656724",
  //     user_id: "69610b40cd61296691631d8b3",
  //     application_name: "Salesforce",
  //     topic_name: "/event/Thunai_HDS_Chat_Conversation_Event__e",
  //     agent_type: "omni",
  //     unique_id: "0MwD3000000hCtYKAU",
  //     event_timestamp: 1771916619398,
  //     message_count: 19,
  //     created_at: "2026-02-24T07:03:45.171000",
  //     updated_at: "2026-02-24T07:03:50.354000",
  //     status: "completed",
  //     case_details: {
  //       case_id: "500D300000GUWusIAH",
  //       case_number: "17393736",
  //       status: "New",
  //       priority: "Low",
  //       origin: "Chat",
  //       owner_name: "Kulanthaivelu Nagarajan",
  //       owner_id: "005D3000007TBWoIAO",
  //     },
  //     processed_data: {
  //       conversation: [
  //         {
  //           timestamp: "2026-02-24T05:01:20.632Z",
  //           sender: "Automated Process",
  //           type: "System",
  //           content: "Hello Guest, an associate will be with you shortly",
  //         },
  //         {
  //           timestamp: "2026-02-24T05:01:33.056Z",
  //           sender: "Guest",
  //           type: "EndUser",
  //           content: "Hi",
  //         },
  //         {
  //           timestamp: "2026-02-24T05:04:01.958Z",
  //           sender: "Kulanthaivelu N",
  //           type: "Agent",
  //           content: "Hi",
  //         },
  //       ],
  //     },
  //     raw_data: {
  //       platform: "Salesforce",
  //       event_type: "PlatformEvent",
  //       payload: {
  //         ConversationIdentifier: "0MwD3000000hCtYKAU",
  //         CaseId: "500D300000GUWusIAH",
  //         CaseNumber: "17393736",
  //         Status: "New",
  //         Priority: "Low",
  //         Origin: "Chat",
  //       },
  //     },
  //   },
  //   {
  //     id: "699d31499c263c02d45daaec",
  //     tenant_id: "thunai1769495656724",
  //     user_id: "69610b40cd61296691631d8b1",
  //     application_name: "Salesforce",
  //     topic_name: "/event/Thunai_HDS_Chat_Conversation_Event__e",
  //     agent_type: "omni",
  //     unique_id: "699d3150da0c2e5bf4abd64b",
  //     event_timestamp: 1771909443560,
  //     message_count: 4,
  //     created_at: "2026-02-24T05:04:09.380000",
  //     updated_at: "2026-02-24T05:04:17.975000",
  //     status: "processing",
  //     case_details: {
  //       case_id: "500D300000GUWusIAH",
  //       case_number: "17393736",
  //       status: "New",
  //       uploaded_by: "kulanthaivelu.nagarajan@hdsupply.com",
  //       source_platform: "Salesforce Platform Event",
  //     },
  //     processed_data: null,
  //     raw_data: {
  //       platform: "Salesforce",
  //       event_type: "PlatformEvent",
  //       notes: "Original processed_data was stored as markdown text",
  //     },
  //   },
  // ];

  useEffect(() => {
    const fetchStreamEvents = async () => {
      setEventLoading(true);
      try {
        const StreamRes = await requestApi(
          "GET",
          `brain/streams/${tenantID}/config/${streamId}/events`,
          null,
          "brainService",
        );
        const data: StreamEvent[] = StreamRes?.data || [];
        setEventData( data);
        // setEventData(data.length > 0 ? data : mockEventData);
      } catch (err) {
        console.error("Error fetching stream events:", err);
        // setEventData(mockEventData);
      } finally {
        setEventLoading(false);
      }
    };

    fetchStreamEvents();
  }, [tenantID, streamId]);

  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState("");

  // Group events by unique_id to form "Unique Objects"
  const groupedObjects = useMemo<Record<string, StreamEvent[]>>(() => {
    const groups: Record<string, StreamEvent[]> = {};
    events.forEach((evt: any) => {
      if (!groups[evt.unique_id]) groups[evt.unique_id] = [];
      groups[evt.unique_id].push(evt);
    });
    return groups;
  }, [events]);

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const saveEdit = () => {
    if (editingEventId) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === editingEventId ? { ...e, payload: editBuffer } : e,
        ),
      );
      setEditingEventId(null);
    }
  };


  const getStatusStyle = (status: StreamEvent["status"]) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "processing":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "failed":
        return "bg-red-50 text-red-600 border-red-100";
      case "queued":
        return "bg-gray-100 text-gray-500 border-gray-200";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const currentObjectEvents: StreamEvent[] =
    selectedObjectId && groupedObjects[selectedObjectId]
      ? [...groupedObjects[selectedObjectId]].sort(
        (a: StreamEvent, b: StreamEvent) => b.event_timestamp - a.event_timestamp,
      )
      : [];
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const selectedEvent = eventData.find(
    (item) => item.id === selectedObjectId
  );

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden flex flex-col h-full md:h-[100vh]">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <button
              onClick={
                selectedObjectId ? () => setSelectedObjectId(null) : onBack
              }
              className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-gray-900 leading-tight tracking-tight">
                  {selectedObjectId ? `Object History` : "Object Discovery"}
                </h2>
                {!selectedObjectId && (
                  <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded ">
                    Global Graph
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 font-bold   mt-0.5">
                {selectedObjectId
                  ? `Tracking unique_id: ${selectedObjectId}`
                  : "Document Ingestion Cluster Live Observability"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-100">
              <RefreshCw size={12} className="animate-spin" /> Live Monitoring
            </div>
          </div>
        </div>

        {!selectedObjectId ? (

          Eventloading ? (
            <div className="p-6 flex items-center justify-center h-[50vh]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : eventData && eventData.length > 0 ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventData?.map((value, index) => (
                <div
                  key={value.id || index}
                  className="bg-white border p-5 border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                  onClick={() => setSelectedObjectId(value?.id)}
                >
                  <div className="flex p-3 items-center justify-between">
                    <button
                      className="flex gap-2 text-sm font-semibold text-blue-600 p-1 px-2 border border-blue-200 rounded-sm bg-blue-50/50 hover:bg-blue-100 transition-all"
                    // onClick={(e) => {
                    //   e.stopPropagation();
                    //   navigate(`/view/${value?.brain_obj_id}`);
                    // }}
                    >
                      <Hash size={12} className="text-blue-500 mt-1" />
                      <span className="font-semibold text-gray-600">
                        UserId:{value?.user_id}
                      </span>
                    </button>
                    {/* <p className="text-xs text-gray-500">Progress</p> */}
                  </div>

                  <div className="mt-2 ml-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Recent Activities
                    </p>

                    <div className="space-y-1">
                      <div
                        key={value.id || index}
                        className="text-xs text-gray-700 bg-gray-50 px-2 py-2 rounded"
                      >
                        <span className="h-2 w-2 bg-blue-500 rounded-full mr-2 mt-1 inline-block"></span>
                        {new Date(value.created).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mt-2 px-3">
                    {value?.message_count || 0} LIFECYCLE LOGS
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 flex flex-col items-center justify-center h-[50vh] bg-white border border-dashed border-gray-200 rounded-xl">
              <div className="p-4 bg-gray-50 rounded-full mb-4">
                <Box size={32} className="text-gray-300" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                No Event Data Found
              </h3>
              <p className="text-xs text-gray-500 mt-1 uppercase font-medium">
                No events are available for this stream yet.
              </p>
            </div>
          )
        ) : (
          <div className="flex-1 overflow-x-auto p-6">

            {/* Back Button */}
            <button
              onClick={() => setSelectedObjectId(null)}
              className="mb-4 text-sm text-blue-600 hover:underline"
            >
              ← Back
            </button>

            {selectedEvent ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">

                {/* RAW DATA */}
                <div className="bg-white border rounded-xl shadow-sm p-4 overflow-auto">
                  <h3 className="text-xs font-semibold text-gray-500 mb-3 tracking-wider">
                    RAW DATA
                  </h3>

                  <pre className="text-xs whitespace-pre-wrap text-gray-700">
                    {JSON.stringify(selectedEvent.raw_data, null, 2)}
                  </pre>
                </div>

                {/* PROCESSED DATA */}
                <div className="bg-white border rounded-xl shadow-sm p-4 overflow-auto">
                  <h3 className="text-xs font-semibold text-green-600 mb-3 tracking-wider">
                    PROCESSED DATA
                  </h3>

                  <pre className="text-xs whitespace-pre-wrap text-gray-700">
                    {JSON.stringify(
                      selectedEvent.processed_data ?? { message: "No processed data available" },
                      null,
                      2
                    )}
                  </pre>
                </div>

              </div>
            ) : (
              <div className="flex items-center justify-center h-[50vh] text-gray-400">
                No data found
              </div>
            )}
          </div>
        )}

        {events.length === 0 && (
          <div className="py-32 text-center flex flex-col items-center gap-3">
            <Activity size={48} className="text-gray-200" />
            <p className="text-sm font-bold text-gray-400 uppercase ">
              No Events Found for this Object
            </p>
          </div>
        )}

        {/* Footer Summary */}
        <div className="position fixed bottom-0 left-0 right-0 px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-400  shrink-0">
          <div>
            {selectedObjectId
              ? `Viewing ${currentObjectEvents.length} Lifecycle Events`
              : `${Object.keys(eventData || {}).length} Unique Objects in Current Cluster`}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Shield size={10} className="text-emerald-500" /> Integrity
              Verified
            </span>
            <span className="text-gray-300">|</span>
            <span>Retention: 30D</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventHistoryView = () => {
  const events = [
    {
      id: 1,
      type: "Live Stream",
      source: "user-session",
      event: "user.pageview",
      time: "1/15/2024, 4:02:00 PM",
    },
    {
      id: 2,
      type: "Live Stream",
      source: "search-engine",
      event: "search.query",
      time: "1/15/2024, 4:00:30 PM",
    },
    {
      id: 3,
      type: "Live Stream",
      source: "user-session",
      event: "user.login",
      time: "1/15/2024, 3:59:15 PM",
    },
    {
      id: 4,
      type: "Live Stream",
      source: "user-session",
      event: "document.shared",
      time: "1/15/2024, 3:58:45 PM",
    },
    {
      id: 5,
      type: "Live Stream",
      source: "user-session",
      event: "user.download",
      time: "1/15/2024, 3:57:20 PM",
    },
  ];

  return (
    <>
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-200 rounded-xl ">
        <div className="p-4 bg-gray-50 rounded-full mb-4">
          <Box size={32} className="text-gray-300" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
          No History Found
        </h3>
      </div>
    </>

    // <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
    //   <div className="p-6 space-y-6">
    //     <div className="flex items-center justify-between">
    //       <div>
    //         <h2 className="text-lg font-black text-gray-900 leading-tight">
    //           Event History
    //         </h2>
    //         <p className="text-xs text-gray-500 mt-1">
    //           Live observability of recent stream events and neural processing
    //           tasks.
    //         </p>
    //       </div>
    //       <div className="flex gap-2">
    //         <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-[10px] font-black uppercase  rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2">
    //           Show All
    //         </button>
    //         <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-[10px] font-black uppercase  rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2">
    //           <Download size={14} /> Export
    //         </button>
    //       </div>
    //     </div>

    //     <div className="overflow-x-auto">
    //       <table className="w-full text-left">
    //         <thead>
    //           <tr className="border-b border-gray-100 text-[8px] font-black text-gray-400 uppercase tracking-[0.25em]">
    //             <th className="px-4 py-3">Status</th>
    //             <th className="px-4 py-3">Stream Type</th>
    //             <th className="px-4 py-3">Source ID</th>
    //             <th className="px-4 py-3">Event Tag</th>
    //             <th className="px-4 py-3">Timestamp</th>
    //             <th className="px-4 py-3 text-right">Actions</th>
    //           </tr>
    //         </thead>
    //         <tbody className="divide-y divide-gray-100 text-xs">
    //           {events.map((evt) => (
    //             <tr
    //               key={evt.id}
    //               className="hover:bg-gray-50/50 transition-colors group"
    //             >
    //               <td className="px-4 py-4">
    //                 <span className="flex items-center gap-2 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-wider border border-blue-100 w-fit">
    //                   <CheckCircle2 size={10} className="text-emerald-500" />{" "}
    //                   success
    //                 </span>
    //               </td>
    //               <td className="px-4 py-4">
    //                 <div className="flex items-center gap-2 text-gray-900 font-bold">
    //                   <Radio size={12} className="text-purple-600" /> {evt.type}
    //                 </div>
    //               </td>
    //               <td className="px-4 py-4">
    //                 <span className="px-2 py-0.5 bg-gray-50 rounded text-[9px] font-bold text-gray-600  border border-gray-200">
    //                   {evt.source}
    //                 </span>
    //               </td>
    //               <td className="px-4 py-4">
    //                 <span className="px-2 py-0.5 bg-gray-50 rounded text-[9px] font-bold text-gray-600  border border-gray-200">
    //                   {evt.event}
    //                 </span>
    //               </td>
    //               <td className="px-4 py-4 text-gray-500 font-medium">
    //                 {evt.time}
    //               </td>
    //               <td className="px-4 py-4 text-right">
    //                 <button className="text-[10px] font-black text-blue-600 hover:underline  uppercase transition-all">
    //                   Payload
    //                 </button>
    //               </td>
    //             </tr>
    //           ))}
    //         </tbody>
    //       </table>
    //     </div>
    //   </div>
    // </div>
  );
};

const EventAggregationView = () => {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-8">
        <div className="flex items-center gap-3">
          <Layers size={20} className="text-gray-900" />
          <h2 className="text-lg  text-gray-900">Event Aggregation</h2>
        </div>
        <p className="text-xs text-gray-500 max-w-2xl ">
          Intelligent neural grouping that reduces noise by combining
          high-frequency stream events into semantic summaries for efficient
          ingestion.
        </p>

        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
          <h3 className="text-sm  text-blue-900 mb-2 flex items-center gap-2  ">
            <Shield size={14} />
            What is Neural Aggregation?
          </h3>
          <p className="text-[11px] text-blue-800">
            Aggregation combines high-velocity related events to eliminate
            redundant processing. Instead of individual triggers, Thunai groups
            events by context, source, and time-windows to maintain a
            lightweight but exhaustive Knowledge Graph.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Activity size={16} />
              <h4 className="text-sm  text-gray-600">Pipeline Batching</h4>
            </div>
            <ul className="space-y-2.5">
              {[
                "Groups by source endpoint and type",
                "Deduplicates ingestion triggers",
                "Throughput normalization",
                "Cluster detection",
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 text-xs text-gray-600"
                >
                  <span className="w-1 h-1 bg-blue-500 rounded-full" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-purple-600">
              <Radio size={16} />
              <h4 className="text-sm  text-gray-600">Live Clustering</h4>
            </div>
            <ul className="space-y-2.5">
              {[
                "Windowed rollups (1s - 5m)",
                "Statistical min/max/avg",
                "Trend-based filtering",
                "Context preservation",
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 text-xs text-gray-600"
                >
                  <span className="w-1 h-1 bg-purple-500 rounded-full" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Small Neat Aggregation Stats */}
        {/* <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-[8px] font-black text-emerald-800 uppercase tracking-[0.2em] mb-1">
              Engine Output
            </div>
            <div className="text-2xl font-black text-emerald-700 leading-none">
              4,874
            </div>
            <div className="text-[8px] font-bold text-emerald-600 uppercase mt-1 ">
              Combined Events
            </div>
          </div>
          <div>
            <div className="text-[8px] font-black text-emerald-800 uppercase tracking-[0.2em] mb-1">
              Performance
            </div>
            <div className="text-2xl font-black text-emerald-700 leading-none">
              21%
            </div>
            <div className="text-[8px] font-bold text-emerald-600 uppercase mt-1 ">
              Overhead Reduced
            </div>
          </div>
          <div>
            <div className="text-[8px] font-black text-emerald-800 uppercase tracking-[0.2em] mb-1">
              Quality
            </div>
            <div className="text-2xl font-black text-emerald-700 leading-none">
              98.9%
            </div>
            <div className="text-[8px] font-bold text-emerald-600 uppercase mt-1 ">
              Precision Rate
            </div>
          </div>
          <div>
            <div className="text-[8px] font-black text-emerald-800 uppercase tracking-[0.2em] mb-1">
              Throughput
            </div>
            <div className="text-2xl font-black text-emerald-700 leading-none">
              2.3s
            </div>
            <div className="text-[8px] font-bold text-emerald-600 uppercase mt-1 ">
              Batch Latency
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

// const StreamConfigureView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
//   const tenantID = localStorage.getItem("tenant_id") || "";
//   // Primary Fields
//   const [podName, setPodName] = useState("");
//   const [appName, setAppName] = useState("");
//   const [topicName, setTopicName] = useState("");
//   const [uniqueIdField, setUniqueIdField] = useState("");
//   const [eventType, setEventType] = useState<string[]>([]);

//   const [authType, setAuthType] = useState("OAuth 2.0");
//   const { toast } = useToast();

//   // Advanced Fields
// const [grpcHost, setGrpcHost] = useState("");
// const [grpcPort, setGrpcPort] = useState("");
// const [apiVersion, setApiVersion] = useState("");
// const [showAdvanced, setShowAdvanced] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const apps = [
//     "Salesforce",
//     "ServiceNow",
//     "Jira",
//     "HubSpot",
//     "Zendesk",
//     "Custom Webhook",
//   ];
//   const events = [
//     "Object Created",
//     "Object Updated",
//     "Object Deleted",
//     "Periodic Sync",
//     "Manual Trigger",
//   ];
//   const auths = ["OAuth 2.0", "API Key", "Bearer Token", "Basic Auth", "None"];
// const toggleEvent = (value: string) => {
//   setEventType((prev) =>
//     prev.includes(value)
//       ? prev.filter((v) => v !== value) // remove
//       : [...prev, value] // add
//   );
// };

//   const handleSave = async () => {
//     setIsSaving(true);
//     const payload = {
//       config: {
//         pod_name: podName,
//         topic_name: topicName,
//         unique_id_field: uniqueIdField,
//         application_name: appName,
//         event_type: eventType,
//         grpc_host: grpcHost,
//         grpc_port: parseInt(grpcPort),
//         api_version: apiVersion,
//       },
//     };

//     try {
//       const response = await requestApi(
//         "POST",
//         `brain/streams/${tenantID}/config/`,
//         payload,
//         "brainService",
//       );

//       if (response) {
//         onBack();
//       }
//       toast({
//         description: "Configuration saved successfully",
//         variant: "default",
//       });
//     } catch (error) {
//       console.error("Failed to save configuration:", error);
//       toast({
//         title: "Error",
//         description:
//           error.response?.data?.message ||
//           error.response?.data ||
//           "Something went wrong",
//         variant: "destructive",
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500 pb-10 h-full overflow-y-auto">
//       <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden flex flex-col">
//         {/* Header */}
//         <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={onBack}
//               className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
//             >
//               <ArrowLeft size={18} />
//             </button>
//             <div>
//               <h2 className="text-lg text-gray-900">
//                 Stream Configuration
//               </h2>
//               <p className="text-xs text-gray-500 mt-0.5">
//                 Deployment Metrics & Source Mapping
//               </p>
//             </div>
//           </div>
//           <div className="flex gap-2">
//             <Button
//               onClick={onBack}
//               className="px-4 py-2 bg-white border border-gray-200 text-gray-600  hover:bg-gray-50 transition-all"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSave}
//               disabled={isSaving}
//               className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isSaving ? (
//                 <Loader2 size={14} className="animate-spin" />
//               ) : (
//                 <Save size={14} />
//               )}
//               {isSaving ? "Saving..." : "Save Configuration"}
//             </Button>
//           </div>
//         </div>

//         <div className="p-8 space-y-8">
//           {/* Application Mapping */}
//           <section className="space-y-6">
//             <h3 className="text-base flex items-center gap-2 border-b border-gray-100 pb-1.5">
//               <Box size={12} className="text-blue-500 h-4 w-4" /> Source & Identity
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Pod Name */}
//               <div className="space-y-1.5">
//                 <label className="text-sm text-gray-700  ">
//                   Pod Name
//                 </label>
//                 <div className="relative group">
//                   <Terminal
//                     size={14}
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
//                   />
//                   <Input
//                     type="text"
//                     value={podName}
//                     onChange={(e) => setPodName(e.target.value)}
//                     placeholder="e.g. pod-primary-01"
//                     className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all  text-base"
//                   />
//                 </div>
//               </div>

//               {/* App Name Dropdown */}
//               <div className="space-y-1.5">
//                 <label className="text-sm text-gray-700  ">
//                   Application Name
//                 </label>
//                 <div className="relative">
//                   <Select
//                     value={appName}
//                     onValueChange={(value) => setAppName(value)}
//                   >
//                     <SelectTrigger className="w-full pl-4  py-2.5 bg-gray-50 border border-gray-200 rounded-lg   text-gray-800 appearance-none focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none">
//                       <SelectValue placeholder="Select app" />
//                     </SelectTrigger>

//                     <SelectContent className="bg-white">
//                       {apps.map((app) => (
//                         <SelectItem key={app} value={app}>
//                           {app}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               {/* Topic Name */}
//               <div className="space-y-1.5">
//                 <label className="text-sm text-gray-700 ">
//                  Topic
//                 </label>
//                 <div className="relative group">
//                   <Cloud
//                     size={14}
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
//                   />
//                   <Input
//                     type="text"
//                     value={topicName}
//                     onChange={(e) => setTopicName(e.target.value)}
//                     placeholder="e.g. Account"
//                     className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-xs"
//                   />
//                 </div>
//               </div>

//               {/* Unique ID Field */}
// <div className="space-y-1.5">
//   <label className="text-sm  text-gray-700">
//     Unique Identifier Field
//   </label>
//   <div className="relative group">
//     <Hash
//       size={14}
//       className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
//     />
//     <Input
//       type="text"
//       value={uniqueIdField}
//       onChange={(e) => setUniqueIdField(e.target.value)}
//       placeholder="e.g. Id"
//       className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all  text-xs"
//     />
//   </div>
// </div>
//             </div>
//           </section>

// {/* Advanced Settings */}
// <section className="space-y-4">
//   <button
//     onClick={() => setShowAdvanced(!showAdvanced)}
//     className="flex items-center gap-2 text-base hover:text-blue-600 transition-colors"
//   >
//     <AdvancedIcon size={12} className="h-4 w-4" />
//     {showAdvanced
//       ? "Hide Advanced GRPC"
//       : "Show Advanced GRPC Settings"}
//     {showAdvanced ? (
//       <ChevronDown size={12} className="rotate-180" />
//     ) : (
//       <ChevronDown size={12} />
//     )}
//   </button>

//   {showAdvanced && (
//     <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-6 animate-in slide-in-from-top-2 duration-300">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="space-y-1.5">
//           <label className="text-sm  text-slate-500  ">
//             GRPC Host
//           </label>
//           <Input
//             type="text"
//             value={grpcHost}
//             onChange={(e) => setGrpcHost(e.target.value)}
//             placeholder="api.pubsub.salesforce.com"
//             className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs   focus:ring-4 focus:ring-slate-200 outline-none"
//           />
//         </div>
//         <div className="space-y-1.5">
//           <label className="text-sm  text-slate-500  ">
//             GRPC Port
//           </label>
//           <Input
//             type="number"
//             value={grpcPort}
//             onChange={(e) => setGrpcPort(e.target.value)}
//             placeholder="7443"
//             className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs  focus:ring-4 focus:ring-slate-200 outline-none"
//           />
//         </div>
//         <div className="space-y-1.5 md:col-span-2">
//           <label className="text-sm  text-slate-500  ">
//             API Version
//           </label>
//           <Input
//             type="text"
//             value={apiVersion}
//             onChange={(e) => setApiVersion(e.target.value)}
//             placeholder="v57.0"
//             className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs   focus:ring-4 focus:ring-slate-200 outline-none"
//           />
//         </div>
//       </div>
//     </div>
//   )}
// </section>

//           <div className="pt-4 border-t border-gray-100 flex flex-col items-center text-center space-y-2">
//             <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
//               <Globe size={24} />
//             </div>
//             <h4 className="text-sm  text-gray-900">
//               Edge Propagation
//             </h4>
//             <p className="text-xs text-gray-500 max-w-sm">
//               Saved changes will propagate to edge ingestion nodes
//               automatically. Sync latency is typically &lt; 200ms.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

const StreamConfigureView: React.FC<{
  onBack: () => void,
  selectedStream?: StreamConfigType | null, view?: boolean
}> = ({ onBack, selectedStream, view = false }) => {

  const tenantID = getTenantId()
  const url_identifier = getUrlIdentifier();
  const user_id = getUserId();
  // Primary Fields
  const [podName, setPodName] = useState("");
  const [application_name, setApplication_name] = useState("");
  const [topicName, setTopicName] = useState("");
  const [schemaDef, setSchemaDef] = useState(
    '{\n  "type": "object",\n  "properties": {\n    "id": { "type": "string" },\n    "data": { "type": "object" }\n  }\n}',
  );
  const [uniqueIdField, setUniqueIdField] = useState("");
  const [applications, setApplications] = useState<any[]>([]);
  const [omniData, setOmniData] = useState<any[]>([]);
  const [app_id, setApp_id] = useState("");
  const [widgetsId, setWidgetsId] = useState("");
  const appOptions = ["salesforce", "ServiceNow"];
  const authOptions = ["OAuth 2.0", "JWT Bearer"];

  console.log("selectedStream", selectedStream);

  // console.log("widgetsId",widgetsId);

  // Destination - Restricted to one at a time
  const [selectedDestination, setSelectedDestination] = useState<string[]>([]);

  // Auth Types
  const [authType, setAuthType] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [widgetName, setWidgetName] = useState("");

  // Schema View Toggle
  const [isSchemaExpanded, setIsSchemaExpanded] = useState(false);

  // Specific Auth Fields
  const [jwtIssuer, setJwtIssuer] = useState("");
  const [jwtSecret, setJwtSecret] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [certBody, setCertBody] = useState("");
  const { toast } = useToast();
  const [grpcHost, setGrpcHost] = useState("api.pubsub.salesforce.com");
  const [grpcPort, setGrpcPort] = useState("7443");
  const [apiVersion, setApiVersion] = useState("v60.0");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isFetched, setIsFetched] = useState<boolean>(false);
 const [state, setState] = useState({
  showWitgetCard: false,
  WidgetLoad: false
});
  const widgetNameRef = useRef<HTMLInputElement>(null);
  const handleOAuthConnect = () => {
    setIsConnecting(true);
    // Simulate OAuth Popup
    const popup = window.open(
      "about:blank",
      "oauth_popup",
      "width=500,height=600",
    );
    if (popup) {
      popup.document.write(
        '<html><body style="font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;"><h2>Connecting to Provider...</h2><p>Please authorize Thunai to access your stream.</p><button onclick="window.close()" style="padding:10px 20px;background:#2563eb;color:white;border:none;border-radius:5px;cursor:pointer;">Authorize & Close</button></body></html>',
      );
    }

    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 2000);
  };

  useEffect(() => {
    if (selectedStream) {
      setPodName(selectedStream?.pod_name || "");
      setApp_id(selectedStream?.app_id || "");
      setApplication_name(selectedStream?.application_name || "");
      setTopicName(selectedStream?.topic_name || "");
      setUniqueIdField(selectedStream?.unique_id_field || "");
      setApiVersion(selectedStream?.api_version || "");
      setGrpcPort(selectedStream?.grpc_port ?? "");
      setGrpcHost(selectedStream?.grpc_host ?? "");
      setSelectedDestination(selectedStream?.target_destinations ?? []);
      setWidgetsId(selectedStream?.widget_id ?? "");
      setWidgetName(selectedStream?.query_field ?? "");
      if (selectedStream.schema) {
        setSchemaDef(
          typeof selectedStream.schema === "string"
            ? selectedStream.schema
            : JSON.stringify(selectedStream.schema, null, 2)
        );
      }
    }
  }, [selectedStream]);
  const toggleDestination = (id: string) => {
    setSelectedDestination(
      (prev) =>
        prev.includes(id)
          ? prev.filter((item) => item !== id) // remove
          : [...prev, id], // add
    );
  };
  const validateFields = () => {
    const requiredFields = [
      // { value: podName, label: "Pod name" },
      { value: topicName, label: "Topic name" },
      { value: uniqueIdField, label: "Unique ID field" },
      { value: application_name, label: "Application name" },
    ];

    for (const field of requiredFields) {
      if (!field.value?.trim()) {
        toast({
          title: `${field.label} is required`,
          variant: "destructive",
        });
        return false;
      }
    }

    try {
      JSON.parse(schemaDef);
    } catch (err) {
      toast({
        title: "Schema must be valid JSON",
        description: "Please fix JSON format",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const getApplications = async () => {
    const payload = {
      tenantId: tenantID,
      urlIdentifier: url_identifier,
      userId: user_id,
      is_admin: false,
      type: "event",
    };

    try {
      const response = await requestApi(
        "POST",
        "thunai/service/mcp/get/custom-application",
        payload,
        "mcpService2",
      );

      if (response?.status && response?.data?.length > 0) {
        setApplications(response.data); // store full list
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const FetchAgent = async () => {
    const payload = {
      sort: "desc",
      sortby: "created",
      page: { size: 10, page_number: 1 },
      filter: [
        { key_name: "interface", operator: "in", key_value: ["stream"] },
      ],
    };

    try {
      const response = await requestApi(
        "POST",
        `${tenantID}/common/widget/filter/`,
        payload,
        "authService",
      );

        setOmniData(response?.data?.data);
      
//      const omniMockData = [
//   {
//     id: "69a6c245e07c0c6f99cc3251",
//     pod_name: "omni-summary-pod",
//     topic_name: "/event/Omni_Summary_Stream_Event__e",
//     unique_id_field: "MessagingSession_Id__c",
//     app_id: "69a6c245e07c0c6f99cc3251",
//     query_field: "messages",
//     widget_id: "thunai-hds-69a6c245e07c0c6f99cc3251",
//     application_name: "omni-summary",
//     event_type: null,
//     target_destinations: ["omni"],
//     auth_method: null
//   },
//   {
//     id: "699ef17dcc5ffde46d352a89",
//     pod_name: "omni-email-pod",
//     topic_name: "/event/Omni_Email_Stream_Event__e",
//     unique_id_field: "MessagingSession_Id__c",
//     app_id: "699ef17dcc5ffde46d352a89",
//     query_field: "messages",
//     widget_id: "thunai-hds-699ef17dcc5ffde46d352a89",
//     application_name: "omni-email",
//     event_type: null,
//     target_destinations: ["omni"],
//     auth_method: null
//   },
//   {
//     id: "699d38373daa5d6f0d014379",
//     pod_name: "omni-stream-pod",
//     topic_name: "/event/Omni_Stream_Event__e",
//     unique_id_field: "MessagingSession_Id__c",
//     app_id: "699d38373daa5d6f0d014379",
//     query_field: "messages",
//     widget_id: "thunai-hds-699d38373daa5d6f0d014379",
//     application_name: "omni-stream",
//     event_type: null,
//     target_destinations: ["omni"],
//     auth_method: null
//   }
// ];
//       setOmniData(omniMockData);
    } catch (error) {
      console.error("Error fetching Omnidata:", error);
    }
  };

  useEffect(() => {
    getApplications();
  if (selectedDestination.includes("omni")) {
    FetchAgent();
  }
  }, []);


  const handleSave = async () => {
    if (!validateFields()) return;
    setIsSaving(true);

    const payload: any = {
      config: {
        app_id: app_id,
        pod_name: podName,
        topic_name: topicName,
        unique_id_field: uniqueIdField,
        application_name: application_name,
        schema: JSON.parse(schemaDef),
        target_destinations: selectedDestination,
        grpc_host: grpcHost,
        grpc_port: grpcPort,
        api_version: apiVersion,
      },
    };
    if (selectedDestination.includes("omni")) {
      payload.config.query_field = widgetName
      payload.config.widget_id = widgetsId;
    }
    try {
      const response = await requestApi(
        view ? "PUT" : "POST",
        view ? `brain/streams/${tenantID}/config/${selectedStream?.pod_name}` : `brain/streams/${tenantID}/config/`,
        payload,
        "brainService",
      );

      if (response) {
        onBack();
      }
      toast({
        description: response?.message || "Configuration saved successfully",
        variant: "default",
      });
      setWidgetName("");
    } catch (error: unknown) {
      console.error("Failed to save configuration:", error);
      toast({
        title: "Error",
        description:
          (error as any)?.response?.data?.message ||
          (error as any)?.response?.data ||
          "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const Destination = [
    {
      id: "brain",
      label: "Brain",
      icon: BrainCircuit,
      color: "blue",
      desc: "Sync Graph",
    },
    {
      id: "omni",
      label: "Omni",
      icon: Globe,
      color: "blue",
      desc: "Enterprise Hub",
    },
    {
      id: "agent",
      label: "Agent",
      icon: Globe,
      color: "blue",
      desc: "Automation",
    },
  ];
 const SendWidgetdata = async () => {
  setState(prev => ({
    ...prev,
    WidgetLoad: true
  }));
  try {
    const payload = {
      access_control: {},
      agent_instructions: "",
      agent_language: "",
      agent_name: "",
      agent_voice_id: "",
      description: "",
      enable_share_screen: false,
      info_not_talk_about: "",
      interface: ["stream"],
      name: widgetNameRef.current?.value || "",
      primary_color: "",
      store_conversation_audio: false,
      tools: [],
      widget_bg_color: "",
      widget_position: "",
      widget_template: { is_reasoning: true },
      is_reasoning: true,
      widget_text: "",
      workflow_type: ""
    };

    const response = await requestApi(
      "POST",
      `${tenantID}/common/widget/`,
      payload,
      "authService"
    );

    if (widgetNameRef.current) {
      widgetNameRef.current.value = "";
    }
    toast({
        description: response?.data?.message || "Widget Added successfully",
        variant: "default",
      });
      FetchAgent()
    setState(prev => ({
      ...prev,
      WidgetLoad: false,
      showWitgetCard: false
    }));

  } catch (error: any) {
    toast({
        title: "Error",
        description:
          (error as any)?.response?.data?.message ||
          (error as any)?.response?.data ||
          "Something went wrong",
        variant: "destructive",
      });
    setState(prev => ({
      ...prev,
      WidgetLoad: false,
      showWitgetCard: false
    }));

  }
};
  return (
    <div className="w-full  space-y-6 animate-in slide-in-from-right-4 duration-500 ">
      {/* Schema Detailed View Overlay */}
      {isSchemaExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
          <div
            className="absolute inset-0 bg-slate-900/20 "
            onClick={() => setIsSchemaExpanded(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[80vh] flex flex-col border border-gray-200 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Code size={18} className="text-blue-600" />
                <h3 className="text-gray-900  text-sm ">
                  Schema Detail Editor
                </h3>
              </div>
              <Button
                variant="ghost"
                onClick={() => setIsSchemaExpanded(false)}
                className="border border-gray-200 hover:bg-gray-100 "
              >
                <X size={20} />
              </Button>
            </div>
            <div className="flex-1 p-6 overflow-hidden">
              <Textarea
                value={schemaDef}
                onChange={(e) => setSchemaDef(e.target.value)}
                className="w-full h-full bg-gray-50 text-gray-900 font-mono text-sm rounded-xl p-6 outline-none resize-none border border-gray-200 transition-all"
                spellCheck={false}
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <Button onClick={() => setIsSchemaExpanded(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col w-full">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-100/50">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-xl  text-gray-900 ">Configure Pipeline</h2>
              <p className="text-xs text-gray-500  mt-0.5">
                Stream Ingestion & Routing
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {isSaving ? "Saving..." : "Deploy Stream"}
            </Button>
          </div>
        </div>

        <div className="p-10 space-y-8 h-[calc(100vh-220px)]  overflow-auto">
          {/* Section 1: Source Identification */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Cloud size={18} />
              </div>
              <h3 className="text-[18px]">Source & Metadata</h3>
            </div>

            <div className="grid grid-cols-12 gap-10">
              {/* Left Side: Three Selects/Inputs */}
              <div className="col-span-12 lg:col-span-5 space-y-4">
                <div className="space-y-2">
                  <Label>Application Provider</Label>

                  <Select
                    value={application_name}
                    onValueChange={(value) => {
                      setApplication_name(value); // opt is the display_name itself
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Application" />
                    </SelectTrigger>

                    <SelectContent className="bg-white">
                      {appOptions
                        .filter(
                          (opt) =>
                            opt === application_name ||
                            !applications.some(
                              (app) => app.display_name === opt,
                            ),
                        )
                        .map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label> Pod Name</Label>
                  <Input
                    type="text"
                    value={podName}
                    placeholder="Enter pod name (eg: brain-prod-01)"
                    onChange={(e) => setPodName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label> Topic</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Account"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Unique Identifier Field</Label>
                  <Input
                    type="text"
                    value={uniqueIdField}
                    onChange={(e) => setUniqueIdField(e.target.value)}
                    placeholder="e.g. Id"
                  />
                </div>
              </div>

              {/* Right Side: Validation Schema */}
              <div className="col-span-12 lg:col-span-7 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <Label>Schema (JSON)</Label>
                  <Button onClick={() => setIsSchemaExpanded(true)}>
                    <Maximize2 size={10} /> Detailed View
                  </Button>
                </div>
                <div className="relative group flex-1 min-h-[240px]">
                  <Textarea
                    value={schemaDef}
                    onChange={(e) => setSchemaDef(e.target.value)}
                    className="w-full h-full p-4 bg-gray-50 text-gray-800 font-mono text-sm rounded-xl border border-gray-200 focus:bg-white focus:ring-4 focus:ring-blue-50/50 focus:border-blue-300 outline-none resize-none transition-all"
                  />
                  <div className="absolute bottom-2 right-2 text-[8px]  text-gray-300 uppercase select-none pointer-events-none tracking-tighter">
                    JSON Parser Active
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Destination Routing */}

          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Share2 size={18} />
              </div>
              <h3 className="text-[18px]">Target Destination</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Destination.map((dest) => {
                const isSelected = selectedDestination.includes(dest.id);

                return (
                  <button
                    key={dest.id}
                    onClick={() => toggleDestination(dest.id)}
                    className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all group text-left ${isSelected
                      ? `bg-${dest.color}-50 border-${dest.color}-500 shadow-md`
                      : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div
                      className={`p-3 rounded-xl ${isSelected
                        ? `bg-${dest.color}-600 text-white`
                        : "bg-blue-600 text-white"
                        }`}
                    >
                      <dest.icon size={22} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-base block ${isSelected
                          ? `text-${dest.color}-700`
                          : "text-gray-500"
                          }`}
                      >
                        {dest.label}
                      </span>
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {dest.desc}
                      </p>
                    </div>

                    {isSelected && (
                      <div
                        className={`w-4 h-4 rounded-full bg-${dest.color}-500 flex items-center justify-center`}
                      >
                        <Check
                          size={10}
                          className="text-white"
                          strokeWidth={4}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedDestination.includes("agent") && (
              <div className="space-y-2 w-full">
                <Label>Application Provider</Label>
                <Select
                  value={app_id}
                  onValueChange={(value: any) => {
                    const selectedApp = applications.find(
                      (app) => app._id === value,
                    );

                    setApp_id(value);
                    // setApplication_name(selectedApp?.display_name || "");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Application" />
                  </SelectTrigger>

                  <SelectContent className="bg-white">
                    {
                      applications.length > 0 ? (
                        applications.map((app: any) => (
                          <SelectItem key={app._id} value={app._id}>
                            {app.display_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>
                          No data found
                        </SelectItem>
                      )
                    }
                  </SelectContent>
                </Select>
              </div>
            )}
          </section>

          {selectedDestination.includes("omni") && (
            <div>

              <div className="space-y-2 w-full">
                <Label>Widget Provider</Label>

                <Select value={widgetsId || ""}
                     onValueChange={(value) => {
                       
                       if (value === "create-new-widget") {
                         setState(prev => ({
                           ...prev,
                           showWitgetCard: true
                          }));
                          return;
                        }
                        setWidgetsId(value);
                      }} >
                 <SelectTrigger className="w-full">
                 <SelectValue placeholder="Select widget" />
                </SelectTrigger>

                  <SelectContent className="bg-white">

                   {omniData?.length > 0 ? (
                      omniData.map((app: any) => (
                  <SelectItem
                   key={app.widget_id}
                  value={app.widget_id}
                    >
                  {app.application_name}
                </SelectItem>
                     ))
                  ) : (
                  <SelectItem value="no-data" disabled>
                    No data found
                      </SelectItem>
                   )}

                <SelectItem
                    value="create-new-widget"
                 className="bg-blue-700 text-white"
                        >
                      + Create New widget
                </SelectItem>

                  </SelectContent>
                    </Select>
              </div>
              <div className="mt-4 flex gap-2">
                <label className="mt-1 text-sm">Query field :</label>
                <input
                  type="text"
                  placeholder="eg.id"
                  className="outline-none p-1 border-2 border-indigo-400 rounded-sm"
                  value={widgetName}
                  onChange={(e) => setWidgetName(e.target.value)}
                />
              </div>
            </div>
          )}
          {/* <Select className="bg-white">
    </Select> */}
          {/* Section 3: Authentication Types */}
          {/* <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Lock size={18}/></div>
                <h3 className="text-[18px] ">Authentication Protocol</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label>Auth Method</Label>
                 <Select
  value={authType}
  onValueChange={(value) => {
    setAuthType(value);
    setIsConnected(false);
  }}
>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Select Auth Type" />
  </SelectTrigger>

  <SelectContent className="bg-white">
    {authOptions.map((auth) => (
      <SelectItem key={auth} value={auth}>
        {auth}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

                </div>

                <div className="flex flex-col justify-end">
                  {authType === 'OAuth 2.0' ? (
                     <button 
                        onClick={handleOAuthConnect}
                        disabled={isConnecting || isConnected}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            isConnected 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default shadow-inner' 
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md active:scale-95'
                        }`}
                     >
                       {isConnecting ? <Loader2 size={16} className="animate-spin" /> : isConnected ? <CheckCircle2 size={16} /> : <ExternalLink size={16} />}
                       {isConnecting ? 'Authenticating...' : isConnected ? 'Authorized' : 'Launch Auth Flow'}
                     </button>
                  ) : (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                        <Info size={16} className="text-blue-500" />
                        <span className="text-[10px] font-bold text-blue-700 uppercase">Configuration required below</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 space-y-4">
                  
                  {(authType === 'JWT Bearer' || selectedDestination === 'omni') && (
                    <div className="p-8 bg-gray-900 rounded-2xl space-y-6 animate-in slide-in-from-top-2 border border-slate-700 shadow-xl w-full">
                      <div className="flex items-center justify-between mb-2">
                          <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Fingerprint size={14}/> JWT Assertion Protocol
                          </h4>
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">HS256 / RS256</span>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Issuer (iss)</label>
                              <input type="text" value={jwtIssuer} onChange={e => setJwtIssuer(e.target.value)} placeholder="thunai.io" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs font-mono text-emerald-400 outline-none focus:border-blue-500 transition-colors" />
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Audience (aud)</label>
                              <input type="text" placeholder="https://api.provider.com" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs font-mono text-emerald-400 outline-none focus:border-blue-500 transition-colors" />
                          </div>
                          <div className="col-span-2 space-y-1.5">
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Private Key / Secret</label>
                              <textarea value={jwtSecret} onChange={e => setJwtSecret(e.target.value)} rows={3} placeholder="-----BEGIN PRIVATE KEY-----" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs font-mono text-emerald-400 outline-none focus:border-blue-500 transition-colors resize-none" />
                          </div>
                      </div>
                    </div>
                  )}

                  {authType === 'API Key' && (
                    <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl space-y-4 animate-in slide-in-from-top-2 w-full">
                      <div className="flex items-center gap-2 mb-2">
                         <Key size={16} className="text-gray-400" />
                         <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">API Secret Key</h4>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Key String</label>
                        <input 
                            type="password" 
                            value={apiKey} 
                            onChange={e => setApiKey(e.target.value)} 
                            placeholder="sk_live_..." 
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-mono text-xs outline-none focus:ring-4 focus:ring-blue-100" 
                        />
                      </div>
                    </div>
                  )}

                  {authType === 'Basic Auth' && (
                    <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl space-y-4 animate-in slide-in-from-top-2 w-full">
                       <div className="flex items-center gap-2 mb-2">
                         <UserIcon size={16} className="text-gray-400" />
                         <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Identity Credentials</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Username</label>
                          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-4 focus:ring-blue-100" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-4 focus:ring-blue-100" />
                        </div>
                      </div>
                    </div>
                  )}

                  {authType === 'mTLS (Client Cert)' && (
                    <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl space-y-4 animate-in slide-in-from-top-2 w-full">
                       <div className="flex items-center gap-2 mb-2">
                         <ShieldEllipsis size={16} className="text-gray-400" />
                         <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mutual TLS Handshake</h4>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Client Certificate (PEM)</label>
                        <textarea 
                            value={certBody} 
                            onChange={e => setCertBody(e.target.value)} 
                            rows={4} 
                            placeholder="-----BEGIN CERTIFICATE-----" 
                            className="w-full p-4 bg-white border border-gray-200 rounded-xl font-mono text-[10px] text-gray-600 outline-none focus:ring-4 focus:ring-blue-100 resize-none" 
                        />
                      </div>
                    </div>
                  )}

                </div>
              </div>
           </section> */}
           {state.showWitgetCard && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 px-4">

    <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative animate-fadeIn">

      <button
        onClick={() =>
          setState(prev => ({ ...prev, showWitgetCard: false }))
        }
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
      >
        <X size={15} />
      </button>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Create Widget
      </h2>

      <label className="block text-sm font-medium text-gray-700 mb-2">
        Widget Name
      </label>

      <input
        ref={widgetNameRef}
        type="text"
        placeholder="Enter widget name..."
        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
      />

      <div className="flex justify-end gap-3 mt-6">

        <button
          onClick={() =>
            setState(prev => ({ ...prev, showWitgetCard: false }))
          }
          className="px-5 py-2 text-sm rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          Cancel
        </button>

        <button
          onClick={SendWidgetdata}
          disabled={state.WidgetLoad}
          className="px-5 py-2 rounded-xl text-sm bg-blue-400 hover:opacity-80 text-white "
        >
          {state.WidgetLoad ? "Submitting..." : "Submit"}
        </button>

      </div>

    </div>
  </div>
)}

          {/* Advanced Settings */}
          <section className="space-y-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-[18px] hover:text-blue-600 transition-colors"
            >
              <AdvancedIcon size={12} className="h-4 w-4" />
              {showAdvanced
                ? "Hide Advanced GRPC"
                : "Show Advanced GRPC Settings"}
              {showAdvanced ? (
                <ChevronDown size={12} className="rotate-180" />
              ) : (
                <ChevronDown size={12} />
              )}
            </button>

            {showAdvanced && (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-6 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label>GRPC Host</Label>
                    <Input
                      type="text"
                      value={grpcHost}
                      disabled={true}
                      onChange={(e) => setGrpcHost(e.target.value)}
                      placeholder="api.pubsub.salesforce.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>GRPC Port</Label>
                    <Input
                      type="number"
                      disabled={true}
                      value={grpcPort}
                      onChange={(e) => setGrpcPort(e.target.value)}
                      placeholder="7443"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>API Version</Label>
                    <Input
                      type="text"
                      value={apiVersion}
                      disabled={true}
                      onChange={(e) => setApiVersion(e.target.value)}
                      placeholder="v60.0"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>
          <div className="pt-8 border-t border-gray-100 flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full shadow-inner ring-4 ring-emerald-50/50">
              <Globe size={28} />
            </div>
            <h4 className="text-sm ">Active Edge Deployment</h4>
            <p className="text-xs text-gray-500 max-w-lg ">
              Stream configurations are cryptographically signed and replicated
              across edge clusters globally. Ingestion begins immediately upon
              deployment.
            </p>
          </div>


        </div>
      </div>
    </div>
  );
};
