// import { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { useLocation } from "react-router-dom";
// import Step2Fields from "./editPopup/Step2Fields";
// import Step3Application from "./editPopup/Step3Application";
// import Step4Authorization from "./editPopup/step4Authorization";
// import Dropdown from "../common-components/dropdown";
// import { useWidgetStore } from '@/stores/widgetStore';
// import { requestApi } from "@/@/services/authService";


// interface NodeEditPanelProps {
//   node: {
//     id: string;
//     data: any;
//   } | null;
//   onSave: (id: string, updates: Partial<any>) => void;
//   onClose: () => void;
// }

// export default function NodeEditPanel({
//   node,
//   onSave,
//   onClose,
// }: NodeEditPanelProps) {
//   const location = useLocation();
//   const searchParams = new URLSearchParams(location.search);
//    const token = localStorage.getItem("agent_token");
//   const { widgetId } = useWidgetStore();
//   const tenantId = localStorage.getItem("tenant_id");
//   const urlIdentifier = localStorage.getItem("url_identifier")
//   const userId = localStorage.getItem("user_id")
//   const csrfToken = localStorage.getItem("csrf_token")

//   const [activeTab, setActiveTab] = useState<
//     "Step1" | "Step2" | "Step3" | "Step4"
//   >("Step1");

//   // Step 1
//   const [title, setTitle] = useState("");
//   const [instructions, setInstructions] = useState("");
//   const [brainOption, setBrainOption] = useState<"instruction" | "link">(
//     "instruction"
//   );
//   const [brainInstruction, setBrainInstruction] = useState("");
//   const [links, setLinks] = useState<any[]>([]);
//   const [dropdownOptions, setDropdownOptions] = useState<
//     { value: string; label: string }[]
//   >([]);
//   // Step 2
//   const [selectedFields, setSelectedFields] = useState<string[]>([]);
//   const [customFields, setCustomFields] = useState<string[]>([]);

//   // Step 3
//   const [applicationName, setApplicationName] = useState("");
//   const [config, setConfig] = useState<any[]>([]);
//   const [selectedConfigId, setSelectedConfigId] = useState<string>("");
//   const [jiraIssueData, setJiraIssueData] = useState<any[]>([]);
//   const [selectedIssueType, setSelectedIssueType] = useState<string>("");
//   const [selectedCustomFields, setSelectedCustomFields] = useState<any>({});
//   const [selectedOperationId, setSelectedOperationId] = useState<string>("");
//   const [isMaster, setIsMaster] = useState<boolean>(null);
//   const [fields, setFields] = useState([]);
//   const [value, setValue] = useState<any[]>([]);
//   const [workflowAgent, setWorkflowagent] = useState<any[]>([]);

//   //Step 4
//   const [isAuthEnabled, setIsAuthEnabled] = useState(false);
//   const [authType, setAuthType] = useState<string>("");
//   const [authInstruction, setAuthInstruction] = useState<string>("");

//   const [finalData, setFinalData] = useState({
//     applicationName: "",
//     applicationTool: "",
//     isMaster: null,
//     brain: {
//       type: "instruction",
//       instruction: "",
//       links: [],
//     },
//     destination: {
//       projectName: "",
//       issueTypeId: "",
//       value: [],
//       authorization: {
//         is_auth: false,
//         auth_type: "",
//         instruction: "",
//       },
//       workflow_agent: [],
//       customFields: [
//         {
//           id: "",
//           name: "",
//           instruction: "",
//         },
//       ],
//     },
//   });

//   // When node data changes, update state
//   useEffect(() => {
//     if (node) {
//       setTitle(node.data.label || "");
//       setInstructions(node.data.instructions || "");
//       setBrainOption(node?.data?.applications?.brain?.type || "instruction");
//       setBrainInstruction(node?.data?.applications?.brain?.instruction || "");
//       setLinks(node?.data?.applications?.brain?.links || [""]);

//       // Set Step 2 data (Fields)
//       console.log("==============>>ode.data.fields", node.data);
//       if (node.data?.applications?.fields) {
//         setSelectedFields(node.data?.applications?.fields?.defaultItems || []);
//         setCustomFields(node.data?.applications?.fields?.customItems || []);
//       }

//       // Set Step 3 data (Application)
//       if (node.data?.applications) {
//         setIsMaster(node.data?.applications?.isMaster || null);
//         setApplicationName(node.data?.applications?.applicationName || "");
//         setSelectedOperationId(node.data.applications?.applicationTool || "");
//         setSelectedConfigId(
//           node.data.applications?.destination?.projectName || ""
//         );
//         setSelectedIssueType(
//           node.data?.applications?.destination?.issueTypeId || ""
//         );
//         setValue(node.data?.applications?.destination?.value || []);
//         setWorkflowagent(
//           node.data?.applications?.destination?.workflow_agent || []
//         );
//         setSelectedCustomFields(
//           node.data?.applications?.destination?.customFields.reduce(
//             (acc: any, field: any) => {
//               acc[field.id] = field;
//               return acc;
//             },
//             {}
//           )
//         );
//         setFields(
//           node.data?.applications?.destination?.customFields.map(
//             (field: any) => ({
//               id: field.id,
//               selectedField: field.id,
//               instructions: field.instruction || "",
//             })
//           )
//         );
//       }

