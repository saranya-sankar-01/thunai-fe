import { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  NodeTypes,
  OnConnect,
  EdgeMouseHandler,
  OnEdgesChange,
  OnNodesChange,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import CustomNode, { NodeData } from "./CustomNode";
import ControlPanel from "./ControlPanel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import NodeEditPanel from "./NodeEditPanel";
import EdgeEditPanel from "./EdgeEditPanel";
import { useLocation } from "react-router-dom";
import Loaders from "../../../components/workflow/common-components/loader";
import AutoSaveIndicator from "../common-components/AutoSaveIndicator";
import { Bot, Loader2 } from "lucide-react";
import { getTenantId, requestApi } from "../../../services/workflow";
import { useWidgetStore } from "../../../stores/widgetStore";

type FlowNode = Node<NodeData>;
type FlowEdge = Edge;

const Toggle = ({ checked, onChange, id }) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
    <label
      htmlFor={id}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
        checked ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </label>
  </div>
);

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const initialNodes: FlowNode[] = [
  {
    id: "1",
    type: "custom",
    position: { x: 450, y: 450 },
    data: {
      label: "Start Node",
      instructions: "Instructions: Start the conversation flow.",
      type: "primary"
    },
  },
];

const initialEdges: FlowEdge[] = [];
const DEBOUNCE_DELAY = 1000;

export default function FlowEditor() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { widgetId } = useWidgetStore();
  const tenantId = getTenantId()
