import "./index.css";
import {Suspense,lazy} from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";

const MeetingAssistants = lazy(() => import("./components/MeetingAssistants"));
const CallDetails = lazy(()=> import("./components/CallDetails"));

const ResearchData = lazy(()=> import( "./SubComponent/ResearchData"));
const CallScoreAnalysis = lazy(()=> import( "./SubComponent/CallScoreAnalysis"));
const CallAnalysisMain = lazy(()=> import( "./SubComponent/CallAnalysis/CallAnalysisMain"));
const CallScore = lazy(()=> import( "./SubComponent/CallAnalysis/CallScore"));
const CategoryList = lazy(()=> import( "./SubComponent/CallAnalysis/CategoryList"));
const CreateParameterGroup = lazy(()=> import( "./SubComponent/CallAnalysis/CreateParameterGroup"));
const ScrollToTop = lazy(()=> import( "./components/ScrollToTop"));
const MeetingViewed = lazy(()=> import( "./SubComponent/MeetingViewed"));
const Index = lazy(()=> import( "./components/brain-agent/pages/Index"));
const AgentConfig = lazy(()=> import( "./components/brain-agent/pages/AgentConfig"));
import  LoadingComp  from "./SubComponent/ReuseComponent/LoadingComp";
import { Approvals } from "./components/brain-agent/pages/Approvals";
import { Toaster } from "../../../components/ui/toaster";
import { Toaster as Sonner } from "../../../components/ui/sonner";
import { getLocalStorageItem } from "@/services/auth";

const userinfo = getLocalStorageItem  ("user_info");
console.log(userinfo);

function MeetingFeedApp() {
  return (
    <Provider store={store}>
      <Suspense fallback={<LoadingComp height="100vh"/> }>
        <Toaster />
        <Sonner />
        <ScrollToTop />
        <Routes>
          <Route
            path="/"
            element={<Navigate to="MeetingAssistants" replace />}
            />
          <Route path="MeetingAssistants" element={<MeetingAssistants />} />
          <Route path="MeetingAssistants/CallDetails/:id" element={<CallDetails />}/>
          <Route path="MeetingViewed/:id" element={<MeetingViewed />}/>

          <Route path="ResearchData/:id" element={<ResearchData />} />
          <Route path="MeetingAssistants/CallScoreAnalysis/:id" element={<CallScoreAnalysis />} />
          <Route path="CallAnalysis" element={<CallAnalysisMain />} />
          <Route path="CallAnalysis/CallScore" element={<CallScore />} />
          <Route path="CallAnalysis/CategoryList" element={<CategoryList />} />
          <Route
            path="CallAnalysis/CreateParameterGroup"
            element={<CreateParameterGroup />}
            />
          <Route path="agent" element={<Index />} />
          <Route path="agent-config" element={<AgentConfig />} />
          <Route path="approvals" element={<Approvals />} />
        </Routes>
      </Suspense>
    </Provider>
  );
}

export default MeetingFeedApp;