//       if (node.data?.applications) {
//         setIsAuthEnabled(
//           node.data?.applications?.destination?.authorization?.is_auth || false
//         );
//         setAuthType(
//           node.data?.applications?.destination?.authorization?.auth_type || ""
//         );
//         setAuthInstruction(
//           node.data?.applications?.destination?.authorization?.instruction || ""
//         );
//       }
//     }
//   }, [node]);

//   const handleSave = async () => {
//     const fields = {
//       defaultItems: selectedFields,
//       customItems: customFields,
//     };

//     onSave(node.id, {
//       node_id: node.id,
//       label: title,
//       instructions,
//       tool_id: finalData.applicationTool,
//       applications: finalData
//         ? { node_id: node.id, fields: fields, ...finalData }
//         : {},
//     });

//     try {
//       // const response = await fetch(
//       //   `https://api.thunai.ai/workflow-service/mcp/v1/${tenantId}/workflow/destinations/`,
//       //   {
//       //     method: "PATCH",
//       //     headers: {
//       //       "Content-Type": "application/json",
//       //       Authorization: `Bearer ${token}`,
//       //       "x-csrftoken": csrfToken || "",
//       //     },
//       //     body: JSON.stringify({
//       //       widget_id: widgetId,
//       //       workflow_type: "version_3",
//       //       destinations: [{ node_id: node.id, fields: fields, ...finalData }],
//       //     }),
//       //   }
//       // );

//       // if (!response.ok) {
//       //   throw new Error(`API error: ${response.statusText}`);
//       // }

//       // const data = await response.json();
//       // console.log(data);
//       const response = await requestApi(
//       "PATCH",
//       `${localStorage.getItem("tenant_id")}/workflow/destinations/`,
//       {
//         widget_id: widgetId,
//         workflow_type: "version_3",
//         destinations: [{ node_id: node.id, fields: fields, ...finalData }],
//       },
//       "mcpService"
//     );

//     console.log(response.data);
//     } catch (error) {
//       console.error("Failed to generate workflow:", error);
//     }
//   };

//   const handleSelectChange = (
//     option: { value: string; label: string } | null
//   ) => {
//     if (option) {
//       console.log("Selected option:", option);
//       setLinks([option]);

//       console.log("setValue called with:", links);
//     } else {
//       setLinks([]);
//       console.log("Cleared value. setValue called with an empty array");
//     }
//   };

//   const updateFinalData = () => {
//     setFinalData((prevData: any) => ({
//       ...prevData,
//       applicationName: applicationName,
//       applicationTool: selectedOperationId,
//       isMaster: isMaster,
//       brain: {
//         type: brainOption,
//         instruction: brainOption === "instruction" ? brainInstruction : "",
//         links: brainOption === "link" ? links : [],
//       },
//       destination: {
//         ...prevData.destination,
//         projectName: selectedConfigId,
//         issueTypeId: selectedIssueType,
//         value: value,
//         workflow_agent: workflowAgent,
//         authorization: {
//           is_auth: isAuthEnabled,
//           auth_type: authType,
//           instruction: authInstruction,
//         },
//         customFields: fields.map((field) => {
//           const customField = field.selectedField
//             ? selectedCustomFields[field.selectedField]
//             : null;
//           return {
//             id: customField ? customField.id : field.id,
//             name: customField ? customField.name : "",
//             instruction: field.instructions,
//           };
//         }),
//       },
//     }));
//   };

//   // Call updateFinalData whenever there's a change
//   useEffect(() => {
//     console.log("applicationName updated:", applicationName);
//     updateFinalData();
//     console.log("Final Data:", finalData);
//   }, [
//     applicationName,
//     isMaster,
//     selectedOperationId,
//     selectedConfigId,
//     selectedIssueType,
//     fields,
//     isAuthEnabled,
//     authType,
//     authInstruction,
//     value,
//     brainOption,
//     brainInstruction,
//     links,
//     workflowAgent,
//   ]);

//   // Fetch Brain Links Data
//   const fetchBrainLinks = async () => {
//     try {
//       // const response = await fetch(
//       //   `https://api.thunai.ai/auth-service/ai/api/v1/thunai1732825572/brain/links/`,
//       //   {
//       //     method: "GET",
//       //     headers: {
//       //       "Content-Type": "application/json",
//       //       Authorization: `Bearer ${token}`,
//       //       "x-csrftoken": csrfToken || "",
//       //     },
//       //   }
//       // );

//       // if (!response.ok) {
//       //   throw new Error(`Failed to fetch brain links: ${response.statusText}`);
//       // }

//       // const data = await response.json();
//        const response = await requestApi(
//       "GET",
//       `thunai1732825572/brain/links/`,
//       null,
//       "authService"
//     );

//     const data = response.data;
//       if (data.status === "success") {
//         if (data && data.data) {
//           const options = data.data.map((user: any) => ({
//             value: user.id,
//             label: user.title,
//           }));
//           setDropdownOptions(options);
//         }
//       } else {
//         console.error("Error fetching brain links:", data.message);
//       }
//     } catch (error) {
//       console.error("Error fetching brain links:", error);
//     }
//   };

