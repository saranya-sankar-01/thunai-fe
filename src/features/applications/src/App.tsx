import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import AppOverview from "./pages/AppOverview";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import {Toaster as Sonner} from "sonner";

function Application() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* <BrowserRouter> */}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="integration/app-integration" element={<Index />} />
          <Route
            path="integration/app-integration/app-overview"
            element={<AppOverview />}
          />
        </Routes>
      {/* </BrowserRouter> */}
    </TooltipProvider>
  );
}

export default Application;
