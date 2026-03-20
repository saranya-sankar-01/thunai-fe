
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Contacts from "./pages/Contacts";
import Opportunities from "./pages/Opportunities";
import Settings from "./pages/Settings";
import Copilot from "./pages/Copilot";
import NotFound from "./pages/NotFound";
import { AppLayout } from "./components/layout/AppLayout";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import Header from "@/components/ui/header";
import "./index.css";

const queryClient = new QueryClient();

const RevAI = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
        <SidebarProvider>
          <div className="min-hscreen flex w-full overflow-hidden">
            {/* <AppSidebar /> */}
            <div className="flex-1 flex flex-col">
              {/* <Header /> */}
              <main className="flex-1">
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Contacts />} />
                    <Route path="contacts" element={<Contacts />} />
                    <Route path="opportunities" element={<Opportunities />} />
                    <Route path="copilot" element={<Copilot />} />
                    <Route path="settings" element={<Settings />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </main>
            </div>
          </div>
        </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider >
);

export default RevAI;