//   useEffect(() => {
//     fetchBrainLinks();
//   }, [token]);

//   useEffect(() => {
//     if (brainOption === "link" && links.length > 0) {
//       setValue([links]);
//       console.log("setValue called with:", [links[0].value]);
//     }
//   }, [links, brainOption]);

//   const selectedOption =
//     dropdownOptions.find((option) => option.value === links[0]?.value) || null;

//   if (!node) return null;

//   return (
//     <div className="fixed top-0 right-0 h-full bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200 w-[500px] min-w-[500px] max-w-[500px]">
//       {/* Header */}
//       <div className="flex items-center justify-start p-4 border-b border-gray-200 bg-gray-50">
//         <button
//           onClick={onClose}
//           className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors mr-4"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="20"
//             height="20"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//             className="w-5 h-5"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M6 18L18 6M6 6l12 12"
//             />
//           </svg>
//         </button>
//         <h2 className="text-lg font-semibold text-gray-900">Edit Node</h2>
//       </div>

//       {/* Step Navigation */}
//       <div className="p-4 border-b border-gray-200">
//         <nav className="flex items-center justify-between">
//           {/* Step 1 */}
//           <div className="flex flex-col items-center">
//             <button
//               onClick={() => setActiveTab("Step1")}
//               className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors mb-2 ${
//                 activeTab === "Step1"
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-300 text-gray-600 hover:bg-gray-400"
//               }`}
//             >
//               1
//             </button>
//             <span
//               className={`text-xs text-center leading-tight ${
//                 activeTab === "Step1"
//                   ? "text-blue-600 font-medium"
//                   : "text-gray-500"
//               }`}
//             >
//               Title &<br />
//               Instructions
//             </span>
//           </div>

//           {/* Connector Line */}
//           <div className="flex-1 h-px bg-gray-300 mx-2 mt-[-20px]"></div>

//           {/* Step 2 */}
//           <div className="flex flex-col items-center">
//             <button
//               onClick={() => setActiveTab("Step2")}
//               className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors mb-2 ${
//                 activeTab === "Step2"
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-300 text-gray-600 hover:bg-gray-400"
//               }`}
//             >
//               2
//             </button>
//             <span
//               className={`text-xs text-center ${
//                 activeTab === "Step2"
//                   ? "text-blue-600 font-medium"
//                   : "text-gray-500"
//               }`}
//             >
//               Fields
//             </span>
//           </div>

//           {/* Connector Line */}
//           <div className="flex-1 h-px bg-gray-300 mx-2 mt-[-20px]"></div>

//           {/* Step 3 */}
//           <div className="flex flex-col items-center">
//             <button
//               onClick={() => setActiveTab("Step3")}
//               className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors mb-2 ${
//                 activeTab === "Step3"
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-300 text-gray-600 hover:bg-gray-400"
//               }`}
//             >
//               3
//             </button>
//             <span
//               className={`text-xs text-center ${
//                 activeTab === "Step3"
//                   ? "text-blue-600 font-medium"
//                   : "text-gray-500"
//               }`}
//             >
//               Application
//             </span>
//           </div>

//           {/* Connector Line */}
//           <div className="flex-1 h-px bg-gray-300 mx-2 mt-[-20px]"></div>

//           {/* Step 4 */}
//           <div className="flex flex-col items-center">
//             <button
//               onClick={() => setActiveTab("Step4")}
//               className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors mb-2 ${
//                 activeTab === "Step4"
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-300 text-gray-600 hover:bg-gray-400"
//               }`}
//             >
//               4
//             </button>
//             <span
//               className={`text-xs text-center ${
//                 activeTab === "Step4"
//                   ? "text-blue-600 font-medium"
//                   : "text-gray-500"
//               }`}
//             >
//               Authorization
//             </span>
//           </div>
//         </nav>
//       </div>

//       {/* Content Area */}
//       <div className="flex-1 overflow-y-auto p-4">
//         {/* Step 1: Title & Instructions */}
//         {activeTab === "Step1" && (
//           <div className="space-y-6">
//             {/* Title */}
//             <div className="space-y-2">
//               <label
//                 htmlFor="title"
//                 className="text-sm font-medium text-gray-700"
//               >
//                 Title
//               </label>
//               <Input
//                 id="title"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 className="border-gray-300 text-gray-900"
//               />
//             </div>

//             {/* Instructions */}
//             <div className="space-y-2">
//               <label
//                 htmlFor="instructions"
//                 className="text-sm font-medium text-gray-700"
//               >
//                 Instructions
//               </label>
//               <Textarea
//                 id="instructions"
//                 value={instructions}
//                 onChange={(e) => setInstructions(e.target.value)}
//                 className="border-gray-300 text-gray-900 min-h-[100px]"
//               />
//             </div>

//             {/* Brain Section */}
//             <div className="space-y-4 border-t border-gray-200 pt-4">
//               <h4 className="text-sm font-semibold text-gray-700">
//                 Brain Configuration
//               </h4>

