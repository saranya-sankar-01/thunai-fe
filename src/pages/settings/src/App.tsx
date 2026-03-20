import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import AppSidebar from "./components/AppSidebar";
import Projects from "./pages/Projects";
import Configuration from "./pages/Configuration";
import UserManagement from "./pages/UserManagement";
import SubscriptionOverview from "./pages/SubscriptionOverview";
import CustomAgent from "./pages/CustomAgent";
import Directory from "./pages/Directory";
import EmailTemplates from "./pages/EmailTemplates";
import RolesDetails from "./pages/RolesDetails";
import EmailTemplate from "./pages/EmailTemplate";
import SmtpTemplates from "./pages/SmtpTemplates";
import DirectorySync from "./pages/DirectorySync";
import CustomSettings from "./pages/CustomSettings";
import { SidebarProvider } from "./components/Sidebar";

const queryClient = new QueryClient();

function Settings() {

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {/* <BrowserRouter> */}
          <SidebarProvider>
            <div className="min-hscreen flex w-full overflow-hidden">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <main className="flex-1 p-4 sm:px-6 lg:p-8">
                  <Routes>
                    <Route path="/" element={<Projects />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="configuration" element={<Configuration />} />
                    <Route path="user-management" element={<UserManagement />} />
                    <Route path="role-management/create-role" element={<RolesDetails />} />
                    <Route path="role-management/edit-role/:role" element={<RolesDetails />} />
                    <Route path="role-management/view-role/:role" element={<RolesDetails />} />
                    <Route path="subscription-overview" element={<SubscriptionOverview />} />
                    <Route path="custom-agent" element={<CustomAgent />} />
                    <Route path="connect-database" element={<CustomSettings />} />
                    <Route path="directory" element={<Directory />} />
                    <Route path="directory/import-directory-sync" element={<DirectorySync />} />
                    <Route path="email-templates" element={<EmailTemplates />} />
                    <Route path="email-templates/create" element={<EmailTemplate />} />
                    <Route path="smtp-template" element={<SmtpTemplates />} />
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

export default Settings
