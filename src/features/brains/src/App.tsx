import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import Index from "./pages/Index";
import WebhooksPage from "./pages/WebhooksPage";
import DocumentViewer from "./pages/DocumentViewer";
import NotFound from "./pages/NotFound";
import { InstructionSetCreator } from "./components/learning-set/InstructionSetCreator";
import { useCacheClear } from "./hooks/useClearCache";
import { useProcessStreamFile } from "./store/useProcessStreamFile";
import { useEffect } from "react";
import { useProcessStream } from "./store/useProcessStream";
import { getTenantId } from "./services/authService";
import { StreamViewer } from "./components/StreamViewer";

const queryClient = new QueryClient();
const saveAuthParamsFromURL = () => {
  const params = new URLSearchParams(window.location.search);

  const permissionsParam = params.get("permissions");

  if (permissionsParam) {
    try {
      const decoded = decodeURIComponent(permissionsParam);
      const permissionsArray = JSON.parse(decoded);

      localStorage.setItem("permissions", JSON.stringify(permissionsArray));
      console.log("Permissions saved:", permissionsArray);
    } catch (err) {
      console.error("Permission decode failed", err);
    }
  }
};


const Brain = () => {
  useCacheClear()
  const fetchStatus = useProcessStreamFile((state) => state.fetchStatus);
  const fetchProcesses = useProcessStream((state) => state.fetchProcesses);
  const tenantID = getTenantId()

    useEffect(() => {
    saveAuthParamsFromURL();
  }, []);

  useEffect(() => {
    // fetchStatus(tenantID);
    fetchProcesses(tenantID);
  }, [tenantID]);
  return(
     <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* <BrowserRouter> */}
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            {/* <AppSidebar /> */}
            <div className="flex-1 flex flex-col">
              {/* <header className="h-14 flex items-center border-b bg-white px-4">
                <SidebarTrigger className="mr-4" />
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-semibold text-gray-900">Knowledge Base</h1>
                </div>
              </header> */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="view/:id" element={<DocumentViewer />} />
                  <Route path="knowledge" element={<Index />} />
                  <Route path="dashboard" element={<Index />} />
                  <Route path="meeting-assistants" element={<Index />} />
                  <Route path="revenue-ai" element={<Index />} />
                  <Route path="common-agents" element={<Index />} />
                  <Route path="chat-agents" element={<Index />} />
                  <Route path="voice-agents" element={<Index />} />
                  <Route path="email-agents" element={<Index />} />
                  <Route path="application-agents" element={<Index />} />
                  <Route path="applications" element={<Index />} />
                  <Route path="webhooks" element={<WebhooksPage />} />
                  <Route path="create-learningset" element = {<InstructionSetCreator/>}/>
                  <Route path="edit-learningset/:setId" element = {<InstructionSetCreator/>}/>
                  {/* <Route path="streams" element = {<StreamViewer/>}/> */}
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      {/* </BrowserRouter> */}
    </TooltipProvider>
  </QueryClientProvider>
  )
}

export default Brain;