//               {/* Radio Buttons */}
//               <div className=" flex item-centre">
//                 <label className="flex items-center space-x-2 cursor-pointer mr-3">
//                   <input
//                     type="radio"
//                     name="brainOption"
//                     value="instruction"
//                     checked={brainOption === "instruction"}
//                     onChange={() => setBrainOption("instruction")}
//                     className="text-blue-600 focus:ring-blue-500"
//                   />
//                   <span className="text-sm text-gray-700">Instruction</span>
//                 </label>
//                 <label className="flex items-center space-x-2 cursor-pointer">
//                   <input
//                     type="radio"
//                     name="brainOption"
//                     value="link"
//                     checked={brainOption === "link"}
//                     onChange={() => setBrainOption("link")}
//                     className="text-blue-600 focus:ring-blue-500"
//                   />
//                   <span className="text-sm text-gray-700">Link</span>
//                 </label>
//               </div>

//               {/* Conditional Brain Fields */}
//               {brainOption === "instruction" && (
//                 <div className="space-y-2">
//                   <label className="text-xs font-medium text-gray-600">
//                     Brain Instruction
//                   </label>
//                   <Textarea
//                     placeholder="Enter brain instruction..."
//                     value={brainInstruction}
//                     onChange={(e) => setBrainInstruction(e.target.value)}
//                     className="border-gray-300 text-gray-900 min-h-[80px]"
//                   />
//                 </div>
//               )}

//               {brainOption === "link" && (
//                 <div className="space-y-2">
//                   <Dropdown
//                     heading=""
//                     label="Select Brain Link"
//                     options={dropdownOptions}
//                     isMulti={false}
//                     value={selectedOption}
//                     onChange={handleSelectChange}
//                   />
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Step 2: Fields */}
//         {activeTab === "Step2" && (
//           <Step2Fields
//             selectedFields={selectedFields}
//             setSelectedFields={setSelectedFields}
//             customFields={customFields}
//             setCustomFields={setCustomFields}
//           />
//         )}

//         {/* Step 3: Application */}
//         {activeTab === "Step3" && (
//           <Step3Application
//             setApplicationName={setApplicationName}
//             applicationName={applicationName}
//             setIsMaster={setIsMaster}
//             isMaster={isMaster}
//             setConfig={setConfig}
//             config={config}
//             selectedConfigId={selectedConfigId}
//             setSelectedConfigId={setSelectedConfigId}
//             jiraIssueData={jiraIssueData}
//             setJiraIssueData={setJiraIssueData}
//             selectedIssueType={selectedIssueType}
//             setSelectedIssueType={setSelectedIssueType}
//             setSelectedCustomFields={setSelectedCustomFields}
//             selectedCustomFields={selectedCustomFields}
//             setSelectedOperationId={setSelectedOperationId}
//             selectedOperationId={selectedOperationId}
//             setFields={setFields}
//             fields={fields}
//             value={value}
//             setValue={setValue}
//             setWorkflowagent={setWorkflowagent}
//             workflowAgent={workflowAgent}
//           />
//         )}

//         {/* Step 4: Authorization */}
//         {activeTab === "Step4" && (
//           <Step4Authorization
//             isAuthEnabled={isAuthEnabled}
//             setIsAuthEnabled={setIsAuthEnabled}
//             authType={authType}
//             setAuthType={setAuthType}
//             instruction={authInstruction}
//             setInstruction={setAuthInstruction}
//           />
//         )}
//       </div>

//       {/* Footer Actions */}
//       <div className="p-4 border-t border-gray-200 bg-gray-50">
//         <div className="flex justify-between space-x-3">
//           {activeTab !== "Step1" && (
//             <Button
//               onClick={() => {
//                 if (activeTab === "Step2") setActiveTab("Step1");
//                 if (activeTab === "Step3") setActiveTab("Step2");
//                 if (activeTab === "Step4") setActiveTab("Step3");
//               }}
//               variant="default"
//               className="flex-1 mb-9"
//             >
//               Previous
//             </Button>
//           )}

//           {activeTab !== "Step4" ? (
//             <Button
//               onClick={() => {
//                 if (activeTab === "Step1") setActiveTab("Step2");
//                 if (activeTab === "Step2") setActiveTab("Step3");
//                 if (activeTab === "Step3") setActiveTab("Step4");
//               }}
//               className="flex-1 bg-blue-600 hover:bg-blue-700 mb-9"
//             >
//               Next
//             </Button>
//           ) : (
//             <Button
//               onClick={handleSave}
//               className="flex-1 bg-blue-600 hover:bg-blue-700"
//               disabled={!title || !instructions}
//             >
//               Save Changes
//             </Button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import Step2Fields from "./editPopup/Step2Fields";
import Step3Application from "./editPopup/Step3Application";
import Step4Authorization from "./editPopup/step4Authorization";
import Dropdown from "../common-components/dropdown";
import { useWidgetStore } from '../../../stores/widgetStore';
import { getTenantId, requestApi } from "@/services/authService";
import { v4 as uuidv4 } from "uuid";


interface NodeEditPanelProps {
  node: {
    id: string;
    data: any;
  } | null;
  onSave: (id: string, updates: Partial<any>) => void;
  onClose: () => void;
}

