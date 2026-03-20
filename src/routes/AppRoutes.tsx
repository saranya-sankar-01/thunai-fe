import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import Login from "../pages/Login/Login";
import { ProtectedRoute } from "./ProtectedRoutes";
import MeetingFeedApp from "../features/meeting-feed/src/App";
import Agent from "@/features/common-agent/src/App";
import Brain from "@/features/brains/src/App";
import { StreamViewer } from "@/features/brains/src/components/StreamViewer";
import RevAI from "@/features/revenue-ai/src/App";
// import RevAIPage from "../features/rev-ai/RevAIPage";

// Placeholder components for now
const CallDetails = () => <div className="p-6"><h1 className="text-2xl font-bold">Call Details</h1></div>;
const Notes = () => <div className="p-6"><h1 className="text-2xl font-bold">Notes</h1></div>;
const Settings = () => <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1></div>;
const DashboardHome = () => <div className="p-6"><h1 className="text-2xl font-bold">Welcome to Dashboard</h1></div>;
// const RevAIPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Revenue AI</h1></div>;

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/accounts/login" element={<Login />} />

        {/* Protected routes with dashboard layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="getting-started/*" element={<MeetingFeedApp />} />
            <Route path="meeting-feed/*" element={<MeetingFeedApp />} />
            <Route path="common-agent/*" element={<Agent />} />
            <Route path="brain/*" element={<Brain />} />
            <Route path="companion/revai/*" element={<RevAI />} />
            <Route path="streams" element = {<StreamViewer/>}/>
            <Route path="settings/projects" element={<Settings />} />
            <Route path="settings/subscription-overview" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}