console.log(widgetId);

  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isConversationFlowEnabled, setIsConversationFlowEnabled] =
    useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiPrompt, setAIPrompt] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAutoSave, setLoadingAutoSave] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  //Generate AI
  const [showDropdowns, setShowDropdowns] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [activeTab, setActiveTab] = useState("generate");
  const [showPhoneDropdowns, setShowPhoneDropdowns] = useState(false);
  const [SelectedteamPhone, setSelectedteamPhone] = useState(null);
  const [teamPhone, setTeamPhone] = useState([]);

  // Node edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editNodeId, setEditNodeId] = useState<string | null>(null);
  const [editNodeLabel, setEditNodeLabel] = useState("");
  const [editNodeInstructions, setEditNodeInstructions] = useState("");

  // Node edit panel state
  const [isNodeEditPanelOpen, setIsNodeEditPanelOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);

  // Edge edit panel state
  const [isEdgeEditPanelOpen, setIsEdgeEditPanelOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<FlowEdge | null>(null);
  const [intialized, setIsintialized] = useState(false);
  
  const [mappingLoading, setMappingLoading] = useState(false);

  const logFlowData = useCallback(() => {
    console.log("Current Flow Data:");
    console.log("Nodes:", nodes);
    console.log("Edges:", edges);
  }, [nodes, edges]);

  useEffect(() => {
    logFlowData();
  }, [nodes, edges, logFlowData]);

  //List the Event data
  async function fetchApplications() {
    try {
      setMappingLoading(true); 
      // const response = await fetch(
      //   `https://api.thunai.ai/auth-service/ai/api/v1/${tenantId}/application/webhook/mapping/`,
      //   {
      //     method: "GET",
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );

      // const data = await response.json();
      const response = await requestApi(
      "GET",
      `${tenantId}/application/webhook/mapping/`,
      null,
      "authService"
    );

    const data = response
      if (data.status === "success" && Array.isArray(data.data)) {
        console.log("within update", data.data);
        setApplications(data.data);
        return data.data;
        console.log("value", data);
      } else {
        console.error("Failed to fetch application data");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
     finally {
    setMappingLoading(false); // Stop loading
  }
  }
  //list teams Phone
  async function fetchTeamsPhone() {
    try {
      setMappingLoading(true)
      // const response = await fetch(
      //   `https://api.thunai.ai/auth-service/ai/api/v1/get/widget/applications/${widgetId}/?app=teams phone`,
      //   {
      //     method: "GET",
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       "x-csrftoken": csrfToken || "",
      //     },
      //   }
      // );

      // const data = await response.json();

      const response = await requestApi(
      "GET",
      `get/widget/applications/${widgetId}/?app=teams phone`,
      null,
      "authService"
    );

    const data = response
      if (data.status === "success" && Array.isArray(data.data)) {
        console.log("Teams Phone", data.data);
        setTeamPhone(data.data);
        return data.data;
      } else {
        console.error("Failed to fetch application data");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }finally{
      setMappingLoading(false)
    }
  }

  //List Workflow
  useEffect(() => {
    async function fetchInitialWorkflow() {
      try {
      setMappingLoading(true); 
        // const response = await fetch(
        //   `https://api.thunai.ai/workflow-service/agent-workflow/v1/${tenantId}/list-workflow/?widget_id=${widgetId}&workflow_type=version_3`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //       "x-csrftoken": csrfToken || "",
        //       "Content-Type": "application/json",
        //     },
        //   }
        // );

        // if (!response.ok) {
        //   throw new Error(`API error: ${response.statusText}`);
        // }

        // const data = await response.json();
  const response = await requestApi(
        "GET",
        `${tenantId}/list-workflow/?widget_id=${widgetId}&workflow_type=version_3`,
        null,
        "workflowService"
      );

      const data = response
        const firstWorkflow =
          Array.isArray(data.data) && data.data.length > 0
            ? data.data[0]
            : null;

        if (
          firstWorkflow &&
          Array.isArray(firstWorkflow.nodes) &&
          firstWorkflow.nodes.length > 0
        ) {
          const data = await fetchApplications();
          await fetchTeamsPhone();
          setNodes(firstWorkflow.nodes);
          setEdges(firstWorkflow.edges || []);
          setAIPrompt(firstWorkflow.instructions || "");
          setIsintialized(true);
          setShowDropdowns(firstWorkflow?.enable_event || false);
          setShowPhoneDropdowns(firstWorkflow?.enable_teams_phone || false);
          setSelectedteamPhone(firstWorkflow?.teams_phone || {});
          const applicationData = firstWorkflow?.events_webhook && Array.isArray(firstWorkflow?.events_webhook)
            ? firstWorkflow.events_webhook[0]
            : {};

          if (applicationData) {
            const filteredApplications = data.filter(
              (app) => app.app_id === applicationData.app_id
            );
            if (filteredApplications.length > 0) {
              setSelectedApplication(filteredApplications[0]);
            } else {
              setSelectedApplication(applicationData);
            }
            console.log("application.webhook_id", applicationData.webhook_id);
            setSelectedWebhook(applicationData.webhook_id);
          }
        } else {
          // Fallback
          setNodes(initialNodes);
          setEdges([]);
          setIsintialized(true);
        }
      } catch (error) {
        console.error("Failed to fetch initial workflow:", error);
        setNodes(initialNodes);
        setEdges([]);
      } finally {
        setMappingLoading(false)
        setLoading(false);
        if (!intialized) {
          setIsintialized(true);
        }
      }
    }

    fetchInitialWorkflow();
  }, [setNodes, setEdges]);

  useEffect(() => {
    const handleNodeEdit = (event: CustomEvent) => {
      console.log("Edit node:", event.detail.nodeId);
      const nodeId = event.detail.nodeId;
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setSelectedNode(node as FlowNode);
        setIsNodeEditPanelOpen(true);
      }
    };

    const handleNodeDelete = (event: CustomEvent) => {
      console.log("Delete node:", event.detail.nodeId);
      const nodeId = event.detail.nodeId;
      setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
      setEdges((edges) =>
        edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );

      toast({
        title: "Node Deleted",
        description: "The node has been removed from the flow.",
      });
    };

    // document.addEventListener("nodeclick", handleNodeClick as any);
    document.addEventListener("nodeedit", handleNodeEdit as any);
    document.addEventListener("nodedelete", handleNodeDelete as any);

    return () => {
      // document.removeEventListener("nodeclick", handleNodeClick as any);
      document.removeEventListener("nodeedit", handleNodeEdit as any);
      document.removeEventListener("nodedelete", handleNodeDelete as any);
    };
  }, [nodes, setNodes, setEdges]);

  const onConnect = useCallback<OnConnect>(
    (params) => {
      const newEdge: FlowEdge = {
        ...params,
        id: `e-${params.source}-${params.target}`,
        label: "",
        animated: true,
      };
      setEdges((eds) => addEdge(newEdge, eds as Edge[]) as FlowEdge[]);
      console.log("New edge created:", newEdge);
    },
    [setEdges]
  );

  // Handle node click
  const onEdgeClick: EdgeMouseHandler = useCallback((event, edge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
    setIsEdgeEditPanelOpen(true);
  }, []);

  // Handle edge condition save
  const handleSaveEdge = (id: string, condition: string) => {
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          return {
            ...edge,
            label: condition,
            labelStyle: { fill: "#fff", fontWeight: 500 },
            labelBgStyle: { fill: "rgba(0, 0, 0, 0.7)", fillOpacity: 0.7 },
          };
        }
        return edge;
      })
    );
    setIsEdgeEditPanelOpen(false);
    toast({
      title: "Connection Updated",
      description: "The edge condition has been saved.",
    });
  };

  // Handle edge deletion
  const handleDeleteEdge = (id: string) => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
    toast({
      title: "Connection Deleted",
      description: "The edge has been removed from the flow.",
    });
  };

  // Handle AI generation button click
  const handleGenerateWithAI = useCallback(() => {
    setIsAIDialogOpen(true);
  }, []);

  async function updateWorkflowAPI(nodes: FlowNode[], edges: FlowEdge[]) {
    try {
      setLoadingAutoSave(true);
      setShowSaved(false);
      const body = {
        // workflow_id: "682dcea658055de9f091c46e",
        widget_id: widgetId,
        workflow_type: "version_3",
        connectors: {
          nodes: nodes,
          edges: edges,
        },
      };

      // const response = await fetch(
      //   `https://api.thunai.ai/workflow-service/agent-workflow/v1/${tenantId}/workflow/`,
      //   {
      //     method: "PATCH",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //       "x-csrftoken": csrfToken || ""
      //     },
      //     body: JSON.stringify(body),
      //   }
      // );

      // if (!response.ok) {
      //   throw new Error(`API error: ${response.statusText}`);
      // }

      // const data = await response.json();
      // console.log("Workflow updated successfully:", data);
       const response = await requestApi(
      "PATCH",
      `${tenantId}/workflow/`,
      body,
      "workflowService"
    );
    //  console.log("Workflow updated successfully:", response.data);
    } catch (error) {
      console.error("Failed to update workflow:", error);
      toast({
        title: "Error",
        description: "Failed to update workflow on server.",
      });
    }finally {
      setLoadingAutoSave(false); 
      setShowSaved(true);

      setTimeout(() => {
        setShowSaved(false);
      }, 2000);
    }
  }

  useEffect(() => {
    if (!intialized) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      updateWorkflowAPI(nodes, edges);
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [nodes, edges]);

  const handleAISubmit = useCallback(async () => {
    console.log("Generating with AI prompt:", aiPrompt);
    if (!aiPrompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a prompt before generating.",
      });
      return;
    }

    setLoading(true);
    setIsAIDialogOpen(false);

    try {
      const payload: any = {
        instructions: aiPrompt,
        widget_id: widgetId,
        workflow_type: "version_3"
      };

      // const response = await fetch(
      //   `https://api.thunai.ai/workflow-service/agent-workflow/v1/${tenantId}/generate-workflow/`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //       "x-csrftoken": csrfToken || ""
      //     },
      //     body: JSON.stringify(payload),
      //   }
      // );

      // if (!response.ok) {
      //   throw new Error(`API error: ${response.statusText}`);
      // }

      // const data = await response.json();
       const response = await requestApi(
      "POST",
      `${tenantId}/generate-workflow/`,
      payload,
      "workflowService"
    );

    const data = response
      const newNodes = data.data.nodes;
      const newEdges = data.data.edges;

      setNodes(newNodes);
      setEdges(newEdges);
      // logFlowData();
    } catch (error) {
      console.error("Failed to generate workflow:", error);
      toast({
        title: "Error",
        description: "Failed to generate workflow. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [
    aiPrompt,
    selectedApplication,
    selectedWebhook,
    setNodes,
    setEdges,
    // logFlowData,
  ]);

  const handleAIApplicationSubmit = useCallback(async () => {
    setLoading(true);
    // setIsAIDialogOpen(false);

    try {
      const payload: any = {
        widget_id: widgetId,
        events_webhook: [],
        enable_event: showDropdowns,
        enable_teams_phone: showPhoneDropdowns,
        teams_phone: {},
        workflow_type: "version_3"
      };

      if (selectedApplication && selectedWebhook) {
        const webhook = selectedApplication.event_webhook.find(
          (web: any) => web.id === selectedWebhook
        );
        payload.enable_event = showDropdowns;
        payload.events_webhook.push({
          app_name: selectedApplication.app_name,
          app_id: selectedApplication.app_id,
          webhook_id: webhook.id,
          webhook_name: webhook.name,
        });
      }
      if (
        showPhoneDropdowns &&
        SelectedteamPhone &&
        Object.keys(SelectedteamPhone).length > 0
      ) {
        payload.enable_teams_phone = showPhoneDropdowns;
        payload.teams_phone = SelectedteamPhone;
      }

      // const response = await fetch(
      //   `https://api.thunai.ai/workflow-service/agent-workflow/v1/${tenantId}/generate-workflow/`,
      //   {
      //     method: "PUT",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //       "x-csrftoken": csrfToken || ""
      //     },
      //     body: JSON.stringify(payload),
      //   }
      // );

      // if (!response.ok) {
      //   throw new Error(`API error: ${response.statusText}`);
      // }
const response = await requestApi(
      "PUT",
      `${tenantId}/generate-workflow/`,
      payload,
      "workflowService"
    );
      setActiveTab('generate')
      // const data = await response.json();
 const data = response
      const newNodes = data.data.nodes;
      const newEdges = data.data.edges;

      setNodes(newNodes);
      setEdges(newEdges);
      // logFlowData();
    } catch (error) {
      console.error("Failed to generate workflow:", error);
      toast({
        title: "Error",
        description: "Failed to generate workflow. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [
    aiPrompt,
    selectedApplication,
    showDropdowns,
    SelectedteamPhone,
    showPhoneDropdowns,
    selectedWebhook,
    setNodes,
    setEdges,
    // logFlowData,
  ]);

  // Handle node addition
  const onAddNode = useCallback(() => {
    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type: "custom",
      position: { x: 250, y: 200 + nodes.length * 100 },
      data: {
        label: `New Node ${nodes.length + 1}`,
        instructions: "Edit this node",
        type: "primary"
      },
    };

    setNodes((nodes) => [...nodes, newNode]);
    toast({
      title: "Node Added",
      description: "A new default node has been added to the flow.",
    });
    // logFlowData();
  }, [nodes, setNodes]);

  // Handle node edits
  const handleSaveNodeEdits = (id: string, updates: Partial<NodeData>) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...updates,
            },
          };
        }
        return node;
      })
    );

    setIsNodeEditPanelOpen(false);
    toast({
      title: "Node Updated",
      description: "The node has been updated with your changes.",
    });
    // logFlowData();
  };

  const handleSaveEditNode = useCallback(() => {
    if (!editNodeId) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === editNodeId
          ? {
              ...node,
              data: {
                ...node.data,
                label: editNodeLabel,
                instructions: editNodeInstructions,
              },
            }
          : node
      )
    );

    setIsEditDialogOpen(false);
    toast({
      title: "Node Updated",
      description: "The node has been updated successfully.",
    });
    // logFlowData();
  }, [editNodeId, editNodeLabel, editNodeInstructions, setNodes]);

  const onDeleteSelected = useCallback(() => {
    setNodes([]);
    setEdges([]);

    // logFlowData();
  }, [setNodes, setEdges]);

  const handleToggleChange = (e: any) => {
    setShowDropdowns(e.target.checked);
    if (!e.target.checked) {
      setSelectedApplication("");
    }
  };

  const handlePhoneToggleChange = (e: any) => {
    setShowPhoneDropdowns(e.target.checked);
  };

  const handleApplicationSelect = (e: any) => {
    const selectedAppName = e.target.value;
    const selectedApp = applications.find(
      (app) => app.app_name === selectedAppName
    );
    setSelectedApplication(selectedApp);
    setSelectedWebhook(null);
  };

  const handleTeamPhoneSelect = (e: any) => {
    const selectedAppName = e.target.value;
    const selectedApp = teamPhone.find((app) => app.name === selectedAppName);
    console.log("selectedAppselectedAppselectedAppselectedApp", selectedApp);
    setSelectedteamPhone(selectedApp);
  };

  const handleWebhookSelect = (e: any) => {
    setSelectedWebhook(e.target.value);
  };

  if (loading) {
    return (
      <div>
        <Loaders />
      </div>
    );
  }

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes as Node[]}
        edges={edges}
        onNodesChange={onNodesChange as OnNodesChange<Node>}
        onEdgesChange={onEdgesChange as OnEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
      >
        <Background color="#444" gap={16} />
        <Controls className="bg-gray-800 text-black border hover:shadow-2xl" />
        <MiniMap
          nodeColor={(n) => {
            const node = n as Node<NodeData>;
            if (node.data?.type === "error") return "#ef4444";
            if (node.data?.type === "success") return "#22c55e";
            if (node.data?.type === "primary") return "#6366f1";
            return "#fff";
          }}
          maskColor="rgb(246, 246, 246)"
          className="bg-white"
        />
        <Panel position="top-left">
          <ControlPanel
            onGenerateWithAI={handleGenerateWithAI}
            onToggleConversationFlow={() =>
              setIsConversationFlowEnabled(!isConversationFlowEnabled)
            }
            isConversationFlowEnabled={isConversationFlowEnabled}
            onDeleteSelected={onDeleteSelected}
            onAddNode={onAddNode}
          />
        </Panel>
{mappingLoading && (
<div className="absolute inset-0 flex items-center justify-center z-10">
  <div className=" p-4 rounded-lg  flex flex-col items-center">
    <Bot className="h-8 w-8 animate-spin mx-auto mb-2 text-thunai-primary" />
    <span className="text-sm text-gray-700">Loading data...</span>
  </div>
</div>   
)}
      </ReactFlow>

      <AutoSaveIndicator loadingAutoSave={loadingAutoSave} showSaved={showSaved} />
      {/* AI Dialog */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="bg-white text-black border-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Conversation Flow Generator</DialogTitle>
            <DialogDescription className="text-gray-400">
              Generate and configure your conversation flow
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("generate")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "generate"
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Generate Workflow
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "applications"
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Application Selection
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "generate" && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Describe Your Workflow
                  </label>
                  <Textarea
                    value={aiPrompt}
                    onChange={(e) => setAIPrompt(e.target.value)}
                    className="min-h-[120px]"
                    placeholder="Describe the conversation flow you want the agent to follow..."
                  />
                </div>
              </div>
            )}

            {activeTab === "applications" && (
              <div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        Enable Event-Based Trigger
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Connect your workflow with Event-Based Trigger
                      </p>
                    </div>
                    <Toggle
                      id="showDropdowns"
                      checked={showDropdowns}
                      onChange={handleToggleChange}
                    />
                  </div>

                  {showDropdowns && (
                    <div className="space-y-4">
                      {/* Select Application Dropdown */}
                      <div>
                        <label
                          htmlFor="selectApplication"
                          className="block mb-2 text-sm font-medium text-gray-700"
                        >
                          Select Application
                        </label>
                        <select
                          id="selectApplication"
                          value={selectedApplication?.app_name || ""}
                          onChange={handleApplicationSelect}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-- Choose an Application --</option>
                          {applications.map((app) => (
                            <option key={app.app_id} value={app.app_name}>
                              {app.app_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Webhook Dropdown */}
                      {selectedApplication &&
                        selectedApplication.event_webhook && (
                          <div>
                            <label
                              htmlFor="webhook"
                              className="block mb-2 text-sm font-medium text-gray-700"
                            >
                              Select Webhook
                            </label>
                            <select
                              id="webhook"
                              value={selectedWebhook || ""}
                              onChange={handleWebhookSelect}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">-- Choose a Webhook --</option>
                              {selectedApplication.event_webhook.map(
                                (webhook) => (
                                  <option key={webhook.id} value={webhook.id}>
                                    {webhook.name}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        )}
                    </div>
                  )}
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        Enable Teams Phone
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Connect your workflow with phone calls
                      </p>
                    </div>
                    <Toggle
                      id="showPhoneDropdowns"
                      checked={showPhoneDropdowns}
                      onChange={handlePhoneToggleChange}
                    />
                  </div>

                  {showPhoneDropdowns && (
                    <div className="space-y-4">
                      {/* Select Application Dropdown */}
                      <div>
                        <label
                          htmlFor="selectApplication"
                          className="block mb-2 text-sm font-medium text-gray-700"
                        >
                          Select Incoming phoneNumber
                        </label>
                        <select
                          id="selectApplication"
                          value={SelectedteamPhone?.name || ""}
                          onChange={handleTeamPhoneSelect}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-- Select a Number --</option>
                          {teamPhone.map((app) => (
                            <option key={app.id} value={app.name}>
                              {app.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dialog Actions */}
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsAIDialogOpen(false)}
              >
                Cancel
              </Button>
              {activeTab === "generate" && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleAISubmit}
                    disabled={loading}
                    className="px-8 py-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      "Generate Workflow"
                    )}
                  </Button>
                </div>
              )}

              {activeTab === "applications" && (
                <Button onClick={handleAIApplicationSubmit}>
                  Save Integration
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* In-Node Edit Panel */}
      {isNodeEditPanelOpen && (
        <NodeEditPanel
          node={selectedNode}
          onSave={handleSaveNodeEdits}
          onClose={() => setIsNodeEditPanelOpen(false)}
        />
      )}

      {/* Edge Edit Panel */}
      {isEdgeEditPanelOpen && (
        <EdgeEditPanel
          edge={selectedEdge}
          onSave={handleSaveEdge}
          onDelete={handleDeleteEdge}
          onClose={() => setIsEdgeEditPanelOpen(false)}
        />
      )}
    </div>
  );
}