export default function NodeEditPanel({
  node,
  onSave,
  onClose,
}: NodeEditPanelProps) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const { widgetId } = useWidgetStore();
  const tenantId = getTenantId()
 

  const [activeTab, setActiveTab] = useState<
    "Step1" | "Step2" | "Step3" | "Step4"
  >("Step1");

  // Step 1
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [brainOption, setBrainOption] = useState<"instruction" | "link">(
    "instruction"
  );
  const [brainInstruction, setBrainInstruction] = useState("");
  const [links, setLinks] = useState<any[]>([]);
  const [dropdownOptions, setDropdownOptions] = useState<
    { value: string; label: string }[]
  >([]);
  // Step 2
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [customFields, setCustomFields] = useState<string[]>([]);

  // Step 3
  const [applicationName, setApplicationName] = useState("");
  const [config, setConfig] = useState<any[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string>("");
  const [jiraIssueData, setJiraIssueData] = useState<any[]>([]);
  const [selectedIssueType, setSelectedIssueType] = useState<string>("");
  const [selectedCustomFields, setSelectedCustomFields] = useState<any>({});
  const [selectedOperationId, setSelectedOperationId] = useState<string>("");
  const [isMaster, setIsMaster] = useState<boolean>(null);
  const [fields, setFields] = useState([]);
  const [value, setValue] = useState<any[]>([]);
  const [workflowAgent, setWorkflowagent] = useState<any[]>([]);
const [showTransfer, setShowTransfer] = useState(false);
  //Step 4
  const [isAuthEnabled, setIsAuthEnabled] = useState(false);
  const [authType, setAuthType] = useState<string>("");
  const [authInstruction, setAuthInstruction] = useState<string>("");
const [forms, setForms] = useState<any[]>([]);
  const [finalData, setFinalData] = useState({
 
    brain: {
      type: "instruction",
      instruction: "",
      links: [],
    },
    destination: {
      projectName: "",
      issueTypeId: "",
      value: [],
      authorization: {
        is_auth: false,
        auth_type: "",
        instruction: "",
      },
      workflow_agent: [],
      customFields: [
        {
          id: "",
          name: "",
          instruction: "",
        },
      ],
    },
  });

// useEffect(() => {
//   if (!node) return;

//   // Step 1: Basic details
//   setTitle(node.data.label || "");
//   setInstructions(node.data.instructions || "");

//   // Step 1: Brain setup
//   setBrainOption(node?.data?.applications?.brain?.type || "instruction");
//   setBrainInstruction(node?.data?.applications?.brain?.instruction || "");
//   setLinks(node?.data?.applications?.brain?.links || [""]);

//   // Step 2: Fields
//   if (node.data?.applications?.fields) {
//     setSelectedFields(node.data?.applications?.fields?.defaultItems || []);
//     setCustomFields(node.data?.applications?.fields?.customItems || []);
//   }

//   // Step 3: Application forms
// if (node.data?.applications?.tools && Array.isArray(node.data.applications.tools)) {
//   const destinations = Array.isArray(node.data.applications.destination)
//     ? node.data.applications.destination
//     : [];

//   setForms(
//     node.data.applications.tools.map((tool: any, index: number) => {
//       const destination = destinations[index] || {};

//       return {
//         applicationName: tool.applicationName || "",
//         isMaster: tool.isMaster || false,
//         selectedOperationId: tool.applicationTool || "",
//         selectedConfigId: destination.projectName || "",
//         selectedIssueType: destination.issueTypeId || "",
//         value: tool.value || [],
      
//         //  setValue(node.data?.applications?.destination?.value || []);
//         workflowAgent:
//           destination.workflow_agent ||
//           node.data.applications.destination?.workflow_agent ||
//           [],
//         selectedCustomFields:
//           tool?.customFields?.reduce((acc: any, field: any) => {
//             acc[field.id] = field;
//             return acc;
//           }, {}) || {},
//         fields:
//           tool?.customFields?.map((field: any) => ({
//             id: field.id,
//             selectedField: field.id,
//             instructions: field.instruction || "",
//           })) || [],
//         config: {},
//         jiraIssueData: [],
//         configLoading: false,
//         jiraLoading: false,
//         error: "",
//       };
//     })
//   );
// }

//   else {
//     // Initialize with one blank form if no tools exist
//     setForms([
//       {
//         applicationName: "",
//         isMaster: false,
//         selectedOperationId: "",
//         selectedConfigId: "",
//         selectedIssueType: "",
//         value: [],
//         workflowAgent: node.data.applications?.destination?.workflow_agent || [],
//         selectedCustomFields: {},
//         fields: [],
//         config: {},
//         jiraIssueData: [],
//         configLoading: false,
//         jiraLoading: false,
//         error: "",
//       },
//     ]);
//   }

//   // Step 4: Authorization
//   if (node.data?.applications?.destination?.authorization) {
//     setIsAuthEnabled(
//       node.data.applications.destination.authorization.is_auth || false
//     );
//     setAuthType(
//       node.data.applications.destination.authorization.auth_type || ""
//     );
//     setAuthInstruction(
//       node.data.applications.destination.authorization.instruction || ""
//     );
//   }
// }, [node]);
useEffect(() => {
  if (!node) return;

  // Step 1: Basic details
  setTitle(node.data.label || "");
  setInstructions(node.data.instructions || "");

  // Step 1: Brain setup
  setBrainOption(node?.data?.applications?.brain?.type || "instruction");
  setBrainInstruction(node?.data?.applications?.brain?.instruction || "");
  setLinks(node?.data?.applications?.brain?.links || [""]);

  // Step 2: Fields
  if (node.data?.applications?.fields) {
    setSelectedFields(node.data?.applications?.fields?.defaultItems || []);
    setCustomFields(node.data?.applications?.fields?.customItems || []);
  }

  // Step 3: Application forms
  const tools = Array.isArray(node.data?.applications?.tools)
    ? node.data.applications.tools
    : [];
  const destinations = Array.isArray(node.data?.applications?.destination)
    ? node.data.applications.destination
    : node.data?.applications?.destination
    ? [node.data.applications.destination]
    : [];
const initialWorkflowAgent = destinations.length > 0 
  ? (destinations[0].workflow_agent || [])
  : (node.data?.applications?.destination?.workflow_agent || []);

setWorkflowagent(initialWorkflowAgent);
 setShowTransfer(initialWorkflowAgent.length > 0); 
  if (tools.length > 0) {
    setForms(
      tools.map((tool: any, index: number) => {
        const destination = destinations[index] || {};

        return {
               id:  uuidv4(), 
          applicationName: tool.applicationName || "",
          isMaster: tool.isMaster ,
          selectedOperationId: tool.applicationTool || "",
          selectedConfigId: destination.projectName || "",
          selectedIssueType: destination.issueTypeId || "",
          value: destination.value || tool.value || [],
              tableName: tool.table_name || "",
              socketUrl: tool.socket_url || "",
              type: tool.type || "",
          workflowAgent:
            destination.workflow_agent ||
            node.data.applications.destination?.workflow_agent ||
            [],
          selectedCustomFields:
            (tool.customFields || []).reduce((acc: any, field: any) => {
              acc[field.id] = field;
              return acc;
            }, {}) || {},
          fields:
            (tool.customFields || []).map((field: any) => ({
              id: field.id,
              selectedField: field.id,
              instructions: field.instruction || "",
            })) || [],
          config: {},
          jiraIssueData: [],
          configLoading: false,
          jiraLoading: false,
          error: "",
             stages: destination.stages || null,
        };
      })
    );
  }

  // Step 4: Authorization
  if (node.data?.applications?.destination?.authorization) {
    setIsAuthEnabled(
      node.data.applications.destination.authorization.is_auth || false
    );
    setAuthType(
      node.data.applications.destination.authorization.auth_type || ""
    );
    setAuthInstruction(
      node.data.applications.destination.authorization.instruction || ""
    );
  }
}, [node]);

  const handleSave = async () => {
    const fields = {
      defaultItems: selectedFields,
      customItems: customFields,
    };

    onSave(node.id, {
      node_id: node.id,
      label: title,
      instructions,
      // tool_id: finalData?.applicationTool,
      applications: finalData
        ? { node_id: node.id, fields: fields, ...finalData }
        : {},
    });

    try {
      // const response = await fetch(
      //   `https://api.thunai.ai/workflow-service/mcp/v1/${tenantId}/workflow/destinations/`,
      //   {
      //     method: "PATCH",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //       "x-csrftoken": csrfToken || "",
      //     },
      //     body: JSON.stringify({
      //       widget_id: widgetId,
      //       workflow_type: "version_3",
      //       destinations: [{ node_id: node.id, fields: fields, ...finalData }],
      //     }),
      //   }
      // );

      // if (!response.ok) {
      //   throw new Error(`API error: ${response.statusText}`);
      // }

      // const data = await response.json();
      // console.log(data);
      const response = await requestApi(
      "PATCH",
      `${tenantId}/workflow/destinations/`,
      {
        widget_id: widgetId,
        workflow_type: "version_3",
        destinations: [{ node_id: node.id, fields: fields, ...finalData }],
      },
      "mcpService"
    );

    // console.log(response);
    } catch (error) {
      console.error("Failed to generate workflow:", error);
    }
  };

  const handleSelectChange = (
    option: { value: string; label: string } | null
  ) => {
    if (option) {
      console.log("Selected option:", option);
      setLinks([option]);

      console.log("setValue called with:", links);
    } else {
      setLinks([]);
      console.log("Cleared value. setValue called with an empty array");
    }
  };

  // const updateFinalData = () => {
  //   setFinalData((prevData: any) => ({
  //     ...prevData,
  //     applicationName: applicationName,
  //     applicationTool: selectedOperationId,
  //     isMaster: isMaster,
  //     brain: {
  //       type: brainOption,
  //       instruction: brainOption === "instruction" ? brainInstruction : "",
  //       links: brainOption === "link" ? links : [],
  //     },
  //     destination: {
  //       ...prevData.destination,
  //       projectName: selectedConfigId,
  //       issueTypeId: selectedIssueType,
  //       value: value,
  //       workflow_agent: workflowAgent,
  //       authorization: {
  //         is_auth: isAuthEnabled,
  //         auth_type: authType,
  //         instruction: authInstruction,
  //       },
  //       customFields: fields.map((field) => {
  //         const customField = field.selectedField
  //           ? selectedCustomFields[field.selectedField]
  //           : null;
  //         return {
  //           id: customField ? customField.id : field.id,
  //           name: customField ? customField.name : "",
  //           instruction: field.instructions,
  //         };
  //       }),
  //     },
  //   }));
  // };

  // Call updateFinalData whenever there's a change
  const updateFinalData = () => {
  setFinalData((prevData: any) => ({
    ...prevData,
    brain: {
      type: brainOption,
      instruction: brainOption === "instruction" ? brainInstruction : "",
      links: brainOption === "link" ? links : [],
    },
    tools: forms.map(form => ({
      applicationName: form.applicationName,
      applicationTool: form.selectedOperationId,
      isMaster: form.isMaster,
      value: form.value,
        ...(form.applicationName === 'thunaidb' && { table_name: form.tableName }), 
      ...(form.applicationName === 'reflect' && { reflect_project_id: form.selectedConfigId }),
        ...(form.applicationName === 'socket' && { socket_url: form.socketUrl, type: form.type }),
      customFields: form.fields.map((field: any) => {
        const customField = field.selectedField
          ? form.selectedCustomFields[field.selectedField]
          : null;
        return {
          id: customField ? customField.id : field.id,
          name: customField ? customField.name : "",
          instruction: field.instructions,
        };
      }),
      //  stages: form.stages,
    })),
  destination: (forms.length ? forms : [{}]).map((form: any) => ({
  projectName: form.selectedConfigId || "",
  issueTypeId: form.selectedIssueType || "",
    authorization: {
      is_auth: isAuthEnabled,
      auth_type: authType,
      instruction: authInstruction,
    },
     workflow_agent: showTransfer ? (workflowAgent || []) : [], 
     stages: form.stages || [], 
  })),
  }));
};
  // useEffect(() => {
  //   console.log("applicationName updated:", applicationName);
  //   updateFinalData();
  //   console.log("Final Data:", finalData);
  // }, [
  //   applicationName,
  //   isMaster,
  //   selectedOperationId,
  //   selectedConfigId,
  //   selectedIssueType,
  //   fields,
  //   isAuthEnabled,
  //   authType,
  //   authInstruction,
  //   value,
  //   brainOption,
  //   brainInstruction,
  //   links,
  //   workflowAgent,
  // ]);
useEffect(() => {
  console.log("Forms updated:", forms);
  updateFinalData();
  console.log("Final Data:", finalData);
}, [
  forms,
  isAuthEnabled,
  authType,
  authInstruction,
  brainOption,
  brainInstruction,
  links,
  workflowAgent,showTransfer 
]);
  // Fetch Brain Links Data
  const fetchBrainLinks = async () => {
    try {
      // const response = await fetch(
      //   `https://api.thunai.ai/auth-service/ai/api/v1/thunai1732825572/brain/links/`,
      //   {
      //     method: "GET",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //       "x-csrftoken": csrfToken || "",
      //     },
      //   }
      // );

      // if (!response.ok) {
      //   throw new Error(`Failed to fetch brain links: ${response.statusText}`);
      // }

      // const data = await response.json();
       const response = await requestApi(
      "GET",
      `${tenantId}/brain/links/`,
      null,
      "authService"
    );

    const data = response
      if (data.status === "success") {
        if (data && data.data) {
          const options = data.data.map((user: any) => ({
            value: user.id,
            label: user.title,
          }));
          setDropdownOptions(options);
        }
      } else {
        console.error("Error fetching brain links:", data.message);
      }
    } catch (error) {
      console.error("Error fetching brain links:", error);
    }
  };

  useEffect(() => {
    fetchBrainLinks();
  }, []);

  useEffect(() => {
    if (brainOption === "link" && links.length > 0) {
      setValue([links]);
      console.log("setValue called with:", [links[0].value]);
    }
  }, [links, brainOption]);

  const selectedOption =
    dropdownOptions.find((option) => option.value === links[0]?.value) || null;

  if (!node) return null;

  return (
    <div className="fixed top-0 right-0 h-full bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200 w-[500px] min-w-[500px] max-w-[500px]">
      {/* Header */}
      <div className="flex items-center justify-start p-4 border-b border-gray-200 bg-gray-50">
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors mr-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Edit Node</h2>
      </div>

      {/* Step Navigation */}
      <div className="p-4 border-b border-gray-200">
        <nav className="flex items-center justify-between">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setActiveTab("Step1")}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors mb-2 ${
                activeTab === "Step1"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-600 hover:bg-gray-400"
              }`}
            >
              1
            </button>
            <span
              className={`text-xs text-center leading-tight ${
                activeTab === "Step1"
                  ? "text-blue-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              Title &<br />
              Instructions
            </span>
          </div>

          {/* Connector Line */}
          <div className="flex-1 h-px bg-gray-300 mx-2 mt-[-20px]"></div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setActiveTab("Step2")}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors mb-2 ${
                activeTab === "Step2"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-600 hover:bg-gray-400"
              }`}
            >
              2
            </button>
            <span
              className={`text-xs text-center ${
                activeTab === "Step2"
                  ? "text-blue-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              Fields
            </span>
          </div>

          {/* Connector Line */}
          <div className="flex-1 h-px bg-gray-300 mx-2 mt-[-20px]"></div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setActiveTab("Step3")}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors mb-2 ${
                activeTab === "Step3"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-600 hover:bg-gray-400"
              }`}
            >
              3
            </button>
            <span
              className={`text-xs text-center ${
                activeTab === "Step3"
                  ? "text-blue-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              Integration
            </span>
          </div>

          {/* Connector Line */}
          <div className="flex-1 h-px bg-gray-300 mx-2 mt-[-20px]"></div>

          {/* Step 4 */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setActiveTab("Step4")}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors mb-2 ${
                activeTab === "Step4"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-600 hover:bg-gray-400"
              }`}
            >
              4
            </button>
            <span
              className={`text-xs text-center ${
                activeTab === "Step4"
                  ? "text-blue-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              Authorization
            </span>
          </div>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Step 1: Title & Instructions */}
        {activeTab === "Step1" && (
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-gray-300 text-gray-900"
              />
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <label
                htmlFor="instructions"
                className="text-sm font-medium text-gray-700"
              >
                Instructions
              </label>
              <Textarea
                id="instructions"
                value={instructions}
                rows={10}
                onChange={(e) => setInstructions(e.target.value)}
                className="border-gray-300 text-gray-900 min-h-[100px]"
              />
            </div>

            {/* Brain Section */}
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-700">
                Brain Configuration
              </h4>

              {/* Radio Buttons */}
              <div className=" flex item-centre">
                <label className="flex items-center space-x-2 cursor-pointer mr-3">
                  <input
                    type="radio"
                    name="brainOption"
                    value="instruction"
                    checked={brainOption === "instruction"}
                    onChange={() => setBrainOption("instruction")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Instruction</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="brainOption"
                    value="link"
                    checked={brainOption === "link"}
                    onChange={() => setBrainOption("link")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Link</span>
                </label>
              </div>

              {/* Conditional Brain Fields */}
              {brainOption === "instruction" && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">
                    Brain Instruction
                  </label>
                  <Textarea
                    placeholder="Enter brain instruction..."
                    value={brainInstruction}
                    rows={10}
                    onChange={(e) => setBrainInstruction(e.target.value)}
                    className="border-gray-300 text-gray-900 min-h-[80px]"
                  />
                </div>
              )}

              {brainOption === "link" && (
                <div className="space-y-2">
                  <Dropdown
                    heading=""
                    label="Select Brain Link"
                    options={dropdownOptions}
                    isMulti={false}
                    value={selectedOption}
                    onChange={handleSelectChange}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Fields */}
        {activeTab === "Step2" && (
          <Step2Fields
            selectedFields={selectedFields}
            setSelectedFields={setSelectedFields}
            customFields={customFields}
            setCustomFields={setCustomFields}
          />
        )}

        {/* Step 3: Application */}
        {/* {activeTab === "Step3" && (
          <Step3Application
            setApplicationName={setApplicationName}
            applicationName={applicationName}
            setIsMaster={setIsMaster}
            isMaster={isMaster}
            setConfig={setConfig}
            config={config}
            selectedConfigId={selectedConfigId}
            setSelectedConfigId={setSelectedConfigId}
            jiraIssueData={jiraIssueData}
            setJiraIssueData={setJiraIssueData}
            selectedIssueType={selectedIssueType}
            setSelectedIssueType={setSelectedIssueType}
            setSelectedCustomFields={setSelectedCustomFields}
            selectedCustomFields={selectedCustomFields}
            setSelectedOperationId={setSelectedOperationId}
            selectedOperationId={selectedOperationId}
            setFields={setFields}
            fields={fields}
            value={value}
            setValue={setValue}
            setWorkflowagent={setWorkflowagent}
            workflowAgent={workflowAgent}
          />
        )} */}
{activeTab === "Step3" && (
  <Step3Application
    forms={forms}
    setForms={setForms}
      setWorkflowagent={setWorkflowagent}
            workflowAgent={workflowAgent}
               showTransfer={showTransfer}  
              setShowTransfer={setShowTransfer} 
  />
)}
        {/* Step 4: Authorization */}
        {activeTab === "Step4" && (
          <Step4Authorization
            isAuthEnabled={isAuthEnabled}
            setIsAuthEnabled={setIsAuthEnabled}
            authType={authType}
            setAuthType={setAuthType}
            instruction={authInstruction}
            setInstruction={setAuthInstruction}
          />
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between space-x-3">
          {activeTab !== "Step1" && (
            <Button
              onClick={() => {
                if (activeTab === "Step2") setActiveTab("Step1");
                if (activeTab === "Step3") setActiveTab("Step2");
                if (activeTab === "Step4") setActiveTab("Step3");
              }}
              variant="default"
              className="flex-1 mb-9"
            >
              Previous
            </Button>
          )}

          {activeTab !== "Step4" ? (
            <Button
              onClick={() => {
                if (activeTab === "Step1") setActiveTab("Step2");
                if (activeTab === "Step2") setActiveTab("Step3");
                if (activeTab === "Step3") setActiveTab("Step4");
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 mb-9"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!title || !instructions}
            >
              Save Changes
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
