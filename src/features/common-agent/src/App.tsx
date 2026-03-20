import { Toaster } from "../../../components/ui/toaster";
import { TooltipProvider } from "../../../components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "../../../components/ui/sidebar";
import Index from "./pages/Index";
import MyAgents from "./pages/MyAgents";
import EditAgent from "./pages/EditAgent";
import NotFound from "./pages/NotFound";
import "./index.css";

const queryClient = new QueryClient();

function Agent() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            {/* <AppSidebar /> */}
            <div className="flex-1 flex flex-col">
              {/* <header className="h-14 flex items-center border-b bg-background px-6">
                <SidebarTrigger className="mr-4" />
                <h1 className="text-xl font-semibold text-thunai-text-primary">Thunai Platform</h1>
              </header> */}
              <main className="flex-1">
                <Routes>
                  <Route path="create-agent" element={<Index />} />
                  <Route path="/" element={<MyAgents />} />
                  <Route path="/:id/edit" element={<EditAgent />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default Agent;
